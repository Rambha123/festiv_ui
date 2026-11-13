import { useEffect, useRef, useState } from "react";
import { assets, flameAnchors } from "../engine/sceneManifest";
import { useJourney } from "../store/journeyStore";
interface Props {
  id: string;
  variant: "front" | "side";
  label: string;
  hold?: boolean;
  artwork?: boolean;
}
export function Diya({
  id,
  variant,
  label,
  hold = false,
  artwork = false,
}: Props) {
  const lit = useJourney((s) => s.lit.includes(id));
  const light = useJourney((s) => s.light);
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchor = artwork ? { left: "50%", top: "50%" } : flameAnchors[variant];
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <button
      type="button"
      className={`diya ${artwork ? "artwork-diya" : ""} ${lit ? "is-lit" : ""} ${holding ? "holding" : ""}`}
      aria-label={`${label}${lit ? " — lit" : ""}`}
      aria-pressed={lit}
      onPointerDown={(event) => {
        if (hold && !lit) {
          event.currentTarget.setPointerCapture(event.pointerId);
          setHolding(true);
          timer.current = setTimeout(() => {
            light(id);
            setHolding(false);
          }, 1200);
        }
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onBlur={cancel}
      onClick={() => light(id)}
    >
      <span className="lamp-glow" style={anchor}>
        <span />
      </span>
      <img
        className={artwork ? "portrait-lamp-sprite" : undefined}
        src={assets[variant]}
        alt=""
        draggable={false}
      />
      <span className="flame" style={anchor}>
        <span />
      </span>
      <span className="hold-ring" />
    </button>
  );
}
