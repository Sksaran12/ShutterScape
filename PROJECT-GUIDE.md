# Project Guide — Understand and Explain ShutterScape

This document is for **you**: how to understand the codebase, how to explain it
in a presentation or viva, and how to answer “what is it built for?” and “why
did you choose this stack?”.

---

## 1. Three versions of the same explanation

Pick the one that fits the moment.

### One sentence

> ShutterScape is the official website of the GCU photography club — a public
> portfolio for student photography plus a private dashboard the club uses to
> publish photos, activities and members without writing code.

### 30 seconds

> ShutterScape is a full-stack Next.js website for the photography club of
> Girijananda Choudhury University. The public side tells the club's story
> through a gallery, an activities timeline and a team page. The private side is
> an admin studio where coordinators can upload photos to Cloudinary, write
> activity posts and manage member profiles. It uses MongoDB for content, JWT
> cookie sessions for admin login, and it is deployed on Vercel or Render.

### 2 minutes

> The club's history, exhibitions and member details were scattered across a PDF,
> Instagram and WhatsApp. There was no single place to send a new student or a
> partner club. So the goal was to build an official home that is both a
> storytelling site and a simple content system.
>
> On the public side there are four pages: a cinematic home page, a filterable
> gallery with a keyboard-accessible lightbox, an activities timeline, and an
> about page with faculty, leadership, core members and alumni.
>
> The admin studio is behind a login. The coordinator signs in with an email and
> password, gets an 8-hour signed session in an httpOnly cookie, and can create,
> edit, publish or delete gallery items, activities and members. Images are
> uploaded through our server to Cloudinary, so the API secret never reaches the
> browser.
>
> Technically it is Next.js 14 with the App Router and TypeScript, Tailwind for
> the design system, Framer Motion and Lenis for motion, MongoDB Atlas with
> Mongoose for data, Zod and sanitize-html for validation, and jose plus bcrypt
> for authentication. If the database is unavailable the site still renders the
> verified fallback content instead of showing an error.
>
> The result is a site the club can actually maintain: publishing a photo takes
> under a minute, and no developer is needed for routine updates.

---

## 2. What the website is built for

### The problem

| Before | After |
| --- | --- |
| Club information lived in a 33 MB PDF | Searchable, mobile-friendly pages |
| Photos were scattered across Instagram | Curated gallery with categories and captions |
| Every website change needed a developer | Coordinators publish from `/admin` |
| Event history was hard to find | Activities timeline with dates and descriptions |
| No official link to share with students/partners | One HTTPS URL with club identity |

### The users

1. **Visitors** — prospective students, current students, faculty, alumni,
   parents, partner clubs.
2. **Club coordinators** — non-technical admins who publish content.
3. **The club itself** — needs a trustworthy archive and public identity.

### The goals

- **Tell the story** of the club visually.
- **Make content self-service** so the site does not go stale.
- **Keep it fast and accessible** on low-end phones and slow networks.
- **Keep it safe** — no public write access, no secrets in the browser.
- **Keep it cheap** — free tiers are enough for a university club.

---

## 3. What the visitor and the admin can do

### Visitor journey

```text
Landing page
  ├─ sees hero, statistics, featured photos, recent activities, team preview
  ├─ opens /gallery → filters by category → opens lightbox → reads caption
  ├─ opens /activities → reads what the club has done
  └─ opens /about → meets faculty, leadership, core members and alumni
```

### Admin journey

```text
/admin/login
  └─ /admin
      ├─ Gallery tab    → upload image, add title/caption/alt text/category, publish
      ├─ Activities tab → write an activity, set date, cover image, publish
      ├─ Members tab    → add a member, role, category, portrait, ordering
      ├─ Import content → one-click seed of verified starter data
      └─ Logout
```

---

## 4. The stack — and how it is implemented

### 4.1 Summary table

