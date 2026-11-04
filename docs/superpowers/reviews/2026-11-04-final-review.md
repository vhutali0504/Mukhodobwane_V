# Final whole-branch review: f1b66f3..a8912be (build/v1)

Reviewer: final code reviewer (single pass over the source, plus targeted checks). Read-only on the checkout. The one build was a production `vite build` into the scratchpad, not into `dist/`.

Method. I read the spec (including Appendix A), the plan's Global Constraints and Review Focus, every ruling in progress.md, and all of `client/src` that faces visitors: App, main, pages, layout, formal components, hooks, lib, api, room shell, scene, reducer, engine, drawMain, Monitors, HUD, touch controls, fallback and styles. I also read netlify.toml, vite.config, index.html, the e2e specs, LAUNCH_CHECKLIST and DECISIONS. I skimmed the per-file scene art (Atmosphere, Props, Desk, CameraRig past the pose logic) and did not judge it line by line. Checks I ran:
- `git grep` across the whole tree and history for the phone number.
- A production build, then grep of `dist` for `__roomDebug`, `e2e3d`, remote URLs and the phone number.
- Grep of the CSS and copy for design-ban patterns and em dashes.

## Strengths

- **Clean engine and renderer contract.**
  - `engine.js` is pure (time through `now`, randomness through `ctx.rng`) and never mutates.
  - `step()` resets scroll centrally (engine.js:416-423).
  - `drawMain` returns `{menuY0, lineH, scrollMax}`. Monitors.jsx:57-62 feeds that back as `setScrollMax`, which is idempotent.
  - `hitLine` uses the same geometry the renderer just wrote.
  - The roomReducer split (a UI `sit` is a camera request; the engine hears `sit` on arrival) is a tidy fix for the boot-after-glide ordering.
  - I found no interface mismatches between engine.js, drawMain.js, RoomScene/Monitors and RoomShell.
- **Test hooks stay out of production.** A production build contains no `__roomDebug` and no `e2e3d`. Both are gated on `import.meta.env.MODE === 'test'`, which Vite folds to false, so Rollup drops them (RoomShell.jsx:194-195 and 247-253). Ruling R3 is honoured.
- **Defence in depth on the 3D path.**
  - No WebGL leads to the 2D view.
  - A scene error caught by SceneBoundary leads to the 2D view.
  - A slow device or no first frame within 10 s leads to the 2D view, and the "try anyway" button lets the visitor override it.
  - The loading cover always carries a way out (LoadingScreen.jsx:374).
  - Touch controls cover every terminal action. Review Focus 1 and 2 are met.
- **The CSP is tight and was exercised in a browser.**
  - No `'unsafe-inline'` anywhere.
  - `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`.
  - connect-src is limited to GoatCounter and the Sentry ingest hosts.
  - The scene chunk references no remote asset URLs (drei is used only for RoundedBox, PerformanceMonitor and useProgress).
- **Privacy code matches its promises.**
  - GoatCounter loads only when a code is set and sets no cookies.
  - Sentry is dynamically imported only when a DSN is set. It is absent from the prod entry when no DSN is set.
  - Sentry runs with `sendDefaultPii:false` and `tracesSampleRate:0`, drops `ui.input` breadcrumbs, and deletes request body, cookies and user.
  - The contact form trims input, bounds lengths, has an unticked consent box and a honeypot, and blocks a double submit with a ref guard.
- **Content traces to the CV.**
  - Every project title, date, stack and bullet in profile.js is a light web edit of Appendix A.
  - The fifth project follows §9.2, KSMS and TLE have no links per §9b, and TryHackMe appears only in the room.
  - The availability line matches exactly, and the stats strip matches §4.3.
  - No em dashes, gradients-as-decoration, banned fonts, backdrop-filter, left-border cards, Lucide or shadcn in `client/src`. The only gradients are the scanline slices of the glitch effect.
- **Docs are honest.** LAUNCH_CHECKLIST separates "Done with evidence" from "Pending first deploy", and DECISIONS records the why.

## Issues

### Critical (Must Fix)

None.

### Important (Should Fix)

