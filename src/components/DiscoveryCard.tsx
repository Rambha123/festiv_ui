import { useEffect, useRef } from "react";
import { discoveries } from "../data/discoveries";
import { useJourney } from "../store/journeyStore";
export function DiscoveryCard({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const language = useJourney((s) => s.language);
  const entry = discoveries.find((d) => d.id === id)!;
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.querySelector("button")?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement)
        previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <aside
      ref={ref}
      className="discovery-card"
      role="region"
      aria-label={language === "en" ? entry.title : entry.neTitle}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <button
        className="close"
        onClick={onClose}
        aria-label={language === "en" ? "Close discovery" : "बन्द गर्नुहोस्"}
      >
        ×
      </button>
      <span className="eyebrow">
        PRAKASH · {language === "en" ? "DISCOVER" : "अन्वेषण"}
      </span>
      <h2>{language === "en" ? entry.title : entry.neTitle}</h2>
      <p>{language === "en" ? entry.text : entry.ne}</p>
    </aside>
  );
}
