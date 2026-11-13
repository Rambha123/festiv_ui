# PRAKASH — A Journey from Darkness to Dawn

## Product vision
An immersive, calm, cinematic, first-person (POV) 2.5D illustrated website. A lone unseen visitor travels through a deserted Basantapur-inspired Newari alley, a temple courtyard, illuminated traditional architecture, twilight countryside, and a Chhath-inspired Terai riverbank at sunrise. The journey connects the distinct festivals of Tihar and Chhath through the poetic motif of light. Never depict people, silhouettes of people, avatars, or crowds. Never imply these festivals are a single ritual or occur continuously on one day.

## Non-negotiable requirements
1. Entire journey is a continuous scroll-driven experience: mouse wheel advances the virtual camera through chapters, reverse scroll returns naturally. On touch devices, swipe/scroll does the same. Do not replace with next buttons, carousels, route changes, or mandatory clicking to navigate. Ordinary scrolling must remain accessible; no trapping the user or hijacking scrolling in inaccessible ways.
2. Strong first-person POV: eye-height camera, forward movement, depth, vanishing point, scene continuity, foreground objects sliding past; never third-person or overhead perspective. No visible people anywhere.
3. Mood: serene, quiet, contemplative, cinematic, warm, restrained; no excessive confetti, strobing, aggressive zoom, jump cuts, bright neon, or intrusive UI.
4. A coherent illustrated 2.5D visual system using layered transparent scene assets and subtle parallax, lighting and atmosphere. No mismatched stock-photo collages. Support fallback if polished assets unavailable.
5. Fully functional advanced-track app: interactive diya ignition, discoveries, progress, accessible controls, localized content, optional sound, and personalized wish card export.
6. Responsive on desktop and mobile; reduced-motion, keyboard navigation, contrast and accessible labels.

## Journey chapters and scene direction
### 01 — The First Spark
Begin in nearly black midnight indigo. Eye-level view into an unlit stone-paved Newari alley. A diya on a low ledge in foreground; short restrained title PRAKASH and line 'A Journey from Darkness to Dawn'. Click/press-and-hold or keyboard activate to ignite; glowing flame and subtle warmth reveal alley details. Scroll begins forward movement. Provide skip-intro and replay.
### 02 — The Alley of Lights
Camera travels forward through a deserted narrow Basantapur-inspired brick alley with traditional carved wooden windows, rooflines, temple details, hanging marigold garlands, rows of diyas. Perspective is architectural, eye-height, vanishing-point oriented. Scroll produces smooth, continuous camera travel; near objects move more than far objects. Cursor light reveals nearby details on desktop; mobile uses subtle fixed lantern-like glow. Optional clickable lamps remain lit; their state persists.
### 03 — The Courtyard
The alley opens spatially into a traditional temple courtyard, without people. Beautiful restrained rangoli, carved wooden windows, pagoda temple silhouette, rows of diyas, garlands. User can illuminate 5 key diyas and inspect 3 cultural hotspots. A quiet glow spreads to surrounding architecture. No gamey scoring overlays.
### 04 — A Thousand Lights
Camera proceeds past illuminated temples, windows, and peaceful traditional streets. Warm lights gradually activate in a staggered, organic wave as visitor passes. More spatial progression, not a separate gallery page. Gentle night ambience.
### 05 — Between Night and Dawn
Architecture gradually recedes and dissolves into a symbolic landscape transition. The sky moves from indigo to violet to peach as scrolling advances; distant trees and landscape gain depth; river becomes visible. This is an artistic passage between distinct festivals, not literal geographic/time continuity.
### 06 — Arunodaya
Visitor arrives at an empty Terai-inspired river ghat with calm water, bamboo offering baskets, fruit, sugarcane and quiet ritual objects; no people. The sun rises in response to continued scroll (optional direct drag interaction too); sky and water reflection update continuously. Discoveries explain the significance of Chhath and offerings to both setting and rising sun, respectfully and accurately.
### Finale — Carry the Light
At sunrise, display an elegant lightweight wish editor in an overlay that preserves scenery. User types a short wish, chooses one of 2-3 tasteful visual treatments, previews, downloads PNG. Replay journey and jump to completed chapter available unobtrusively.