**I-1. A failed load of the lazy Room chunk blanks the whole app.**
- Where: `client/src/App.jsx:27-33`.
- What's wrong:
  - `lazy(() => import('./pages/Room.jsx'))` has no error boundary above it, so a rejected import is an uncaught render error and React 19 unmounts the root. The visitor gets a white page with no way out.
  - The inner RoomScene chunk is protected by SceneBoundary. The outer Room chunk is not.
  - The trigger is common. With the SPA rewrite `/* -> /index.html 200` (netlify.toml:5-8), a stale tab that asks for a hashed chunk that is gone after a redeploy gets HTML back with status 200, the module fails on its MIME type, and the import rejects. A flaky mobile connection has the same effect.
- Why it matters: this is the spec §2 anti-goal (trapping the visitor) and Review Focus 2 ("never a blank or frozen page").
- Fix:
  - Wrap the `/room` `<Suspense>` in a small error boundary that renders "Couldn't load the room" with "Reload" and "Back to the formal site". Optionally reload once automatically, guarded by sessionStorage, so a stale tab picks up the new deploy.
  - Optionally add a `[[redirects]] from="/assets/*" to="/404.html" status=404` rule (or a rule with an empty 404) above the SPA rule, so a missing chunk fails fast with a real 404.

**I-2. The consent "privacy policy" link destroys the visitor's typed message.**
- Where: `client/src/components/formal/ContactForm.jsx:127`.
- What's wrong: it is a same-tab `<Link to="/privacy">`. The natural flow is: type a message, reach the consent box, click to read the policy. That unmounts Home, and the form state is lost. Back returns an empty form.
- Why it matters: data loss at the exact moment the site asks for consent.
- Fix: `<a href="/privacy" target="_blank" rel="noopener noreferrer">` for this one link, or keep a sessionStorage draft. The new tab is the one-line fix.

**I-3. The scroll position is never reset on route change.**
- Where: `client/src/App.jsx:15-19`. Nothing in `client/src` calls `scrollTo`, and `<BrowserRouter>` has no scroll restoration.
- What's wrong: a visitor who clicks the privacy link from the contact section near the bottom of the long Home page lands near the bottom of /privacy. On a phone they land mid-page. The same happens after any in-app push navigation.
- Fix: in `PageViews` (or a sibling), on a push navigation run `useNavigationType() !== 'POP' && !hash && window.scrollTo(0, 0)`, keyed on `pathname`.

**I-4. The privacy, thanks and 404 pages use an orange focus ring, against ruling and contrast.**
- Where: `client/src/styles/pages.css:8`.
- What's wrong: `outline: 3px solid var(--accent)` on `--bg` is about 2.8:1. The Task 3 ruling replaced the accent focus ring with navy, at 10.5:1, because accent fails WCAG 1.4.11's 3:1. This line, added in Task 4, brings it back for links on /privacy and /thanks.
- Fix: delete the line, so the global navy `:focus-visible` applies.

**I-5. The owner's phone number is in plain text in a file that will be pushed to a public repo.**
- Where: `docs/superpowers/plans/2026-11-03-portfolio.md:31` (full number) and :598 (fragment). The fragment also appears in `tests/e2e/formal.spec.js:86`. The full number is already in the base commit f1b66f3 and every commit since, so the history carries it too.
- Why it matters:
  - Spec §5 and §9.1 limit the number to the CV PDF.
  - The site's "This Portfolio" row links to `github.com/vhutali0504/vhutali-portfolio-2026` (profile.js:128), and handover step 1 pushes the repo there. That publishes the number as scrapeable plain text, which is a different exposure from a PDF a person downloads.
  - Nothing has been pushed yet (no remote), so this is cheap to fix now and expensive later.
- Fix:
  - Replace the number in the plan with "the owner's phone number (see the CV PDF)".
  - Rewrite the history before the first push. Squashing or recreating the root commit is easy while there's no remote.
  - In the e2e test, keep the fragment, or check against a value read from an env var.
  - Add a handover step: "repo must be public for the Source link; confirm no phone number in `git log -p`". While at it, decide whether `docs/assets/photo-original.jpg` (uncropped, street background) belongs in a public repo.

### Minor (Nice to Have)

