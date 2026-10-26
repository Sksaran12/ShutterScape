# ShutterScape — Official Photography Club Website

The official website of **ShutterScape**, the photography club of
**Girijananda Choudhury University (GCU), Guwahati, Assam** (founded 2023).

It is a full-stack Next.js application with two halves:

- a **public storytelling site** (home, gallery, activities, team), and
- a **private admin studio** where club coordinators manage photographs,
  activities and members without touching code.

> New to the project or preparing a presentation/viva? Read
> [`PROJECT-GUIDE.md`](./PROJECT-GUIDE.md).
>
> Ready to publish it? Follow [`DEPLOYMENT.md`](./DEPLOYMENT.md).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sksaran12/ShutterScape)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Sksaran12/ShutterScape)

> Both buttons ask you to connect your own Vercel/Render account and fill in the
> environment variables listed in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## 1. What the website is built for

The club had its history, exhibitions, photowalks and member records scattered
across a PDF, Instagram and WhatsApp. This site gives the club:

1. **A permanent public home** that tells the club's story and showcases
   student photography.
2. **A content management layer** so non-technical coordinators can publish a
   new photo, activity or member in under a minute — no redeploy needed.
3. **A verified digital archive** of the club's activities and people,
   imported from the official Club Details document.
4. **A safe admin workflow**: uploads go to Cloudinary, credentials stay on the
   server, and every write requires a signed session.

Primary audience: students, faculty, prospective members, alumni, partner
clubs and anyone looking for the club online.

---

## 2. Features

### Public site

| Route | What it does |
| --- | --- |
| `/` | Cinematic hero, club statistics, featured photographs, recent activities, team preview, calls to action |
| `/gallery` | Category filters, responsive masonry-style grid, keyboard-accessible lightbox (arrow keys, Escape, focus trap), captions and dates |
| `/activities` | Timeline of exhibitions, workshops, photowalks and campus challenges |
| `/about` | Club story, mission, faculty coordinators, leadership, core members and alumni |
| `/robots.txt` | Allows the public site, blocks `/admin` and `/api` |

### Admin studio (`/admin`)

- Email + password sign-in (bcrypt cost 12) with an 8-hour JWT session in an
  `httpOnly`, `SameSite=Lax` cookie.
- Create / edit / delete **gallery items**, **activities** and **members**.
- Publish / unpublish content without deleting it.
- Drag-free ordering of members via a `displayOrder` field.
- Server-proxied **Cloudinary image upload** with signed requests.
- One-click **“Import verified starter content”** seed for an empty database.
- Responsive dashboard, loading/error states and confirmation dialogs.

### Accessibility & UX

- Semantic landmarks, skip link, visible focus rings, `aria-*` labels.
- Lightbox focus trap + focus restoration.
- Required alt text for every image.
- `prefers-reduced-motion` support through the animation components.
- Optimised images via `next/image` and responsive `sizes`.
- Dark editorial design with a consistent type scale and colour tokens.

---

## 3. Tech stack

| Layer | Technology | Role in this project |
| --- | --- | --- |
| Framework | **Next.js 14 (App Router)** | Server components, route handlers, middleware, image optimisation, metadata |
| UI runtime | **React 18** | Client components for filters, lightbox and dashboard |
| Language | **TypeScript 5 (strict)** | Shared types for API payloads, models and components |
| Styling | **Tailwind CSS 3** + custom tokens | Utility-first styling, responsive layout, design system in `src/styles/globals.css` |
| Animation | **Framer Motion** | Page reveals, modal transitions, micro-interactions |
| Smooth scroll | **Lenis** | Inertia-style scrolling on the public site |
| Icons | **lucide-react** | Consistent SVG icon set |
| Utilities | **clsx + tailwind-merge** | Conditional class composition (`cn`) |
| Database | **MongoDB Atlas + Mongoose 9** | Stores gallery, activities, members and admin accounts |
| Auth | **jose (JWT, HS256) + bcryptjs** | Stateless admin sessions; password hashing |
| Validation | **Zod 4** | Request schemas, query parsing, typed errors |
| Sanitisation | **sanitize-html** | Strips markup from plain text, whitelists rich-text tags |
| Media | **Cloudinary** (signed upload REST API) | Image hosting, transformation and deletion |
| Security | Next.js middleware + headers | Route protection, CSRF gate, CSP, HSTS, rate limiting |
| Deployment | **GitHub → Vercel or Render** | CI/CD from the `main` branch |

