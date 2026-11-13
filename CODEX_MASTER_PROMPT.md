# CODEX MASTER IMPLEMENTATION PROMPT — PRAKASH

You are acting as a senior creative frontend engineer, interactive experience developer, motion designer, and technical architect.

Your task is to implement **Prakash — A Journey from Darkness to Dawn**, an immersive, first-person, scroll-driven 2.5D illustrated website inspired by Tihar and Chhath in Nepal.

This is intended to be a visually impressive interactive web application, not a conventional landing page.

## 0. Read the project documentation

Before writing code, read the following files completely if they exist:

- `PROJECT_SPEC.md`
- `AGENTS.md`
- `CODEX_MASTER_PROMPT.md`

Use them as supporting project documentation.

However, the instructions in this message take precedence if there are any conflicts.

Preserve the project's established design direction and cultural requirements.

## 1. Inspect the existing project and artwork

Use the five existing PNGs below. These paths are relative to the project root and match the current folder structure exactly. Preserve their case and spaces. No files need to be moved or renamed.

| Source asset | Role |
| --- | --- |
| `public/assets/environments/Unlit Basantapur Alley.png` | Pre-ignition view of the alley. |
| `public/assets/environments/lit Basantapur Alley.png` | The same alley after ignition and the base for forward travel. |
| `public/assets/environments/temple-courtyard.png` | The closer destination view at the end of the alley. |
| `public/assets/objects/diya-unlit-frontfacing.png` | The primary interactive diya in The First Spark. |
| `public/assets/objects/diya-unlit-sidefacing.png` | Reusable environmental diya, placed where the side angle matches the scene. |

These are the canonical asset paths for this milestone. If another project document references the older single-alley or single-diya filenames, use this table. For Vite public assets, centralize the runtime URLs in the scene manifest, omit the `public/` prefix, and respect the configured base path. Handle spaces in URLs without double encoding. Verify the exact casing in the production build because a path that works on Windows may fail on a case-sensitive host.

Before implementation:

1. Confirm all five files exist and decode. Inspect dimensions, aspect ratios, formats, and transparency.
2. Visually inspect the images where tooling permits. Compare the lit and unlit alley at the temple silhouette, rooflines, paving lines, and vanishing point. Determine whether the differences are lighting-only or whether geometry and framing also changed.
3. Compare the lit alley with the courtyard. Record the temple anchor and the framing needed for the approach and handoff.
4. Check actual alpha transparency and the visible wick position for both diya images. Record a separate flame anchor for each angle relative to its image bounds. Do not assume the PNG extension guarantees a transparent background.
5. Identify which parts of the artwork can realistically support 2.5D movement and which need to stay fixed.

Do not assume the artwork consists of separate layers.

Do not silently replace the supplied images with generic stock photos, placeholders, emoji, or unrelated illustrations.

Preserve the supplied artwork as the main visual foundation.

If any image is missing, report the exact missing path and provide a graceful fallback instead of crashing.

## 2. Project goal

Build an immersive experience in which the visitor feels physically present inside a traditional Nepali environment.

The visitor begins in darkness, lights a diya, and travels forward through a peaceful Basantapur-inspired Newari alley toward an illuminated pagoda temple courtyard.

Eventually, the full project will continue toward dawn and a Chhath-inspired riverbank.

The primary interaction is mouse-wheel scrolling.

**Scrolling forward must feel like walking forward through the environment. Scrolling backward must feel like walking backward along the same path.**

The website must not behave like a conventional landing page, slideshow, or sequence of unrelated full-screen images.

The entire experience should feel calm, beautiful, atmospheric, and continuous.

## 3. Non-negotiable visual requirements

