import { FrameSequence, type SequenceHandle } from "./components/FrameSequence";
import { WishEditor } from "./components/WishEditor";
import { narrative } from "./data/narrative";
import { useCallback, useEffect, useRef, useState } from "react";
import { assets, chapters } from "./engine/sceneManifest";
import { useJourney } from "./store/journeyStore";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useAssets } from "./hooks/useAssets";
import { useScrollJourney } from "./hooks/useScrollJourney";
import { Diya } from "./components/Diya";
import { DiscoveryCard } from "./components/DiscoveryCard";
import { discoveries } from "./data/discoveries";
import { AlleyLamps } from "./components/AlleyLamps";
import { alleyLamps } from "./data/alleyLamps";
export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const sequence = useRef<SequenceHandle>(null);
  const renderFrame = useCallback(
    (p: number) => sequence.current?.render(p),
    [],
  );
  const [wishOpen, setWishOpen] = useState(false);
  const { reduced, toggleMotion, resetMotion } = useReducedMotion();
  const loading = useAssets();
  const [chapter, setChapter] = useState(0);
  const [panel, setPanel] = useState<string | null>(null);
  const [map, setMap] = useState(false);
  const [debug, setDebug] = useState(false);
  const {
    lit,
    light,
    language,
    setLanguage,
    discover,
    discovered,
    replay,
    storageError,
  } = useJourney();
  const ignited = lit.includes("first");
  const ne = language === "ne";
  const updateChapter = useCallback((value: number) => setChapter(value), []);
  useScrollJourney(root, reduced, updateChapter, renderFrame);
  useEffect(() => {
    document.documentElement.lang = ne ? "ne" : "en";
  }, [ne]);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const key = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "d" &&
        event.shiftKey &&
        !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)
      )
        setDebug((value) => !value);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const jump = (progress: number) => {
    const element = root.current;
    if (!element) return;
    window.scrollTo({
      top: element.offsetTop + (element.offsetHeight - innerHeight) * progress,
      behavior: reduced || progress === 0 ? "instant" : "smooth",
    });
    setMap(false);
  };
  const restartOpening = () => {
    jump(0);
    replay();
    resetMotion();
    setPanel(null);
  };
  return (
    <>
      <a href="#journey-end" className="skip-link">
        {ne ? "यात्राको अन्त्यमा जानुहोस्" : "Skip to journey end"}
      </a>
      <main
        ref={root}
        className={`journey ${(ignited || chapter > 0) && loading.ready ? "ignited" : ""} ${reduced ? "reduced" : ""}`}
        aria-label={ne ? "प्रकाश यात्रा" : "Prakash scroll journey"}
      >
        <div className="scene-viewport">
          <div className="environment">
            <div className="alley-camera">
              <img className="scene-art" src={assets.unlit} alt="" />
              <AlleyLamps active={ignited && chapter < 2} />
            </div>
            <div className="courtyard-camera">
              <img
                className="scene-art courtyard-art"
                src={assets.courtyard}
                alt=""
              />
              <div
                className="scene-lamps courtyard-lamps"
                inert={chapter !== 2}
              >
                <div className="artwork-lamp court-lamp left">
                  <Diya
                    id="court-left"
                    variant="side"
                    artwork
                    label={
                      ne ? "बायाँ दियो बाल्नुहोस्" : "Light the left courtyard diya"
                    }
                  />
                </div>
                <div className="artwork-lamp court-lamp right">
                  <Diya
                    id="court-right"
                    variant="side"
                    artwork
                    label={
                      ne
                        ? "दायाँ दियो बाल्नुहोस्"
                        : "Light the right courtyard diya"
                    }
                  />
                </div>
              </div>
            </div>
            <div className="darkness" />
            <div className="ignition-warmth" aria-hidden="true">
              <span />
            </div>
            <div className="vignette" />
          </div>
          <FrameSequence ref={sequence} reduced={reduced} />
          <header>
            <span className="wordmark">
              PRAKASH<span>प्रकाश</span>
            </span>
            <nav aria-label={ne ? "यात्रा नियन्त्रण" : "Journey controls"}>
              <span
                className="sound-note"
                title="No audio is included in this milestone"
              >
                {ne ? "शान्त" : "SOUND OFF"}
              </span>
              <button
                onClick={() => setLanguage(ne ? "en" : "ne")}
                aria-label={ne ? "Switch to English" : "नेपालीमा पढ्नुहोस्"}
              >
                {ne ? "EN" : "ने"}
              </button>
              <button onClick={() => setMap(!map)} aria-expanded={map}>
                {ne ? "अध्याय" : "Chapters"} <span aria-hidden="true">☰</span>
              </button>
            </nav>
          </header>
          {map && (
            <nav className="chapter-map" aria-label="Chapter navigation">
              {chapters.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => {
                    jump(item.start === 0 ? 0 : item.start + 0.015);
                  }}
                >
                  <span>0{index + 1}</span> {ne ? item.ne : item.name}
                </button>
              ))}
              <button onClick={restartOpening}>
                {ne ? "फेरि सुरु गर्नुहोस्" : "Replay opening"}
              </button>
              <button onClick={toggleMotion} aria-pressed={reduced}>
                {ne ? "कम गति" : "Reduced motion"}:{" "}
                {reduced ? (ne ? "चालु" : "on") : ne ? "बन्द" : "off"}
              </button>
              {chapter > 0 && (
                <button
                  onClick={() =>
                    light(
                      chapter === 1
                        ? (alleyLamps.find((lamp) => !lit.includes(lamp.id))
                            ?.id ?? "alley")
                        : "court-left",
                    )
                  }
                >
                  {ne ? "नजिकको दियो बाल्नुहोस्" : "Light a nearby diya"}
                </button>
              )}
            </nav>
          )}
          <section
            className="opening"
            aria-label={ne ? "पहिलो ज्योति" : "The first spark"}
          >
            <div className="intro-copy">
              <span className="eyebrow">
                {ne ? "अँध्यारोबाट उज्यालोतिर" : "FROM STILLNESS, A SMALL LIGHT"}
              </span>
              <h1>PRAKASH</h1>
              <p>
                {ne
                  ? "अँध्यारोबाट बिहानीसम्मको यात्रा"
                  : "A Journey from Darkness to Dawn"}
              </p>
            </div>
            <p className="opening-narrative">{narrative[0][ne ? 1 : 0]}</p>
            <div className="opening-diya">
              <Diya
                id="first"
                variant="front"
                label={ne ? "पहिलो दियो बाल्नुहोस्" : "Light the diya"}
                hold
              />
              <p className="ignite-instruction">
                {ignited
                  ? ne
                    ? "गल्लीका दियोहरू बाल्नुहोस्।"
                    : "Light the lamps along the alley."
                  : ne
                    ? "बाल्न थिचिराख्नुहोस् · वा ट्याप गर्नुहोस्"
                    : "Hold to ignite · or tap / press Enter"}
              </p>
              <button
                className="text-button"
                onClick={() => {
                  jump(0.14);
                }}
              >
                {ne ? "यात्रा जारी राख्नुहोस्" : "Skip intro"}{" "}
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          </section>
          <section
            className={`court-interactions ${lit.some((id) => id.startsWith("court-")) ? "court-glowing" : ""}`}
            inert={chapter !== 2}
            aria-label={
              ne ? "आँगनका दियो र जानकारी" : "Courtyard lamps and discoveries"
            }
          >
            <div className="courtyard-lamp-actions">
              <button
                aria-pressed={lit.includes("court-left")}
                onClick={() => light("court-left")}
              >
                {ne ? "बायाँ दियो बाल्नुहोस्" : "Light the left courtyard diya"}
              </button>
              <button
                aria-pressed={lit.includes("court-right")}
                onClick={() => light("court-right")}
              >
                {ne ? "दायाँ दियो बाल्नुहोस्" : "Light the right courtyard diya"}
              </button>
            </div>
            <span className="explore-label">
              {ne ? "आँगन अन्वेषण गर्नुहोस्" : "Explore the courtyard"}
            </span>
            <div
              className="discovery-links"
              aria-label={ne ? "आँगन अन्वेषण गर्नुहोस्" : "Explore the courtyard"}
            >
              {discoveries
                .filter((entry) => entry.id !== "offerings")
                .map((entry, index) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      discover(entry.id);
                      setPanel(entry.id);
                    }}
                    aria-label={`${ne ? entry.neTitle : entry.title}${discovered.includes(entry.id) ? " — visited" : ""}`}
                  >
                    <span aria-hidden="true">
                      {discovered.includes(entry.id) ? "✧" : "+"}
                    </span>
                    <span>{ne ? entry.neTitle : entry.title}</span>
                    <small>0{index + 1}</small>
                  </button>
                ))}
            </div>
          </section>
          <div className="arrival-label" aria-hidden="true">
            <span className="eyebrow">03 / 03</span>
            <h2>{ne ? "उज्यालो आँगन" : "The Courtyard of Lights"}</h2>
          </div>
          <footer>
            <span>
              {ne
                ? "स्क्रोल गरेर अघि बढ्नुहोस् · फर्कन माथि स्क्रोल गर्नुहोस्"
                : "Follow the lamps · scroll to travel"}
            </span>
            <span aria-live="polite">
              0{chapter + 1} <i>/ 06</i>{" "}
              <b>{ne ? chapters[chapter].ne : chapters[chapter].name}</b>
            </span>
          </footer>
          <div className="narrative" aria-live="polite">
            {chapter > 0 && <p>{narrative[chapter][ne ? 1 : 0]}</p>}
            {chapter === 3 && (
              <small>
                {ne ? "अर्को बिहान · छठ" : "Another morning · Chhath"} —{" "}
                {ne
                  ? "दुई छुट्टाछुट्टै पर्वबीचको प्रतीकात्मक यात्रा"
                  : "A symbolic passage between two distinct festivals"}
              </small>
            )}
            {chapter === 2 && (
              <small>
                {lit.includes("first")
                  ? ne
                    ? "तपाईंले बालेको दियो पछाडि अझै बलिरहेको छ।"
                    : "The lamp you lit is still burning behind you"
                  : ne
                    ? "गल्लीका दियोहरू पछाडि अझै बलिरहेका छन्।"
                    : "The lamps in the alley are still burning behind you."}
              </small>
            )}
            {chapter === 4 && (
              <button onClick={() => setPanel("offerings")}>
                {ne ? "अर्घ्य सामग्रीबारे" : "About the offerings"}
              </button>
            )}
            {chapter === 5 && (
              <>
                <button onClick={() => setWishOpen(true)}>
                  {ne ? "कामना लेख्नुहोस्" : "Write a wish"}
                </button>
                <button onClick={restartOpening}>
                  {ne ? "फेरि यात्रा गर्नुहोस्" : "Walk again"}
                </button>
              </>
            )}
          </div>
          {wishOpen && (
            <WishEditor ne={ne} onClose={() => setWishOpen(false)} />
          )}
          {panel && <DiscoveryCard id={panel} onClose={() => setPanel(null)} />}
          {(!loading.ready || loading.errors.length > 0 || storageError) && (
            <div className="notice" role="status">
              {!loading.ready ? (
                "Preparing the light…"
              ) : loading.errors.length ? (
                <>
                  Some artwork could not load.{" "}
                  <button onClick={() => location.reload()}>Retry</button>
                  <details>
                    <summary>Asset paths</summary>
                    {loading.errors.join(" · ")}
                  </details>
                </>
              ) : (
                storageError
              )}
            </div>
          )}
          {import.meta.env.DEV && (
            <output className="debug" hidden={!debug}>
              <span data-debug /> | Light {ignited ? "ON" : "OFF"} | Assets{" "}
              {loading.ready ? `${5 - loading.errors.length}/5` : "loading"} |
              Panel {panel ?? "closed"}
            </output>
          )}
        </div>
      </main>
      <section id="journey-end" tabIndex={-1} className="journey-end">
        <span className="eyebrow">
          {ne ? "अहिलेलाई, यही उज्यालोमा" : "FOR NOW, REST IN THE LIGHT"}
        </span>
        <h2>{ne ? "यात्रा यहाँ रोकिन्छ।" : "A quiet place to pause."}</h2>
        <p>
          {ne
            ? "यस बिहानको केही उज्यालो साथ लैजानुहोस्।"
            : "Carry a little of this morning with you."}
        </p>
        <button onClick={restartOpening}>
          {ne ? "फेरि यात्रा गर्नुहोस्" : "Walk the path again"} ↗
        </button>
      </section>
    </>
  );
}