| Layer | Technology | Why it was chosen | Where to look |
| --- | --- | --- | --- |
| Framework | Next.js 14 (App Router) | One codebase for pages + API, server rendering, built-in image and metadata handling, easy deploy | `src/app/` |
| UI | React 18 | Component model, client interactivity where needed | `src/features/`, `src/components/` |
| Language | TypeScript (strict) | Catches API/model mistakes before runtime; shared types | `src/types/`, `src/lib/content-types.ts` |
| Styling | Tailwind CSS 3 + CSS variables | Fast, consistent design system; no huge CSS files | `tailwind.config.ts`, `src/styles/globals.css` |
| Motion | Framer Motion + Lenis | Editorial feel without hand-written animation code; respects reduced motion | `src/components/react-bits/` |
| Icons | lucide-react | Lightweight, consistent SVG icons | throughout |
| Database | MongoDB Atlas + Mongoose 9 | Flexible documents for varied content; free tier; simple hosting | `src/models/`, `src/lib/db.ts` |
| Auth | jose (JWT) + bcryptjs | Stateless sessions that work on serverless; strong password hashing | `src/lib/auth.ts`, `src/middleware.ts` |
| Validation | Zod 4 | One schema validates and types the payload | `src/lib/validation.ts` |
| Sanitisation | sanitize-html | Prevents stored XSS in text and rich text | `src/lib/validation.ts` |
| Images | Cloudinary | Optimised delivery, no local disk on serverless, signed uploads | `src/lib/cloudinary.ts` |
| Security | Middleware + HTTP headers | Route protection, CSRF gate, CSP/HSTS | `src/middleware.ts`, `next.config.mjs` |
| Deployment | GitHub + Vercel/Render | Push-to-deploy, HTTPS, free tier | `DEPLOYMENT.md` |

### 4.2 Next.js App Router

**What to say:** “Next.js gives us server-rendered pages and API endpoints in one
project. Server Components read from MongoDB on the server, so the database
credentials never go to the browser. Only the interactive parts — filters,
lightbox, dashboard — are Client Components.”

**How it is implemented:**

- Public pages are Server Components: `src/app/(site)/page.tsx` imports
  `HomePage`, which is `async` and calls `getGallery()`, `getActivities()`,
  `getMembers()` directly.
- The `(site)` route group adds a shared Navbar/Footer layout without changing
  the URL.
- Interactive islands use `"use client"`: `GalleryClient.tsx`, `Navbar.tsx`,
  the admin managers.
- API endpoints are Route Handlers: `src/app/api/**/route.ts`.
- `middleware.ts` intercepts `/admin/:path*` and `/api/admin/:path*` before they
  run.
- `next/image` handles sizing and optimisation; `metadata` objects handle SEO;
  `robots.ts` generates `robots.txt`.

**Why not plain React?** A plain SPA would expose the database access pattern,
need a separate backend, and lose server rendering/SEO. Next.js removes that
extra server.

### 4.3 React 18

**What to say:** “React is the UI layer. We keep most pages on the server and
only hydrate the parts that need state — the gallery filter, the lightbox, the
mobile menu and the admin dashboard.”

**How:** `useState` for filters/forms, `useEffect` for keyboard listeners and
body scroll lock, `useMemo` for filtered lists, refs for focus management.

### 4.4 TypeScript

**What to say:** “Strict TypeScript means the API, database models and UI all
agree on the shape of a gallery item or member. Most integration bugs are caught
at build time.”

**How:** `strict: true` in `tsconfig.json`; Mongoose interfaces
(`IGalleryItem`, etc.); `src/types/index.ts` and `src/lib/content-types.ts` for
shared records; `npm run build` type-checks every page.

### 4.5 Tailwind CSS + design tokens

**What to say:** “Tailwind is the styling engine, but the look comes from a
custom token system — obsidian backgrounds, a forest green accent, terracotta
highlights, Sora/Inter/JetBrains Mono typography. That keeps every page visually
consistent.”

**How:** colours, shadows, fonts and animations are extended in
`tailwind.config.ts`; base styles and the film-grain/lighting layers live in
`src/styles/globals.css`; reusable class helpers (`cn`) merge conditional
classes.

### 4.6 Framer Motion + Lenis

**What to say:** “Motion is part of the storytelling, but it must not hurt
usability. Framer Motion handles reveals and modals; Lenis adds smooth scrolling
on the public site only. Both respect `prefers-reduced-motion`.”

**How:** small reusable primitives in `src/components/react-bits/` (`BlurText`,
`ScrollReveal`, `TiltedCard`, `SpotlightCard`, `Marquee`, `CountUp`, `Parallax`,
`Aurora`, `Magnetic`). `SmoothScroll` is mounted only in the public layout so
admin tables and textareas keep native scrolling.

### 4.7 MongoDB Atlas + Mongoose

**What to say:** “Content is document-shaped: a photo has a title, caption,
category, date and image URL; an activity has rich text. MongoDB stores that
naturally, and Atlas gives us a managed free database.”