- First-person POV camera at approximately human eye height.
- Absolutely no visible people, avatars, silhouettes, or characters.
- Traditional Kathmandu Valley Newari architecture.
- Peaceful Tihar atmosphere.
- Warm golden diya and string lighting.
- Deep indigo nighttime sky.
- Beautiful illustrated environments.
- Subtle painterly textures.
- Calm and restrained animation.
- No excessive particles, camera shaking, rapid zooming, or flashy transitions.
- Minimal interface elements.
- No intrusive navigation bars, conventional hero sections, or large information panels covering the environment.

The website should feel like exploring a beautiful, quiet illustrated world.

## 4. Recommended technology stack

Use:

- React
- Vite
- TypeScript
- Tailwind CSS
- GSAP
- GSAP ScrollTrigger where appropriate
- Zustand for application state
- Lucide React for interface icons

Use CSS transforms, SVG, and layered images for the 2.5D experience.

Do not introduce Three.js unless a specific requirement cannot reasonably be implemented with the chosen approach.

Keep dependencies minimal and justified.

If the repository already contains a working compatible setup, preserve it rather than unnecessarily recreating the project.

## 5. Build a reusable POV travel engine

Implement a virtual camera system controlled by normalized journey progress.

The camera should not jump directly between chapters.

Represent progress as a continuous value, for example:

- 0.00–0.12: opening and first spark
- 0.12–0.60: forward movement through the alley
- 0.60–0.82: approaching and entering the courtyard
- 0.82–1.00: settling in the courtyard and exploration

These ranges are initial design guidelines and may be adjusted to fit the artwork.

Implement:

1. A central journey progress controller.
2. Smooth mouse-wheel input accumulation.
3. Direction-aware movement.
4. Progress clamping.
5. Smooth interpolation or damping.
6. Scroll velocity management.
7. A virtual camera transform system.
8. Depth-aware object positioning.
9. Scene-specific camera configuration.
10. Reversible transitions.
11. Resize-aware camera framing.
12. Proper cleanup of event listeners and animation instances.

Avoid excessive wheel sensitivity.

Use a requestAnimationFrame-based render loop only when necessary, and prevent unnecessary React re-renders on every animation frame.

The camera should feel as though it is gently walking forward, not flying rapidly through the scene.

Add only extremely subtle vertical walking motion, if any.

## 6. Important limitation of the supplied illustrations

Both alley lighting states and the courtyard are flattened 2D illustrations. The two alley images are alternate states of the same location, not depth layers or separate chapters.

Do not pretend they are full 3D environments.

A single image cannot support unlimited realistic camera movement or reveal geometry that was never illustrated.

Implement the best feasible hybrid 2.5D approach using:

- Perspective-aware image scaling.
- Careful translation toward the vanishing point.
- Cropping and responsive camera framing.
- Foreground overlays where appropriate.
- Separately positioned interactive objects.
- Gradual environmental transitions.
- Depth masks and atmospheric overlays.
- Image alignment between the alley and courtyard.
- Controlled crossfades only as supporting effects, never as the sole transition mechanism.

When transitioning to the courtyard, align the temple and major architectural features as closely as possible.

Use a camera move, perspective-aware scaling, and a carefully timed image transition to create the illusion of approaching the same temple.

If the two images cannot be aligned convincingly, identify the issue and document what intermediate illustration or separated layer would improve the result.

Do not introduce visibly broken geometry or exaggerated distortion merely to avoid a transition.

## 7. Opening scene — The First Spark

Build a cinematic opening experience.

Initial state:

- Full viewport dark midnight-indigo background.
- Very subtle atmospheric texture.
- The front-facing unlit diya displayed slightly below center, over the unlit alley obscured by a dark overlay.
- Elegant serif typography reading "PRAKASH".
- Subtitle: "A Journey from Darkness to Dawn".
- Minimal instruction: "Hold to ignite".

Interaction:

The visitor presses and holds the diya for approximately 1.2 seconds.

Provide visible progress feedback while holding.

When the hold completes:

