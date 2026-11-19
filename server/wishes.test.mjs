import { afterEach, describe, expect, it } from "vitest";
import { Readable } from "node:stream";
import { Buffer } from "node:buffer";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import { createWishApi, createWishStore, validateWish } from "./wishes.mjs";

const directories = [];
const makeFile = () => {
  const directory = mkdtempSync(join(tmpdir(), "prakash-wishes-"));
  directories.push(directory);
  return join(directory, "wishes.json");
};
function startApi() {
  let time = 1000;
  const file = makeFile();
  const api = createWishApi({ store: createWishStore(file), now: () => time });
  const request = async (method, body, headers = {}, address = "127.0.0.1") => {
    const req = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))]);
    req.url = "/api/wishes";
    req.method = method;
    req.headers = { host: "prakash.example", "content-type": "application/json", ...headers };
    req.socket = { remoteAddress: address };
    let status;
    let data;
    const res = {
      headersSent: false,
      writeHead(value) { status = value; this.headersSent = true; },
      end(value) { data = value ? JSON.parse(value) : undefined; },
    };
    await api(req, res, () => { throw new Error("Unexpected route fallthrough"); });
    return { status, json: async () => data };
  };
  return { request, file, advance: () => { time += 16000; } };
}
afterEach(() => {
  for (const directory of directories.splice(0)) {
    const absolute = resolve(directory);
    if (!absolute.startsWith(`${resolve(tmpdir())}${sep}prakash-wishes-`)) throw new Error("Unexpected temporary path");
    rmSync(absolute, { recursive: true });
  }
});

describe("shared wishes", () => {
  it("validates bounded Unicode text and rejects empty and control-only input", () => {
    expect(validateWish(" उज्यालो र शान्ति ")).toBe("उज्यालो र शान्ति");
    expect(validateWish("   ")).toBeNull();
    expect(validateWish("a".repeat(301))).toBeNull();
    expect(validateWish(`hello${String.fromCharCode(0)}`)).toBeNull();
    expect(validateWish({ text: "invalid" })).toBeNull();
  });
  it("persists across fresh store instances without identity data", () => {
    const file = makeFile();
    const first = createWishStore(file);
    const saved = first.add("May our homes be peaceful.", randomUUID());
    expect(createWishStore(file).list()).toEqual([saved]);
    expect(Object.keys(saved).sort()).toEqual(["createdAt", "id", "text"]);
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual([saved]);
  });
  it("does not overwrite malformed storage", () => {
    const file = makeFile();
    writeFileSync(file, "corrupt archive");
    expect(() => createWishStore(file).add("A little light", randomUUID())).toThrow();
    expect(readFileSync(file, "utf8")).toBe("corrupt archive");
  });
  it("shares between clients and deduplicates a retried publication", async () => {
    const { request } = startApi();
    const body = { text: "सबैमा शान्ति रहोस्।", requestId: randomUUID() };
    const first = await request("POST", body);
    expect(first.status).toBe(201);
    const { wish } = await first.json();
    const second = await request("POST", body);
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ wish });
    expect(await (await request("GET", undefined, {}, "192.0.2.1")).json()).toEqual({ wishes: [wish] });
  });
  it("limits repeated new submissions but allows a later wish", async () => {
    const { request, advance } = startApi();
    expect((await request("POST", { text: "One light", requestId: randomUUID() })).status).toBe(201);
    expect((await request("POST", { text: "Another light", requestId: randomUUID() })).status).toBe(429);
    advance();
    expect((await request("POST", { text: "Another light", requestId: randomUUID() })).status).toBe(201);
  });
  it("rejects invalid input, cross-origin submissions and oversized bodies", async () => {
    const { request } = startApi();
    expect((await request("POST", { text: " ", requestId: randomUUID() })).status).toBe(400);
    expect((await request("POST", { text: "Hello", requestId: randomUUID() }, { origin: "https://another.example" })).status).toBe(403);
    expect((await request("POST", { text: "a".repeat(9000), requestId: randomUUID() })).status).toBe(413);
    expect(await (await request("GET")).json()).toEqual({ wishes: [] });
  });
});
