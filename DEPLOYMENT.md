# Deployment Guide — GitHub → Vercel / Render

This guide takes the project from your Windows machine to a public HTTPS URL.
Follow the steps in order. Commands are written for **PowerShell**.

---

## 0. Understand the shape of the app first

ShutterScape is **one full-stack Next.js application**. The pages, the API and
the admin studio all live in the same codebase.

```text
Browser ──► Next.js (pages + /api routes + middleware)
                 │
                 ├──► MongoDB Atlas   (content + admin accounts)
                 └──► Cloudinary      (images)
```

That means:

- **Vercel and Render are alternatives, not two halves.** You do **not** deploy
  the frontend to Vercel and the backend to Render. Pick one host for the whole
  app. (Splitting them would require changing API URLs and cross-site cookies —
  unnecessary work for this site.)
- **MongoDB Atlas and Cloudinary are external services** used by both hosts.
- **Vercel** is the recommended default: zero-config Next.js, global CDN, free
  hobby tier.
- **Render** runs the same app as a long-lived Node server. Choose it if you
  prefer a traditional server, need uploads larger than 4.5 MB, or want the
  free blueprint in `render.yaml`. The free instance sleeps after 15 minutes.

> **Important — the 4.5 MB upload limit**
> Vercel caps serverless request bodies at 4.5 MB. The app's default upload
> ceiling is 15 MB. On Vercel set `NEXT_PUBLIC_MAX_UPLOAD_MB=4` **before the
> build** (it is inlined into the admin UI). On Render keep `15`.

---

## 1. Pre-flight checklist

