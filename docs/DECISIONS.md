# Decisions

Every significant decision and why. Source: design spec `docs/superpowers/specs/2026-11-03-portfolio-design.md` (the "[Claude's call]" items, section 9 and section 9b).

## 2026-11-03

- **Hacker mode lives at its own `/room` route.** A real URL can be shared directly and lets the 3D code load only when it is visited.
- **Stack: React + Vite single-page app, React Router, three.js via React Three Fiber, drei and postprocessing (bloom).** The owner already works in this stack and the old site used it.
- **3D code is lazy-loaded on `/room` only.** The formal page should never pay for three.js or the models.
- **Visual direction for formal mode: warm off-white, deep navy, UJ orange as a small accent, hairline borders, Plus Jakarta Sans with IBM Plex Mono labels.** Fits the owner's "close to Student, more young-professional" brief and stays inside the design bans.
- **Fonts self-hosted through @fontsource (OFL).** Licensed, no third-party font requests, no tracking.
- **Netlify Forms for the contact form.** No custom backend needed; it collects only name, email and message, with a honeypot and an unticked consent checkbox.
- **Cookie-free analytics (GoatCounter), no cookie banner.** No cookies and no tracking means no banner is required. If any cookie-setting tool is ever added, a consent banner becomes mandatory.
- **No terms or refund pages.** Nothing is sold, so both are not applicable.
- **No `server/` folder.** The site has no custom backend; `client/` holds the app and shared config sits at the root.
- **Lightweight client error logging (Sentry DSN via env, optional).** Covers the error-logging rule without a custom server.
- **Touch and fallback behaviour in the room.** Tappable on-screen controls for the terminal, plus a 2D terminal-only fallback when WebGL is unavailable or the frame rate stays very low.
- **Performance guards in the room.** Capped pixel ratio, throttled side-screen canvas redraws, rendering paused when the tab is hidden.
- **Phone number never appears on site pages; the Download CV button serves the full CV PDF with the phone number (owner's choice).** The PDF is the only place the number exists.
- **The fifth project is this portfolio, replacing Multi-Theme Developer Portfolio.** Described only by what is actually built; the owner plans to update the CV to match.
- **Availability line: "Open to roles, starting 2027".** Covers graduate roles, junior developer roles and internships.
- **Photo: plain head-and-shoulders 4:5 crop, no background removal.** Removes the camera watermark and most of the street background; an honest crop suits the tone. Exported as AVIF/WebP with a JPG fallback.
- **Old repo `Mukhodobwane_V` stays untouched on GitHub.** Rollback safety and history.
- **Deploy to a new Netlify preview site first; the owner relinks the existing site at launch via a handover checklist.** The live link stays the same and the owner controls the switch.
- **KSMS row has no links; Thusa Lushaka is named but not linked until its hosting move finishes.** No link is shown that may break or that the owner has not provided.
- **TryHackMe profile appears only in the room (`contact`, `whoami`), not on the formal page.** The CV does not list it.
- **Contact email is `mukhodobwanevhutali@gmail.com`, as on the CV.** Single source of truth for contact details.
