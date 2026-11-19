import { useEffect, useRef, useState } from "react";
import { assets } from "../engine/sceneManifest";
import { publishWish } from "../engine/wishes";
import "./wishes.css";
export function WishEditor({
  ne,
  onClose,
}: {
  ne: boolean;
  onClose: () => void;
}) {
  const [wish, setWish] = useState(() => {
    try {
      return localStorage.getItem("prakash-wish")?.slice(0, 300) ?? "";
    } catch (error) {
      console.warn("[PRAKASH] Wish draft could not be restored.", error);
      return "";
    }
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState("");
  const publication = useRef<{ text: string; id: string } | null>(null);
  const pending = useRef<AbortController | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    input.current?.focus({ preventScroll: true });
    return () => {
      pending.current?.abort();
      if (previous instanceof HTMLElement)
        previous.focus({ preventScroll: true });
    };
  }, []);
  const update = (value: string) => {
    setWish(value);
    setError("");
    try {
      localStorage.setItem("prakash-wish", value);
    } catch {
      setError(
        ne ? "कामना सुरक्षित भएन।" : "Could not save the draft on this device.",
      );
    }
  };
  const share = async () => {
    const text = wish.trim();
    if (!text || publishing) return;
    setPublishing(true);
    setError("");
    const controller = new AbortController();
    pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort("timeout"), 10000);
    try {
      if (publication.current?.text !== text) {
        // Keep the request ID for retries so a lost response cannot duplicate a wish.
        publication.current = { text, id: crypto.randomUUID() };
      }
      await publishWish(text, publication.current.id, controller.signal);
      if (!controller.signal.aborted) setPublished(text);
    } catch (reason) {
      if (!controller.signal.aborted || controller.signal.reason === "timeout") {
        setError(ne
          ? "कामना साझा हुन सकेन। मस्यौदा सुरक्षित छ; फेरि प्रयास गर्नुहोस्।"
          : reason instanceof Error && reason.name !== "TypeError" && !controller.signal.aborted
            ? reason.message
            : "Your wish could not be shared. Your draft is safe; please retry.");
      }
    } finally {
      window.clearTimeout(timeout);
      if (!controller.signal.aborted || controller.signal.reason === "timeout") setPublishing(false);
    }
  };
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await document.fonts.ready;
      const image = new Image();
      image.src = assets.sunrise;
      await image.decode();
      const c = document.createElement("canvas");
      c.width = 1080;
      c.height = 1440;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const scale = Math.max(1080 / image.width, 1440 / image.height);
      ctx.drawImage(
        image,
        (1080 - image.width * scale) / 2,
        0,
        image.width * scale,
        image.height * scale,
      );
      const shade = ctx.createLinearGradient(0, 600, 0, 1440);
      shade.addColorStop(0, "transparent");
      shade.addColorStop(1, "#080c19");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, 1080, 1440);
      ctx.fillStyle = "#fff0d4";
      ctx.textAlign = "center";
      ctx.font = '36px "Noto Serif Devanagari", Georgia';
      const lines: string[] = [];
      for (const para of wish.split("\n")) {
        let line = "";
        for (const { segment: char } of new Intl.Segmenter(ne ? "ne" : "en", {
          granularity: "grapheme",
        }).segment(para)) {
          if (ctx.measureText(line + char).width > 880) {
            lines.push(line);
            line = "";
          }
          line += char;
        }
        lines.push(line);
      }
      const lineHeight = Math.min(50, 800 / Math.max(1, lines.length));
      ctx.font = `${Math.min(36, lineHeight * 0.75)}px "Noto Serif Devanagari", Georgia`;
      const start = 1280 - lines.length * lineHeight;
      lines.forEach((line, i) =>
        ctx.fillText(line, 540, start + i * lineHeight),
      );
      ctx.font = "24px Georgia";
      ctx.fillText("PRAKASH · प्रकाश", 540, 1360);
      const blob = await new Promise<Blob>((resolve, reject) =>
        c.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("PNG export failed"))),
          "image/png",
        ),
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prakash-wish.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.warn("[PRAKASH] Export failed", e);
      setError(
        ne
          ? "तस्बिर सुरक्षित भएन। फेरि प्रयास गर्नुहोस्।"
          : "Could not save the image. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <aside
      className="discovery-card wish-editor"
      aria-label={ne ? "कामना लेख्नुहोस्" : "Write a wish"}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <button
        className="close"
        onClick={onClose}
        aria-label={ne ? "बन्द गर्नुहोस्" : "Close wish"}
      >
        ×
      </button>
      <h2>{ne ? "उज्यालो साथ लैजानुहोस्" : "Carry the Light"}</h2>
      <p>{ne ? "आफ्नै लागि पनि हुन सक्छ।" : "It can be for yourself, too."}</p>
      <label>
        {ne ? "तपाईंको कामना" : "Your wish"}
        <textarea
          ref={input}
          value={wish}
          maxLength={300}
          onChange={(e) => update(e.target.value)}
        />
      </label>
      <div
        className="wish-preview"
        style={{
          backgroundImage: `linear-gradient(transparent,#080c19),url("${assets.sunrise}")`,
        }}
      >
        <p>{wish}</p>
        <small>PRAKASH · प्रकाश</small>
      </div>
      <p className="wish-publish-note">
        {ne ? "साझा गरेपछि यो कामना नामबिना सबैले देख्न सक्छन्।" : "Share a wish anonymously for other visitors to discover in the distance."}
      </p>
      <div className="wish-actions">
        <button disabled={publishing || !wish.trim() || published === wish.trim()} onClick={() => void share()}>
          {publishing ? (ne ? "साझा गर्दै…" : "Sharing…") : published === wish.trim() && published ? (ne ? "साझा भयो" : "Wish shared") : (ne ? "अनाम कामना छोड्नुहोस्" : "Leave an anonymous wish")}
        </button>
        <button disabled={saving} onClick={() => void save()}>
          {saving ? (ne ? "सुरक्षित गर्दै…" : "Saving…") : (ne ? "तस्बिर सुरक्षित गर्नुहोस्" : "Save as image")}
        </button>
      </div>
      {published === wish.trim() && published && <p className="wish-published" role="status">{ne ? "तपाईंको कामना अब टाढाको उज्यालामा छ।" : "Your wish is now among the distant lights."}</p>}
      {error && <p role="alert">{error}</p>}
    </aside>
  );
}
