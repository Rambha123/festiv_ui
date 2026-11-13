import { useEffect, useRef, useState } from "react";
import { frames } from "../engine/sequence";
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
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    input.current?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement)
        previous.focus({ preventScroll: true });
    };
  }, []);
  const update = (value: string) => {
    setWish(value);
    try {
      localStorage.setItem("prakash-wish", value);
    } catch {
      setError(
        ne ? "कामना सुरक्षित भएन।" : "Could not save the draft on this device.",
      );
    }
  };
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await document.fonts.ready;
      const image = new Image();
      image.src = frames.at(-1)!.url;
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
          backgroundImage: `linear-gradient(transparent,#080c19),url("${frames.at(-1)!.url}")`,
        }}
      >
        <p>{wish}</p>
        <small>PRAKASH · प्रकाश</small>
      </div>
      <button disabled={saving} onClick={() => void save()}>
        {ne ? "तस्बिर सुरक्षित गर्नुहोस्" : "Save as image"}
      </button>
      {error && <p role="alert">{error}</p>}
    </aside>
  );
}
