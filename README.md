# PRAKASH — Darkness to Dawn

The existing React/Vite/TypeScript journey now spans six chapters using the supplied JPEG sequence. No autoplay, global wheel interception, page locking, new audio or backend.

## Run

Use Node 22.13+ and npm:

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
node scripts/verify-sequence.mjs
```

Deploy `dist/` as a Vite static build. Relative base-path support is retained. No publishing was performed.

## Assets and camera

Original sequence: `jpeg sequence/ezgif-frame-001.jpg` through `ezgif-frame-300.jpg`. All 300 images decode at 1920×1080. Indices are unique and contiguous. Some consecutive frames have identical image bytes; Vite safely deduplicates those production assets. No originals were renamed or moved. `src/data/frames.json` lists exact filenames numerically; `src/engine/sequence.ts` resolves Vite asset URLs and defines frame cues.

The live opening uses `public/assets/environments/Extinguished Diyas Beneath Temple Lights-1.png` and the front-facing diya. It begins pitch black and reveals a dim image after ignition. Four doorway lamps gradually reveal brighter masked copies of the same image around their wick positions. Portrait crops reposition small lamp sprites into visible pavement. All lamps reset on every fresh load, with scroll at zero and reduced motion OFF as requested. During a visit, reversing retains lamps. Replay resets the opening lamp and motion setting without clearing discoveries or the wish draft.

| Chapter | Scroll entry | Actual frame landmark |
|---|---:|---|
| First Spark | 0 | Live illustration |
| Alley of Lights | .12 | Handoff .14–.20; frame 001 at .16 |
| Courtyard of Lights | .35 | Frame 075 |
| Before the Dawn | .52 | Frame 130; gateway clearly visible around 150 |
| Arunodaya | .68 | Frame 175, pre-dawn; sunrise develops around 225–250 |
| Carry the Light | .94 | Frame 300, held for the finale |

Frame 001 is the closest supplied opening view, with the same central temple/alley direction, but camera distance and roof geometry differ. The short supporting blend still needs in-browser visual review. The JPEGs supply all subsequent camera movement, sunrise and reflection; no second sun or reflection is drawn.

One native document path and sticky viewport drive one scoped GSAP timeline. The canvas renderer decodes on demand, limits concurrent requests to four and retains at most 20 decoded frames. It prefetches in both directions and retains the previous image while a requested frame loads or fails. It includes a still fallback and error notice. Resize redraws the current image. Reduced motion uses landmark stills with all chapters and interactions available.

To replace frames, keep originals in `jpeg sequence/`, run `node scripts/manifest.mjs`, inspect the new images, and update the actual landmark indices in `src/engine/sequence.ts` plus chapter entries in `src/engine/sceneManifest.ts`. Change the import glob if replacement originals use `.jpeg` rather than `.jpg`. Do not divide a replacement sequence into equal slices without inspecting it.

## Narrative and keepsake

All six narrative lines and discovery panels have English and Nepali text. The gateway explicitly marks “Another morning · Chhath” as a symbolic passage between distinct festivals. No separate basket or portrait-card background was found, so there is an About the offerings control and the final sunrise frame supplies the portrait keepsake background.

The optional wish stays local and survives reverse scrolling/replay. PNG export draws only the artwork, wish and wordmark to a 1080×1440 canvas; it waits for fonts/image decoding, wraps at grapheme boundaries and fits multiline text. Export failures are visible and actionable. Nepali needs the loaded Noto Serif Devanagari font or an appropriate device fallback.

Semantic controls, visible focus, 44px targets, skip/replay, chapter links and native keyboard scrolling are retained. Discovery and wish panels contain internal scrolling, dismiss with Escape, and restore focus without camera jumps.

## Verification checklist

- [x] First, courtyard, gateway, pre-dawn, sunrise and last source frames inspected; contact sheet: `docs/sequence-contact.png`.
- [x] All 300 source images decoded; index continuity and dimensions checked.
- [x] Exact source filename casing and identical production bytes verified for every frame (including deduplicated assets).
- [x] Typecheck, ESLint, 10 unit tests and production build passed.
- [x] Tests cover six-chapter boundaries, reverse frame mapping, fresh-load lamp reset, storage validation and replay.
- [ ] Current browser smoke tests blocked: browser tool reported that localhost access was declined. No alternate browser route was attempted.
- [ ] Current desktop/mobile screenshots, physical touch, reduced-motion interaction, missing-frame injection, focus behavior and handoff quality still require browser verification.
- [ ] Downloaded PNG opening, multiline/Nepali appearance and controls-free export still require browser verification. Export is implemented, not claimed visually verified.

Older screenshots in `docs/` are from earlier revisions and are not evidence for this build. The contact sheet shows source art, not the running UI. The six-chapter code is implemented; the browser/export acceptance gates remain open. The opening-to-sequence geometry mismatch and portrait cropping are remaining visual limitations.
