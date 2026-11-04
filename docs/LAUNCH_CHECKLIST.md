# Launch checklist and Netlify handover

Checked on 2026-11-04 against a production build (`npm run build`) served by `npx vite preview --port 4173`, branch `build/v1`. Raw Lighthouse reports and screenshots are in `.superpowers/sdd/2026-11-03-portfolio/lh/` (local only, that folder is git-ignored).

Items marked **Pending first deploy** cannot be proven on a laptop. Do each one in the handover section below.

## 1. Launch checklist (spec section 8)

| Item | Status | Evidence |
| --- | --- | --- |
| Custom 404 | Done | `curl localhost:4173/nope` gives 200 (Netlify rewrite), the page renders the 404 terminal, title `404 · Mukhodobwane Vhutalihandivho`, `robots: noindex`. e2e `/nope shows the 404 terminal and is noindex` passes. Screenshot: `lh/404.png`. |
| CTA above the fold | Done | At 1280x800 the hero buttons "View my work" and "Download CV" sit at y=458. At 390x800 they show in the first screen (`lh/mobile-home.png`). |
| Meta title and description per page | Done | Read from the live DOM: `/` "Mukhodobwane Vhutalihandivho · Software Developer"; `/privacy`, `/room`, `/thanks`, `/nope` each have their own title and description (`useDocumentMeta`). `/thanks` and `/nope` are `noindex`. |
| Open Graph image | Done | `curl -I /og-image.png` gives 200 `image/png`. `index.html` has og:image (1200x630), og:title, og:url and `twitter:card`. |
| Favicon | Done | `/favicon.svg` gives 200 `image/svg+xml`, linked in `index.html`. |
| robots.txt and sitemap.xml | Done | `/robots.txt` 200 `text/plain` (Allow all, Sitemap line). `/sitemap.xml` 200 `text/xml`, lists `/` and `/room`. Both use the `mukhodobwanevhutalihandivho.netlify.app` host, which the handover keeps. |
| Alt text on every image | Done | Playwright on `/`: 1 `<img>`, 0 without an `alt` attribute (alt: "Portrait of Mukhodobwane Vhutalihandivho"). Lighthouse accessibility 100. |
| Mobile breakpoints | Done | At 390 px `documentElement.scrollWidth` is 390. e2e `no horizontal scroll at 320px` passes. Screenshot: `lh/mobile-home.png`. |
| Sticky mobile CTA | Done | At 390 px `.mobile-cta` is `position: fixed`, bottom edge at 800 = viewport bottom, with Contact and Download CV (`lh/mobile-home.png`). Hidden above 720 px. |
| Loading states | Done | Room lazy load shows the LoadingScreen with real progress (App.jsx Suspense and RoomScene). Contact button shows "Sending…" while pending. |
| Form error states | Done | e2e `contact form shows errors when empty` and `a 500 shows the error message` pass. Inputs set `aria-invalid`, the server error uses `role="alert"`. |
| Thank-you page | Done | `/thanks` 200, renders, `noindex`. e2e `a valid submit posts to / and lands on /thanks` passes (against a mocked post, see the pending item for the real one). |
| Privacy page | Done | `/privacy` 200. Covers Netlify Forms, GoatCounter and how to ask for deletion by email. Linked from the footer and the form consent checkbox (unticked by default). |
| Cookie banner | Not needed | Playwright `context.cookies()` on `/` returns 0 cookies. Analytics is GoatCounter, which sets no cookies and stores no personal data (see `DECISIONS.md`). Error logging (Sentry) is off unless a DSN is set. If any cookie-setting tool is added later, a banner becomes mandatory. |
| Terms and refund pages | N/A | Nothing is sold (recorded in `DECISIONS.md`). |
| Analytics | Code done | `client/src/lib/analytics.js` loads GoatCounter only when `VITE_GOATCOUNTER_CODE` is set. **Pending first deploy:** beacon request, see section 5. |
| Real contact details | Done | Email `mukhodobwanevhutali@gmail.com`, Johannesburg, GitHub, LinkedIn. The phone number is only inside the CV PDF (unit tests check the site text and pages). |
| Keyboard navigation | Done | See section 3. |
| Contrast | Done | `npm run check:contrast` printed "All contrast pairs pass" (formal text above 4.5:1, room green 15.59:1, room dim green 5.01:1, focus rings above 10:1). Lighthouse accessibility 100. |
| Licences | Done | Plus Jakarta Sans and IBM Plex Mono are OFL-1.1 (`license` field in each `@fontsource` package.json), self-hosted, no Google Fonts request. The 3D room uses only primitives built in code, no downloaded models or textures, so there is nothing to licence (`DECISIONS.md`, 2026-11-04). The portrait is the owner's own photo. |
| No dark patterns, hidden fees or unsupported claims | Done | Nothing is sold, the consent checkbox is unticked, copy traces to the CV. |
| Data deletion requests | Done | The privacy page tells visitors to email the owner (mailto link with a subject line). |

## 2. Lighthouse (desktop preset, production build)

Command:

```
npx lighthouse http://localhost:4173/ --preset=desktop --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless"
```

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| `/` (targets 85 / 95 / none / 95) | 100 | 100 | 100 | 100 |
| `/room` (informational) | 72 | 100 | 100 | 100 |

All targets are met on `/`, so no fix was needed. `/room` performance is lower because the 3D scene is about 290 kB gzip and headless Chrome renders it in software. Treat that number as a worst case, not a target. Visitors only load it after choosing the room.

## 3. Keyboard pass

Method: Playwright, 1280x800, pressing Tab repeatedly and reading `document.activeElement` and its computed outline.

- `/`: order is Skip to content, nav (Work, Experience, Skills, Contact), the hacker mode switch, View my work, Download CV, the five project buttons, email, GitHub, LinkedIn, the form fields, consent checkbox, privacy link, Send message, footer links (GitHub, LinkedIn, Privacy, Enter the room), then out of the page and round again. Every stop had a visible focus style and nothing was unreachable. Screenshot: `lh/kb-home-focus.png`.
- `/room` with WebGL disabled (the 2D fallback): Back to the formal site, the terminal output region (scrollable, focusable), the nine menu buttons, the Command input, Run, then it wraps. Nothing unreachable, all with a focus style. Screenshot: `lh/kb-room-fallback.png`.
- Not tested by script: the 3D room's own keyboard controls and the HUD "Text-only view" button, because headless Chrome here has no real GPU. The e2e test `flow: sit, scan, open Skills, exit to formal` covers the 3D flow. Try the room with the keyboard once after deploy.

## 4. Handover: switching the existing Netlify site to the new repo

Do these in order. Nothing has been pushed or deployed by the builder.

1. Create the GitHub repo `vhutali0504/vhutali-portfolio-2026` (empty, no README) and push the `build/v1` branch. Either keep `build/v1` as the branch Netlify builds, or merge it into `main` first.
2. In Netlify, deploy a new **preview** site from that repo. Open it and click around (`/`, `/room`, CV download).
3. When happy, open the **existing** site (the one serving `mukhodobwanevhutalihandivho.netlify.app`). Go to Site configuration, Build and deploy, Continuous deployment, and relink the repository to `vhutali0504/vhutali-portfolio-2026`. Set Build command `npm run build` and Publish directory `dist`. (The same values are in `netlify.toml`.)
4. Under Site configuration, Environment variables, set these if you have made the accounts (the site works without them):
   - `VITE_GOATCOUNTER_CODE`: your GoatCounter site code.
   - `VITE_SENTRY_DSN`: your Sentry DSN. The security policy (CSP `connect-src` in `netlify.toml`) allows `*.ingest.sentry.io`, `*.ingest.de.sentry.io` and `*.ingest.us.sentry.io`. Check your DSN host matches one of those. If it does not, add your host to `connect-src`.
5. Under Forms, make sure form detection is enabled. After the first deploy the `contact` form should appear. Add a form notification by email to `mukhodobwanevhutali@gmail.com`.
6. Trigger a deploy (Deploys, Trigger deploy, Clear cache and deploy site).
7. Smoke test on the live address:
   - `/` loads, `/room` loads and the 3D room appears.
   - Download CV opens the PDF.
   - Send a test message through the form (tick the consent box). You should land on `/thanks` and receive the email.
   - `/nope` shows the 404 page.
   - Open DevTools (Console) on `/`, on `/room` and while submitting the contact form, and confirm there are **no Content Security Policy errors**.
8. Leave the old repo `Mukhodobwane_V` on GitHub untouched. It is the rollback.

## 5. Pending first deploy

None of these can be checked on a laptop, because they need Netlify's servers or your accounts.

- [ ] **Netlify form delivery.** Step 7 above: submit the form, land on `/thanks`, the email arrives at `mukhodobwanevhutali@gmail.com`, and the submission shows in Netlify under Forms. The local tests only mock the POST.
- [ ] **CSP headers.** Run `curl -sI https://mukhodobwanevhutalihandivho.netlify.app/ | grep -i content-security-policy` and confirm the header is present, then confirm no CSP errors in DevTools (step 7). `tests/e2e/csp.spec.js` already applies the exact header from `netlify.toml` locally and passes, so this only proves Netlify serves it.
- [ ] **GoatCounter beacon.** With `VITE_GOATCOUNTER_CODE` set, open the site, check DevTools Network for requests to `gc.zgo.at` and `<code>.goatcounter.com`, and see the visit in the GoatCounter dashboard.
- [ ] **Sentry event.** With `VITE_SENTRY_DSN` set, throw a test error (in the DevTools Console run `setTimeout(() => { throw new Error("sentry test") })`) and see it in Sentry. If nothing arrives, check the DSN host against the CSP (step 4).
- [ ] **Room keyboard check** on the live site (section 3).
- [ ] **Lighthouse on the live URL**, if you want production numbers: `npx lighthouse https://mukhodobwanevhutalihandivho.netlify.app/ --preset=desktop --quiet --chrome-flags="--headless"`.
