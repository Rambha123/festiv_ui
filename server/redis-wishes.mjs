import process from "node:process";
import { URL } from "node:url";
import { createHmac } from "node:crypto";
import { validateWish } from "./wishes.mjs";

// Publication, duplicate protection and cooldown are atomic across function instances.
export const publishScript = `
local existing = redis.call('HGET', KEYS[1], ARGV[1])
if existing then
  if cjson.decode(existing).text ~= ARGV[3] then return 'CONFLICT' end
  return existing
end
if redis.call('EXISTS', KEYS[3]) == 1 then return 'RATE_LIMIT' end
if redis.call('HLEN', KEYS[1]) >= 10000 then return 'FULL' end
redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
redis.call('ZADD', KEYS[2], ARGV[4], ARGV[1])
redis.call('SET', KEYS[3], '1', 'EX', 15)
return ARGV[2]
`;
const listScript = `
local ids = redis.call('ZREVRANGE', KEYS[2], 0, 35)
if #ids == 0 then return {} end
return redis.call('HMGET', KEYS[1], unpack(ids))
`;

function decodeRecord(raw) {
  const row = JSON.parse(raw);
  if (!row || typeof row.id !== "string" || validateWish(row.text) !== row.text ||
    typeof row.createdAt !== "string" || !Number.isFinite(Date.parse(row.createdAt))) {
    throw new Error("Invalid stored wish.");
  }
  return { id: row.id, text: row.text, createdAt: row.createdAt };
}

export function createRedisWishStore({ env = process.env, fetcher = globalThis.fetch } = {}) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token || new URL(url).protocol !== "https:") {
    throw new Error("Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel.");
  }
  // Preview deployments must not write into the production archive by default.
  const prefix = env.WISH_KEY_PREFIX || `prakash:${env.VERCEL_ENV === "preview" ? "preview" : "production"}:wishes`;
  const keys = [`${prefix}:records`, `${prefix}:order`];
  const command = async (args) => {
    const response = await fetcher(url, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args), signal: globalThis.AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error("Wish database request failed.");
    const body = await response.json();
    if (!body || body.error || !("result" in body)) throw new Error("Wish database response failed.");
    return body.result;
  };
  return {
    async list() {
      const result = await command(["EVAL", listScript, 2, ...keys]);
      if (!Array.isArray(result)) throw new Error("Invalid wish list.");
      return result.map(decodeRecord);
    },
    async find(id) {
      const result = await command(["HGET", keys[0], id]);
      return result === null ? undefined : decodeRecord(result);
    },
    async add(text, id, address = "unknown") {
      const clean = validateWish(text);
      if (!clean || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)) throw new Error("Invalid wish.");
      const record = { id, text: clean, createdAt: new Date().toISOString() };
      const digest = createHmac("sha256", token).update(address).digest("hex");
      const result = await command(["EVAL", publishScript, 3, ...keys, `${prefix}:cooldown:${digest}`,
        id, JSON.stringify(record), clean, Date.parse(record.createdAt)]);
      if (result === "RATE_LIMIT" || result === "CONFLICT") {
        throw Object.assign(new Error("Wish publication rejected."), { code: `WISH_${result}` });
      }
      if (result === "FULL") throw new Error("Wish archive is full.");
      return decodeRecord(result);
    },
  };
}
