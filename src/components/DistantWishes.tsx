import { useCallback, useEffect, useRef, useState } from "react";
import { getWishes, WISH_PUBLISHED, type SharedWish } from "../engine/wishes";
import "./wishes.css";

export function DistantWishes({ active, ne, selectedId, onSelect }: {
  active: boolean; ne: boolean; selectedId: string | null; onSelect: (wish: SharedWish | null) => void;
}) {
  const [wishes, setWishes] = useState<SharedWish[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const pending = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort("timeout"), 10000);
    setLoading(true);
    try {
      const next = await getWishes(controller.signal);
      if (!controller.signal.aborted) { setWishes(next); setError(false); }
    } catch {
      if (!controller.signal.aborted || controller.signal.reason === "timeout") setError(true);
    } finally {
      window.clearTimeout(timeout);
      if (pending.current === controller) setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!active) return;
    void refresh();
    const update = () => { if (!document.hidden) void refresh(); };
    window.addEventListener(WISH_PUBLISHED, update);
    document.addEventListener("visibilitychange", update);
    const timer = window.setInterval(update, 30000);
    return () => {
      pending.current?.abort();
      pending.current = null;
      window.clearInterval(timer);
      window.removeEventListener(WISH_PUBLISHED, update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [active, refresh]);
  if (!active) return null;
  const visible = wishes.slice(0, 5);
  return (
    <section className="distant-wishes" aria-label={ne ? "अरूका अनाम कामनाहरू" : "Anonymous wishes left by others"}>
      <p className="wishes-caption">{ne ? "टाढाका उज्यालामा, केही कामना" : "Wishes, carried into the distance"}</p>
      <ul className="wish-lights">
        {visible.map((wish, index) => (
          <li className={`wish-light wish-light-${index + 1}`} key={wish.id}>
            <button
              className={selectedId === wish.id ? "wish-light-open" : ""}
              onClick={() => onSelect(selectedId === wish.id ? null : wish)}
              aria-expanded={selectedId === wish.id}
              aria-label={`${ne ? "अनाम कामना खोल्नुहोस्" : "Open anonymous wish"} ${index + 1}`}
              aria-controls={selectedId === wish.id ? "discovery-panel" : undefined}
            >
              <span className="wish-light-flame" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {wishes.length === 0 && !error && (
        <p className="wish-garden-status" role="status">
          {loading ? (ne ? "कामनाहरू ल्याउँदै…" : "Gathering the wishes…") : (ne ? "पहिलो कामना तपाईंको हुन सक्छ।" : "The first wish here could be yours.")}
        </p>
      )}
      {error && (
        <div className="wish-garden-status" role="status">
          <span>{ne ? "कामनाहरू ल्याउन सकिएन।" : "Shared wishes could not be loaded."}</span>
          <button onClick={() => void refresh()} disabled={loading}>{ne ? "फेरि प्रयास" : "Retry"}</button>
        </div>
      )}
    </section>
  );
}