**How:**

- Models with schema validation and indexes: `src/models/GalleryItem.ts`,
  `Activity.ts`, `Member.ts`, `Admin.ts`.
- `src/lib/db.ts` caches the Mongoose connection on `globalThis`, which avoids
  opening a new connection on every serverless invocation.
- `src/lib/content.ts` contains read queries (`published: true`, sorted) and
  maps documents to small plain objects for the UI.
- Writes are only in `/api/admin/*` handlers.

**Why not SQL?** Either would work, but the content has few relations, evolves
quickly, and the team already had a Mongo cluster. Document modelling keeps the
queries short.

### 4.8 Authentication and sessions

**What to say:** “Admin auth uses a signed JWT in an httpOnly cookie. Passwords
are hashed with bcrypt cost 12. The cookie cannot be read by JavaScript, and
every admin API checks the session again on the server.”

**How:**

1. `POST /api/admin/login` validates the body with Zod and rate-limits by IP.
2. The password is compared with `bcrypt.compare` — a dummy hash is used for
   unknown emails so timing does not reveal whether an account exists.
3. `createAdminToken()` signs `{ sub, email, role }` with HS256 and an 8-hour
   expiry (`src/lib/auth.ts`).
4. The token is stored in `admin_token` with `httpOnly`, `secure` in production,
   `sameSite: 'lax'`, `path: '/'`.
5. `src/middleware.ts` verifies the token with `jose` before the admin page or
   API runs. Each handler also calls `getAdminSession()` — defence in depth.
6. Logout overwrites the cookie with `maxAge: 0`.

**Why JWT instead of a session table?** No extra database round-trip or session
store, and it works well on serverless. The trade-off is that revoking a single
session before expiry needs a blocklist; for one club admin, an 8-hour expiry is
acceptable.

### 4.9 Zod + sanitize-html

**What to say:** “Every write is validated at the boundary. Zod checks types,
lengths, enums and URL formats; sanitize-html strips dangerous markup. The
database never receives unvalidated input.”

**How:** schemas in `src/lib/validation.ts` for gallery/activity/member
create and update, login, query strings and ObjectIds. Plain text is stripped of
all tags; activity descriptions allow only a safe tag whitelist (`p`, `strong`,
`em`, lists, links with `noopener noreferrer`). Errors are converted to a single
readable message.

### 4.10 Cloudinary signed uploads

**What to say:** “Images go from the browser to our server, then to Cloudinary
with a signature. The API secret stays on the server, so nobody can upload to
the club's account directly.”

**How (sequence):**

```text
Admin browser
   │  multipart file
   ▼
POST /api/admin/upload        (session + rate limit + MIME + size + magic bytes)
   │  SHA-1 signature of sorted params + API secret
   ▼
Cloudinary /image/upload      (returns secure_url + public_id)
   │
   ▼
Admin saves the record → MongoDB stores imageUrl + imagePublicId
```

When a record is deleted, the API also calls Cloudinary `/image/destroy` so
orphaned images do not accumulate. `next.config.mjs` allows
`res.cloudinary.com` for `next/image`.

### 4.11 Security headers

**What to say:** “The app sends a strict Content-Security-Policy plus the usual
hardening headers. Scripts may only come from our own origin, the site cannot be
framed, and production adds HSTS.”

**How:** `next.config.mjs` builds a CSP (`default-src 'self'`, no object/frame
embedding, Cloudinary images allowed) and sets `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS in
production. `poweredByHeader` is disabled.

### 4.12 Deployment

**What to say:** “The repository is connected to Vercel or Render. A push to
`main` builds and deploys automatically. MongoDB Atlas and Cloudinary are
managed services, so there is no server to patch.”

**How:** see `DEPLOYMENT.md`. Both hosts run `npm run build` and `npm start`
(Vercel wraps this automatically). Environment variables hold the secrets.

---

## 5. How a request works, end to end

### Reading the gallery

```text
GET /gallery
  → Next.js renders src/app/(site)/gallery/page.tsx (Server Component)
  → GalleryPage calls getGallery() in src/lib/content.ts
  → connectToDatabase() (cached Mongoose connection)
  → GalleryItem.find({ published: true }).sort(...)
  → map to GalleryRecord objects
  → HTML is streamed to the browser
  → GalleryClient hydrates for filtering and the lightbox