## Visual system
- Palette: void #080C19, midnight #151B38, twilight #4B2D68, dusk #E88C39, flame #FFC46B, dawn #FFF0D4.
- Typography: Cormorant Garamond or Fraunces for short English display headings; Noto Serif Devanagari for Nepali; Inter for controls. Use fallback font stacks.
- Art: consistent illustrated painterly/vector 2.5D, gentle grain, atmospheric haze, warm localized light, precise architectural details, layered foreground/midground/background. Avoid photorealistic collage, cartoon icons as scene assets, or decorative stock UI.
- UI chrome: tiny PRAKASH wordmark, discreet chapter progress (01/06), sound toggle, EN/ने toggle, chapter map, subtle discovery prompts. Controls fade back during cinematic moments but remain recoverable. All interactions have visible focus states and keyboard equivalents.
- Light and motion: no sudden flashes. Flame flicker, subtle particles, soft radial glows, window warmth, gentle camera push, parallax, sky gradient interpolation, rippling reflection. Respect prefers-reduced-motion.

## UX and scroll mechanics
- Use a single pinned scene viewport or long scroll track with normalized scroll progress; define contiguous chapter ranges and interpolate camera/scene states between ranges. Smooth mouse wheel and trackpad behavior; backward scrubbing must work. Avoid custom wheel event trapping/preventDefault unless absolutely necessary. Native page scroll and ScrollTrigger scrub is preferred.
- Interaction hotspots do not block page scroll. Opening a detail panel pauses only interaction within that panel and preserves scroll progress.
- Optional ignition is a meaningful first action, but provide accessible skip/continue so users can navigate without pointer precision or long holds.
- Persist discovered objects, lit diyas, language and optional audio preferences in localStorage. Scroll position restoration optional but desirable.
- On mobile use portrait framing/art-directed crop, touch targets >=44px, reduced parallax and no hover-only functionality.

## Technical stack
React + Vite + TypeScript, Tailwind CSS, GSAP ScrollTrigger for timeline/scroll progress, Zustand for state, SVG/CSS for scene layers and lighting, optional Motion for small UI transitions, html-to-image for PNG export, Vercel deployment. Do not introduce Three.js or a backend without clear demonstrated need. Keep dependencies lean.

## Architecture
- src/components: SceneViewport, SceneLayer, LightReveal, Diya, DiscoveryCard, ChapterProgress, SoundToggle, LanguageToggle, WishCardEditor
- src/scenes: FirstSpark, AlleyOfLights, Courtyard, ThousandLights, Twilight, Arunodaya, Finale
- src/hooks: useScrollJourney, useParallax, useReducedMotion, useAudio
- src/store: journeyStore
- src/data: chapters, festivalContent (English and Nepali), hotspots
- public/scenes: scene-specific layered artwork with predictable naming and sizes
- public/audio: optional licensed/original ambient audio

## Functionality and acceptance criteria
1. Desktop mouse wheel smoothly moves POV forward through entire narrative; reverse wheel scrubs backward. No scene hard cuts; chapter transitions blend or camera travel.
2. Scrolling feels like traveling down an alley and through space, not simply sliding flat images vertically. At least 3 depth layers per key environment and noticeable foreground occlusion.
3. No people or person silhouettes in any scene.
4. First diya can be lit by click/tap/keyboard; 5 courtyard diyas can be toggled, remain lit after chapter travel, and illuminate surroundings.
5. At least 3 accessible cultural hotspots, including Tihar and Chhath content, with accurate concise descriptions.
6. Chhath sun position and river reflection are tied to scroll progress and reversible.
7. Wish editor works and exports a correctly rendered PNG with user text.
8. Responsive mobile touch scroll and interaction; keyboard controls; reduced-motion alternative; optional audio muted by default.
9. No uncaught runtime errors, broken asset requests, major layout overflow, or scroll dead zones. Include tests for progress-to-chapter mapping and persistent state.
10. Build succeeds and README documents setup, run, assets, architecture, testing, and deployment.

## Quality gates
Visual continuity and art quality > unnecessary features. Prioritize the First Spark, Alley, Courtyard and Arunodaya. If time is limited, make Thousand Lights and Twilight scroll transitions rather than separate elaborate environments. Use deliberate graceful placeholder artwork if illustration assets are missing; never pretend generated placeholders are finished. Deliver a cohesive functional MVP before optional polish.