No UI framework or database ORM abstraction beyond Mongoose is used, which
keeps the bundle small and the data layer easy to audit.

---

## 4. Architecture

```text
                    ┌──────────────────────────────────────────┐
                    │              Browser (React)             │
                    │  public pages · admin studio · lightbox  │
                    └───────────────┬──────────────────────────┘
                                    │ HTTPS (same origin)
                    ┌───────────────▼──────────────────────────┐
                    │        Next.js 14 on Vercel/Render       │
                    │                                          │
                    │  middleware.ts                           │
                    │    • protects /admin and /api/admin      │
                    │    • verifies HS256 JWT                  │
                    │    • blocks cross-origin writes (CSRF)   │
                    │                                          │
                    │  Server Components        Route Handlers │
                    │  (read content)           (JSON API)     │
                    └───────┬───────────────────────┬──────────┘
                            │                       │
              ┌─────────────▼──────────┐   ┌────────▼─────────────┐
              │  MongoDB Atlas         │   │  Cloudinary          │
              │  GalleryItem           │   │  secure image URLs   │
              │  Activity              │   │  signed uploads      │
              │  Member                │   │  asset deletion      │
              │  Admin                 │   └──────────────────────┘
              └────────────────────────┘
```

### Read path

1. A page such as `/gallery` is a Server Component.
2. It calls `getGallery()` in `src/lib/content.ts`.
3. If `MONGODB_URI` is missing or the database errors, the function returns the
   verified fallback data from `src/lib/seed-data.ts` instead of crashing.
4. Otherwise Mongoose returns published items, sorted and mapped to a small
   `GalleryRecord` shape before reaching the UI.

### Write path

1. The admin signs in at `/admin/login`; the API verifies bcrypt and sets a JWT
   cookie.
2. Every admin request passes `src/middleware.ts` (session + same-origin check)
   and then `getAdminSession()` inside the route handler (defence in depth).
3. The payload is parsed with Zod, sanitised, and written with Mongoose.
4. For uploads, the browser sends the file to
   `/api/admin/upload`; the server signs the request with the Cloudinary API
   secret and forwards it. The secret never reaches the browser.

---

## 5. Project structure

```text
src/
├─ app/
│  ├─ (site)/               # public pages share Navbar + Footer
│  │  ├─ page.tsx           # /
│  │  ├─ gallery/page.tsx   # /gallery
│  │  ├─ activities/page.tsx
│  │  └─ about/page.tsx
│  ├─ admin/
│  │  ├─ login/page.tsx     # /admin/login
│  │  └─ page.tsx           # /admin (server-gated)
│  ├─ api/
│  │  ├─ gallery/route.ts   # public reads
│  │  ├─ activities/route.ts
│  │  ├─ members/route.ts
│  │  └─ admin/             # protected CRUD + login/logout/upload/seed
│  ├─ layout.tsx            # metadata, fonts, global CSS
│  └─ robots.ts
├─ components/
│  ├─ layout/               # Navbar, Footer
│  ├─ ui/                   # Button, Badge, PhotoFrame, states…
│  └─ react-bits/           # reusable animation primitives
├─ features/
│  ├─ home/                 # HomePage
│  ├─ gallery/              # GalleryPage + interactive GalleryClient
│  ├─ activities/           # ActivitiesPage
│  ├─ about/                # AboutPage
│  └─ admin/                # dashboard and three managers
├─ lib/
│  ├─ auth.ts               # JWT create/verify, cookie options
│  ├─ cloudinary.ts         # signed upload + destroy
│  ├─ constants.ts          # club info, categories, limits
│  ├─ content.ts            # read queries + database fallback
│  ├─ db.ts                 # cached Mongoose connection
│  ├─ http.ts               # shared JSON error responses
│  ├─ rate-limit.ts         # in-memory limiter
│  ├─ seed-data.ts          # verified starter content
│  └─ validation.ts         # Zod schemas + sanitisation
├─ models/                  # GalleryItem, Activity, Member, Admin
├─ styles/globals.css
└─ middleware.ts
scripts/                    # local setup / verification CLIs
public/assets/              # photos, logos, icons, QR code
```

