import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { assets } from "../engine/sceneManifest";
import { courtyardFrame, inspectionTransform, type Frame } from "../engine/courtyardGeometry";
import { courtyardHotspots } from "../data/courtyardHotspots";
import { useJourney } from "../store/journeyStore";
import { useParallax } from "../hooks/useParallax";
import "./courtyard.css";

interface Props {
  active: boolean;
  load?: boolean;
  reduced: boolean;
  panel: string | null;
  onInspect: (id: string) => void;
}

export function Courtyard({ active, load = true, reduced, panel, onInspect }: Props) {
  const surface = useRef<HTMLDivElement>(null);
  const drift = useRef<HTMLDivElement>(null);
  const focus = useRef<HTMLDivElement>(null);
  const animationContext = useRef<gsap.Context | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const language = useJourney((state) => state.language);
  const lit = useJourney((state) => state.lit);
  const toggleLight = useJourney((state) => state.toggleLight);
  const ne = language === "ne";
  const target = panel ? courtyardHotspots.find((spot) => spot.id === selected && spot.discovery === panel) : undefined;
  const inspecting = active && Boolean(target);
  const { revealPoint, wasDragged } = useParallax({ surface, layer: drift, frame, active, reduced, suspended: inspecting });

  useLayoutEffect(() => {
    const context = gsap.context(() => undefined, surface);
    animationContext.current = context;
    return () => context.revert();
  }, []);

  useLayoutEffect(() => {
    const element = surface.current;
    if (!element) return;
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width > 0 && height > 0) setFrame(courtyardFrame(width, height));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!focus.current || !frame) return;
    const transform = target && active && !reduced
      ? inspectionTransform(frame, target.x, target.y)
      : { x: 0, y: 0, scale: 1 };
    let tween: gsap.core.Tween | undefined;
    animationContext.current?.add(() => {
      tween = gsap.to(focus.current, { ...transform, duration: reduced ? 0 : 1.25, ease: "power3.inOut", overwrite: true });
    });
    return () => { tween?.kill(); };
  }, [frame, active, target, reduced]);

  useEffect(() => {
    if (failed) console.warn("[PRAKASH] Courtyard artwork could not load; retry is available.");
  }, [failed]);

  return (
    <div ref={surface} className={`courtyard-scene ${inspecting ? "is-inspecting" : ""}`} inert={!active} aria-label={ne ? "आँगन अन्वेषण" : "Explore the courtyard"}>
      <div className="courtyard-travel">
        <div ref={drift} className="courtyard-drift">
          <div className="courtyard-plane" style={frame ? { width: frame.width, height: frame.height, left: frame.left, top: frame.top } : undefined}>
            <div ref={focus} className="courtyard-focus">
              {load && <img key={attempt} className="courtyard-image" src={assets.courtyard} alt="An empty traditional brick courtyard with a pagoda temple, oil lamps and marigold garlands." draggable={false}
                onLoad={() => { setFailed(false); ScrollTrigger.refresh(); }} onError={() => setFailed(true)} />}
              {courtyardHotspots.map((spot) => {
                const isLit = lit.includes(spot.id);
                return <button key={spot.id} type="button"
                  className={`courtyard-hotspot ${spot.kind === "lamp" ? "is-lamp" : "is-detail"} ${isLit ? "is-lit" : ""}`}
                  style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
                  aria-label={`${ne ? spot.neLabel : spot.label} — ${ne ? "हेर्नुहोस्" : "inspect"}`}
                  aria-pressed={spot.kind === "lamp" ? isLit : undefined}
                  aria-expanded={inspecting && selected === spot.id}
                  aria-controls={inspecting && selected === spot.id ? "discovery-panel" : undefined}
                  onFocus={(event) => {
                    if (!event.currentTarget.matches(":focus-visible")) return;
                    if (inspecting) {
                      // Tabbing between details reframes without changing a lamp's state.
                      setSelected(spot.id);
                      onInspect(spot.discovery);
                    }
                    if (!inspecting || reduced) revealPoint(spot.x, spot.y);
                  }}
                  onClick={(event) => {
                    if (event.detail !== 0 && wasDragged()) return;
                    if (spot.kind === "lamp") toggleLight(spot.id);
                    setSelected(spot.id);
                    onInspect(spot.discovery);
                  }}>
                  <span className="hotspot-aura" aria-hidden="true" />
                  <span className="hotspot-mark" aria-hidden="true" />
                  <span className="hotspot-label">{ne ? spot.neLabel : spot.label}</span>
                </button>;
              })}
            </div>
          </div>
        </div>
        <div className="courtyard-atmosphere" aria-hidden="true" />
      </div>
      {failed && <p className="courtyard-error" role="alert">{ne ? "आँगनको तस्बिर खुलेन।" : "The courtyard image could not load."} <button onClick={() => setAttempt((value) => value + 1)}>{ne ? "फेरि प्रयास" : "Retry artwork"}</button></p>}
    </div>
  );
}