```

If `MONGODB_URI` is missing or the query fails, `getGallery()` logs the error and
returns `seedGallery` with `source: "fallback"`. The page still renders.

### Signing in

```text
POST /api/admin/login
  → rate limit (5 / 15 min / IP)
  → Zod validates email + password
  → Admin.findOne({ email })
  → bcrypt.compare(password, hash or DUMMY_HASH)
  → sign JWT (HS256, 8h)
  → Set-Cookie: admin_token=…; HttpOnly; SameSite=Lax; Secure (prod)
  → 200 { success: true }
```

### Creating a gallery item

```text
1. Upload image  → POST /api/admin/upload  → Cloudinary URL + publicId
2. Save record   → POST /api/admin/gallery → middleware JWT check
                                             → getAdminSession() check
                                             → Zod parse + sanitise
                                             → GalleryItem.create(...)
3. Public page   → next request reads the new published item
```

---

## 6. Data model in one picture

```text
Admin
  _id, email (unique), hashedPassword, role, timestamps

GalleryItem
  _id, title, caption, imageUrl, imagePublicId, thumbnailUrl,
  altText, category, eventDate, published, createdBy, timestamps
  index: (published, eventDate, createdAt), (published, category)

Activity
  _id, title, description (sanitised HTML), coverImageUrl,
  coverImagePublicId, activityDate, endDate, dateLabel,
  published, createdBy, timestamps
  index: (published, activityDate)

Member
  _id, fullName, role, memberCategory, department, biography,
  portraitUrl, portraitPublicId, altText, displayOrder,
  published, createdBy, timestamps
  index: (published, memberCategory, displayOrder)
```

`memberCategory` is one of `faculty`, `leadership`, `core`, `alumni`.
Gallery categories are `Campus Life`, `Events & Workshops`, `Photowalks`,
`Behind the Lens`.

---

## 7. Engineering decisions worth mentioning

These are the details that make a project sound considered rather than “it
works on my machine”.

1. **Graceful degradation.** Missing database → verified fallback content, not a
   blank page or a 500.
2. **Defence in depth.** Middleware *and* a per-handler session check. Even if
   the matcher is edited later, writes still require a valid cookie.
3. **CSRF protection without a token.** Browser state-changing requests include
   `Origin`; middleware compares it to `Host` / `X-Forwarded-Host` and rejects
   mismatches.
4. **Timing-safe login.** Unknown emails still run bcrypt against a dummy hash,
   so response time does not reveal registered accounts.
5. **Validate at the boundary.** Zod for structure, sanitize-html for content,
   ObjectId regex for IDs, URL allow-list for images.
6. **Upload hardening.** MIME allow-list, magic-byte signature check, 15 MB
   ceiling, safe folder names, server-side signing.
7. **Accessibility.** Alt text is required, the lightbox traps focus and
   restores it, Escape closes, arrows navigate, motion respects user settings.
8. **Performance.** Server rendering, `next/image`, responsive `sizes`, small
   client bundles (only interactive islands hydrate), cached DB connection.
9. **Truthful content.** The seed data comes from the club's official document,
   not invented placeholder text.
10. **Operational clarity.** Central `http.ts` error helpers, consistent
    `{ success, message }` API shape, environment checks that fail with clear
    messages.

---

## 8. A 10-slide presentation outline

Use one slide per bullet group. Keep text short; say the details.

### Slide 1 — Title

- ShutterScape: Official Photography Club Website
- Girijananda Choudhury University
- Your name, course, date

**Say:** “This is the official website of ShutterScape, the GCU photography
club.”

### Slide 2 — The problem

- Club content scattered across a PDF, Instagram and WhatsApp
- No single official link
- Updates required a developer
- History and member records were hard to find

**Say:** “The club had great content but no home for it.”

### Slide 3 — The goal

- One official public home
- Self-service content management
- Fast, accessible, mobile-first
- Safe admin access

### Slide 4 — What it does (public)

- Home, gallery, activities, about
- Category filters and keyboard-accessible lightbox
- Verified club history and team

Show a screenshot or live page.

### Slide 5 — What it does (admin)

- Secure login
- Create/edit/publish/delete photos, activities, members
- Cloudinary uploads
- One-click import of verified content

### Slide 6 — Architecture

Show the diagram from `README.md`:

```text
Browser → Next.js (pages + API + middleware) → MongoDB Atlas
                                            → Cloudinary