---

## 6. Data model

| Collection | Key fields |
| --- | --- |
| `GalleryItem` | `title`, `caption`, `imageUrl`, `imagePublicId`, `thumbnailUrl`, `altText`, `category`, `eventDate`, `published`, timestamps |
| `Activity` | `title`, `description` (sanitised rich text), `coverImageUrl`, `activityDate`, `endDate`, `dateLabel`, `published`, timestamps |
| `Member` | `fullName`, `role`, `memberCategory` (`faculty` / `leadership` / `core` / `alumni`), `department`, `biography`, `portraitUrl`, `altText`, `displayOrder`, `published` |
| `Admin` | `email` (unique, lowercase), `hashedPassword` (bcrypt), `role` |

Gallery categories: `Campus Life`, `Events & Workshops`, `Photowalks`,
`Behind the Lens`.

Indexes: published + date (gallery/activities), published + category,
and `memberCategory` + `displayOrder` for the team page.

---

## 7. API reference

### Public (read-only)

| Method | Endpoint | Query | Returns |
| --- | --- | --- | --- |
| `GET` | `/api/gallery` | `category`, `page`, `limit` (max 60) | `{ success, data, meta }` |
| `GET` | `/api/activities` | `page`, `limit` | `{ success, data, meta }` |
| `GET` | `/api/members` | `category` | `{ success, data, meta }` |

### Admin (JWT cookie required)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/login` | Sign in; sets `admin_token` |
| `POST` | `/api/admin/logout` | Clears the cookie |
| `GET` / `POST` | `/api/admin/gallery` | List all / create |
| `PATCH` / `DELETE` | `/api/admin/gallery/[id]` | Update / delete (also removes the Cloudinary asset) |
| `GET` / `POST` | `/api/admin/activities` | List all / create |
| `PATCH` / `DELETE` | `/api/admin/activities/[id]` | Update / delete |
| `GET` / `POST` | `/api/admin/members` | List all / create |
| `PATCH` / `DELETE` | `/api/admin/members/[id]` | Update / delete |
| `POST` | `/api/admin/upload` | Multipart image upload to Cloudinary |
| `DELETE` | `/api/admin/upload` | Delete an unused Cloudinary asset by `publicId` |
| `POST` | `/api/admin/seed` | Import starter content into empty collections |

All error responses use `{ success: false, message }` with an appropriate
status code (`400`, `401`, `403`, `413`, `415`, `429`, `503`, `500`).

---

## 8. Local development

### Prerequisites

- Node.js **20+** (22 recommended)
- npm 10+
- A free MongoDB Atlas cluster
- A free Cloudinary account

### Steps

```powershell
# 1. Install dependencies
npm install

# 2. Create your environment file
Copy-Item .env.local.example .env.local
# then edit .env.local and fill in the real values

# 3. Verify the database connection
node scripts/connect-check.mjs

# 4. Create (or reset) an admin account — password is typed, never stored
node scripts/set-admin-password.mjs

# 5. Start the dev server
npm run dev
# http://localhost:3000

# 6. Production build check
npm run build
npm run start
```

### Useful scripts

| Command | What it does |
| --- | --- |
| `node scripts/set-db-password.mjs` | Percent-encodes a special character in the Mongo password inside `.env.local` |
| `node scripts/set-admin-password.mjs` | Creates/resets the admin account; `--list` shows accounts, `--generate` makes a random password |
| `node scripts/connect-check.mjs` | Checks env vars + Atlas connectivity without printing secrets |
| `node scripts/check-cloudinary.mjs` | Verifies Cloudinary credentials and signing |
| `node scripts/check-admin-flow.mjs` | Full smoke test: login → seed → lists → public APIs → logout (server must be running at `APP_BASE_URL`) |

