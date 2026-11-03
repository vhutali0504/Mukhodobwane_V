# Portfolio rebuild: design

Date: 2026-11-03
Owner: Mukhodobwane Vhutalihandivho
Location: `C:\Projects\vhutali-portfolio-2026`

Items marked **[builder's call]** or **[Claude's call]** were not decided by the owner. Everything else was.

---

## 1. Intent

This is a ground-up replacement for the owner's current portfolio at `mukhodobwanevhutalihandivho.netlify.app`. The new site keeps the same link. The owner dislikes everything about the current site. Nothing from its code or look carries over. Only facts may be reused, and the CV wins over everything else (see §5).

The site has two modes showing the same person:

1. **Formal mode** is the landing page. The owner described it as "regular, boring but still animated, not 3D". It should read like a *young professional who has just entered the corporate world*. It sits close to the old "Student" theme (light and warm) but is more grown-up.
2. **Hacker mode** is a 3D, cybersecurity-themed room that the visitor explores and plays with. It is one click away from the formal page.

**Why two modes:** recruiters skimming for experience get a clean, credible page. Anyone curious gets a memorable, playful 3D experience that matches the owner's security focus (secure auth work, fingerprint recognition).

## 2. Goals, non-goals, anti-goals

**Goals**
- A recruiter on the formal page can tell within about 10 seconds who the owner is, what they do and how to contact them.
- Hacker mode feels "flashy, interactive and 3D". The visitor sits at the desk, uses the screens and plays the games.
- All content comes from one source file, so both modes always agree.
- The site meets the owner's ground rules (`docs/GROUND_RULES.md`, copied from their global CLAUDE.md). See §8.

**Non-goals**
- Blog, CMS, admin panel or user accounts.
- Selling anything. Terms of service and refund policy don't apply because nothing is sold.
- Reusing the old site's code or the old three-theme picker.

**Anti-goals (a failure even if everything technically works)**
- The formal page feels like a template or "AI-made".
- The formal page is slow because the 3D code loads before anyone asks for it.
- Content contradicts the CV, or makes claims the CV doesn't support.
- Hacker mode traps the visitor: there's no obvious way out, or it's unusable on a phone with no fallback.
- Any of the design bans in §8 appear.

## 3. Structure and navigation