- [ ] Node.js 20+ installed (`node --version`)
- [ ] Project builds locally: `npm run build`
- [ ] `.env.local` contains the real values
- [ ] `.env.local` is **not** tracked by Git
- [ ] A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [ ] A free [Cloudinary](https://cloudinary.com) account
- [ ] A [GitHub](https://github.com) account
- [ ] A [Vercel](https://vercel.com) and/or [Render](https://render.com) account

Optional but recommended before publishing:

```powershell
npm run build   # must finish without errors
```

---

## 2. Step 1 — MongoDB Atlas

1. Create a **free M0 cluster** (region closest to your users, e.g. Mumbai or
   Singapore).
2. **Database Access → Add New Database User**
   - Username: `shutterscape`
   - Password: generate a strong one and save it in a password manager.
   - Role: `Read and write to any database`.
3. **Network Access → Add IP Address**
   - For Vercel/Render, add `0.0.0.0/0` (allow from anywhere). These platforms
     use dynamic IPs, so a single office IP will not work.
   - For local development, your home IP is added automatically or manually.
4. **Cluster → Connect → Drivers → Node.js** and copy the SRV string:

   ```text
   mongodb+srv://shutterscape:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. Add the database name before the `?`:

   ```text
   mongodb+srv://shutterscape:<password>@cluster0.xxxxx.mongodb.net/shutterscape?retryWrites=true&w=majority
   ```

6. If the password contains `@ : / ? # [ ] %`, it must be percent-encoded.
   The helper script does it for you:

   ```powershell
   node scripts/set-db-password.mjs
   ```

7. Verify the connection:

   ```powershell
   node scripts/connect-check.mjs
   ```

> **Never commit the real URI.** It is a password. Rotate the database user's
> password if it ever appears in a screenshot, chat or commit.

---

## 3. Step 2 — Cloudinary

1. Sign up and open **Console → Dashboard**.
2. Copy the **Cloud Name**, **API Key** and **API Secret** from *Product
   Environment Credentials*.
3. Do **not** create or use an unsigned upload preset; this project signs
   uploads on the server (`src/lib/cloudinary.ts`).
4. Optional check:

   ```powershell
   node scripts/check-cloudinary.mjs
   ```

Images are stored in the `shutterscape/` folder by default
(`CLOUDINARY_FOLDER` in `src/lib/constants.ts`).

---

## 4. Step 3 — Push the code to GitHub

### 4.1 Check what will be committed

```powershell
Get-ChildItem -Force
```

`.env.local` and `Club Details/` must **not** appear in Git. They are already
listed in `.gitignore`.

### 4.2 Create the local repository

```powershell
git init -b main
git add .
git status
```

Review the list. You should see `src/`, `public/`, `scripts/`, config files,
`README.md`, `DEPLOYMENT.md`, `PROJECT-GUIDE.md`, `render.yaml` — **not**
`node_modules/`, `.next/`, `.env.local` or `Club Details/`.

```powershell
git commit -m "Initial commit: ShutterScape club website"
```

### 4.3 Create an empty GitHub repository

1. Go to <https://github.com/new>.
2. Repository name: `shutterscape`.
3. Visibility: **Public** (or Private — both work with Vercel/Render).
4. **Do not** add a README, `.gitignore` or licence (you already have files).
5. Click **Create repository**.

### 4.4 Connect and push

```powershell
git remote add origin https://github.com/YOUR-USERNAME/shutterscape.git
git push -u origin main
```

When Git asks for a password, paste a **Personal Access Token (PAT)**, not your
GitHub account password:

- GitHub → Settings → Developer settings → Personal access tokens →
  Tokens (classic) → Generate new token → scope `repo` → copy it once.

Alternative (recommended if you use SSH):

```powershell
git remote add origin git@github.com:YOUR-USERNAME/shutterscape.git
git push -u origin main
```

### 4.5 Optional: GitHub CLI

If you install GitHub CLI (`winget install GitHub.cli`) and run
`gh auth login`, the whole step becomes:

```powershell
gh repo create shutterscape --public --source=. --remote=origin --push
```

### 4.6 Later updates

```powershell
git add .
git commit -m "Update gallery content"
git push
```

Vercel/Render will redeploy automatically.

---

## 5. Step 4 — Deploy on Vercel (recommended)

### 5.1 Import the repository

1. <https://vercel.com/new> → **Import Git Repository** → choose
   `shutterscape`.
2. **Framework Preset:** Next.js (detected automatically).
3. **Root Directory:** `./` (leave as is).
4. **Build Command:** `npm run build` (default).
5. **Output Directory:** `.next` (default).
6. **Install Command:** `npm install` (default).

### 5.2 Environment variables

Add these under **Environment Variables** for **Production**, **Preview** and
**Development**:

| Key | Value |
| --- | --- |
| `MONGODB_URI` | `mongodb+srv://.../shutterscape?retryWrites=true&w=majority` |
| `NEXTAUTH_SECRET` | 64-char random hex (generate below) |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | `4` |

Generate the secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use a **different** secret from your local `.env.local` so a leaked laptop
secret cannot mint production sessions.

> `NEXT_PUBLIC_MAX_UPLOAD_MB` is compiled into the browser bundle. If you change
> it later, **redeploy** (Vercel → Deployments → Redeploy).

### 5.3 Deploy

Click **Deploy** and wait for the build log to finish. You will get:

```text
https://shutterscape-xxxx.vercel.app
```

### 5.4 Custom domain (optional)

Vercel → Project → **Settings → Domains → Add**. Point your domain's DNS
records as instructed. HTTPS is automatic.

### 5.5 CLI alternative

```powershell
npm install -g vercel
vercel login
vercel            # preview deployment
vercel --prod     # production deployment
```

Environment variables are still managed in the dashboard (or with
`vercel env add`).

---

## 6. Step 5 — Deploy on Render (alternative)

Choose **one** host. If you already deployed to Vercel, skip this section.

### Option A — Blueprint (`render.yaml`)

1. Push the repository to GitHub (Step 3).
2. Render → **New → Blueprint** → connect the repository.
3. Render reads `render.yaml`, creates the web service, and asks for the secret
   environment variables (`sync: false`).
4. Fill in `MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`. `NEXTAUTH_SECRET` is generated automatically.
5. Apply and wait for the first deploy.

### Option B — Manual web service

1. Render → **New → Web Service** → connect the repository.
2. Settings:

   | Setting | Value |
   | --- | --- |
   | Runtime | Node |
   | Region | closest to your users (e.g. Singapore) |
   | Build Command | `npm ci && npm run build` |
   | Start Command | `npm run start -- -H 0.0.0.0 -p $PORT` |
   | Health Check Path | `/` |
   | Plan | Free (or Starter to avoid sleeping) |

3. Add the same environment variables as Vercel, plus:

   | Key | Value |
   | --- | --- |
   | `NODE_VERSION` | `22.23.2` (or `22`) |
   | `NODE_ENV` | `production` |
   | `NEXT_PUBLIC_MAX_UPLOAD_MB` | `15` |

4. Deploy. Render gives you:

   ```text
   https://shutterscape.onrender.com
   ```

### Render free-tier reality

- The service **sleeps after 15 minutes** of inactivity. The next visitor waits
  ~30–60 seconds for a cold start.
- 512 MB RAM and shared CPU; the build may take 5–10 minutes.
- For a club site that is fine. Upgrade to Starter when the club can afford it,
  or use Vercel for the public site.

---

## 7. Step 6 — Post-deploy: admin account and starter content

The public site works immediately (it falls back to verified seed content if the
database is empty). To manage content:

### 7.1 Create the admin account

The admin lives in MongoDB, not in an environment variable. Run the script
**against the same Atlas database** the deployment uses:

```powershell
# .env.local must contain the production MONGODB_URI
node scripts/set-admin-password.mjs
```

- Type a password of at least 12 characters (echo is off).
- Or use `--generate` for a random strong password.
- `--list` shows existing admin emails.
- `--email you@example.com` chooses the email.

If your local `.env.local` points to a different database, either:

- point it at the production database temporarily and run the script, or
- create the admin from a machine that can reach the production database.

### 7.2 Sign in and import content

1. Open `https://YOUR-DOMAIN/admin/login`.
2. Sign in with the admin email + password.
3. Click **Import content** → **Import verified content**. This copies the
   verified photographs, activities and members into empty collections. It is
   safe to retry: existing collections are never overwritten.
4. Check the public pages and create a test record.

### 7.3 Smoke-test checklist

- [ ] `/` loads with photographs and statistics
- [ ] `/gallery` filters work and the lightbox opens with keyboard controls
- [ ] `/activities` and `/about` render
- [ ] `https://YOUR-DOMAIN/api/gallery` returns JSON
- [ ] `/admin` redirects to `/admin/login` in a private window
- [ ] Login succeeds and the dashboard loads
- [ ] Upload a small JPEG → it appears on the public gallery after saving
- [ ] Logout clears the session
- [ ] `/robots.txt` disallows `/admin` and `/api`
- [ ] Mobile layout at 375 px wide
- [ ] Security headers are present:

```powershell
curl.exe -I https://YOUR-DOMAIN
```

Look for `Content-Security-Policy`, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff` and (on HTTPS) `Strict-Transport-Security`.

---

## 8. Environment variables by platform

| Variable | Local `.env.local` | Vercel | Render |
| --- | --- | --- | --- |
| `MONGODB_URI` | yes | yes | yes |
| `NEXTAUTH_SECRET` | yes | yes (unique) | yes (`generateValue` in blueprint) |
| `CLOUDINARY_CLOUD_NAME` | yes | yes | yes |
| `CLOUDINARY_API_KEY` | yes | yes | yes |
| `CLOUDINARY_API_SECRET` | yes | yes | yes |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | optional (`15`) | `4` | `15` |
| `ADMIN_EMAIL` | optional | no | no |

Never put real secrets in `README.md`, `.env.local.example`, Git commits or
screenshots.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Site loads but shows old/sample photos, admin says database unavailable | `MONGODB_URI` missing, wrong, or Atlas IP not allow-listed | Check the env var, add `0.0.0.0/0` in Atlas Network Access, redeploy |
| Login returns **503** “NEXTAUTH_SECRET is not configured” | Secret missing or shorter than 32 chars | Set a 64-char hex secret and redeploy |
| Login succeeds but `/admin` bounces back to login | Cookie `Secure` requires HTTPS; accessing via plain HTTP, or the domain/proxy strips cookies | Use the HTTPS deployment URL (or localhost), check `Host`/`X-Forwarded-Host` |
| **413** on upload | Vercel 4.5 MB body limit | Set `NEXT_PUBLIC_MAX_UPLOAD_MB=4` and redeploy, or deploy on Render |
| **415** on upload | File is not JPEG/PNG/WebP or the magic bytes do not match | Re-export the image as JPEG/PNG/WebP |
| **502 / 401** from Cloudinary | Wrong API key/secret or cloud name | Re-copy credentials from the Cloudinary dashboard |
| Images from Cloudinary return 400 in `next/image` | Domain allow-list | `res.cloudinary.com` is already allowed in `next.config.mjs`; local `/assets` paths also work |
| **403** “Cross-origin request blocked” | Admin API called from a different origin | Use the same deployed domain for the UI and API |
| **429** on login | Rate limit (5 attempts / 15 min) | Wait, or restart the local server (in-memory store) |
| Seed reports 0 imported | Collections already contain records (by design) | Delete records in the dashboard first if you really want to re-import |
| Render returns **502** / “no open ports” | Start command or host binding | Use `npm run start -- -H 0.0.0.0 -p $PORT` |
| Vercel build fails with TypeScript errors | Code changed locally but not verified | Run `npm run build` locally and fix before pushing |
| `git push` rejected (non-fast-forward) | GitHub repo was created with a README | `git pull --rebase origin main` then push, or create an empty repo |
| Changes do not appear | Build cache / old deployment | Redeploy; hard-refresh the browser |

Check platform logs first: **Vercel → Deployments → Functions/Logs**, or
**Render → Logs**.

---

## 10. Ongoing workflow

```powershell
# make changes locally
npm run dev

# verify
npm run build

# publish
git add .
git commit -m "Describe the change"
git push
```

- Every push to `main` triggers a production deploy.
- Pull requests get preview URLs on Vercel.
- Environment-variable changes require a redeploy to take effect (especially
  `NEXT_PUBLIC_*`, which is compiled into the client bundle).

### Rolling back

- **Vercel:** Deployments → choose a previous deployment → **Promote to
  Production**.
- **Render:** Events → choose a previous deploy → **Rollback**.

---

## 11. Before you call it “live”

- [ ] Real club photos and correct member names are published
- [ ] The admin password is strong and stored in a password manager
- [ ] `NEXTAUTH_SECRET` is unique to production
- [ ] Atlas network access is restricted as much as your host allows
- [ ] Cloudinary API secret is only in the host's env settings
- [ ] A backup/export of the Atlas collections exists (Atlas → Backup or
      `mongodump`)
- [ ] The club's Instagram/WhatsApp links in `src/lib/constants.ts` are correct
- [ ] `NEXT_PUBLIC_MAX_UPLOAD_MB` matches the chosen host
- [ ] You tested the site on a phone

---

## 12. If you want a custom domain

1. Buy a domain (Namecheap, Cloudflare, GoDaddy, etc.).
2. **Vercel:** Settings → Domains → add `shutterscape.club` and `www`; copy the
   DNS records into your registrar.
3. **Render:** Settings → Custom Domains → add the domain; create the shown
   `CNAME`/`A` records.
4. Wait for DNS propagation (minutes to a few hours). HTTPS certificates are
   issued automatically.

---

## 13. Cost expectations

| Service | Free tier | When you might pay |
| --- | --- | --- |
| GitHub | Unlimited public/private repos | Large files / LFS |
| MongoDB Atlas | M0: 512 MB storage | More storage or dedicated cluster |
| Cloudinary | ~25 credits/month | Heavy image traffic or transformations |
| Vercel | Hobby: personal, non-commercial | Pro for a team/commercial use |
| Render | Free web service (sleeps) | Starter to stay always-on |

For a university club site, the free tiers are usually enough.
