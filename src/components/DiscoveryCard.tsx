import { useEffect, useRef } from "react";
import { discoveries } from "../data/discoveries";
import { useJourney } from "../store/journeyStore";
export function DiscoveryCard({
  id,
  onClose,
  customEntry,
}: {
  customEntry?: { title: string; neTitle: string; text: string; ne: string };
  id: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const language = useJourney((s) => s.language);
  const entry = customEntry ?? discoveries.find((d) => d.id === id);
  const ne = language === "ne";
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.querySelector("button")?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement)
        previous.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    if (!entry) console.warn("[PRAKASH] The requested discovery is unavailable.");
  }, [entry]);
  return (
    <aside
      id="discovery-panel"
      ref={ref}
      className={`discovery-card object-discovery ${id === "wish" ? "wish-discovery" : ""}`}
      role="region"
      aria-labelledby="discovery-title"
    >
      <button
        className="close"
        onClick={onClose}
        aria-label={language === "en" ? "Close discovery" : "बन्द गर्नुहोस्"}
      >
        ×
      </button>
      <span className="eyebrow">
        {id === "wish" ? (ne ? "प्रकाश · अनाम कामना" : "PRAKASH · ANONYMOUS WISH") : ["offerings", "riverbank", "riversteps"].includes(id) ? (ne ? "छठ · अरुणोदय" : "CHHATH · ARUNODAYA") : (ne ? "तिहार · उज्यालो आँगन" : "TIHAR · THE COURTYARD")}
      </span>
      <div aria-live="polite">
        <h2 id="discovery-title">{entry ? (ne ? entry.neTitle : entry.title) : (ne ? "जानकारी उपलब्ध छैन" : "Discovery unavailable")}</h2>
        <span className="discovery-divider" aria-hidden="true" />
        <p>{entry ? (ne ? entry.ne : entry.text) : (ne ? "बन्द गरेर अर्को उज्यालो छुनुहोस्।" : "Close this panel and touch another light to explore.")}</p>
      </div>
      <p className="discovery-note">{ne ? "बन्द गरेर फराकिलो दृश्यमा फर्कनुहोस् · Esc" : "Close to return to the wide view · Esc"}</p>
    </aside>
  );
}
