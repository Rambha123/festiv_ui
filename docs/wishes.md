# Shared anonymous wishes

Wishes are published explicitly with **Leave an anonymous wish**. Typing only saves a draft on the current device; PNG export is separate. The sunrise scene reads real published wishes from `GET /api/wishes`, refreshes after publishing, every 30 seconds while active, and when the tab becomes visible. There are no generated sample visitor wishes. Only text, random record ID and creation time are stored and returned; no account, name, cookie ID or IP address is persisted. The in-memory rate limiter temporarily uses the connection address for 15 seconds.

## Run locally

`npm run dev` and `npm run preview` both include the same wish API through the Vite plugin. Wishes survive server restarts in `.data/wishes.json` (ignored by Git). Open two browsers against the same server to check sharing. Run one server process per data directory: do not run dev and production together against the same archive.

## Serve visitors

Run `npm run build`, then `npm start`. This serves both `dist/` and the API. Set `HOST=0.0.0.0` behind an HTTPS reverse proxy, `PORT` to the desired listen port, and **`WISH_DATA_DIR` to a writable persistent disk directory**. Keep regular backups of `wishes.json`. The reverse proxy must preserve the external Host header for same-origin validation. The server does not store forwarded client addresses; a proxy therefore shares the conservative submission limit between visitors. Adjust to a trusted-proxy-aware rate limiter before larger-scale hosting.

Static-only hosting, including uploading `dist/` alone to Vercel, cannot provide shared persistence. No remote service has been provisioned or published in this change. For Vercel/serverless or multiple replicas, replace the file store with a managed durable database behind the same API; ephemeral filesystems are unsuitable. The bundled server supports one persistent process and an archive of up to 10,000 wishes; when full, new submissions fail visibly instead of deleting older wishes.

## API and reliability

- `GET /api/wishes`: newest 36 records; the scene shows up to five (three on mobile).
- `POST /api/wishes`: JSON `{ "text": "...", "requestId": "UUID v4" }`. Text must be nonempty, at most 300 Unicode code points, and contain no unsafe control characters. Body is limited to 8 KiB. Same-origin validation and a 15-second per-connection-address cooldown limit accidental spam. A retry with the same request ID and text returns the existing record.
- Atomic flushed file replacement keeps the old archive if a write fails. Corrupt storage fails visibly and is never reset silently. Database errors do not print wish contents.
- Browser failures retain the local draft, show an actionable retry message, and never claim successful publication. Wishes are rendered as React text, never HTML.
- The API is intentionally anonymous and has no accounts or automatic content review. Operators can remove a record from the JSON archive while the server is stopped, then restart it. Public deployment should include an appropriate moderation/reporting policy for the intended audience.

## Validation

`npm test` includes store persistence, record validation, cross-client reads, idempotent retry, rate limiting, oversized requests and malformed storage checks. `npm run typecheck`, `npm run lint`, and `npm run build` cover the frontend integration. A production host still needs its persistent volume and HTTPS configuration before inviting visitors.