1. A small flame ignites above the wick.
2. The flame grows gently.
3. A warm radial glow expands.
4. Soft ember particles appear briefly.
5. The surrounding darkness lifts and warm light reveals the lit alley at the same camera position. Apply the alley alignment rules in Section 8 so ignition changes illumination without moving the architecture.
6. The title fades away.
7. The POV journey becomes available.

Implement the flame with SVG or CSS animation.

The flame must be independently animated from the diya image.

Do not use emoji as the flame.

The ignition must work with mouse, touch, and keyboard.

Provide an accessible alternative activation mechanism and support reduced-motion preferences.

The opening should be replayable.

## 8. Alley scene — First-person journey

Use the unlit and lit alley files from Section 1 as two lighting states of one location. The lit artwork is the main travel view toward the pagoda temple. Keep ignition state independent of camera progress so reverse travel does not unintentionally reset the lighting.

- If both images register at desktop and mobile framing, render them with identical crop, transform origin, and camera transform. Reveal the lit state with a soft mask centered near the diya during ignition. Preload and decode the two images before the reveal so ignition never exposes a blank frame.
- If architecture does not align, do not blend the mismatched layers. Keep the lit alley as one stable base, use a darkening overlay before ignition, and animate the overlay and localized warmth away. Document why the supplied unlit image could not safely be composited. Preserve both originals.
- Treat the alley-to-courtyard handoff as camera travel. Do not reuse the ignition lighting blend as the chapter transition.

Implement a full-viewport scene renderer.

Required behavior:

- The camera initially looks straight down the alley.
- The viewer can move forward using the mouse wheel.
- The central stone pathway acts as the main visual travel direction.
- Buildings and pavement should gradually enlarge as the viewer advances.
- The temple should appear to approach.
- The motion must remain aligned with the image's perspective.
- Scroll backward should reverse the movement smoothly.
- The camera should not rotate randomly or drift sideways.
- The user must not encounter visible black gaps or empty regions during travel.

Add subtle atmospheric effects:

- Gentle warm light bloom around existing lamps.
- Very faint floating dust.
- Subtle illumination changes.
- Minimal ambient movement.
- Soft vignette.
- Carefully controlled parallax on separately rendered elements.

Do not add heavy blur, excessive bloom, or bright neon effects.

The environment must remain readable and beautiful.

## 9. Interactive lighting

Implement reusable interactive diya components.

Use the front-facing diya for the separate opening interaction. Use the side-facing diya for environmental interactions where the perspective and scale fit the alley or courtyard.

Render each lamp's flame and glow separately in CSS or SVG. Anchor the flame to that variant's visible wick, and keep the sprite, anchor, and hit target aligned as the camera transforms and the viewport resizes. Do not mirror one sprite as a substitute for the other. If transparency is unusable, preserve the original and document any cleaned derivative or fallback used.

Do not cover existing illustrated lamps unnecessarily.

Each interactive diya should support:

- Hover or focus feedback.
- Click/tap ignition.
- Animated flame appearance.
- Warm radial glow.
- Persistent lit state.
- Optional short cultural discovery.
- Accessible label.
- Keyboard activation.

Use Zustand to store lit states.

Persist meaningful progress in localStorage.

The visitor should be able to revisit the alley without losing already-lit diyas.

Avoid positioning too many interactive objects in the initial prototype.

Start with three carefully placed interactions.

## 10. Courtyard arrival

Use:

`public/assets/environments/temple-courtyard.png`

The courtyard is the continuation of the Basantapur alley.

As the visitor approaches the temple:

1. The virtual camera moves toward the distant temple in the lit alley artwork.
2. The alley's foreground gradually moves out of view.
3. The courtyard artwork begins replacing the distant scene at an appropriate progress threshold.
4. The temple remains visually aligned as much as possible.
5. The transition feels spatial and deliberate.
6. The camera settles gently inside the courtyard.

Avoid a sudden image swap.

Avoid a generic page fade.

Avoid a slideshow transition.

The courtyard should feel like a destination reached through travel.

