import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { URL } from "node:url";
import process from "node:process";
import console from "node:console";
import { createWishApi } from "./wishes.mjs";

const root = resolve("dist");
const mime = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2",
};
const api = createWishApi();
const server = createServer((req, res) => {
  void api(req, res, () => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405); res.end(); return;
      }
      const pathname = decodeURIComponent(new URL(req.url || "/", "http://local").pathname);
      const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
      if (!file.startsWith(`${root}${sep}`) || !statSync(file).isFile()) {
        res.writeHead(404); res.end("Not found"); return;
      }
      res.writeHead(200, {
        "Content-Type": mime[extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": extname(file) === ".html" ? "no-cache" : "public, max-age=3600",
      });
      if (req.method === "HEAD") { res.end(); return; }
      const stream = createReadStream(file);
      stream.on("error", () => res.destroy());
      stream.pipe(res);
    } catch {
      res.writeHead(404); res.end("Not found");
    }
  });
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.on("error", (error) => {
  console.error("[PRAKASH] Server could not start:", error.message);
  process.exitCode = 1;
});
server.listen(Number(process.env.PORT || 3000), process.env.HOST || "127.0.0.1", () => {
  console.log(`[PRAKASH] Serving the journey and shared wishes on port ${process.env.PORT || 3000}.`);
});
