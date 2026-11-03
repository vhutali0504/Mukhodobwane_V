# Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the owner's new portfolio: an animated formal landing page at `/` and a 3D hacker room at `/room`. Both read one CV-based content module, and the site deploys to Netlify.

**Architecture:**
- A Vite + React single-page app lives in `client/`, with React Router.
- All copy lives in `client/src/content/`.
- The room's logic (terminal, quiz, vault) is pure JavaScript in `client/src/room/terminal/` with no React or three.js, so it can be unit-tested and reused by the 2D fallback.
- The 3D scene (React Three Fiber) only draws that state onto canvas textures, and it is lazy-loaded so `/` never downloads three.js.

**Tech Stack:**
- Node 20+, Vite 6, React 19, React Router 7.
- three, @react-three/fiber 9, @react-three/drei 10, @react-three/postprocessing 3.
- Vitest 3 + @testing-library/react + jsdom + vitest-canvas-mock.
- Playwright for end-to-end tests.
- sharp (photo script only).
- @fontsource for self-hosted fonts.
- Netlify Forms, GoatCounter (cookie-free analytics), Sentry browser SDK (error logging, lazy, DSN-gated).

**Spec:** `docs/superpowers/specs/2026-11-03-portfolio-design.md`. Executors read the spec alongside this plan.

**Reference prototypes:**
- `docs/prototypes/hacker-room-3d.html`: room layout, coordinates, colours, screen drawing, boot lines, facts, trivia, vault. Port its behaviour.
- `docs/prototypes/formal-mode.html`: formal look and the three live animations.

## Global Constraints

- **Content:** every claim must trace to spec Appendix A (the CV), §9 or §9b. No invented numbers, facts or titles.
- **Phone number:** the owner's phone number must never appear in any file under `client/src` or `client/public/*.html`. It may appear only inside the CV PDF.
- **Email:** `mukhodobwanevhutali@gmail.com`.
  - GitHub: `https://github.com/vhutali0504`
  - LinkedIn: `https://www.linkedin.com/in/mukhodobwanev`
  - TryHackMe (room only): `https://tryhackme.com/p/HawkSpecter`
- **Availability line:** exactly `Open to roles, starting 2027`.
- **Formal palette:**
  - `--bg #F7F5F0`, `--ink #14213D`, `--navy #1F3A5F`, `--muted #5B6474`, `--line #E2DDD2`, `--card #FFFFFF`, `--accent #E8730C`.
  - Body text contrast must be ≥ 4.5:1.
- **Room palette:** green `#3CFF8F`, dim green `#1F8F50`, amber `#FFB347`, red `#FF4545`, screen background `#010402`, scene background `#020405`.
- **Fonts:** Plus Jakarta Sans (UI) and IBM Plex Mono (labels and terminal), both self-hosted via @fontsource (OFL).
- **Design bans** (spec §8), never use:
  - Purple-to-blue gradients, gradient text.
  - Emojis in headings.
  - Inter, Space Grotesk/Instrument Serif.
  - Coloured left-border cards, glassmorphism.
  - Three icon boxes in a row, a badge above the headline.
  - Lucide everywhere.
  - Sections fading or sliding in on scroll, cursor-follow beams, buttons that fade on hover.
  - Em-dash-heavy or buzzword copy.
  - Serif italics accents.
  - Grain over a gradient.
- **No sound** anywhere.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, there are no glitch flashes, the typed role shows its first phrase statically, counters show final values, and camera moves are ≤ 400 ms.
- **Cookies:** none. If any cookie-setting tool is added, a consent banner becomes mandatory (spec §7).
- **Folder rules:** follow the owner's project structure. App code lives in `client/`, shared config at the repo root, docs in `docs/`, and there is no `server/` folder.
- **Commits:** small, one per task minimum, on branch `build/v1` (never commit to `main` directly).

## Review Focus

1. **A phone or tablet in the room, with no physical keyboard.** Every terminal action (menu, sections, quiz answers, vault guesses, stand up, exit) must be reachable by tapping. *Test: Task 12, `touch controls cover every action`.*
2. **No WebGL, or a very slow GPU.** The visitor gets the 2D terminal fallback plus a link back to formal mode, never a blank or frozen page. *Tests: Task 12, `falls back to 2D when WebGL is unavailable`; Task 13 e2e, `room fallback without WebGL`.*
3. **Contact form failures: network error, a 10 s timeout, a double click.** Expect one submission, a visible error message, typed text kept, and the button re-enabled. *Test: Task 8, `submitContact` failure and timeout tests, plus `double submit sends once`.*
4. **Narrow phones (320 px) with the long surname "Vhutalihandivho".** No horizontal scroll and no clipped name. *Test: Task 13 e2e, `no horizontal scroll at 320px` on `/`, `/privacy` and `/thanks`.*
5. **Opening or refreshing `/room` directly on Netlify, and the browser Back button from the room.** The room loads, and Back returns to `/`. *Tests: Task 13 e2e, `deep link and back`; Task 13 step `netlify.toml SPA redirect`.*

---

## File Structure

```
package.json, vite.config.js, eslint.config.js, playwright.config.js, netlify.toml, .gitignore, .env.example
client/
  index.html                      # contains hidden Netlify form markup
  public/ favicon.svg, og-image.png, robots.txt, sitemap.xml, cv/…pdf, images/portrait-*.{avif,webp,jpg}
  src/
    main.jsx, App.jsx             # router + lazy Room route
    content/ profile.js, facts.js, trivia.js, vaultWords.js
    hooks/ useReducedMotion.js, useTypewriter.js, useCountUp.js, useDocumentMeta.js
    api/ contact.js               # submitContact()
    lib/ validateContact.js, analytics.js, errorLogging.js, webgl.js
    components/ layout/ (TopBar, Footer, MobileCta, ModeSwitch, GlitchOverlay)
                formal/ (Hero, TypedRole, Stats, ProjectRow, Work, Experience, Skills, Education, ContactForm)
    pages/ Home.jsx, Privacy.jsx, Thanks.jsx, NotFound.jsx, Room.jsx
    room/
      terminal/ engine.js, commands.js, quiz.js, vault.js, sections.js, constants.js
      screens/ drawMain.js, drawSide.js, drawNote.js, scanlines.js
      scene/ RoomScene.jsx, RoomShell.jsx, Desk.jsx, Monitors.jsx, Props.jsx, Atmosphere.jsx, CameraRig.jsx, useScreenTexture.js
      ui/ RoomHud.jsx, TouchControls.jsx, LoadingScreen.jsx, TerminalFallback.jsx, useRoomKeyboard.js
    styles/ tokens.css, global.css, formal.css, room.css
scripts/ process-photo.mjs, check-contrast.mjs, check-bundle.mjs
tests/ unit/…, e2e/…
docs/ DECISIONS.md, GROUND_RULES.md, LAUNCH_CHECKLIST.md (+ existing spec, plans, prototypes, assets)
```

