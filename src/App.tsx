import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { assets, chapters } from "./engine/sceneManifest";
import { openingDarkness } from "./engine/lighting";
import { narrative } from "./data/narrative";
import { useJourney } from "./store/journeyStore";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useAssets } from "./hooks/useAssets";
import { useScrollJourney } from "./hooks/useScrollJourney";
import { Diya } from "./components/Diya";
import { AlleyLamps } from "./components/AlleyLamps";
import { Courtyard } from "./components/Courtyard";
import { DiscoveryCard } from "./components/DiscoveryCard";
import { WishEditor } from "./components/WishEditor";
import { riverSceneAt, type RiverScene } from "./engine/riverScene";
import type { SharedWish } from "./engine/wishes";
import { DistantWishes } from "./components/DistantWishes";

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [panel, setPanel] = useState<string | null>(null);
  const [wishOpen, setWishOpen] = useState(false);
  const [riverScene, setRiverScene] = useState<RiverScene>(null);
  const [selectedWish, setSelectedWish] = useState<SharedWish | null>(null);
  const [map, setMap] = useState(false);
  const [debug, setDebug] = useState(false);
  const { reduced, toggleMotion, resetMotion } = useReducedMotion();
  const loading = useAssets(furthest);
  const { lit, language, setLanguage, discover, replay, storageError } = useJourney();
  const ignited = lit.includes("first");
  const ne = language === "ne";
  const updateChapter = useCallback((value: number) => {
    setChapter(value);
    setFurthest((previous) => Math.max(previous, value));
    setPanel(null);
    setWishOpen(false);
    setSelectedWish(null);
  }, []);
  const updateRiver = useCallback((progress: number) => {
    setRiverScene(riverSceneAt(progress));
  }, []);
  useScrollJourney(root, reduced, updateChapter, updateRiver);
  useEffect(() => { setPanel(null); }, [riverScene]);
  useEffect(() => { document.documentElement.lang = ne ? "ne" : "en"; }, [ne]);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const key = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "d" && event.shiftKey &&
        !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) {
        setDebug((value) => !value);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const inspect = (id: string) => { discover(id); setPanel(id); };
  const jump = (progress: number) => {
    const element = root.current;
    if (!element) return;
    window.scrollTo({
      top: element.offsetTop + (element.offsetHeight - innerHeight) * progress,
      behavior: reduced || progress === 0 ? "instant" : "smooth",
    });
    setMap(false);
  };
  const restart = () => {
    jump(0);
    replay();
    resetMotion();
    setPanel(null);
    setWishOpen(false);
  };
  const lightStyle = { "--opening-darkness": loading.ready ? openingDarkness(lit, chapter > 0) : 1 } as CSSProperties;
  return <>
    <a href="#journey-end" className="skip-link">{ne ? "यात्राको अन्त्यमा जानुहोस्" : "Skip to journey end"}</a>
    <main ref={root} style={lightStyle}
      className={`journey ${(ignited || chapter > 0) && loading.ready ? "ignited" : ""} ${reduced ? "reduced" : ""} ${panel || selectedWish ? "inspecting" : ""} ${panel && riverScene ? "river-inspecting" : ""} ${selectedWish ? "wish-inspecting" : ""}`}
      aria-label={ne ? "प्रकाश यात्रा" : "Prakash scroll journey"}>
      <div className="scene-viewport">
        <div className="environment">
          <div className="alley-camera">
            <img className="scene-art" src={assets.unlit} alt="" fetchPriority="high" />
            <AlleyLamps active={(ignited || chapter > 0) && chapter < 2} />
          </div>
          <div className="darkness" />
          <div className="ignition-warmth" aria-hidden="true"><span /></div>
        </div>
        <Courtyard active={chapter === 2} load={furthest >= 1} reduced={reduced} panel={panel} onInspect={inspect} />
        <div className="journey-still riverbank-still" aria-hidden="true">
          <div className="still-camera riverbank-camera">{furthest >= 2 && <div className="river-inspection"><img className="scene-art" src={assets.riverbank} alt="" decoding="async" /></div>}</div>
        </div>
        <div className="journey-still riversteps-still" aria-hidden="true">
          <div className="still-camera riversteps-camera">{furthest >= 3 && <div className="river-inspection"><img className="scene-art" src={assets.riverSteps} alt="" decoding="async" /></div>}</div>
        </div>
        <div className="journey-still sunrise-still" aria-hidden="true">
          <div className="still-camera sunrise-camera">{furthest >= 3 && <div className="river-inspection"><img className="scene-art" src={assets.sunrise} alt="" decoding="async" /></div>}</div>
        </div>
        <div className="vignette" aria-hidden="true" />
        <div className="transition-veil" aria-hidden="true" />
        <header>
          <span className="wordmark">PRAKASH<span>प्रकाश</span></span>
          <nav aria-label={ne ? "यात्रा नियन्त्रण" : "Journey controls"}>
            <button onClick={() => setLanguage(ne ? "en" : "ne")} aria-label={ne ? "Switch to English" : "नेपालीमा पढ्नुहोस्"}>{ne ? "EN" : "ने"}</button>
            <button onClick={() => setMap(!map)} aria-expanded={map}>{ne ? "अध्याय" : "Chapters"}<span aria-hidden="true">☰</span></button>
          </nav>
        </header>
        {map && <nav className="chapter-map" aria-label={ne ? "अध्याय" : "Chapter navigation"} onKeyDown={(event) => { if (event.key === "Escape") setMap(false); }}>
          {chapters.map((item, index) => <button key={item.name} onClick={() => jump(item.start === 0 ? 0 : item.start + (index === 2 ? 0.06 : 0.035))}>
            <span>0{index + 1}</span>{ne ? item.ne : item.name}
          </button>)}
          <button onClick={restart}>{ne ? "फेरि सुरु गर्नुहोस्" : "Replay opening"}</button>
          <button onClick={toggleMotion} aria-pressed={reduced}>{ne ? "कम गति" : "Reduced motion"}: {reduced ? (ne ? "चालु" : "on") : (ne ? "बन्द" : "off")}</button>
        </nav>}
        <section className="opening" inert={chapter !== 0} aria-label={ne ? "पहिलो ज्योति" : "The first spark"}>
          <div className="intro-scroll">
            <div className="intro-copy">
              <span className="eyebrow">{ne ? "अँध्यारोबाट उज्यालोतिर" : "FROM STILLNESS, A SMALL LIGHT"}</span>
              <h1>PRAKASH</h1>
              <p>{ne ? "अँध्यारोबाट बिहानीसम्मको यात्रा" : "A Journey from Darkness to Dawn"}</p>
            </div>
            <p className="opening-narrative">{narrative[0][ne ? 1 : 0]}</p>
          </div>
          <div className="opening-diya">
            <Diya id="first" variant="front" label={ne ? "पहिलो दियो बाल्नुहोस्" : "Light the diya"} hold />
            <p className="ignite-instruction">{ignited ? (ne ? "गल्लीका दियोहरू बाल्नुहोस्।" : "Let the light grow. Touch the lamps along the alley.") : (ne ? "बाल्न थिचिराख्नुहोस् · वा ट्याप गर्नुहोस्" : "Hold to ignite · or tap / press Enter")}</p>
            <button className="text-button" onClick={() => jump(0.16)}>{ne ? "यात्रा जारी राख्नुहोस्" : "Skip intro"} <span aria-hidden="true">↓</span></button>
          </div>
        </section>
        {riverScene && <button className="river-hotspot" onClick={() => inspect(riverScene)}
          aria-label={ne ? "नदीकिनारको कथा हेर्नुहोस्" : riverScene === "riversteps" ? "Explore the stone river steps" : "Explore the riverbank"}
          aria-expanded={panel === riverScene} aria-controls={panel === riverScene ? "discovery-panel" : undefined}>
          <span className="river-hotspot-ring" aria-hidden="true" />
          <span className="river-hotspot-hint">{ne ? "नदीकिनार छुनुहोस्" : "Touch the riverbank to discover"}</span>
        </button>}
        <DistantWishes active={chapter === 5} ne={ne} selectedId={selectedWish?.id ?? null}
          onSelect={(wish) => { setWishOpen(false); setSelectedWish(wish); }} />
        <div className="narrative-stage">
          {narrative.slice(1).map((line, index) => {
            const i = index + 1;
            if (i === 3 || i === 4) return null;
            return <section key={i} className={`narrative narrative-${i}`} inert={chapter !== i} aria-hidden={chapter !== i}>
              <span className="eyebrow">{ne ? chapters[i].ne : chapters[i].name}</span>
              <p>{line[ne ? 1 : 0]}</p>
              {i === 2 && <small>{ne ? "दियो वा फूल छुनुहोस्, कथा पत्ता लगाउनुहोस्।" : "Touch a lamp, a garland, a quiet detail."}</small>}
              {i === 5 && <div className="finale-actions">
                <button onClick={() => { setSelectedWish(null); setWishOpen(true); }}>{ne ? "कामना लेख्नुहोस्" : "Write a wish"} <span aria-hidden="true">↗</span></button>
                <button className="text-button" onClick={restart}>{ne ? "फेरि यात्रा गर्नुहोस्" : "Walk again"}</button>
              </div>}
            </section>;
          })}
        </div>
        <footer>
          <span>{ne ? "स्क्रोल गरेर अघि बढ्नुहोस् · फर्कन माथि स्क्रोल गर्नुहोस्" : "Scroll to wander · return the way you came"}</span>
          <span aria-live="polite">0{chapter + 1} <i>/ 06</i><b>{ne ? chapters[chapter].ne : chapters[chapter].name}</b></span>
        </footer>
        {wishOpen && <WishEditor ne={ne} onClose={() => setWishOpen(false)} />}
        {selectedWish && <DiscoveryCard id="wish" onClose={() => setSelectedWish(null)} customEntry={{
          title: "A wish among the stars", neTitle: "ताराहरूबीचको कामना", text: selectedWish.text, ne: selectedWish.text,
        }} />}
        {panel && <DiscoveryCard id={panel} onClose={() => setPanel(null)} />}
        {(!loading.ready || loading.errors.length > 0 || storageError) && <div className="notice" role="status">
          {!loading.ready ? "Preparing the light…" : loading.errors.length ? <>Some artwork could not load. <button onClick={() => location.reload()}>Retry</button></> : storageError}
        </div>}
        {import.meta.env.DEV && <output className="debug" hidden={!debug}><span data-debug /> | Light {ignited ? "ON" : "OFF"} | Panel {panel ?? "closed"}</output>}
      </div>
    </main>
    <section id="journey-end" tabIndex={-1} className="journey-end">
      <span className="eyebrow">{ne ? "अहिलेलाई, यही उज्यालोमा" : "FOR NOW, REST IN THE LIGHT"}</span>
      <h2>{ne ? "यात्रा यहाँ रोकिन्छ।" : "A quiet place to pause."}</h2>
      <p>{ne ? "यस बिहानको केही उज्यालो साथ लैजानुहोस्।" : "Carry a little of this morning with you."}</p>
      <button onClick={restart}>{ne ? "फेरि यात्रा गर्नुहोस्" : "Walk the path again"} ↗</button>
    </section>
  </>;
}
