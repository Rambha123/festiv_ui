# Codex working agreement for PRAKASH

Read PROJECT_SPEC.md before making architectural or visual decisions. Treat its non-negotiables and acceptance criteria as source of truth.

- Work incrementally; inspect the existing repository before modifying it. Plan briefly, then implement and validate. Do not stop at a plan or mockup.
- TypeScript strict mode; functional React components, reusable typed hooks, data-driven chapters and hotspots. Avoid `any`, excessive prop drilling, unnecessary abstractions and new libraries.
- Separate rendering, animation orchestration, interaction state, and content. Keep scene animation timelines in scoped GSAP contexts and clean them up on unmount. Register ScrollTrigger appropriately and refresh after asset loading/layout changes.
- Favor native scrolling and reversible GSAP scrubbed timelines. Never block wheel/trackpad scrolling globally. Avoid layout thrashing: animate transform and opacity, throttle pointer updates with requestAnimationFrame, and avoid huge filters on mobile.
- Robust error handling: validate localStorage JSON and defaults, handle failed image/audio loading, guard missing DOM refs, handle export failures with visible actionable errors, add clear development logging without leaking data. Never silently swallow errors.
- Accessibility: semantic buttons, labels, visible focus, keyboard equivalents, reduced-motion behavior, minimum touch targets, meaningful contrast. Audio off by default.
- Performance: lazy-load later scenes, responsive assets, cache static resources, avoid continuous React re-renders for pointer movement, optimize image formats, provide fallback for slow devices.
- Never add people, avatars, crowds, or silhouettes. Preserve calm first-person POV, traditional Nepali architectural atmosphere, and distinct respectful Tihar/Chhath representations.
- Run available lint, typecheck, unit tests and production build after major milestones. Fix failures. Explain any untested or incomplete item in the final summary.
- Maintain a concise implementation checklist in README or TASKS.md and update it as work progresses. Do not claim completion without checking acceptance criteria.