```

**Say:** “One Next.js app, two managed services. No server to maintain.”

### Slide 7 — Stack and why

| Need | Choice |
| --- | --- |
| Full-stack framework | Next.js 14 + React 18 |
| Type safety | TypeScript |
| UI system | Tailwind CSS |
| Motion | Framer Motion + Lenis |
| Data | MongoDB + Mongoose |
| Auth | JWT (jose) + bcrypt |
| Validation | Zod + sanitize-html |
| Images | Cloudinary |
| Deploy | Vercel / Render |

Pick three to explain in detail; do not read the table.

### Slide 8 — Security

- httpOnly JWT cookie, 8-hour expiry
- Two-gate admin checks
- CSRF origin check
- Rate limiting
- Sanitised input
- CSP and security headers

### Slide 9 — Demo / screenshots

Live demo or 4 screenshots: home, gallery lightbox, admin dashboard, upload
success.

### Slide 10 — Result and future

- Club can publish without code
- Works on free tiers
- Future: Redis rate limiting, password reset, direct-to-Cloudinary uploads,
  automated tests, analytics, multi-language

**Close:** “The website gives the club a permanent home and gives coordinators
control over their own story.”

---

## 9. Five-minute live demo script

Practice this order; it tells a story instead of clicking randomly.

1. **Home (45 s).** “This is the public landing page — hero, club statistics
   from the database, featured photographs, recent activities and the team.”
2. **Gallery (60 s).** Filter by “Photowalks”. Open a photo. Use arrow keys,
   press Escape. “The lightbox is keyboard accessible and restores focus.”
3. **Activities + About (45 s).** “Activities come from the same content layer;
   the About page groups members by category.”
4. **Admin protection (20 s).** Open `/admin` in a private window → redirected to
   login. “Middleware blocks it before the page renders.”
5. **Login + dashboard (45 s).** Sign in. “The session is an httpOnly JWT; the
   dashboard talks to protected API routes.”
6. **Upload a photo (90 s).** Choose a small JPEG, fill title/caption/alt text,
   pick a category, save. Open `/gallery` in another tab and show it live.
   “Cloudinary hosts the image; MongoDB stores the metadata.”
7. **Delete / unpublish (30 s).** Show the confirmation and explain that the
   Cloudinary asset is cleaned up too.
8. **Close (20 s).** “Everything you saw is managed by the club — no redeploy
   needed for content.”

**Before the demo:** have a small (<4 MB) JPEG ready, be logged in in a second
tab if the network is slow, and keep a screenshot backup in case the venue Wi-Fi
fails.

---

## 10. Likely questions and short answers

**Q: What is the project about?**
A: A public website and content system for the GCU photography club — gallery,
activities, team, and an admin studio.

**Q: Why Next.js?**
A: It combines server-rendered pages and API routes in one codebase, keeps
database access on the server, and deploys easily. A separate SPA + backend
would be more work and more infrastructure.

**Q: Why MongoDB?**
A: The content is document-shaped and changes often. Mongoose gives schema
validation and indexes, and Atlas has a free managed tier. Relations are minimal,
so SQL would add complexity without much benefit.

**Q: How does authentication work?**
A: Email/password checked with bcrypt. On success we sign a short-lived JWT
(HS256, 8 hours) and store it in an httpOnly, SameSite=Lax cookie. Middleware and
each route handler verify it.

**Q: Why not NextAuth?**
A: The requirement is a single admin credential, so a small explicit JWT
implementation is easier to audit than configuring a full auth framework. The
`NEXTAUTH_SECRET` name is kept for familiarity.

**Q: How are passwords stored?**
A: Never in plain text. bcrypt with cost 12. The admin account is created by a
local script, not seeded in code.

**Q: How do you prevent XSS?**
A: All input is validated with Zod, plain text is stripped with sanitize-html,
rich text uses a tag/attribute whitelist, and React escapes output by default. A
strict CSP is an extra layer.

**Q: How do you prevent CSRF?**
A: The session cookie is SameSite=Lax, and state-changing admin requests must
have a matching `Origin` header. Requests without an Origin (curl/server-to-
server) still need the cookie.

**Q: What happens if the database is down?**
A: Public reads fall back to verified seed content. Admin writes return a clear
503. The site never crashes because of a database outage.

**Q: How are images handled?**
A: The browser sends the file to our API; the server checks type, magic bytes and
size, signs the Cloudinary request with the API secret, and returns the secure
URL. The secret is never shipped to the client.

**Q: Why not store images in MongoDB or the repo?**
A: Large binaries bloat the database and the repository, and serverless hosts
have no persistent disk. Cloudinary handles storage, optimisation and delivery.

**Q: How is it accessible?**
A: Semantic HTML, skip link, focus rings, labelled controls, required alt text,
keyboard lightbox with focus trap, reduced-motion support, contrast-checked
palette.

**Q: How is it deployed?**
A: GitHub → Vercel or Render, with MongoDB Atlas and Cloudinary as managed
services. Push to `main` triggers a build and deploy.

**Q: What are the limitations?**
A: In-memory rate limiting is per instance; no password reset; one admin role;
Vercel's 4.5 MB body limit requires a lower upload ceiling; the image folder is
large.

**Q: What would you do next?**
A: Redis/Upstash rate limiting, direct browser-to-Cloudinary signed uploads,
automated tests (Playwright + Vitest), image optimisation and moving archived
photos to Cloudinary, password reset, audit logs, analytics.

**Q: Did you build this alone?**
A: Answer honestly. Describe your specific parts: pages, admin CRUD, auth,
validation, deployment. The repository history shows the work.

---

## 11. If the demo goes wrong

- **Database slow / cold start:** wait, then refresh. Explain that Atlas free
  tier can take a few seconds to wake.
- **No internet:** show the screenshot backup. The fallback content proves the
  site is resilient.
- **Login fails:** check Caps Lock; the rate limiter may have locked the IP after
  5 attempts — restart locally or wait 15 minutes.
- **Upload fails:** the file may be over the limit or not a real JPEG/PNG/WebP.
  Use the prepared small JPEG.

---

## 12. Future improvements (good “next steps” answer)

1. **Redis/Upstash rate limiting** for multi-instance correctness.
2. **Direct-to-Cloudinary uploads** with a short-lived signature endpoint, to
   bypass host body limits.
3. **Password reset + multiple admins** with audit logging.
4. **Automated tests** — unit tests for validation, Playwright for the admin
   flow.
5. **Image pipeline** — move archived `public/assets` photos to Cloudinary and
   generate AVIF/WebP variants.
6. **Search and pagination UI** on the public gallery.
7. **Analytics** (privacy-friendly) to see which exhibitions people read.
8. **Structured data** (`Event`, `Organization`) for richer search results.
9. **Newsletter / contact form** with spam protection.
10. **Bilingual content** (English + Assamese/Hindi) if the club needs it.

---

## 13. Glossary

| Term | Meaning |
| --- | --- |
| **App Router** | Next.js routing system based on folders under `src/app` |
| **Server Component** | React component that runs on the server and sends HTML, not JS |
| **Client Component** | Component marked `"use client"` that hydrates in the browser |
| **Route Handler** | A `route.ts` file that implements an HTTP endpoint |
| **Middleware** | Code that runs before a matched request reaches a page or API |
| **JWT** | Signed token carrying session claims; verified without a database lookup |
| **httpOnly cookie** | Cookie JavaScript cannot read, protecting it from XSS theft |
| **CSRF** | Cross-Site Request Forgery — tricking a logged-in browser into a write |
| **CSP** | Content-Security-Policy — restricts which sources may load scripts/images |
| **ORM/ODM** | Object Document Mapper; Mongoose maps JS objects to MongoDB documents |
| **Hydration** | Browser attaching React behaviour to server-rendered HTML |
| **Seed data** | Verified starter content imported into an empty database |
| **Signed upload** | Upload authorised by a server-generated signature, not a public preset |

---

## 14. Where to look when you get lost

| Question | File |
| --- | --- |
| What does the home page show? | `src/features/home/HomePage.tsx` |
| How is content read? | `src/lib/content.ts` |
| What is the fallback content? | `src/lib/seed-data.ts` |
| How is login implemented? | `src/app/api/admin/login/route.ts`, `src/lib/auth.ts` |
| How are admin routes protected? | `src/middleware.ts` |
| How are uploads signed? | `src/lib/cloudinary.ts`, `src/app/api/admin/upload/route.ts` |
| How is input validated? | `src/lib/validation.ts` |
| What are the database schemas? | `src/models/` |
| How are headers configured? | `next.config.mjs` |
| How do I deploy? | `DEPLOYMENT.md` |
| How does the whole project fit together? | `README.md` |
