export type SharedWish = { id: string; text: string; createdAt: string };
export const WISH_PUBLISHED = "prakash:shared-wish";
const endpoint = `${import.meta.env.BASE_URL}api/wishes`;

function isWish(value: unknown): value is SharedWish {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && row.id.length <= 64 &&
    typeof row.text === "string" && row.text.trim().length > 0 && Array.from(row.text).length <= 300 &&
    typeof row.createdAt === "string" && Number.isFinite(Date.parse(row.createdAt));
}

async function request(init: RequestInit, signal: AbortSignal): Promise<Record<string, unknown>> {
  const response = await fetch(endpoint, { ...init, signal, cache: "no-store", credentials: "same-origin" });
  const data: unknown = await response.json();
  if (!data || typeof data !== "object") throw new Error("The wish garden returned an unreadable response.");
  const result = data as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "The wish garden is unavailable. Please try again.");
  return result;
}

export async function getWishes(signal: AbortSignal): Promise<SharedWish[]> {
  const data = await request({}, signal);
  if (!Array.isArray(data.wishes) || !data.wishes.every(isWish)) throw new Error("The shared wishes could not be read. Please retry.");
  return data.wishes.slice(0, 36);
}

export async function publishWish(text: string, requestId: string, signal: AbortSignal): Promise<SharedWish> {
  const data = await request({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, requestId }) }, signal);
  if (!isWish(data.wish)) throw new Error("The wish could not be confirmed. Please retry.");
  window.dispatchEvent(new Event(WISH_PUBLISHED));
  return data.wish;
}
