import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { chapterAt, chapters } from "../engine/sceneManifest";

gsap.registerPlugin(ScrollTrigger);

export function useScrollJourney(
  root: RefObject<HTMLDivElement | null>,
  reduced: boolean,
  onChapter: (chapter: number) => void,
  onProgress: (progress: number) => void,
) {
  useLayoutEffect(() => {
    if (!root.current) return;
    let previous = -1;
    const ctx = gsap.context(() => {
      const state = { p: 0 };
      const updateProgress = (progress: number) => {
        onProgress(progress);
        const chapter = chapterAt(progress);
        if (chapter !== previous) {
          previous = chapter;
          onChapter(chapter);
        }
        const debug = root.current?.querySelector("[data-debug]");
        if (debug) debug.textContent = `Progress ${progress.toFixed(3)} | Chapter ${chapter + 1}`;
      };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: reduced ? true : 0.65,
          invalidateOnRefresh: true,
          onUpdate: (trigger) => updateProgress(trigger.progress),
          onRefresh: (trigger) => updateProgress(trigger.progress),
        },
        defaults: { ease: "none" },
      });
      timeline
        .to(state, { p: 1, duration: 1 }, 0)
        .to(".intro-scroll", { y: reduced ? 0 : -70, autoAlpha: 0, duration: 0.055 }, 0.065)
        .to(".opening", { autoAlpha: 0, duration: 0.045 }, 0.095)
        .to(".alley-camera", { scale: reduced ? 1 : 1.21, yPercent: reduced ? 0 : 2, duration: 0.32 }, 0)
        .fromTo(".courtyard-scene", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.29)
        .to(".environment", { autoAlpha: 0, duration: 0.065 }, 0.32)
        .fromTo(".courtyard-travel", { scale: reduced ? 1 : 1.015 }, { scale: reduced ? 1 : 1.09, duration: 0.24 }, 0.3)
        .fromTo(".riverbank-still", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.54)
        .to(".courtyard-scene", { autoAlpha: 0, duration: 0.1 }, 0.54)
        .fromTo(".riverbank-camera", { scale: reduced ? 1 : 1.025 }, { scale: reduced ? 1 : 1.13, duration: 0.29 }, 0.53)
        .fromTo(".riversteps-still", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.075 }, 0.755)
        .fromTo(".riversteps-camera", { scale: 1 }, { scale: reduced ? 1 : 1.1, yPercent: reduced ? 0 : -1, duration: 0.2 }, 0.75)
        .fromTo(".sunrise-still", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.84)
        .fromTo(".sunrise-camera", { scale: reduced ? 1 : 1.055 }, { scale: 1, duration: 0.16 }, 0.84);

      for (const cue of [{ start: 0.285, peak: 0.325, end: 0.38, opacity: 0.8 },
        { start: 0.49, peak: 0.555, end: 0.655, opacity: 0.96 },
        { start: 0.745, peak: 0.785, end: 0.835, opacity: 0.38 }]) {
        timeline.to(".transition-veil", { opacity: cue.opacity, duration: cue.peak - cue.start, ease: "sine.inOut" }, cue.start)
          .to(".transition-veil", { opacity: 0, duration: cue.end - cue.peak, ease: "sine.inOut" }, cue.peak);
      }
      // Independent lines let reverse scrolling restore each entrance, too.
      chapters.slice(1).forEach((chapter, index) => {
        const i = index + 1;
        if (i === 3 || i === 4) return;
        const start = chapter.start + (i === 2 ? 0.025 : 0.006);
        const end = chapters[i + 1]?.start ?? 1.06;
        const selector = `.narrative-${i}`;
        timeline.fromTo(selector,
          { autoAlpha: 0, y: reduced ? 0 : 32 },
          { autoAlpha: 1, y: 0, duration: i === 5 ? 0.025 : 0.022, ease: "sine.out" }, start);
        if (i < 5) timeline.to(selector,
          { autoAlpha: 0, y: reduced ? 0 : -28, duration: 0.025, ease: "sine.in" }, end - 0.035);
      });
    }, root);
    let active = true;
    document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); }).catch((error: unknown) => {
      console.warn("[PRAKASH] Font layout could not be refreshed.", error);
    });
    return () => { active = false; ctx.revert(); };
  }, [root, reduced, onChapter, onProgress]);
}
