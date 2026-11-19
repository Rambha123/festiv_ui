import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import console from "node:console";
import { Buffer } from "node:buffer";
import { URL } from "node:url";

const MAX_WISHES = 10000;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export function validateWish(value) {
  if (typeof value !== "string") return null;
  const text = value.normalize("NFC").trim();
  if (!text || Array.from(text).length > 300) return null;
  if (Array.from(text).some((char) => {
    const code = char.codePointAt(0);
    return code < 32 && code !== 10 && code !== 9;
  })) return null;
  return text;
}

export function createWishStore(file = resolve(process.env.WISH_DATA_DIR || ".data", "wishes.json")) {
  let records;
  const load = () => {
    if (records) return records;
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8"));
      if (!Array.isArray(parsed) || parsed.length > MAX_WISHES || parsed.some((row) =>
        !row || typeof row !== "object" || !UUID.test(row.id) ||
        validateWish(row.text) !== row.text || !Number.isFinite(Date.parse(row.createdAt)),
      )) throw new Error("Invalid wish database; restore a valid backup before restarting.");
      records = parsed.map(({ id, text, createdAt }) => ({ id, text, createdAt }));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      records = [];
    }
    return records;
  };
  return {
    list: () => load().slice(-36).reverse(),
    find: (id) => load().find((row) => row.id === id),
    add(text, id) {
      const existing = load().find((row) => row.id === id);
      if (existing) return existing;
      if (!validateWish(text) || !UUID.test(id)) throw new Error("Invalid wish.");
      if (records.length >= MAX_WISHES) throw new Error("Wish archive is full; contact the site operator.");
      const record = { id, text: validateWish(text), createdAt: new Date().toISOString() };
      const next = [...records, record];
      mkdirSync(dirname(file), { recursive: true });
      // One server process owns this file. Flush before atomically replacing it;
      // readers never see partial JSON, and failed writes retain the old archive.
      const temporary = `${file}.${process.pid}.tmp`;
      writeFileSync(temporary, JSON.stringify(next), { encoding: "utf8", mode: 0o600, flush: true });
      renameSync(temporary, file);
      records = next;
      return record;
    },
  };
}

function respond(res, status, payload, extra = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extra,
  });
  res.end(JSON.stringify(payload));
}

export function createWishApi({ store = createWishStore(), now = Date.now, clientAddress = (req) => req.socket?.remoteAddress || "unknown" } = {}) {
  const recent = new Map();
  return async (req, res, next) => {
    const path = req.url?.split("?")[0];
    if (path !== "/api/wishes") { next(); return; }
    try {
      if (req.method === "GET") {
        respond(res, 200, { wishes: await store.list() });
        return;
      }
      if (req.method !== "POST") {
        respond(res, 405, { error: "Use GET or POST." }, { Allow: "GET, POST" });
        return;
      }
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host) {
        respond(res, 403, { error: "Please share from this website." });
        return;
      }
      if (!req.headers["content-type"]?.startsWith("application/json")) {
        respond(res, 415, { error: "Send the wish as JSON." });
        return;
      }
      let body = req.body;
      if (body !== undefined) {
        if (Buffer.byteLength(typeof body === "string" ? body : JSON.stringify(body), "utf8") > 8192) {
          respond(res, 413, { error: "Keep your wish within 300 characters." }); return;
        }
        if (typeof body === "string") {
          try { body = JSON.parse(body); }
          catch { respond(res, 400, { error: "The wish could not be read. Please try again." }); return; }
        }
      } else {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 8192) {
            respond(res, 413, { error: "Keep your wish within 300 characters." }); return;
          }
          chunks.push(chunk);
        }
        try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
        catch { respond(res, 400, { error: "The wish could not be read. Please try again." }); return; }
      }
      const text = validateWish(body?.text);
      if (!text || typeof body?.requestId !== "string" || !UUID.test(body.requestId)) {
        respond(res, 400, { error: "Write a wish between 1 and 300 characters." });
        return;
      }
      const existing = await store.find(body.requestId);
      if (existing) {
        if (existing.text !== text) respond(res, 409, { error: "This wish was already shared. Start a new wish." });
        else respond(res, 200, { wish: existing });
        return;
      }
      const time = now();
      for (const [key, until] of recent) if (until <= time) recent.delete(key);
      const address = clientAddress(req);
      if (recent.has(address) || recent.size >= 10000) {
        respond(res, 429, { error: "Let this light settle. Try again in 15 seconds." }, { "Retry-After": "15" });
        return;
      }
      const wish = await store.add(text, body.requestId, address);
      recent.set(address, time + 15000);
      respond(res, 201, { wish });
    } catch (error) {
      if (error.code === "WISH_RATE_LIMIT") {
        respond(res, 429, { error: "Let this light settle. Try again in 15 seconds." }, { "Retry-After": "15" }); return;
      }
      if (error.code === "WISH_CONFLICT") {
        respond(res, 409, { error: "This wish was already shared. Start a new wish." }); return;
      }
      console.error("[PRAKASH] Wish storage request failed.", error instanceof Error ? error.name : "Unknown error");
      if (!res.headersSent) respond(res, 503, { error: "The wish garden is unavailable. Your draft is safe; please retry shortly." });
      else res.end();
    }
  };
}

export function wishesPlugin() {
  const api = createWishApi();
  return {
    name: "prakash-shared-wishes",
    configureServer(server) { server.middlewares.use(api); },
    configurePreviewServer(server) { server.middlewares.use(api); },
  };
}