---

### Task 1: Project scaffold, tooling and ground-rule docs

**Files:**
- Create: `package.json`, `vite.config.js`, `eslint.config.js`, `.gitignore`, `.env.example`, `client/index.html`, `client/src/main.jsx`, `client/src/App.jsx`, `docs/GROUND_RULES.md`, `docs/DECISIONS.md`
- Test: `tests/unit/app.smoke.test.jsx`

**Interfaces:**
- Produces:
  - `npm run dev | build | preview | test | test:e2e | lint`.
  - Vite `root: 'client'`, `build.outDir: '../dist'`.
  - Vitest uses `environment: 'jsdom'`, `setupFiles: ['tests/unit/setup.js']` (imports `@testing-library/jest-dom` and `vitest-canvas-mock`), `include: ['tests/unit/**/*.test.{js,jsx}']`.

- [ ] **Step 1:** In `C:\Projects\vhutali-portfolio-2026`, run `git init -b main`, make an empty initial commit, then run `git checkout -b build/v1`.
- [ ] **Step 2:** Create `package.json`. Install `react react-dom react-router` and the dev dependencies `vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest-canvas-mock eslint @eslint/js eslint-plugin-react-hooks globals @playwright/test`.
  - `.gitignore`: `node_modules`, `dist`, `.env`, `test-results`, `playwright-report`, `.superpowers`.
  - `.env.example`: `VITE_GOATCOUNTER_CODE=` and `VITE_SENTRY_DSN=`.
- [ ] **Step 3: Write the failing test** `tests/unit/app.smoke.test.jsx`. Render `<App />` inside `MemoryRouter initialEntries={['/']}` and assert `screen.getByRole('main')` exists.
- [ ] **Step 4:** Run `npm test`. Expected: FAIL because `App` is not found.
- [ ] **Step 5:** Implement the minimal `App.jsx` (exports `App`, which renders `<main/>`) and `main.jsx` (`createRoot` + `BrowserRouter`).
  - `client/index.html` gets `lang="en"`, the viewport meta and `<div id="root">`.