When the viewer arrives, display a small elegant chapter label:

"THE COURTYARD OF LIGHTS"

The label should fade in unobtrusively and disappear after a short delay.

Add a few interactive objects or hotspots.

Keep the environment free of people.

## 11. Scroll and interaction coordination

Wheel input must not accidentally move the camera while the user is interacting with a modal or another scrollable interface.

Implement an interaction state system.

Possible states:

- INTRO
- IGNITING
- TRAVELING
- EXPLORING
- MODAL_OPEN
- TRANSITIONING
- FINALE

When a modal is open, pause camera movement.

When the user closes it, restore the previous camera progress.

Do not reset the journey when an interaction finishes.

Prevent the browser page itself from scrolling during the immersive experience, but do not trap keyboard focus or break accessibility.

Allow navigation using arrow keys or other clearly documented alternatives.

On touch devices, use vertical swipe gestures or an accessible progress control.

## 12. Visual interface

Use a restrained cinematic interface.

Top-left:
- Small PRAKASH wordmark.

Top-right:
- Sound toggle.
- Language toggle.
- Minimal chapter navigation button.

Bottom-center:
- Small scroll instruction that disappears after movement begins.

Bottom-right or side:
- Subtle chapter progress indicator.

Do not add large permanent cards over the environment.

Use a refined serif font for titles.

Use a clean sans-serif font for controls.

Recommended colors:

- Midnight: #080C19
- Deep indigo: #151B38
- Twilight: #4B2D68
- Warm amber: #E88C39
- Flame gold: #FFC46B
- Dawn cream: #FFF0D4

Use Noto Serif Devanagari for Nepali typography when necessary.

All interactive controls must have clear hover, focus, and active states.

## 13. Cultural content

The experience is inspired by Tihar and Chhath.

Do not treat them as one continuous religious ritual.

The transition from Tihar night to Chhath dawn is symbolic.

Use respectful, concise descriptions.

Do not invent historical or ritual facts.

For this initial milestone, focus on the Tihar alley and courtyard.

Prepare the architecture to support later chapters:

- Illuminated village.
- Twilight journey.
- Chhath riverbank.
- Sunrise interaction.
- Personalized wish card.

Do not block completion of the initial prototype on artwork that has not yet been provided.

## 14. Project architecture

Create maintainable reusable components.

Suggested structure:

src/
  components/
    SceneViewport.tsx
    SceneLayer.tsx
    Diya.tsx
    LightGlow.tsx
    ChapterProgress.tsx
    DiscoveryCard.tsx
  engine/
    journeyController.ts
    camera.ts
    sceneManifest.ts
    inputController.ts
  scenes/
    FirstSpark.tsx
    BasantapurAlley.tsx
    TempleCourtyard.tsx
  hooks/
    useReducedMotion.ts
  store/
    journeyStore.ts
  styles/
    globals.css
  App.tsx

You may adjust the structure if there is a better architectural reason.

Keep scene data declarative where practical.

Avoid large monolithic components.

Avoid unnecessary abstractions.

## 15. Error handling and debugging

Error handling is a high priority.

Implement:

- Asset loading errors with useful file paths.
- Clear console warnings for missing assets.
- Safe defaults for invalid progress values.
- Graceful behavior when animations cannot initialize.
- Proper cleanup of listeners and observers.
- Handling of resize and orientation changes.
- Development-only debug information.

Create a development debug overlay that can be toggled with a keyboard shortcut.

It should show:

- Current journey progress.
- Active scene.
- Scroll direction.
- Camera scale.
- Camera translation.
- Active interaction state.
- Asset loading status.

The debug overlay must be hidden by default and excluded or disabled in production.

Do not silently swallow errors.

Use meaningful error messages.

## 16. Performance requirements

Target smooth interaction on ordinary laptops.

Optimize for:

