import console from "node:console";
import { createWishApi } from "../server/wishes.mjs";
import { createRedisWishStore } from "../server/redis-wishes.mjs";

let handler;
export default async function wishes(req, res) {
  if (!handler) {
    try {
      handler = createWishApi({
        store: createRedisWishStore(),
        // This header is supplied by Vercel, not trusted by the standalone server.
        clientAddress: (request) => {
          const forwarded = request.headers["x-vercel-forwarded-for"];
          return typeof forwarded === "string" ? forwarded.split(",")[0].trim() : request.socket?.remoteAddress || "unknown";
        },
      });
    } catch {
      console.error("[PRAKASH] Connect Upstash Redis: missing or invalid UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.");
      res.writeHead(503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(JSON.stringify({ error: "Shared wishes are not available yet. Please try again later." }));
      return;
    }
  }
  await handler(req, res, () => { res.writeHead(404); res.end(); });
}