> The scripts read `.env.local` directly. They are development tools and are not
> used by the deployed application.

---

## 9. Environment variables

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes (content), optional for browsing | `src/lib/db.ts`, `src/lib/content.ts` | Atlas SRV string including `/shutterscape`. Without it the site shows fallback content and admin writes return `503` |
| `NEXTAUTH_SECRET` | Yes for admin | `src/lib/auth.ts`, `src/middleware.ts` | **32+ characters**. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Use a different value in production |
| `CLOUDINARY_CLOUD_NAME` | Yes for uploads | `src/lib/cloudinary.ts` | Lowercase cloud name, not the upload preset |
| `CLOUDINARY_API_KEY` | Yes for uploads | `src/lib/cloudinary.ts` | Server-side only |
| `CLOUDINARY_API_SECRET` | Yes for uploads | `src/lib/cloudinary.ts` | Server-side only; never expose |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | No | `src/lib/constants.ts` | Default `15`. Use `4` on Vercel |
| `ADMIN_EMAIL` | No | `scripts/check-admin-flow.mjs` | Only for the local smoke test |

`.env.local` is git-ignored. `.env.local.example` is the safe template.

---

## 10. Security notes

- **Two-gate admin access** — middleware verifies the JWT before the page/API
  runs, and each route handler calls `getAdminSession()` again.
- **CSRF gate** — state-changing `/api/admin/*` requests with a mismatched
  `Origin` header are rejected (browsers always send `Origin` on POST/PATCH/DELETE).
- **Timing-safe login** — unknown emails still run a bcrypt comparison against
  a dummy hash, preventing account enumeration.
- **Rate limiting** — 5 login attempts / 15 min per IP, 60 writes / min,
  20 uploads / min. The store is in-memory; see the limitation below.
- **Upload hardening** — MIME allow-list (JPEG/PNG/WebP), magic-byte check,
  size ceiling, generated public IDs, whitelisted folder names.
- **Input sanitisation** — Zod on every payload, `sanitize-html` for text and
  rich text, ObjectId regex checks, URL allow-list for images.
- **Security headers** — CSP, `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, and HSTS in production
  (`next.config.mjs`).
- **Published-only reads** — public queries always filter `{ published: true }`.
- **No secrets in the bundle** — Cloudinary signing happens only on the server.

### Known limitations (documented, not bugs)

1. **In-memory rate limiting** resets on serverless cold starts and is per
   instance. For strict limits use Upstash Redis while keeping the same
   `rateLimit()` interface.
2. **Vercel request-body limit is 4.5 MB.** The default upload ceiling is
   15 MB, so set `NEXT_PUBLIC_MAX_UPLOAD_MB=4` on Vercel or host on Render.
3. **No email/verification/password reset.** Admins are created with the
   local script; add a reset flow if the club grows.
4. **Single admin role.** The `role` field exists for future expansion.
5. **Large media folder** (~48 MB in `public/assets`) makes clones slower;
   moving photos to Cloudinary is the next optimisation.

---

## 11. Deployment

The app is a single full-stack Next.js project, so **Vercel and Render are
alternatives, not two halves**. Deploy the same repository to either one.

- **Vercel** — best default: native Next.js support, fast CDN, free hobby tier.
- **Render** — good for a long-lived Node server, no 4.5 MB body limit, but the
  free web service sleeps after 15 minutes of inactivity.

Step-by-step instructions, checklists and troubleshooting:
**[`DEPLOYMENT.md`](./DEPLOYMENT.md)**

A Render Blueprint is included at [`render.yaml`](./render.yaml).

---

## 12. Credits

- **Club:** ShutterScape, Girijananda Choudhury University
- **Website maintained by:** Codénix (GCU Coding Club)
- **Content source:** official Club Details document, verified by the club
- **Fonts:** Google Fonts (loaded via `@import` in `globals.css`)
- **Icons:** [Lucide](https://lucide.dev)

All photographs remain the property of their respective photographers and
ShutterScape. Please ask before reusing them.
