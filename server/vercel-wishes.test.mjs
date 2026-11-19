import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import console from "node:console";
import { createWishApi } from "./wishes.mjs";
import { createRedisWishStore } from "./redis-wishes.mjs";
import vercelHandler from "../api/wishes.js";

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
const response = () => ({
  status: 0, headersSent: false, data: null,
  writeHead(status) { this.status = status; this.headersSent = true; },
  end(body) { this.data = body ? JSON.parse(body) : null; },
});
const request = (body) => ({
  url: "/api/wishes", method: "POST", body,
  headers: { host: "festiv-ui.vercel.app", origin: "https://festiv-ui.vercel.app", "content-type": "application/json" },
  socket: { remoteAddress: "127.0.0.1" },
});

it("accepts Vercel parsed bodies and awaits asynchronous persistence before success", async () => {
  const records = [];
  const api = createWishApi({ store: {
    async list() { return records; },
    async find(id) { return records.find((r) => r.id === id); },
    async add(text, id) { const row = { id, text, createdAt: new Date().toISOString() }; records.push(row); return row; },
  } });
  const req = request({ text: "A peaceful morning", requestId: randomUUID() });
  const res = response();
  await api(req, res, vi.fn());
  expect(res.status).toBe(201);
  expect(res.data.wish).toEqual(records[0]);
  const retry = response();
  await api(req, retry, vi.fn());
  expect(retry.status).toBe(200);
  expect(records).toHaveLength(1);
  const read = response();
  await api({ ...req, method: "GET" }, read, vi.fn());
  expect(read.data).toEqual({ wishes: records });
  const oversized = response();
  await api(request({ text: "x".repeat(9000), requestId: randomUUID() }), oversized, vi.fn());
  expect(oversized.status).toBe(413);
});

it("fails visibly on Vercel when no database is connected, without a file-store fallback", async () => {
  for (const name of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"]) vi.stubEnv(name, "");
  vi.spyOn(console, "error").mockImplementation(() => {});
  const res = response();
  await vercelHandler({ ...request(), method: "GET" }, res);
  expect(res.status).toBe(503);
  expect(res.data.error).toContain("not available yet");
});

it("uses authenticated REST commands and hashes cooldown identities", async () => {
  const row = { id: randomUUID(), text: "शान्ति", createdAt: new Date().toISOString() };
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: JSON.stringify(row) }) });
  const store = createRedisWishStore({ env: { UPSTASH_REDIS_REST_URL: "https://example.upstash.io", UPSTASH_REDIS_REST_TOKEN: "test-token", VERCEL_ENV: "preview" }, fetcher });
  expect(await store.add(row.text, row.id, "192.0.2.1")).toEqual(row);
  const [url, init] = fetcher.mock.calls[0];
  expect(url).toBe("https://example.upstash.io");
  expect(init.headers.Authorization).toBe("Bearer test-token");
  const command = JSON.parse(init.body);
  expect(command[0]).toBe("EVAL");
  expect(command[3]).toBe("prakash:preview:wishes:records");
  expect(init.body).not.toContain("192.0.2.1");
  expect(await store.find(row.id)).toEqual(row);
  fetcher.mockResolvedValueOnce({ ok: true, json: async () => ({ result: [JSON.stringify(row)] }) });
  expect(await store.list()).toEqual([row]);
});

it("propagates database failure and distributed cooldown instead of claiming publication", async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: false });
  const store = createRedisWishStore({ env: { KV_REST_API_URL: "https://example.upstash.io", KV_REST_API_TOKEN: "test-token" }, fetcher });
  await expect(store.list()).rejects.toThrow("request failed");
  fetcher.mockResolvedValue({ ok: true, json: async () => ({ result: "RATE_LIMIT" }) });
  await expect(store.add("Light", randomUUID())).rejects.toMatchObject({ code: "WISH_RATE_LIMIT" });
});