- [ ] **Step 6:** Run `npm test`, then `npm run build`. Expected: PASS, and `dist/index.html` exists.
- [ ] **Step 7:** Write the docs.
  - `docs/GROUND_RULES.md` is a verbatim copy of sections 1–6 of `C:\Users\Mukho\.claude\CLAUDE.md`.
  - `docs/DECISIONS.md` is seeded with one dated entry per spec "[Claude's call]" and §9/§9b decision. Each entry gives the decision and a one-line why. Include: no terms or refund pages (nothing sold), no cookie banner (cookie-free analytics), `/room` route, Netlify Forms, CV served with phone (owner's choice), the photo crop.
- [ ] **Step 8:** Commit with `chore: scaffold vite react app, tooling and ground-rule docs`.

### Task 2: Content module (CV as source of truth)

**Files:**
- Create: `client/src/content/profile.js`, `client/src/content/facts.js`, `client/src/content/trivia.js`, `client/src/content/vaultWords.js`
- Test: `tests/unit/content.test.js`

**Interfaces:**
- Produces:
  - `profile` is `{ name, shortName: 'Vhutali M.', location: 'Johannesburg, South Africa', email, availability, summary, roles: string[3], links: { github, linkedin, tryhackme }, cvUrl: '/cv/Mukhodobwane-Vhutalihandivho-CV.pdf', photo: { base: '/images/portrait', alt: 'Portrait of Mukhodobwane Vhutalihandivho' }, idCard: { title: 'Co-Founder & Technical Lead', org: 'Elevate Digital Solutions' }, stats: {value:number,label:string}[4], experience: Experience[], projects: Project[], skills: {group:string, items:string[]}[], education: { school, degree, when, coursework: string[], notes: string[] } }`
  - `Experience = { org, title, when, location?, bullets: string[] }`
  - `Project = { id, title, kind, when, stack: string[], bullets: string[], links: {label,url}[] }`
  - `FACTS: string[]`
  - `TRIVIA: {q:string, o:[string,string,string], a:0|1|2}[]`
  - `VAULT_WORDS: string[]`

- [ ] **Step 1: Write the failing tests** in `tests/unit/content.test.js`:
  - `skills match the CV`: the group names equal `['Languages','Web & Backend','Databases','Security','Tools & Practices']`, and Languages items equal `['JavaScript (ES6+)','Java','C++','C#','SQL']`.
  - `projects in spec order`: `profile.projects.map(p=>p.id)` equals `['ksms','fingerprint','tle','job-tracker','this-portfolio']`.
  - `ksms has no links and tle has no links` (spec §9b).
  - `stats`: `[5,5,2,2024]`, with labels `'projects built','programming languages','junior students mentored','co-founded Elevate Digital Solutions'`.
  - `availability` is exactly `'Open to roles, starting 2027'`.
  - `experience order`: `['Elevate Digital Solutions','StudyTrust']`, with `when` set to `'Jan 2024 – Present'` and `'Feb 2026 – Present'`.
  - `no phone number in content`: `JSON.stringify` of all four modules must not match `/(\+27|\b0)\s?\d{2}\s?\d{3}\s?\d{4}/`.
  - `facts`: there are ≥ 12, each non-empty and ≤ 220 characters.
  - `trivia`: there are ≥ 12, each has 3 options, `a ∈ {0,1,2}`, and the questions are unique.
  - `vault words`: there are ≥ 16, unique, each matching `/^[A-Z]{5}$/`.
- [ ] **Step 2:** Run `npm test -- content`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Write `profile.js` from spec Appendix A, lightly edited for the web with no new claims.
  - `summary` paraphrases the CV summary, as in the mockup's lede.
  - `roles` = `['Full-stack developer','Co-founder, Elevate Digital Solutions','Secure authentication builder']`.
  - The project `this-portfolio` (kind `'Personal Project'`, when `'2026'`, stack `['React','three.js','Vite']`) describes only what this plan builds: a formal page, a 3D room, a typed terminal, trivia, the vault game. Its link is `https://github.com/vhutali0504/vhutali-portfolio-2026`, which the owner creates at launch (Task 14). The name matches the local folder.
  - Job tracker links: `Live app` → `https://job-application-tracking1.netlify.app/` and `Source` → `https://github.com/vhutali0504/job-tracker-api`.
  - Fingerprint link: `Watch demo` → `https://youtu.be/2PtRI5dPc_Y`.
- [ ] **Step 4:** Write `facts.js`, `trivia.js` and `vaultWords.js`. Start with the 12 facts, 12 trivia items and 20 words from the prototype. The trivia must be tech-only (spec §6), so carry over the prototype's final tech set. Optionally extend; every addition must be accurate and tech-related.
- [ ] **Step 5:** Run `npm test -- content`. Expected: PASS.
- [ ] **Step 6:** Commit with `feat(content): CV-based profile, facts, trivia, vault words`.

### Task 3: Design tokens, fonts, global styles, contrast check

**Files:**
- Create: `client/src/styles/tokens.css`, `global.css`, `scripts/check-contrast.mjs`
- Modify: `client/src/main.jsx` (import the fonts and styles)
- Test: `npm run check:contrast`

**Interfaces:**
- Produces:
  - CSS custom properties exactly as listed in Global Constraints.
  - Spacing scale `--s-1..--s-8` (4, 8, 12, 16, 24, 32, 48, 64 px).
  - `--radius 10px` and `--font-ui`, `--font-mono`.
  - `.mono` utility and the `.visually-hidden` class.

- [ ] **Step 1:** Install `@fontsource/plus-jakarta-sans @fontsource/ibm-plex-mono`. Import only weights 400/500/600/700/800 (Jakarta) and 400/500 (Plex Mono).
- [ ] **Step 2: Write the failing check** `scripts/check-contrast.mjs`. It parses `tokens.css` and computes WCAG contrast. It must exit 1 unless all of these hold:
  - `ink/bg` ≥ 7
  - `muted/bg` ≥ 4.5
  - `navy/bg` ≥ 7
  - `white/ink` ≥ 7
  - room `#1F8F50/#010402` ≥ 4.5
  - `#3CFF8F/#010402` ≥ 7

  Add `"check:contrast": "node scripts/check-contrast.mjs"`.
- [ ] **Step 3:** Run `npm run check:contrast`. Expected: FAIL because `tokens.css` is missing.
- [ ] **Step 4:** Write `tokens.css` and `global.css`.
  - `global.css` has the reset, `body{background:var(--bg);color:var(--ink);font-family:var(--font-ui)}`, a visible `:focus-visible` outline in `--accent`, and the reduced-motion media block that zeroes `animation-duration` and `transition-duration`.
  - If `--muted` fails, darken it until it passes and log the change in `DECISIONS.md`.
- [ ] **Step 5:** Run `npm run check:contrast`. Expected: PASS, printing each ratio.
- [ ] **Step 6:** Commit with `feat(styles): tokens, self-hosted fonts, contrast check`.

### Task 4: Routing, page meta, 404, privacy and thanks pages

**Files:**
- Create: `client/src/hooks/useDocumentMeta.js`, `client/src/pages/Home.jsx`, `Privacy.jsx`, `Thanks.jsx`, `NotFound.jsx`, `Room.jsx` (temporary placeholder)
- Modify: `client/src/App.jsx`
- Test: `tests/unit/routes.test.jsx`

**Interfaces:**
- Produces:
  - `useDocumentMeta({ title: string, description: string }): void` sets `document.title` and `meta[name=description]`, plus `og:title` and `og:description`.
  - Routes: `/` → `Home`, `/room` → `lazy(() => import('./pages/Room.jsx'))` inside `<Suspense fallback={<LoadingScreen/>}>` (Task 12 replaces the fallback), `/privacy`, `/thanks`, `*` → `NotFound`.

- [ ] **Step 1: Write the failing tests:**
  - For each route, assert the `document.title` values:
    - `Mukhodobwane Vhutalihandivho · Software Developer`
    - `Privacy · Mukhodobwane Vhutalihandivho`
    - `Thanks · Mukhodobwane Vhutalihandivho`
    - `404 · Mukhodobwane Vhutalihandivho`
  - `NotFound` renders the text `404: file not found` and a link named `Back to home` with `href="/"`.
  - `Privacy` mentions `Netlify Forms`, `GoatCounter`, `no cookies` and a `mailto:` link to the owner's email for data deletion requests.
- [ ] **Step 2:** Run `npm test -- routes`. Expected: FAIL.
- [ ] **Step 3:** Implement the hook, the pages and the routes.
  - The privacy copy covers: what is collected (name, email, message), why, where (Netlify), how long (until handled or deleted on request), analytics without cookies or personal data, error logging (technical errors only), and how to request deletion.
  - `NotFound` is styled as a terminal block using the room palette.
  - `Thanks` confirms receipt and links home.
- [ ] **Step 4:** Run `npm test -- routes`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(routes): pages, per-page meta, terminal 404, privacy, thanks`.

### Task 5: Top bar, mode switch link, footer, sticky mobile CTA, hero with typed role

**Files:**
- Create: `client/src/hooks/useReducedMotion.js`, `useTypewriter.js`, `client/src/components/layout/TopBar.jsx`, `ModeSwitch.jsx`, `Footer.jsx`, `MobileCta.jsx`, `client/src/components/formal/Hero.jsx`, `TypedRole.jsx`, `client/src/styles/formal.css`
- Modify: `client/src/pages/Home.jsx`
- Test: `tests/unit/typewriter.test.jsx`, `tests/unit/hero.test.jsx`

**Interfaces:**
- Consumes: `profile` (Task 2).
- Produces:
  - `useReducedMotion(): boolean`
  - `useTypewriter(phrases: string[], { typeMs=70, deleteMs=35, holdMs=1500, enabled=true }): string`. When `enabled` is false, it returns `phrases[0]`.
  - `<ModeSwitch onActivate?: (e) => void />` renders `<a href="/room">` with the accessible name `Switch to hacker mode`. Task 13 attaches the transition.

- [ ] **Step 1: Write the failing tests:**
  - `useTypewriter`, with fake timers: after `70*3` ms it returns `'Ful'`; after the full phrase + 1500 ms it starts deleting; once fully deleted it moves to phrase 2.
  - With `enabled:false` it returns `'Full-stack developer'` immediately.
  - `Hero`:
    - the `h1` text contains `Mukhodobwane` and `Vhutalihandivho`
    - a link `View my work` → `#work`
    - a link `Download CV` → `profile.cvUrl` with the `download` attribute
    - the text `Open to roles, starting 2027`
    - an `img` with alt `Portrait of Mukhodobwane Vhutalihandivho`
    - the ID card text `Co-Founder & Technical Lead` / `Elevate Digital Solutions`
  - `TopBar`: links `Work`, `Experience`, `Skills`, `Contact` (to `#work`, `#experience`, `#skills`, `#contact`) and a mode switch link. Below 720 px, a `Menu` button with `aria-expanded` toggles the nav.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement everything, matching `docs/prototypes/formal-mode.html`.
  - The name rises in: each line is wrapped in an `overflow:hidden` span with an inner `translateY(105%)→0` over 700 ms using `cubic-bezier(.2,.8,.2,1)`, with line 2 delayed 120 ms. This runs on load, not on scroll.
  - The `<picture>` element prefers avif, then webp, then jpg from `profile.photo.base`, using a 4:5 frame with `max-width:340px`.
  - Buttons press with `transform: scale(.97)` on `:active`, change colour on hover, and never change opacity.
  - Below 720 px, `MobileCta` is a fixed bottom bar with `Contact` (`#contact`) and `Download CV`, with `padding-bottom: env(safe-area-inset-bottom)`.
  - `Footer` has the name, GitHub, LinkedIn, `/privacy` and an `Enter the room` link to `/room`.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(formal): top bar, mode switch link, hero, typed role, footer, mobile CTA`.

### Task 6: Stats strip with count-up

**Files:**
- Create: `client/src/hooks/useCountUp.js`, `client/src/components/formal/Stats.jsx`
- Test: `tests/unit/countup.test.jsx`

**Interfaces:**
- Produces:
  - `useCountUp(target: number, { durationMs=1200, start: boolean }): number`, with ease-out cubic. It returns `target` immediately when reduced motion is on.
  - `Stats` starts counting the first time it intersects (`IntersectionObserver`, threshold 0.4) and never again.

- [ ] **Step 1: Write the failing tests:**
  - With mocked `requestAnimationFrame`/`performance.now`, `useCountUp(2024,{start:true})` at 0 ms is `0`, at 1200 ms is `2024`, and is monotonic in between.
  - With `start:false` it stays at `0`.
  - With reduced motion it returns `2024` at once.
  - `Stats` renders the four labels from `profile.stats`, and the section itself is never hidden or faded: its computed opacity is not set below 1 by any class.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the hook and component. The numbers use `font-variant-numeric: tabular-nums` so the width doesn't jitter.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(formal): stats strip with one-time count-up`.

### Task 7: Selected work (expandable rows), experience, skills, education

**Files:**
- Create: `client/src/components/formal/ProjectRow.jsx`, `Work.jsx`, `Experience.jsx`, `Skills.jsx`, `Education.jsx`
- Modify: `client/src/pages/Home.jsx`
- Test: `tests/unit/work.test.jsx`

**Interfaces:**
- Consumes: `profile.projects`, `profile.experience`, `profile.skills`, `profile.education`.
- Produces:
  - `<ProjectRow project index />` is a disclosure: a `<button aria-expanded aria-controls>` that holds the number, title, one-line summary and tags.
  - The panel `id` is `project-${id}`. The panel lists the bullets, stack, `when` and links (`target="_blank" rel="noopener noreferrer"`).

- [ ] **Step 1: Write the failing tests:**
  - 5 rows render in spec order, numbered `01`–`05`.
  - Clicking `MutualTrust – Student Management System (KSMS)` sets `aria-expanded="true"` and shows the bullet containing `centre manager`. Clicking again collapses it.
  - Enter and Space toggle it too.
  - The KSMS and Thusa Lushaka panels contain no links. The job tracker panel has the links `Live app` and `Source`.
  - Experience renders EDS before StudyTrust.
  - Skills renders 5 groups.
  - Education contains `University of Johannesburg` and `2023 – 2026`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the components.
  - Expand and collapse animates `grid-template-rows: 0fr → 1fr` over 300 ms (instant with reduced motion).
  - Rows slide 10 px on hover and their arrow moves 6 px.
  - Section headings use `h2` with the `id`s `work`, `experience`, `skills` and `education`, and `scroll-margin-top` covers the sticky top bar.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(formal): selected work disclosures, experience, skills, education`.

### Task 8: Contact form (Netlify Forms) with validation, consent, honeypot and failure handling

**Files:**
- Create: `client/src/lib/validateContact.js`, `client/src/api/contact.js`, `client/src/components/formal/ContactForm.jsx`
- Modify: `client/index.html` (hidden static form so Netlify detects the fields), `client/src/pages/Home.jsx`
- Test: `tests/unit/contact.test.jsx`

**Interfaces:**
- Produces:
  - `validateContact({name,email,message,consent}): Record<string,string>` returns error messages keyed by field, or `{}` when valid.
  - `submitContact(fields, { fetchImpl=fetch, timeoutMs=10000 }): Promise<void>` POSTs `application/x-www-form-urlencoded` to `/` with `form-name=contact`. It throws `Error('timeout')` when the timeout passes, and `Error('http_<status>')` when the response is not ok.

- [ ] **Step 1: Write the failing tests:**
  - `validateContact`:
    - An empty name gives `name: 'Please enter your name.'`
    - A bad email gives `email: 'Please enter a valid email address.'`
    - A message shorter than 10 characters gives `message: 'Please write at least 10 characters.'`
    - Name over 100, email over 254 or message over 5000 characters gives a length error.
    - `consent:false` gives `consent: 'Please agree to the privacy policy so I can reply.'`
  - `submitContact`:
    - The body contains `form-name=contact` and the encoded fields.
    - A 500 response rejects with `http_500`.
    - A fetch that never resolves rejects with `timeout` after 10 000 ms (fake timers, using `AbortController`).
  - `ContactForm`:
    - The consent checkbox is **unchecked** on render.
    - Submitting while invalid shows inline errors linked through `aria-describedby`, and focus moves to the first invalid field.
    - On success it navigates to `/thanks`.
    - On rejection it shows `Something went wrong sending your message. Please try again or email me directly.` (with a mailto link) and keeps the typed values.
    - `double submit sends once`: two rapid clicks lead to one fetch call, because the button is disabled with `Sending…` while pending.
    - A filled honeypot field `bot-field` means no fetch, but it still shows the success navigation.
- [ ] **Step 2:** Run `npm test -- contact`. Expected: FAIL.
- [ ] **Step 3:** Implement everything.
  - The hidden form in `index.html` is `<form name="contact" netlify netlify-honeypot="bot-field" hidden>` with inputs `name`, `email`, `message`, `consent`, `bot-field`.
  - All inputs are trimmed before validating and sending.
- [ ] **Step 4:** Run `npm test -- contact`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(formal): contact form with validation, consent, honeypot, error states`.

### Task 9: Photo processing, CV file, favicon, OG image, robots, sitemap

**Files:**
- Create: `scripts/process-photo.mjs`, `client/public/images/portrait-{480,720}.{avif,webp,jpg}`, `client/public/cv/Mukhodobwane-Vhutalihandivho-CV.pdf`, `client/public/favicon.svg`, `client/public/og-image.png` (1200×630), `client/public/robots.txt`, `client/public/sitemap.xml`
- Test: `tests/unit/public-assets.test.js`

**Interfaces:**
- Produces: the files at the paths that `profile.photo.base` and `profile.cvUrl` (Task 2) already reference.

- [ ] **Step 1: Write the failing test.** It asserts that each file above exists.
  - `robots.txt` contains `Sitemap: https://mukhodobwanevhutalihandivho.netlify.app/sitemap.xml`.
  - `sitemap.xml` lists `/` and `/room` only (privacy, thanks and 404 are excluded).
  - The CV PDF has the same byte size as `docs/assets/cv.pdf`.
- [ ] **Step 2:** Run the test. Expected: FAIL.
- [ ] **Step 3:** Write `scripts/process-photo.mjs` (`npm i -D sharp`).
  - Read `docs/assets/photo-original.jpg` (720×1280).
  - Crop a head-and-shoulders 4:5 region: `left 60, top 330, width 600, height 750`, which keeps the face in the upper third and drops the "Galaxy S23+" watermark near y≈1215.
  - Resize to widths 480 and 720 (no upscale past the source; the 720 output equals the 600 px crop width).
  - Write avif (q50), webp (q75) and jpg (q80, mozjpeg).
  - Add the script `"photo": "node scripts/process-photo.mjs"`.
- [ ] **Step 4:** Run `npm run photo`, then open `client/public/images/portrait-720.jpg`. Check the result:
  - the full head is visible
  - the watermark is gone
  - the shoulders are framed

  Adjust the crop numbers if needed and record the final values in `DECISIONS.md`.
- [ ] **Step 5:** Copy `docs/assets/cv.pdf` to `client/public/cv/Mukhodobwane-Vhutalihandivho-CV.pdf`.
  - Create the favicon: a navy `#14213D` rounded square with a green `#3CFF8F` `>_`.
  - Create the OG image: a 1200×630 PNG with the name, `Software Developer · Johannesburg` and the off-white/navy palette, rendered by a small sharp SVG→PNG step inside the same script.
  - Write `robots.txt` and `sitemap.xml`.
- [ ] **Step 6:** Run the test. Expected: PASS.
- [ ] **Step 7:** Commit with `feat(assets): cropped portrait, CV download, favicon, OG image, robots, sitemap`.

### Task 10: Terminal engine (pure logic): commands, sections, quiz, vault, state machine

**Files:**
- Create: `client/src/room/terminal/constants.js`, `commands.js`, `quiz.js`, `vault.js`, `sections.js`, `engine.js`
- Test: `tests/unit/terminal/*.test.js`

**Interfaces:**
- Consumes: `profile`, `FACTS`, `TRIVIA`, `VAULT_WORDS` (Task 2).
- Produces:
  - **`constants.js`**
    - `MENU = ['professional_summary','skills','experience','projects','education','contact','fun_facts','trivia','crack_the_vault']`
    - `BOOT_LINES: string[6]` (verbatim from the prototype)
    - `BOOT_LINE_MS=280`, `SCAN_MS=1400`, `GRANT_HOLD_MS=1100`, `GLITCH_MS=320`, `MAX_INPUT=40`
  - **`commands.js`**: `parseCommand(text: string): Command`, where `Command` is one of:
    - `{kind:'help'|'menu'|'whoami'|'exit'|'sudo'|'quiz'|'hack'|'funfact'}`
    - `{kind:'open', index:number}`
    - `{kind:'word', word:string}`
    - `{kind:'unknown', text:string}`
    - Aliases: `ls|menu|clear|cd ..` → `menu`; `exit|logout` → `exit`; `quiz|trivia`; `hack|game|play`; `funfact|fortune|fact`; a digit 1–9 → `open`; `cat|open|cd|less <name>` or a bare name → `open`, matching an id, an id prefix or an id word; a 5-letter word → `word`.
  - **`quiz.js`**
    - `createQuiz(pool, rng, n=5): Quiz`, where `Quiz = {qs, i, score, picked: null|0|1|2}`
    - `answerQuiz(q, k): Quiz` (ignored if already picked)
    - `nextQuestion(q): Quiz` (ignored if not picked)
    - `isQuizOver(q): boolean`
    - `quizRank(score): string`, using the prototype's six strings for scores 0–5
  - **`vault.js`**
    - `likeness(a,b): number`
    - `createVault(words, rng): Vault`, where `Vault = {words:string[8], secret, left:4, log:string[], sel:0, done:null|'win'|'lose', fact:string}`
    - `guessVault(v, word, pickFact:()=>string): Vault`. A repeat guess or a non-candidate word costs no attempt. A non-candidate logs `> WORD  not in memory`.
  - **`sections.js`**: `sectionLines(id, profile): string[]` gives the CV text lines for ids 0–5. Contact includes email, GitHub, LinkedIn and the TryHackMe URL, and never a phone number.
  - **`engine.js`**
    - `createTerminal({rng=Math.random, now=0}): T`, where `T = {mode:'idle'|'boot'|'scan'|'granted'|'menu'|'section'|'msg'|'quiz'|'game', bootAt, scanAt, grantAt, sel, sec, msg:{cmd,lines,fact?}|null, quiz, game, input, factIdx, booted}`
    - `step(t: T, action: Action, ctx={profile,FACTS,TRIVIA,VAULT_WORDS,rng}): {t: T, effects: ('glitch'|'standUp'|'scanStarted')[]}`
    - `Action` is one of: `{type:'sit', now}` | `{type:'tick', now}` | `{type:'key', key, now}` | `{type:'pad', now}` | `{type:'clickLine', index}` | `{type:'tapCommand', text}`
    - `visibleBootLines(t, now): number`

- [ ] **Step 1: Write the failing tests** (seeded `rng` via a tiny `mulberry32(42)` in the test helper):
  - `commands.test.js`:
    - `parseCommand('cat skills.txt')` → `{kind:'open',index:1}`
    - `'3'` → `open 2`
    - `'summary'` → `open 0`
    - `'sudo rm -rf /'` → `sudo`
    - `'LOGOUT'` → `exit`
    - `'token'` → `{kind:'word',word:'TOKEN'}`
    - `'   '` → `unknown` with text `''`
    - `'0'` and `'10'` → `unknown`
  - `quiz.test.js`:
    - `createQuiz` has 5 unique questions.
    - `answerQuiz` on the correct answer raises the score by 1.
    - A second `answerQuiz` changes nothing.
    - `nextQuestion` before answering changes nothing.
    - After 5 rounds `isQuizOver` is true.
    - `quizRank(0)` is `'you might be a bot.'` and `quizRank(5)` is `'root access granted. flawless.'`
  - `vault.test.js`:
    - `likeness('TOKEN','TAKEN') === 4`
    - A wrong guess decrements `left` and logs `> CACHE  likeness N/5`.
    - A repeat guess has no effect.
    - A non-candidate word logs `not in memory` without decrementing.
    - The correct guess sets `done:'win'` with the fact.
    - Four wrong guesses set `done:'lose'` and log `> LOCKOUT · it was <SECRET>`.
  - `sections.test.js`:
    - The contact lines include the email and `tryhackme.com/p/HawkSpecter`.
    - No section line matches the phone regex from Task 2.
  - `engine.test.js`:
    - `sit` on first use goes to `boot` with the effect `glitch`.
    - `tick` at `bootAt + 6*280` goes to `scan`.
    - `pad` goes to `scanStarted`.
    - `tick` at `+1400` goes to `granted`.
    - `tick` at `+1100` goes to `menu` with the effect `glitch`.
    - A second `sit` after a stand-up goes straight back to the previous mode (no re-boot).
    - In `menu`: `ArrowDown` ×9 wraps to `sel 0`; `Enter` opens `sel`; typing `hack` + `Enter` goes to `game`; `Escape` gives the effect `standUp`.
    - In `section`: `Backspace` with empty input goes to `menu`.
    - In `msg` with a fact: `Enter` shows the next fact.
    - In `quiz`: the keys `a`/`b`/`c` and `1`/`2`/`3` answer (when input is empty), and `Enter` advances.
    - In `game`: arrows move `sel`, `Enter` guesses `sel`, and `Enter` when done restarts.
    - `keys during boot are ignored` (no state change).
    - Input is capped at 40 characters.
    - `tapCommand('quiz')` is equivalent to typing it.
    - `clickLine(i)` in menu opens `i`; in quiz it answers `i` (0–2); in game it guesses `words[i]`.
- [ ] **Step 2:** Run `npm test -- terminal`. Expected: FAIL.
- [ ] **Step 3:** Implement the modules, porting the prototype's behaviour (`runCmd`, `guess`, `startQuiz`, the key handler) into pure functions. `step` never reads the clock or the DOM: time arrives only through `now` in actions.
- [ ] **Step 4:** Run `npm test -- terminal`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(room): pure terminal engine with commands, quiz, vault`.

### Task 11: Screen renderers (canvas drawing)

**Files:**
- Create: `client/src/room/screens/scanlines.js`, `drawMain.js`, `drawSide.js`, `drawNote.js`
- Test: `tests/unit/screens.test.js` (vitest-canvas-mock)

**Interfaces:**
- Consumes: the `T` state from Task 10, `profile`, `sectionLines`, `visibleBootLines`.
- Produces:
  - `drawMain(ctx, t: T, now: number, { reducedMotion }): { menuY0:number, lineH:number }`. The canvas is 1024×612. The returned geometry is what `clickLine` hit-testing uses.
  - `drawSideLeft(ctx, now)` draws code rain (512×320).
  - `drawSideRight(ctx, t, now)` (512×320) draws by mode:
    - skills: bars
    - projects: network
    - quiz: scoreboard
    - game: intrusion alarm and trace bar
    - otherwise: radar
  - `drawTopLeft(ctx, now)` draws the hex dump (512×292).
  - `drawTopRight(ctx, now, date)` draws the clock and CPU graph (512×292).
  - `drawNote(ctx, text)` draws the sticky note (256×256).
  - `hitLine(uvY, geom, count): number|-1`

- [ ] **Step 1: Write the failing tests:**
  - For every `mode`, `drawMain` runs without throwing and calls `fillText` with the expected headline:
    - `menu`: `root@vhutali:~$ ls ./about_me`
    - `quiz`: a string starting `TRIVIA`
    - `game`: `VAULT LOCKED` or `VAULT OPEN`
    - `scan` before pad: `BIOMETRIC LOCK`
  - With `reducedMotion:true`, `drawMain` makes no glitch slice `drawImage` calls.
  - `hitLine(1 - (menuY0+45)/612, geom, 9) === 1`.
  - `drawNote` wraps a 200-character fact to ≤ 9 lines.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Port the drawing code from the prototype (`drawMain`, `drawLeft`, `drawRight`, `drawTopL`, `drawTopR`, `drawNote`, `wrap`, `scanlines`), reading state from `T` instead of globals. Fonts: `IBM Plex Mono`, falling back to `Consolas, monospace`.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(room): canvas screen renderers`.

### Task 12: 3D room scene, camera rig, props, HUD, touch controls, keyboard, loading and fallback

**Files:**
- Create: `client/src/lib/webgl.js`, `client/src/room/scene/*`, `client/src/room/ui/*`, `client/src/styles/room.css`
- Modify: `client/src/pages/Room.jsx`
- Test: `tests/unit/room-ui.test.jsx`

**Interfaces:**
- Consumes: `createTerminal`/`step` (Task 10), the renderers (Task 11), `profile`, `FACTS`.
- Produces:
  - `hasWebGL(): boolean`
  - `<RoomShell />` owns the terminal state with `useReducer` around `step`, and the `pose: 'standing'|'moving'|'seated'`. It renders the `<Canvas>` scene, or `<TerminalFallback>` when `!hasWebGL()` or the FPS monitor (drei `PerformanceMonitor`) reports a sustained average below 20 fps.
  - `<CameraRig pose onArrive />`
  - `useScreenTexture(width, height, draw: (ctx, now) => void, fps=30): THREE.CanvasTexture`. It redraws at most `fps` times a second and pauses when `document.hidden`.
  - `<TouchControls t dispatch />`
  - `useRoomKeyboard(dispatch, pose)`

- [ ] **Step 1:** Install `three @react-three/fiber @react-three/drei @react-three/postprocessing`.
- [ ] **Step 2: Write the failing tests** (jsdom, with `hasWebGL` mocked):
  - `falls back to 2D when WebGL is unavailable`: `hasWebGL → false` renders `TerminalFallback`, the text `Your device can't run the 3D room`, a link `Back to the formal site` → `/`, and the same terminal menu as real DOM buttons.
  - `touch controls cover every action`: with `(pointer: coarse)` matched, `TouchControls` shows buttons for each of the 9 menu items in `menu`, `A`/`B`/`C` + `Next` in `quiz`, the 8 words + `Play again` in `game`, `Scan fingerprint` in `scan`, and `Stand up` and `Exit to formal` at all times.
  - `TerminalFallback`: typing `help` and Enter in its text input shows the help lines (it reuses `step`).
  - `RoomHud`: in `standing` it shows the hint `drag to look around · click the desk to sit down`; in `seated`, `↑↓ / click to choose · type "help" · Esc to stand up`. `Exit to formal` → `/` is always present.
- [ ] **Step 3:** Run `npm test -- room-ui`. Expected: FAIL.
- [ ] **Step 4:** Implement the scene using the prototype's coordinates and values:
  - Room box: 8×3.2×8 with `FogExp2(0x020405, 0.035)`.
  - Desk at `DX=-1.6, DZ=-3.55, DY=0.75`.
  - Monitors: the main one is 0.92×0.55 and the side ones are ±0.88 with yaw ±0.5.
  - Lighting:
    - screen point light: `0x3CFF8F`, intensity 3.5, distance 5
    - red strip light: `0xFF2A2A`
    - lamp spot light: `0xFFB347`
    - hemisphere light: `0x6A8A8A/0x101010` at 1.1
    - moon light
  - Bloom: `strength 0.75, radius 0.55, threshold 0.55`.
  - Atmosphere: rain window, poster, rack LEDs, cables.
  - Props:
    - cans toggle over/upright
    - the chair spins a full turn
    - the lamp toggles
    - the note shows the next `FACTS` entry with a flip
    - the pad pulses while scanning
  - Use real low-poly models or refined primitives; record any asset licences in `DECISIONS.md`. Cap DPR at 2.
  - `CameraRig` poses:
    - **Standing:** `(0.9,1.6,0.2)`, looking at `(DX,1.05,DZ)`. Drag yaw is ±1.3 rad and pitch is −0.7..0.5.
    - **Seated:** `(DX,1.32,-2.35 + max(0,1.7-aspect)*0.9)`, looking at `(DX,1.22,DZ-0.1)`. The seated mouse parallax is ±0.06/±0.09 rad.
    - **Moves:** sitting down takes 1.9 s and standing up 1.5 s, with ease-in-out cubic and a `sin(kπ)*0.12` dip. With reduced motion, both take 400 ms with no dip.
  - Pointer events: `onClick` on desk meshes when standing gives `sit`. Clicks on the main screen give `clickLine(hitLine(uv.y, …))`.
  - `useRoomKeyboard`: Enter while standing gives `sit`. While seated, every key goes to `{type:'key'}`, and the effect `standUp` triggers the stand pose.
  - `TouchControls` render below the canvas on coarse pointers.
  - Glitch effect: a 320 ms CSS overlay flicker on `glitch` effects, skipped with reduced motion.
  - `LoadingScreen` uses drei `useProgress` and shows `booting room… NN%` in the room palette.
- [ ] **Step 5:** Run `npm test -- room-ui`. Expected: PASS.
- [ ] **Step 6:** Run `npm run dev` and open `/room` in a browser. Walk through the whole flow:
  1. Drag to look around.
  2. Click the desk to sit; the boot runs.
  3. Click the pad: scan, then menu.
  4. Open each of the 9 items.
  5. Run `help`, `whoami`, `sudo x` and `funfact`.
  6. Finish the quiz and the vault (win and lose).
  7. Use each prop.
  8. Press Esc to stand, then `Exit to formal`.

  Repeat at a 390×844 touch viewport using only `TouchControls`.
- [ ] **Step 7:** Commit with `feat(room): 3D scene, camera rig, props, HUD, touch controls, loading, 2D fallback`.

### Task 13: Mode-switch glitch transition, analytics, error logging, Netlify config, e2e suite, bundle check

**Files:**
- Create: `client/src/components/layout/GlitchOverlay.jsx`, `client/src/lib/analytics.js`, `client/src/lib/errorLogging.js`, `netlify.toml`, `playwright.config.js`, `scripts/check-bundle.mjs`, `tests/e2e/formal.spec.js`, `tests/e2e/room.spec.js`
- Modify: `ModeSwitch.jsx`, `main.jsx`, `App.jsx`
- Test: e2e + `npm run check:bundle`

**Interfaces:**
- Consumes: `ModeSwitch onActivate` (Task 5), routes (Task 4).
- Produces:
  - `initAnalytics(code?: string)` injects `https://gc.zgo.at/count.js` with `data-goatcounter` only when `code` is set. It sends SPA page views on route change and sets no cookies.
  - `initErrorLogging(dsn?: string)` dynamically imports `@sentry/react` only when `dsn` is set, with `sendDefaultPii:false` and `tracesSampleRate:0`.

- [ ] **Step 1:** Implement the switch transition.
  - Clicking `ModeSwitch` prevents the default navigation and plays `GlitchOverlay`: 3 scanline slice shifts over 450 ms, then a fade to `#020405`. It then calls `navigate('/room')`.
  - Leaving the room fades back in.
  - With reduced motion it navigates immediately.
- [ ] **Step 2:** Write `netlify.toml`:
  - Build: `command = "npm run build"`, `publish = "dist"`.
  - SPA redirect: `/* /index.html 200`.
  - Headers:
    - `X-Content-Type-Options nosniff`
    - `Referrer-Policy strict-origin-when-cross-origin`
    - `Permissions-Policy camera=(), microphone=(), geolocation=()`
    - a CSP allowing `self`, `gc.zgo.at` and `*.goatcounter.com` for analytics, `*.ingest.sentry.io` for connect, `data:` and `blob:` images, `blob:` workers (three/drei), and `frame-ancestors 'none'`
  - Long cache for `/assets/*` and `/images/*`.
- [ ] **Step 3:** Write `scripts/check-bundle.mjs`. After `vite build`, it reads `dist/.vite/manifest.json` (set `build.manifest: true`) and **fails** if the entry chunk, or any chunk statically imported by it, contains `three`. Add the script `"check:bundle": "vite build && node scripts/check-bundle.mjs"`.
- [ ] **Step 4: Write the failing e2e tests.** Playwright runs against `npm run preview`, using Chromium with the flag `--use-angle=swiftshader` for WebGL.
  - `formal.spec.js`:
    - The title matches.
    - The `h1` shows the full name.
    - `Download CV` responds 200 with `application/pdf`.
    - Expanding KSMS works.
    - The contact form shows errors when empty.
    - A valid submit (POST `/` mocked with a 200 route) lands on `/thanks`.
    - A mocked 500 shows the error message.
    - `no horizontal scroll at 320px`: on `/`, `/privacy` and `/thanks`, `document.documentElement.scrollWidth <= 320`, and the `h1` bounding box fits inside the viewport.
    - The page text does not contain any phone number.
    - `/nope` shows `404: file not found`.
    - Clicking the hacker mode switch reaches `/room`.
  - `room.spec.js` (generous timeouts for software rendering):
    - **Flow:** wait for the HUD hint, press Enter, wait for seated, press Enter (scan), wait for the menu. Then type `2` + Enter and assert the canvas state via `window.__roomDebug` (exposed **only** when `import.meta.env.MODE === 'test'`, returning `{mode, sec}`) equals `{mode:'section', sec:1}`. Then Escape, `Exit to formal`, and the URL is `/`.
    - `deep link and back`: `goto('/')`, click the switch, then `goBack()` gives URL `/` with the hero visible. A direct `goto('/room')` shows the room.
    - `room fallback without WebGL`: an init script deletes `WebGL2RenderingContext` and `WebGLRenderingContext` and stubs `getContext('webgl*') → null`; expect `Your device can't run the 3D room`. Then open `trivia` via its button and answer `A` via its button.
- [ ] **Step 5:** Run `npm run test:e2e`. Expected: the new specs fail where the behaviour is missing. Fix the gaps until all pass.
- [ ] **Step 6:** Run `npm i @sentry/react`. Implement analytics and error logging, wired in `main.jsx` from `import.meta.env.VITE_GOATCOUNTER_CODE` and `VITE_SENTRY_DSN`. Both are no-ops when unset.
- [ ] **Step 7:** Run the full check: `npm run lint && npm test && npm run check:contrast && npm run check:bundle && npm run test:e2e`. Expected: all pass, and `check:bundle` prints `entry chunk free of three.js`.
- [ ] **Step 8:** Commit with `feat: mode-switch transition, cookie-free analytics, error logging, netlify config, e2e suite`.

### Task 14: Launch readiness and handover checklist

**Files:**
- Create: `docs/LAUNCH_CHECKLIST.md`
- Modify: `docs/DECISIONS.md`, `README.md` (create)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1:** Walk the owner's launch checklist (spec §8) against the running preview build and tick each item in `docs/LAUNCH_CHECKLIST.md`, with evidence (a command output, a screenshot path, or the URL checked):
  - custom 404
  - CTA above the fold
  - meta title and description per page
  - OG image
  - favicon
  - robots and sitemap
  - alt text
  - mobile breakpoints
  - sticky mobile CTA
  - loading states
  - form error states
  - thank-you page
  - privacy page
  - no cookie banner needed (with the reason)
  - analytics
  - real contact details
  - keyboard navigation (tab through `/` and the room fallback)
  - contrast
  - licences (fonts OFL, models/assets recorded)
- [ ] **Step 2:** Run Lighthouse on the `/` preview (`npx lighthouse http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless"`). Target: accessibility ≥ 95, SEO ≥ 95, performance ≥ 85 (desktop). Record the scores. Fix anything below target before continuing.
- [ ] **Step 3:** Write the Netlify handover section of `LAUNCH_CHECKLIST.md` (spec §9b):
  1. The owner creates the GitHub repo `vhutali0504/vhutali-portfolio-2026` and pushes `build/v1` (or merges it to `main`).
  2. Deploy a preview site from the repo and check it.
  3. In the **existing** site's settings, relink the repository to the new repo. Build command `npm run build`, publish directory `dist`.
  4. Set `VITE_GOATCOUNTER_CODE` and `VITE_SENTRY_DSN` if the owner has created those accounts.
  5. Enable form detection and set form notification emails to `mukhodobwanevhutali@gmail.com`.
  6. Trigger a deploy.
  7. Smoke test: `/`, `/room`, CV download, a test form submission received by email, `/nope` shows the 404.
  8. Leave the old repo `Mukhodobwane_V` untouched.
- [ ] **Step 4:** Write `README.md`: what the site is, `npm` scripts, where the content lives (`client/src/content/profile.js`, "edit this when your CV changes"), and how to replace the CV PDF and photo.
- [ ] **Step 5:** Commit with `docs: launch checklist, Netlify handover, README`.
