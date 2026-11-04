# Vhutali portfolio 2026

My personal portfolio. It has two faces on one site:

- `/` is the formal page: summary, work, experience, skills, education and a contact form.
- `/room` is a 3D hacker room built with three.js. You sit at a desk and use a terminal to read the same content. Phones and browsers without WebGL get a text-only version.

It is a Vite + React 19 app, deployed on Netlify. There is no server of my own. The contact form uses Netlify Forms.

## Run it

You need Node.js 20 or newer.

```
npm install
npm run dev
```

Open http://localhost:5173.

## npm scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server with hot reload. |
| `npm run build` | Builds the production site into `dist/`. Netlify runs this. |
| `npm run preview` | Serves `dist/` locally (port 4173) so you can check the real build. |
| `npm run lint` | Checks the code style and common mistakes. |
| `npm test` | Runs the unit tests (Vitest). |
| `npm run test:e2e` | Runs the browser tests (Playwright). It builds in test mode first. |
| `npm run check:contrast` | Checks that the colour pairs meet WCAG AA contrast. |
| `npm run check:bundle` | Builds, then fails if the formal page loads three.js up front (it must only load when you open the room). |
| `npm run photo` | Re-makes the portrait images and the social preview image from `docs/assets/photo-original.jpg`. |
| `npm run build:test` | A test-mode build used by the browser tests. You do not need to run it yourself. |

Before you push a change, run:

```
npm run lint && npm test && npm run check:contrast && npm run check:bundle && npm run test:e2e
```

The first time you run the browser tests you may need `npx playwright install chromium`.

## Updating content when your CV changes

Almost all the text on the site lives in one file: `client/src/content/profile.js`.

- Name, location, email, availability line and summary are at the top.
- `experience`, `projects`, `skills`, `education` and `stats` are further down. Edit the text in place.
- Add or remove a project by adding or removing an item in `projects`.

The room's fun facts, trivia and vault words are in `client/src/content/facts.js`, `trivia.js` and `vaultWords.js`.

Rules to keep:

- Do not put your phone number in any file under `client/`. It stays inside the CV PDF only. A unit test checks for it.
- Only write things that are true and on your CV.

After editing, run `npm test` and look at `npm run dev` before you push.

## Replacing the CV PDF

1. Put the new PDF in `client/public/cv/`.
2. If the file name is different, update `cvUrl` in `client/src/content/profile.js` to match, and delete the old PDF.
3. Run `npm run dev` and click Download CV to check it opens.

Also keep a copy at `docs/assets/cv.pdf` so the original is in the repo.

## Replacing the photo

1. Save the new photo as `docs/assets/photo-original.jpg`.
2. Check the crop in `scripts/process-photo.mjs` (the `CROP` line). It is a 4:5 head-and-shoulders frame measured in pixels of the original, so a photo of a different size needs different numbers.
3. Run `npm run photo`. It writes the 480 px and 600 px images (AVIF, WebP and JPG) to `client/public/images/` and the social preview image to `client/public/og-image.png`.
4. Open the site and look at the result. Update the alt text in `profile.js` if the photo changes a lot.

## Optional environment variables

Both are off by default. The site works without them. Copy `.env.example` to `.env` to try them locally. On Netlify, set them under Site configuration, Environment variables.

- `VITE_GOATCOUNTER_CODE`: your GoatCounter site code (the part before `.goatcounter.com`). Turns on the cookie-free page counter.
- `VITE_SENTRY_DSN`: the DSN from your Sentry project. Turns on error reporting. The Content Security Policy in `netlify.toml` allows `*.ingest.sentry.io` and the `de` and `us` regions, so check your DSN host matches one of those.

These values are baked into the build, so redeploy after changing them.

## Where things are

```
client/src/content/   all the text (edit this)
client/src/pages/     one file per route: Home, Room, Privacy, Thanks, NotFound
client/src/components/ the formal page pieces
client/src/room/      the 3D room, terminal engine and 2D fallback
client/public/        CV, images, favicon, robots.txt, sitemap.xml
docs/                 DECISIONS.md, GROUND_RULES.md, LAUNCH_CHECKLIST.md, the spec
netlify.toml          build settings, redirects and security headers
```

## Launching

Follow `docs/LAUNCH_CHECKLIST.md`. It has the checks already done and the exact Netlify steps.