- Minimal React re-renders.
- Transform and opacity animations where possible.
- Image preloading.
- Responsive image sizing.
- Efficient SVG effects.
- Reduced GPU-intensive blur.
- Avoiding layout thrashing.
- Proper cleanup of GSAP timelines.
- Reasonable memory usage.

Use WebP where it improves performance without unacceptable visual degradation.

Preserve original artwork.

Avoid loading all future chapters immediately.

## 17. Accessibility and responsiveness

The experience must work on desktop and mobile.

Desktop:
- Mouse-wheel travel.
- Keyboard travel.
- Pointer interactions.

Mobile:
- Touch swipe or alternative progress control.
- Large touch targets.
- Responsive scene framing.
- No reliance on hover.

Accessibility:
- Semantic controls.
- Visible keyboard focus.
- Accessible object labels.
- Reduced-motion support.
- Sound off by default.
- Sufficient contrast.
- Skip or replay intro controls.

## 18. Testing

Implement and run appropriate tests.

At minimum verify:

1. The project starts successfully.
2. All five asset paths resolve and decode in development and the production preview. Verify the front-facing diya is used in the opening, the side-facing diya is used for environmental interactions, and the courtyard artwork is used at arrival. Test that ignition holds a stable frame without ghosting, and that the one-base-image fallback works if the lit and unlit art cannot be aligned.
3. The opening diya can be ignited.
4. Scroll forward advances progress.
5. Scroll backward reverses progress.
6. Progress remains within valid bounds.
7. Alley-to-courtyard transition works.
8. Lit diyas retain their state.
9. Modal interactions pause camera movement.
10. Keyboard and touch navigation work.
11. Reduced-motion mode remains usable.
12. Production build succeeds.

Use Vitest for logic tests where appropriate.

If browser automation is available, run a visual smoke test.

Fix all TypeScript, build, and runtime errors before reporting completion.

## 19. Implementation order

Work in this order:

Phase 1:
- Inspect the repository and image assets.
- Initialize or validate React/Vite/TypeScript.
- Create the scene viewport.
- Implement the opening diya.

Phase 2:
- Implement normalized journey progress.
- Implement smooth wheel input.
- Build the virtual camera.
- Render the alley with perspective-aware motion.

Phase 3:
- Integrate the courtyard.
- Implement the alley-to-courtyard transition.
- Verify reverse travel.

Phase 4:
- Add interactive diyas, lighting, and discoveries.
- Add chapter progress and controls.
- Add state persistence.

Phase 5:
- Optimize responsiveness and performance.
- Add debugging tools.
- Run tests and production build.
- Document limitations and next steps.

Do not stop after producing a plan.

Implement the actual working application.

## 20. Acceptance criteria

The initial milestone is complete only when:

- The application runs locally.
- The supplied illustrations are used in their assigned roles. Both alley lighting states work without shifting architecture, or the documented single-base fallback produces a stable lighting change when the images cannot be aligned.
- The opening diya is interactive.
- The visitor can scroll forward through the alley.
- Scrolling backward reverses the journey.
- The temple appears to approach.
- The visitor can reach the courtyard.
- The transition does not feel like an ordinary page change.
- The environment contains no visible people.
- The visual atmosphere remains peaceful.
- The interface is minimal and polished.
- The experience works on desktop and mobile.
- The production build passes.

If a limitation of the artwork prevents convincing continuous travel, explain it precisely and identify the minimum additional artwork required.

## 21. Final deliverables

When finished, provide:

1. A working React application.
2. A summary of implemented features.
3. Instructions to run the application.
4. A list of tests performed and their results.
5. A description of the POV camera system.
6. Any remaining visual limitations.
7. The next assets required to continue toward the Chhath sunrise.
8. A concise list of next development priorities.

Remember:

**This must feel like a peaceful first-person journey through a beautifully illuminated Nepali world.**

The visitor should feel that they are traveling toward the temple with each movement of the mouse wheel.

The project is called PRAKASH.

Build the experience, not just a collection of screens.
