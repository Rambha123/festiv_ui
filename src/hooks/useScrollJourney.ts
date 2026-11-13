import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { chapterAt } from "../engine/sceneManifest";
gsap.registerPlugin(ScrollTrigger);
export function useScrollJourney(
  root: RefObject<HTMLDivElement | null>,
  reduced: boolean,
  onChapter: (c: number) => void,
  renderFrame: (p: number) => void,
) {
  useLayoutEffect(() => {
    if (!root.current) return;
    let previous = -1;
    const ctx = gsap.context(() => {
      const state = { p: 0 };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: reduced ? true : 0.25,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          renderFrame(state.p);
          const chapter = chapterAt(state.p);
          if (chapter !== previous) {
            previous = chapter;
            onChapter(chapter);
          }
          const debug = root.current?.querySelector("[data-debug]");
          if (debug)
            debug.textContent = `Progress ${state.p.toFixed(3)} | Chapter ${chapter + 1}`;
        },
      });
      timeline
        .to(state, { p: 1, duration: 1, ease: "none" }, 0)
        .to(".opening", { autoAlpha: 0, duration: 0.04 }, 0.1)
        .fromTo(
          ".frame-sequence",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.06, ease: "none" },
          0.14,
        )
        .fromTo(
          ".court-interactions",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.02 },
          0.35,
        )
        .to(".court-interactions", { autoAlpha: 0, duration: 0.02 }, 0.5);
    }, root);
    return () => ctx.revert();
  }, [root, reduced, onChapter, renderFrame]);
}
