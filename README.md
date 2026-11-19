# PRAKASH — Darkness to Dawn

A native-scroll React/Vite/TypeScript journey through Tihar light and a separate Chhath morning, using the supplied illustrated environments. The November 14 revision follows the supplied object-inspection recording and Jesko Jets scroll reference. It removes the deleted JPEG sequence renderer and the bamboo-tray overlay.

## Run and deploy

Use Node 22.13+ and npm:

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
node scripts/verify-assets.mjs
npm start
```

`npm run dev` and `npm run preview` include the shared-wish API. `npm start` serves the production build and API together (port 3000 by default). Keep one server process per data directory.

**Shared wishes need persistent server storage.** Deploy the bundled Node server with `WISH_DATA_DIR` on a persistent volume, `HOST=0.0.0.0` behind HTTPS, and the appropriate `PORT`. Deploying `dist/` alone does not provide shared wishes. Vercel is now supported by deploying the repository with `api/wishes.js` and connecting Upstash Redis; see `docs/wishes.md`. No hosting or remote database has been provisioned. See [shared wish operations](docs/wishes.md) for the API, persistence, backup, and hosting contract.

## Motion and interactions

- One native document scroll track and a scoped GSAP ScrollTrigger timeline. Scroll moves forward; reverse scrolling restores the same camera, darkness and text transitions. No wheel interception, scroll lock, frame canvas, JPEG loading or auto-advancing chapters.
- The opening starts black. Ignition reveals the original `Extinguished Diyas Beneath Temple Lights-1.png` over 4.6 seconds. Four additional alley lamps progressively remove the remaining darkness until the artwork reaches normal brightness; there is no permanent brightness filter.
- The courtyard has a slow scroll push plus damped cursor movement. Five lamps and three cultural details are semantic, artwork-aligned hotspots. Selecting one eases the camera toward that object and opens its story beside it. Closing pulls back; changing chapters dismisses inspection. Small hover/focus labels replace the old rectangular button groups.
- Portrait views retain object alignment. Horizontal touch exploration reveals cropped courtyard details while vertical scrolling stays native. Keyboard focus brings an offscreen hotspot into view. Reduced motion is permanently off, as requested. Full camera movement, cursor drift and zoom remain enabled across reloads and replay; there is no motion toggle.
- Long perspective changes pass through a soft dark veil. Every narrative line has its own scroll entrance, reading interval and exit. The gateway explicitly describes the passage between distinct Tihar and Chhath festivals.
- Later river artwork preloads as the preceding chapters are reached. Image and wish failures show retry feedback. GSAP contexts, observers, event handlers and animation frames are cleaned up.

| Chapter | Entry | Artwork / behavior |
| --- | ---: | --- |
| The First Spark | 0 | Original temple alley, black-to-light reveal |
| The Alley of Lights | .12 | Same environment, four interactive lamps, forward camera |
| The Courtyard of Lights | .35 | Temple courtyard, cursor drift and object inspection |
| Before the Dawn | .52 | Dark passage into the pre-dawn riverbank |
| Arunodaya | .68 | Riverbank to stone steps to supplied sunrise |
| Carry the Light | .94 | Sunrise, anonymous wishes and keepsake editor |

## Wishes and persistence

A draft stays on the current device. **Leave an anonymous wish** explicitly publishes it to the shared server archive; other visitors see real wishes as distant lights. There are no seeded sample visitor wishes. Read/publish errors retain the draft and offer retry; request IDs prevent duplicates after a lost response. PNG export remains separate and uses only artwork, wish and wordmark.

Journey state validates stored JSON and known IDs. Language and discoveries survive reloads. As in the previous opening, a fresh document resets all lamps to provide the dark first spark; lamps survive chapter travel, and replay resets the first spark only. Audio remains absent and silent.

## Source guide

`src/hooks/useScrollJourney.ts` owns the reversible timeline; `src/engine/lighting.ts` controls opening illumination. `Courtyard.tsx`, `useParallax.ts`, and `courtyardGeometry.ts` separate rendering, pointer movement, and crop/inspection math. Content and hotspot coordinates are in `src/data/`. `WishEditor.tsx`, `DistantWishes.tsx`, and `src/engine/wishes.ts` use the small API in `server/wishes.mjs`. No new runtime dependencies were added.

## Implementation and acceptance checklist

- [x] Inspected supplied recording and original art; reference contact sheets in `docs/reference-motion.png` and `docs/current-environments.png`.
- [x] Removed active JPEG sequence code, manifests, imports and helper scripts; no frame requests remain.
- [x] Removed courtyard overlay buttons and bamboo-tray element/import.
- [x] Added native reversible fades, camera motion and independent narrative entrances/exits.
- [x] Added gradual black-to-normal opening illumination, tested at every lamp count.
- [x] Added five courtyard lamps, three artwork hotspots, object zoom and side panel; geometry tested at desktop and portrait sizes.
- [x] Added real anonymous shared wish API and distant display; validated HTTP publish/read and persistence after restart using temporary data.
- [x] Typecheck, ESLint, all 29 unit/API tests and production build pass.
- [ ] Browser QA: opening black state, lamp activation and courtyard composition inspected. Corrected chapter tracking to use native ScrollTrigger progress after spotting stale state. Final hotspot/finale, mobile, touch and focus verification remain open because the preview session disconnected.
- [ ] PNG download and rendered multiline/Nepali export need browser verification.
- [ ] Public shared wishes require deployment of the persistent Node service; a static-only deployment is insufficient.

The full original product spec also calls for separately illustrated depth layers, an independently animated sun/reflection and optional ambience. This revision uses the supplied flattened scenes with camera compositing and a scroll-controlled sunrise dissolve; it does not claim those broader artwork/audio requirements are complete. Older screenshots are not evidence for this revision.


## November 15 interaction refinement

- [x] Riverbank and stone-step information opens only by clicking/tapping the scenery hotspot; automatic chapter 4/5 information paragraphs are removed. Scroll still moves through the journey normally.
- [x] River discoveries use the existing side panel, close on scene changes/Escape, and gently zoom the scenery.
- [x] Opening title, subtitle and narrative use a stacked flow layout, with a compact side-by-side arrangement on short landscape screens.
- [x] Shared wishes are small glowing stars. Text is not rendered in the scene or star label; selecting a star opens the full wish in the discovery panel. Close restores focus and the wide view.
- [x] All five stars remain available on mobile; keyboard labels and reduced-motion behavior are retained.
- [x] Typecheck, lint, 29 tests and production build pass.
- [ ] Visual verification of this refinement remains outstanding; no browser-control tool is available in this session.


## November 19 motion setting

- [x] Reduced motion is always off, regardless of operating-system preferences or replay.
- [x] Removed the Chapters motion toggle.

### Windows quick start

Open PowerShell in the project folder, then run:

```powershell
cd C:\Users\HELIOS\Desktop\prakash\prakash
npm ci
npm run dev
```

Open the Local URL printed in the terminal (normally http://127.0.0.1:5173). This one command runs both the website and shared-wish API; no separate backend command is needed. Keep the terminal running. Press Ctrl+C to stop it.

To run the production version instead, stop development first, then run:

```powershell
npm run build
npm start
```

Open http://127.0.0.1:3000. Wishes persist in `.data/wishes.json`; keep that file to retain them. Both modes use the same archive, so run only one at a time. Localhost is accessible on this computer only; public visitors need the persistent server deployment described in `docs/wishes.md`.


## Vercel wish fix

- [x] Added `/api/wishes` function and durable Redis adapter without new dependencies.
- [x] Parsed request bodies, async storage, atomic publication and distributed cooldown supported.
- [x] Missing database fails visibly; no ephemeral file fallback and no secrets in the browser.
- [ ] Connect Upstash Redis to festiv-ui and redeploy, then verify live sharing. See [setup](docs/wishes.md#vercel-setup-for-festiv-ui).