- **M-1.** `client/src/components/formal/ContactForm.jsx:42-43, 131`: after a failed submit, focus is not moved to the error. The button was disabled while pending, so focus can be lost to `<body>` (browser-dependent). Fix: give the alert `tabIndex={-1}` and focus it in the `catch`. This is the Task 8 deferral. I mark it fix before merge (see the triage).
- **M-2.** `client/src/room/scene/RoomScene.jsx:165`: `visibleSince = useRef(0)`. `performance.now()` counts from page load. A visitor reaches the room after reading the formal page, so the 5 s grace has already expired by the time the scene mounts. The first PerformanceMonitor windows include shader compile and texture upload stalls, which can add up to the two strikes and push a capable laptop into "running too slowly". Fix: `useRef(performance.now())`, or reset it in `onFirstFrame`.
- **M-3.** `client/src/room/scene/RoomScene.jsx:196-200`: there is no `webglcontextlost` handling. After a GPU reset, or mobile backgrounding under memory pressure, the canvas goes black. three's restore path does not rebuild the EffectComposer targets or the CanvasTextures. The HUD buttons remain, so the visitor is not trapped, but the room is dead. Fix: in `onCreated`, `gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onSceneError() })`. That needs `onSceneError` passed down, or reuse `onSlow`.
- **M-4.** `client/index.html:12`: the static `og:url` always points to `/`. Link-preview crawlers don't run JS, so a shared `/room` link is attributed to the home URL. Facebook and LinkedIn collapse it to `/`, which undercuts the reason given in spec §3 for a real `/room` URL. Fix: delete the `og:url` line. Also consider adding a static `og:description`, since today only JS sets it.
- **M-5.** `client/src/components/layout/ModeTransition.jsx:24-33`: pressing Back during the 670 ms glitch leaves phase `'out'` and lets the pending `navigate('/room')` fire. Fix: in the pathname effect, `if (phase==='out') { clearTimeout(timer.current); setPhase(null) }`. The trigger window is narrow (see the triage).
- **M-6.** `client/src/room/terminal/engine.js:258-259` with roomReducer.js:56: in the 2D view, typed `exit` is a silent no-op, because `standUp` only acts when the pose is seated. Meanwhile `help` advertises it. Fix: in 2D, map the `standUp` effect to "Back to the formal site", or hide the line.
- **M-7.** RoomShell remounts on every visit to `/room`, so the boot log and fingerprint replay on each re-entry in the same session. Spec §6.3 says "first visit only". Fix: a module-level or sessionStorage `booted` flag passed to `initRoom`.
- **M-8.** `client/src/pages/Privacy.jsx`:
  - The error-logging paragraph doesn't name Sentry, a third party that receives data when a DSN is set.
  - Netlify Forms runs submissions through Akismet spam filtering, which isn't mentioned.
  - Fix: one sentence each. This is ground rule "Audit third-party SDKs".
- **M-9.** `client/src/components/layout/Footer.jsx:12-19`: the GitHub and LinkedIn links open in the same tab, while the same links in Contact open a new tab. The `rel` attribute is harmless but pointless without `target`. Pick one behaviour.
- **M-10.** `client/src/room/scene/RoomShell.jsx:189`: on a slow network the 10 s first-frame clock starts before the 290 kB-gzip scene chunk has downloaded. The fallback then says "running too slowly on this device", which is wrong for a slow network. The retry works. Fix: start the clock when the scene chunk resolves, or change the wording to "taking too long to load".
- **M-11.** `client/src/styles/tokens.css:22`: the comment "token only; not wired yet" is stale, since `--focus-room` is now used.
- **M-12.** `client/src/components/formal/Stats.jsx:26`: before the count-up starts, screen-reader users hear "0 projects built". Fix: give each stat an `aria-label` with the final value and hide the animated number from assistive tech.
- **M-13.** `client/public/sitemap.xml` omits `/privacy`.

## Triage of the deferred minors in progress.md