| URL | What |
|---|---|
| `/` | Formal page (landing) |
| `/room` | Hacker mode **[Claude's call]**: a real URL so it can be shared directly |
| `/privacy` | Privacy policy |
| `/thanks` | Shown after the contact form is sent |
| anything else | Custom 404, styled as a terminal "404: file not found" with a link home |

- A **"hacker mode" switch** sits in the formal page's top bar. It is a dark pill with a small green toggle that nudges now and then.
- **Switching into hacker mode:** the formal page glitches out (scanlines and a slice shift), the screen goes dark, and the room fades in. Switching back reverses it.
- **Inside the room:** "stand up" (Esc) returns to the room view. A separate, always-visible "exit to formal" control returns to `/`.

## 4. Formal mode

Reference mockup: `docs/prototypes/formal-mode.html`. It shows the direction, not final art. The owner said it "feels good".

**Look** (all [Claude's call] within the owner's "close to Student, more young-professional" brief)
- Warm off-white background (`#F7F5F0`), deep navy for text and primary buttons (`#14213D`, `#1F3A5F`), UJ orange (`#E8730C`) as a small accent only, and hairline borders (`#E2DDD2`).
- One clean sans-serif for everything (the mockup uses Plus Jakarta Sans), with IBM Plex Mono for small labels. The builder may choose differently within the bans in §8.

**Sections, in order**
1. **Top bar:** short name, links (Work, Experience, Skills, Contact) and the hacker-mode switch. On mobile it collapses to a menu.
2. **Hero:** location line, full name, a typed role line that cycles three phrases, a short intro paraphrasing the CV summary, buttons for **View my work** and **Download CV**, a line saying "Open to roles, starting 2027" (see §9), and a professional photo with a small ID-card label reading "Co-Founder & Technical Lead · Elevate Digital Solutions".
3. **Numbers strip** (counts up): 5 projects built · 5 programming languages · 2 junior students mentored · 2024, the year EDS was co-founded.
4. **Selected work:** numbered rows, not tiles. Each row expands in place to show the CV bullets, stack, dates and links. Order: KSMS, Fingerprint Recognition, Thusa Lushaka NPO website, Job Application Tracker, then this portfolio (it replaces the CV's Multi-Theme Portfolio entry, per §9).
5. **Experience:** a timeline with Elevate Digital Solutions (Jan 2024–present) and StudyTrust (Feb 2026–present).
6. **Skills:** grouped exactly as on the CV (Languages, Web & Backend, Databases, Security, Tools & Practices).
7. **Education:** University of Johannesburg, BSc Computer Science and Informatics, 2023–2026, with relevant coursework.
8. **Contact:** a form (§7) plus email, GitHub and LinkedIn links.
9. **Footer:** name, links, privacy link and a small "enter the room" link.

**Movement** (the owner approved the direction; all six options are in)
- A. The name rises in from behind a line on load.
- B. The typed role line cycles with a blinking cursor.
- C. The numbers count up once, when the strip first comes into view. This is a count, not a section fade.
- D. Hover and press feedback: nav underline grows, project row slides and its arrow moves, buttons press in. Buttons must never fade on hover.
- E. Project rows expand smoothly in place.
- F. The glitch transition into hacker mode.
- **Never** fade or slide whole sections in on scroll (banned).
- With `prefers-reduced-motion`, everything shows instantly and the typed line shows its first phrase statically.

## 5. Content

**The CV is the source of truth** because it is the owner's most recent document. The owner has the PDF and it was supplied during brainstorming. The old site's `C:\Projects\Mukhodobwane_V\src\data\profile.js` is **out of date**: it has no EDS, no Thusa Lushaka project and a different language list. Use it only for things the CV doesn't have, namely link URLs and project media.

All site text lives in one content module, for example `client/src/content/profile.js`, and both modes read from it.

From the CV:
- **Name:** Mukhodobwane Vhutalihandivho · Johannesburg, Gauteng · South African citizen.
- **Summary:** final-year BSc Computer Science and Informatics student at UJ. Hands-on with full-stack web apps, secure authentication, and data structures and algorithms. Mentors junior CS students through a formal bursary programme. Co-founded a web development agency delivering production software for real clients. "Driven by a genuine hunger to grow through structured, high-intensity environments."
- **Skills:**
  - Languages: JavaScript (ES6+), Java, C++, C#, SQL.
  - Web & Backend: Node.js, Express.js, REST API design, React, Vite, HTML5, CSS3.
  - Databases: PostgreSQL, SQL schema design, relational data modelling.
  - Security: JWT (dual-token with refresh queue), bcrypt, HTTP-only cookies, MFA via email OTP.
  - Tools & Practices: Git, GitHub, OOP, DSA, Agile/SDLC, Railway, Netlify.
- **Experience:**
  - StudyTrust, Peer Mentor, formal bursary programme (Feb 2026–present). Mentored 2 junior CS students, explained DSA and OOP, and was assigned an industry mentor.
  - Elevate Digital Solutions, Co-Founder & Technical Lead, Johannesburg (Jan 2024–present). Grew from zero to paying clients and led end-to-end delivery. Clients include the Thusa Lushaka Empowerment NPO.
- **Projects:**
  - MutualTrust – Student Management System (KSMS), Jan–Oct 2026.
  - Fingerprint Recognition System, Apr–May 2026.
  - Thusa Lushaka Empowerment NPO Website, 2024–2025.
  - Job Application Tracker, 2025.
  - Multi-Theme Developer Portfolio, 2026.
  - The full bullets are in the CV. Use them, lightly edited for the web.
- **Education:** UJ, 2023–2026, with relevant coursework as listed on the CV.
- **Links:**
  - GitHub: github.com/vhutali0504
  - LinkedIn: linkedin.com/in/mukhodobwanev
  - Job tracker live: https://job-application-tracking1.netlify.app/
  - Job tracker source: github.com/vhutali0504/job-tracker-api
  - Fingerprint demo video: https://youtu.be/2PtRI5dPc_Y
- **Photo:** `docs/assets/photo-original.jpg`, cropped as described in §9.
- **Phone number:** never in the site pages. It appears only inside the downloadable CV PDF (see §9).
- **No invented claims.** Every number and statement must trace back to the CV.

## 6. Hacker mode (the 3D room)

Reference prototype: `docs/prototypes/hacker-room-3d.html`. It is a throwaway three.js spike the owner called **"perfect"**, so the production build should match its behaviour and mood and improve on its art.

**The room**
- A dark room of a stereotypical hacker, with a desk at the side holding a multi-monitor setup: one large centre screen, two angled side screens and two smaller screens on top.
- Atmosphere details from the prototype, all kept:
  - Rain on a window with blurred city lights outside.
  - A red light strip under the desk.
  - A server rack with blinking lights.
  - A poster on the wall.
  - Energy-drink cans, a desk lamp, a keyboard with a red underglow, a fingerprint pad.
  - A gaming chair.
  - Cables on the floor.
  - Light fog and a bloom glow on the screens.
- Palette: phosphor green `#3CFF8F`, amber `#FFB347` and red `#FF4545` on near-black.
- The prototype uses block placeholders. Production uses real low-poly models **[builder's call]**: either modelled from simple shapes or using CC0/properly licensed assets, with licenses recorded per §8.

**The flow**
1. **Room view:** the visitor drags to look around within limits. Hovering something clickable changes the cursor, and a hint reads "click the desk to sit down".
2. **Sit down:** clicking the desk or screens (or pressing Enter) glides the camera into the chair in about 2 seconds with a slight dip. When seated, the view shifts slightly with mouse movement.
3. **Boot** (first visit only): a fake boot log, including the joke line "bypassing firewall ... just kidding".
4. **Fingerprint lock:** the pad on the desk pulses. Clicking it (or pressing Enter) scans it, shows a progress bar, then "ACCESS GRANTED · welcome, visitor".
5. **Menu** on the centre screen. Choose with arrow keys, a click on the screen, or by typing:
   - `01 professional_summary`
   - `02 skills`
   - `03 experience`
   - `04 projects`
   - `05 education`
   - `06 contact`
   - `07 fun_facts`
   - `08 trivia`
   - `09 crack_the_vault`
6. **Sections** show CV content on the centre screen, with a glitch effect on every switch. The side screens react to what's open:
   - Skills: skill bars.
   - Projects: a network map.
   - Trivia: a scoreboard.
   - The vault game: an "INTRUSION DETECTED" alarm with a trace bar.
   - Otherwise: a radar.
   - The other screens always run code rain, a scrolling hex dump and a clock with a CPU graph.
7. **Stand up** with Esc or the on-screen button.

**Typed commands** (the owner chose "a real terminal you can type in"):
- `help`, `ls`/`menu`/`clear`
- `cat <section>`, or a number from 1 to 9
- `whoami`
- `sudo …`: a joke refusal
- `hack`/`game`: starts the vault game
- `quiz`/`trivia`
- `funfact`
- `exit`

The production build may add more easter-egg commands **[builder's call]**.

**Props you can play with** (owner chose these): knock cans over and stand them up, spin the chair, switch the lamp on and off, and a sticky note on a monitor that shows the next fun fact on each click.

**Owner-chosen extras:**
- Typed terminal.
- Props.
- Fingerprint login.
- Glitch transitions.
- A hidden challenge, which is the vault game.
- Sound effects were turned **off**. Don't add sound.

**Fun facts and trivia** (owner: "random knowledge", **tech-related only**, not about the owner)
- Facts are shown in `fun_facts`, by the `funfact` command, on the sticky note, and as the vault reward. The prototype has 12 accurate computing, security and web history facts, a starting set the builder may extend. Every fact must be accurate and checkable.
- Trivia gives 5 random questions per round from a pool (12 in the prototype, extendable), each with A/B/C answers. Answer by clicking or pressing A, B or C. The correct answer turns green and a wrong pick red. A final score gets a playful rank, from "you might be a bot" to "root access granted. flawless."
- **Crack the vault:** 8 five-letter security words are hidden in a hex dump, and one is the password. Guess by clicking or typing. Each wrong guess shows its "likeness" (letters in the right position). You get 4 attempts. Winning shows "VAULT OPEN" plus a fun fact. Losing reveals the password and offers a retry.

**Performance, devices and accessibility** ([Claude's call] unless noted)
- The 3D code and assets load **only** when the visitor enters hacker mode, so the formal page never pays for them. A themed loading screen shows real progress.
- Touch works: drag to look, tap to interact. The terminal still needs an on-screen way to type or pick, so on touch devices show tappable buttons for the menu, the answers and the vault words.
- Fallback: if WebGL is unavailable or the frame rate is persistently very low, show a message offering formal mode, plus a lightweight 2D "terminal only" view **[builder's call on the exact fallback]**.
- Keyboard: everything in the room can be reached without a mouse (Enter to sit, arrows, typing, Esc).
- Respect `prefers-reduced-motion`: shorter camera moves and no glitch flashes.
- Target a smooth frame rate on a mid-range laptop. Cap the pixel ratio, throttle side-screen canvas redraws, and pause rendering when the tab is hidden.

## 7. How it gets made

[Claude's call; the owner already works in this stack, and the old site used it]
- **React + Vite**, single-page app.
- **3D:** three.js through React Three Fiber, `@react-three/drei` and `@react-three/postprocessing` (bloom), lazy-loaded on `/room`.
- **Routing:** React Router.
- **Hosting:** Netlify, deployed to the existing site so the link stays the same. Old and new are separate repos (§9 Q4).
- **Contact form:** Netlify Forms, so no custom backend is needed.
  - Name, email and message, validated in the browser. Netlify handles the server side.
  - A honeypot field against spam.
  - An **unticked** consent checkbox linking the privacy policy.
  - Error states, then redirect to `/thanks`.
- **Analytics:** a cookie-free, privacy-friendly option (e.g. Netlify Analytics or GoatCounter) **[builder's call]**. With no cookies and no tracking, no cookie banner is needed. Record this reasoning in `DECISIONS.md`. If any cookie-setting tool is ever added, a consent banner becomes mandatory.
- **Folder layout:** follow the owner's standard (§6 of their ground rules). This site has no custom server, so `client/` holds the app, `docs/` holds `DECISIONS.md` and `GROUND_RULES.md` plus this spec and the prototypes, and the shared config sits at the root. Don't create a `server/` folder for its own sake.

## 8. Ground rules that apply

From the owner's global rules (copy them into `docs/GROUND_RULES.md`):

- **Launch checklist:**
  - A meta title and description per page, an Open Graph image and a favicon.
  - `robots.txt` and `sitemap.xml`.
  - Alt text on every image.
  - Mobile breakpoints, plus a sticky mobile CTA (Contact / Download CV) on the formal page.
  - Loading states and form error states.
  - A thank-you page, a privacy policy page and the custom 404.
  - Analytics installed.
  - Real contact details. The location is Johannesburg. The email is on the CV. The phone number appears only in the downloadable CV (§9).
- **Privacy:**
  - Collect only name, email and message.
  - The privacy page explains Netlify Forms and the analytics, and how to request deletion (by emailing the owner).
  - Audit any third-party script.
  - Fonts and images must be licensed.
  - Terms and refund pages are N/A because nothing is sold. Record that in `DECISIONS.md`.
- **Accessibility:** colour contrast passes WCAG AA in formal mode, and the room's screen text stays readable. Keyboard navigation everywhere, visible focus styles.
- **Design bans** (never use):
  - Purple-to-blue gradients, gradient hero text.
  - Emojis in headings.
  - Inter everywhere, Space Grotesk + Instrument Serif.
  - Coloured left-border cards, glassmorphism.
  - Low-contrast dark mode.
  - Three icon boxes in a row, a badge above the headline.
  - Lucide icons everywhere, untouched shadcn.
  - Sections fading in on scroll, a cursor-following beam, buttons that fade on hover.
  - Inconsistent spacing.
  - Em dashes everywhere, buzzword copy.
  - Serif italics for accent words.
  - Grain over a gradient.
- **Reliability:** error handling and loading and empty states, compressed assets (Draco or meshopt for models, compressed textures), and error logging for the client (a lightweight option, **[builder's call]**).

## 9. Owner decisions (answered 2026-11-03)

1. **Phone number:** it does **not** appear anywhere on the site pages. The **Download CV** button serves the **full CV PDF, phone number included** (the owner's choice).
   - The PDF the owner supplied is saved at `docs/assets/cv.pdf`. Copy it into the site's public files at build time.
   - When the owner sends an updated CV (see item 2), it replaces this file.
2. **Multi-Theme Developer Portfolio:** **swap it for this new site.** The fifth project becomes this portfolio. Describe it only by what is actually built: a React portfolio with a formal mode and a 3D hacker room built in three.js, with a typed terminal, mini-games, and so on. Projects stay at 5.
   - This goes beyond the current CV, so the owner plans to update the CV to match.
   - The project entry links to this site's GitHub repo.
3. **Availability line:** "Open to roles, starting 2027". This covers graduate roles, junior developer roles and internships.
4. **Photo:** supplied 2026-11-03 and saved at `docs/assets/photo-original.jpg` (720×1280). It shows the owner in a white shirt, outdoors.
   - For the site, crop it to a head-and-shoulders 4:5 frame. This removes the "Galaxy S23+" camera watermark at the bottom and most of the busy street background.
   - Export it as optimised WebP/AVIF with a JPG fallback.
   - Alt text: "Portrait of Mukhodobwane Vhutalihandivho".
   - **[Claude's call]** Don't remove or replace the background (no AI cut-outs). A plain, honest crop suits the "young professional" tone. At 720px wide the source is fine for the hero frame, though a higher-resolution original would look sharper on large screens.
5. **Old repo:** `Mukhodobwane_V` stays on GitHub untouched. See §9b for the Netlify switch.

## 9b. Calls settled during the builder check [Claude's calls]

- **Project links:** KSMS has no public link unless the owner provides one, so its row is laid out without links. Thusa Lushaka is a client of the owner's agency and is already named on the CV. Name it, and link the live site only once its move to new hosting is finished (it currently lives on Netlify while moving to Supabase/Vercel). Until then, no link.
- **TryHackMe:** the owner's profile (`HawkSpecter`, https://tryhackme.com/p/HawkSpecter) is real. It appears in hacker mode's `contact` screen and `whoami` output, not on the formal page, because the CV doesn't list it.
- **Deployment:** the builder builds the site in the new repo and deploys it to a new Netlify preview site for checking. At launch, the owner relinks the existing Netlify site (the one serving `mukhodobwanevhutalihandivho.netlify.app`) to the new repo by following a handover checklist the builder writes. The checklist covers the build settings, the form notification email, the analytics switch-on, and a smoke test. The old repo stays as it is on GitHub, and the old site isn't kept at a separate address.
- **Email:** `mukhodobwanevhutali@gmail.com`, as on the CV.

## Appendix A: CV text (source of truth)

This is a verbatim copy of the owner's CV, supplied 2026-11-03, with the phone number left out on purpose. Site copy may be lightly edited for the web but must not add claims.

**Mukhodobwane Vhutalihandivho**. Johannesburg, Gauteng · mukhodobwanevhutali@gmail.com · GitHub · LinkedIn

**Professional summary**
Final-year BSc Computer Science and Informatics student at the University of Johannesburg, with hands-on experience building full-stack web applications, implementing secure authentication systems, and applying data structures and algorithms to solve real-world problems. Currently mentoring junior CS students through a formal bursary programme, and co-founding a web development agency delivering production software for real clients. Driven by a genuine hunger to grow through structured, high-intensity environments.

**Technical skills**
- Languages: JavaScript (ES6+), Java, C++, C#, SQL
- Web & Backend: Node.js, Express.js, REST API design, React, Vite, HTML5, CSS3
- Databases: PostgreSQL, SQL schema design, relational data modelling
- Security: JWT (dual-token with refresh queue), bcrypt, HTTP-only cookies, MFA via email OTP
- Tools & Practices: Git, GitHub, OOP, Data Structures & Algorithms, Agile/SDLC, Railway, Netlify

**Experience**

*StudyTrust: Peer Mentor, Formal Bursary Programme (Feb 2026 – Present)*
- Mentored 2 junior Computer Science students through coursework challenges, study planning and academic development as part of a structured bursary programme
- Developed clear, structured explanations of complex topics (data structures, algorithms and OOP), reinforcing my own understanding while supporting peers
- Assigned an industry mentor through the programme, gaining exposure to professional engineering practices and career planning in a real-world context

*Elevate Digital Solutions (EDS): Co-Founder & Technical Lead, Johannesburg (Jan 2024 – Present)*
- Co-founded a web development agency while completing final year of studies; grew from zero to paying clients through consistent technical delivery
- Led end-to-end software delivery: scoping requirements, architecting solutions, writing production code and managing client relationships
- Delivered production websites for clients including an NPO (Thusa Lushaka Empowerment), handling ongoing maintenance and post-launch support

**Projects**

*MutualTrust – Student Management System (KSMS) (Jan 2026 – Oct 2026). Final Year Project | React, Node.js, PostgreSQL*
- Built both frontend and backend of a multi-role platform serving student, teacher, centre manager and admin workflows, with full ownership of the authentication and API layers
- Implemented secure auth flows including dual-token JWT, HTTP-only cookies, MFA via email OTP and a refresh queue to handle concurrent API calls safely
- Developed shared utility modules standardising API communication, validation and UI behaviour across all role-based dashboards
- Collaborated in a team using Git branching, code reviews and integrating independently developed modules, applying Agile practices throughout

*Fingerprint Recognition System (Apr 2026 – May 2026). Final Year Project | Java, Graph Algorithms*
- Designed a graph-based fingerprint matching pipeline using Zhang-Suen skeletonisation to extract ridge structure, with minutiae points represented as graph nodes
- Implemented k-NN graph matching to compare fingerprint graphs, enabling similarity scoring and identity classification across benchmark datasets (FVC2002, FVC2004)
- Applied graph theory concepts (adjacency, traversal, k-NN) to a real-world biometric problem, bridging academic data structures work with practical application

*Thusa Lushaka Empowerment – NPO Website (2024 – 2025). Client Project (EDS) | React, Vite, React Router, Netlify*
- Designed and built a complete multi-section website for a South African youth NPO (Thusa Lushaka Empowerment, Nzhelele, Limpopo), covering their programmes, annual academic awards, and the Miss Thusa Lushaka beauty pageant
- Built dedicated pages and sections for About, Programs, Awards, Pageant, Gallery and Donate, with React Router handling client-side navigation and Netlify Forms powering the contact and inquiry forms without a backend
- Took the initiative to build and deploy the site proactively, then pitched it to the organisation, handling the full client conversation from first email through to demo presentation

*Job Application Tracker (2025). Full-Stack Web App | Node.js, Express.js, PostgreSQL, JWT | Deployed to Production*
- Built a full-stack REST API backend in Node.js/Express deployed on Railway, with a plain HTML/CSS/JS frontend hosted on Netlify, live and publicly accessible
- Implemented JWT authentication with bcrypt password hashing, protecting all job-related endpoints from unauthenticated access
- Supported full CRUD for job applications with status tracking across four stages (Applied, Interview, Offer and Rejected), giving users a clear pipeline view of their search
- Resolved cross-origin resource sharing (CORS) issues between separate frontend and backend deployments, a common production challenge for full-stack apps

*Multi-Theme Developer Portfolio (2026). Personal Project | React | Live Deployed*
- Built a personal portfolio in React featuring a profile picker with three distinct visual themes, demonstrating component architecture, state management and responsive UI design
- Live at mukhodobwanevhutalihandivho.netlify.app

**Education**

*University of Johannesburg: BSc Computer Science and Informatics (2023 – 2026)*
- Relevant coursework: Data Structures & Algorithms, Software Engineering (Requirements, SDLC, Agile), Priority Queues, Heaps, Hash Tables, Graph Theory, Binary Trees
- Applied coursework practically through team and individual projects spanning backend APIs, graph-based systems and secure authentication architectures
- South African citizen | Based in Johannesburg

## 10. Left to the builder

- Exact typefaces within the bans, the final spacing scale, and the icon set (not Lucide everywhere).
- Room models, materials, lighting values and the final camera framing, matching the prototype's mood.
- More easter-egg commands, more facts and trivia questions (accurate, tech-only), and the vault word list.
- The analytics provider (cookie-free) and the client error logging tool.
- The exact low-power fallback behaviour.