| # | Task | Deferred minor | Verdict | Reason |
|---|---|---|---|---|
| 1 | T1 | eslint ignores lacks .superpowers | fine to leave | git-ignored folder; at worst lint is slower |
| 2 | T1 | varsIgnorePattern '^[A-Z_]' too broad | fine to leave | lint ergonomics only |
| 3 | T1 | DECISIONS.md entries need own date headings | fine to leave | the "CSP style-src (Task 13 fix)" heading lacks a date; docs polish |
| 4 | T2 | vaultWords comment "all real words" vs HTTPS/REGEX/LINUX | fine to leave | they are real tech terms; the comment wording is cosmetic |
| 5 | T2 | trivia "father of computer science" contestable | fine to leave | Turing is the standard answer and the distractors are unambiguous |
| 6 | T2 | trivia test doesn't check options non-empty/distinct | fine to leave | the pool is static and was reviewed by hand |
| 7 | T3 | no unit test for the contrast helper | fine to leave | the script itself is the check and it runs in CI |
| 8 | T3 | navy ring on navy surfaces | fine to leave | the 2px offset draws it on the light bar; but see I-4 for the real focus regression |
| 9 | T4 | /room lazy route untested in unit | fine to leave | e2e deep-link covers it (the failure path is I-1) |
| 10 | T4 | 404 test should use getByRole heading | fine to leave | test style |
| 11 | T4 | noindex for /thanks and 404 | fine to leave | already done (useDocumentMeta `noindex`) |
| 12 | T5 | mobile menu Escape-to-close and focus return | fine to leave | it's a non-modal disclosure: the button toggles, links close it, nothing is trapped; Escape is a nice-to-have, not WCAG |
| 13 | T5 | useTypewriter throws on empty phrases | fine to leave | static three-phrase content |
| 14 | T5 | unneeded MemoryRouter in footer test | fine to leave | Footer now uses `<Link>`, so the router is needed |
| 15 | T5 | nav underline on hover only, not focus-visible | fine to leave | the global navy focus ring is visible |
| 16 | T5 | internal plain anchors cause full reloads | fine to leave | resolved in T13 (Footer uses Link; ModeSwitch prevents default) |
| 17 | T6 | "never restarts" test should fire a second intersect | fine to leave | the observer disconnects; test depth only |
| 18 | T7 | row hover animates padding; not gated by (hover:hover) | fine to leave | cosmetic; one small layout on hover; sticky shift on touch is harmless |
| 19 | T7 | reduced motion handled twice | fine to leave | redundant, not wrong |
| 20 | T7 | long accessible name on the row button | fine to leave | informative, and inside a heading |
| 21 | T7 | no RED step | fine to leave | process lapse; the tests are real |
| 22 | T8 | **focus not restored after failed submit; no pending announcement** | **fix before merge** | keyboard users can lose their place after an error; two-line fix (M-1) |
| 23 | T8 | component tests lack reject/timeout; ref guard unexercised | fine to leave | submitContact unit tests cover reject and timeout; the guard is simple |
| 24 | T8 | disabled button opacity .7 | fine to leave | about 6:1 after blending, and disabled controls are exempt |
| 25 | T8 | retry after timeout may duplicate | fine to leave | inherent to a fire-and-forget POST; the owner dedupes by eye |
| 26 | T9 | CV test compares size only; no dimension checks | fine to leave | the assets are committed and reviewed by eye |
| 27 | T10 | ctx spread lets undefined override; Math.random fallback | fine to leave | RoomShell always passes the full `CTX` |
| 28 | T10 | ended-game candidate words swallowed; vault imports shuffle from quiz | fine to leave | cosmetic; module coupling |
| 29 | T10 | test gaps (out-of-range clickLine, Escape in boot, ls ./about_me) | fine to leave | the code paths are guarded |
| 30 | T11 | weak drawNote wrap test; no ellipsis on long facts | fine to leave | the fact pool is static and fits |
| 31 | T11 | dead setup in BIOMETRIC test | fine to leave | test hygiene |
| 32 | T11 | heading spacing | fine to leave | cosmetic |
| 33 | T11 | stale scrollMax across a section change; last line overlaps the footer by a few px | fine to leave | self-corrects within one 30 fps frame; the overlap is a few px |
| 34 | T12 | **visibleSince grace starts at 0** | **fix before merge** | one line; avoids a false "too slow" fallback on first entry (M-2) |
| 35 | T12 | **no webglcontextlost handling** | **fix before merge** | about 4 lines; turns a dead black canvas into the 2D view (M-3) |
| 36 | T12 | no unit tests for SceneBoundary / slow path / hasWebGL / throttle | fine to leave | e2e covers no-WebGL; add a test alongside fixes 34 and 35 if cheap |
| 37 | T12 | aria-live on the whole fallback output | fine to leave | verbose but correct for the screen-reader path; consider moving focus to the heading later |
| 38 | T12 | pointer:coarse only | fine to leave | hybrid devices keep the HUD buttons; the keyboard path exists |
| 39 | T12 | caret blink in the Suspense fallback | fine to leave | the global reduced-motion rule stops it |
| 40 | T13 | style-src 'unsafe-inline' | fine to leave | resolved (removed, browser-verified) |
| 41 | T13 | first-frame timeout has no e2e | fine to leave | unit-level logic; real-device check in the handover |
| 42 | T13 | Back during the glitch: pending navigate fires | fine to leave | 670 ms window, and the outcome is the room the visitor just asked for; optional 2-line fix (M-5) |
| 43 | T13 | **static og:url** | **fix before merge** | delete one line; otherwise every shared /room link previews as / (M-4) |
| 44 | T13 | Sentry regional ingest hosts | fine to leave | resolved (de and us added) |
| 45 | T13 | check-bundle relies on three's markers | fine to leave | dev tooling |
| 46 | T13 | netlify.toml:11 stale comment | fine to leave | resolved in 2858e9a |
| 47 | T14 | **checklist lacks §8 Reliability rows and the third-party-script audit** | **fix before merge** | ground rules require them. Docs only. Add rows for: error handling, loading/empty states, compressed assets, error logging, uptime monitoring as a handover step, and a GoatCounter + Sentry audit. Also add the I-5 public-repo and phone step |
| 48 | T14 | wrong DECISIONS citation; alt text checked on / only; README Node 20+ without engines; preview sitemap host | fine to leave | the only `<img>` is on /; Netlify's default Node is 20 or newer; sitemap points at the final host on purpose |

## Recommendations

- Fix I-1 to I-5 and the five "fix before merge" minors in one small round. Each is a few lines. Add unit tests for the I-1 boundary, the I-3 scroll reset and the M-3 context-loss path.
- For I-5, redact and rewrite history before the first `git push`. After a push, removal means a force-push plus GitHub cache purges.
- Consider calling `Sentry.captureException` (no payload) in the ContactForm catch, so failed submissions are visible to the owner. Today they are invisible, and that path is exactly where a lost recruiter message would happen.
- Consider a `<noscript>` with the email and a CV link in index.html, so a JS-off recruiter isn't met by a blank page.

## Declined to judge

- **3D art quality and mood versus the prototype:** needs a real GPU and eyes. The per-task controller viewed it.
- **Frame rate on a real mid-range laptop:** not measurable here; the handover lists a live check.
- **Live Netlify behaviour** (form delivery, served headers, GoatCounter and Sentry ingest): the checklist marks these "Pending first deploy".
- **Spacing consistency and visual polish of the formal page:** needs screenshots across breakpoints. Lighthouse and the 320 px e2e give partial evidence only.
- **Accuracy of every fact and trivia answer:** I spot-checked them all and found nothing wrong, but did not research each one against sources.
- **Dependency advisories in package-lock.json:** covered at T1 (`npm audit --omit=dev` gave 0).
- **Whether `docs/assets/cv.pdf` and `photo-original.jpg` should ship in a public repo:** owner decision, raised under I-5.

## Assessment

**Ready to merge? With fixes**

**Reasoning:** The architecture, the engine/renderer/shell contract, the fallbacks, the CSP and the content fidelity are solid, and I found nothing critical. Merge after five small fixes:
- the unguarded lazy Room import that can blank the site (I-1);
- the consent link that drops a typed message (I-2);
- the missing scroll reset (I-3);
- a one-line focus-contrast regression (I-4);
- removing the phone number from the repo and its history before the first public push (I-5).
