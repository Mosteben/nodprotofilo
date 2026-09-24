# Nadine Mohamed — Portfolio & CMS

An Arabic (RTL) personal portfolio with a built-in content management system. From `/admin` the
site owner manages all of this without touching code:

- articles, projects, gallery, resources, books and lectures
- the About page, homepage content, colours and fonts
- visitor comments and contact messages

Visitors can create an account to comment under their name, or comment as a guest.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Supabase (Postgres, Auth,
Storage) · Vercel. Everything runs on free tiers; no Docker, no VPS, no paid services.

---

## Contents

- [Architecture](#architecture)
- [Features and routes](#features-and-routes)
- [Local development](#local-development)
- [Supabase setup](#supabase-setup)
- [Environment variables](#environment-variables)
- [Database setup and migration order](#database-setup-and-migration-order)
- [Storage setup](#storage-setup)
- [Admin account setup](#admin-account-setup)
- [Vercel deployment](#vercel-deployment)
- [Security notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Project structure](#project-structure)
- [Database reference](#database-reference)

---

## Architecture

```
Browser ──► Next.js on Vercel ──► Supabase (Postgres + Auth + Storage)
             ├─ app/(site)/*            public pages: static, cached, revalidated when content changes
             ├─ app/(site)/account/*    visitor accounts (Supabase Auth)
             ├─ app/admin/(dashboard)/* CMS (server components + server actions, admin-only)
             └─ middleware.ts           refreshes sessions, guards /admin/* and /account/*
```

- **Public reads** use a cookie-less client with the public anon key and are cached per content
  type. Saving in the admin refreshes the cache immediately, and every page also refreshes at least
  once an hour.
- **Writes** go through server actions. Each one re-checks that the caller is an admin
  (`profiles.is_admin`), and Row Level Security enforces the same rule inside the database.
- **Uploads** go straight from the browser to Supabase Storage (with progress). The server then
  verifies the file and records it.
- **Images** can be cropped, rotated, resized and compressed in the browser before upload; no external
  service is used.
- **Dates** use one fixed site timezone (`Africa/Cairo`), so server and browser render identical
  HTML (no hydration mismatches).

More background is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Features and routes

**Public site**

| Route | Content |
| --- | --- |
| `/` | Hero, stats, about, featured projects, latest articles, quote, lectures, featured book, testimonials, newsletter, contact call-to-action (each section can be hidden) |
| `/about` | Intro, long bio, highlight cards, skills, services, education, experience timeline, achievements, location, website and social links |
| `/portfolio`, `/portfolio/[slug]` | Published projects, with comments |
| `/blog`, `/blog/[slug]` | Published articles: search, category filter, reading time, related articles, sharing, comments |
| `/gallery` | Published images: category filter, lightbox with captions |
| `/resources` | Published files (PDF, Office, images) and links: search, category filter, download |
| `/books`, `/books/[slug]` | Published books, purchase / sample links, comments |
| `/lectures`, `/lectures/[slug]` | YouTube embeds or external lecture links, comments |
| `/contact` | Contact form saved to the database (validated, spam-protected, rate-limited) |
| `/account/register`, `/account/login`, `/account` | Visitor sign-up, sign-in, display name, sign-out |
| `/sitemap.xml`, `/robots.txt`, `/rss.xml` | Generated from published content |

`/articles/*` permanently redirects to `/blog/*`. Every section shows an empty state when it has no
published content.

**Admin CMS** (`/admin`, admin account required)

| Route | What the owner can do |
| --- | --- |
| `/admin` | Dashboard: counts, unread messages, comments awaiting review, recent activity |
| `/admin/articles` | Create, edit, delete, draft/publish, search, filter, sort; rich-text editor with preview |
| `/admin/projects` | Create, edit, delete, publish, feature on the homepage |
| `/admin/gallery` | Add images (library, upload with editing, or URL), title, caption, alt text, category, order, publish, delete |
| `/admin/resources` | Upload files (PDF/Office/images up to 20 MB) or links, thumbnail, author, category, replace file, order, publish, delete |
| `/admin/books` | Title, author, description, cover, year, pages, price, purchase URL, sample chapter, featured, order, publish, delete |
| `/admin/lectures` | YouTube URL (any format) or external link, speaker, date, duration, thumbnail, featured, order, publish, delete |
| `/admin/media` | Image library: upload (drag & drop, progress), crop/rotate/resize/compress, alt text, copy URL, delete |
| `/admin/comments` | Approve, unapprove, mark read, delete; filter by status and content type; search |
| `/admin/messages` | Read/unread, search, filter, open, reply by e-mail, delete |
| `/admin/settings` | Site name and description, contact e-mail, social links |
| `/admin/appearance` | Homepage content and section visibility; colours, fonts, button and corner styles |
| `/admin/about` | Everything on the About page, plus the owner's profile |

---

## Local development

Requirements: **Node.js 20+** and npm.

```bash
git clone <your-repo-url>
cd nodprotofilo
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run dev                    # http://localhost:3000
```

Other scripts:

```bash
npm run lint     # ESLint
npm run build    # production build (also type-checks)
npm run start    # serve the production build
```

On a machine with little free RAM, build with `NEXT_BUILD_LOW_MEMORY=1 npm run build`; this has no
effect on Vercel.

The public site works without Supabase or before the migrations run. It shows empty states and the
built-in default texts, and `/admin/login` explains what is missing.

---

## Supabase setup

1. Create a free account at [supabase.com](https://supabase.com) and click **New project**.
2. Choose a name, a strong database password (store it somewhere safe) and the region closest to
   your visitors. Wait until the project is ready.
3. **Visitor accounts:** in **Authentication → Sign In / Providers → Email**, keep **Allow new users to
   sign up** enabled, and keep **Confirm email** enabled (recommended). New accounts are never admins:
   admin rights come only from `profiles.is_admin`, which users cannot change.
   (Turn sign-ups off if you do not want visitor accounts; guests can still comment.)
4. **Authentication → URL Configuration**:
   - **Site URL**: your production URL, e.g. `https://your-site.vercel.app`.
   - **Redirect URLs**: add `https://your-site.vercel.app/auth/callback` and, for local development,
     `http://localhost:3000/auth/callback`. Confirmation e-mails link there.

Then continue with [environment variables](#environment-variables) and the [database setup](#database-setup-and-migration-order).

---

## Environment variables

Copy `.env.example` to `.env.local` for local development. Add the same variables in Vercel for
production.

| Variable | Required | Where to find it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → **Project Settings → API** (or **Data API**) → *Project URL*, e.g. `https://abcd1234.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → **Project Settings → API Keys** → the `anon` `public` key (newer projects may call it the *publishable* key) |
| `NEXT_PUBLIC_SITE_URL` | Recommended in production | Your public URL without a trailing slash, e.g. `https://your-site.vercel.app`. Used for canonical URLs, the sitemap, RSS, share links and confirmation e-mails. On Vercel it falls back to the project's production domain. |

> **Never** add the `service_role` / secret key to this project. The app only needs the public anon key;
> Row Level Security decides what each visitor may do.

`NEXT_PUBLIC_*` values are baked in at build time. After changing them, restart `npm run dev` or
redeploy on Vercel.

---

## Database setup and migration order

All SQL lives in [`supabase/`](supabase). Run the files **in this order**:

| # | File | Purpose | Run it |
| --- | --- | --- | --- |
| 1 | `migrations/20260924000000_initial_schema.sql` | Profiles, articles, projects, media, messages, site settings; RLS; `media` bucket | **Required** |
| 2 | `import_existing_content.sql` | The 4 articles that used to be hard-coded in the site | Recommended |
| 3 | `migrations/20260925000000_cms_extensions.sql` | Gallery, resources, books, lectures, comments, About content, visitor-account rules; RLS; `resources` bucket. Also imports the previous static books, lectures and gallery images (and the old resources as drafts) | **Required** |
| 4 | `seed.sql` | Demo articles/projects (slugs start with `demo-`) for trying things out | Optional |

Then create the admin account (step 5, [below](#admin-account-setup)).

**Using the Supabase dashboard (simplest):** open **SQL Editor → New query**, paste the full contents
of each file in the order above, and click **Run** for each. Each should end with
"Success. No rows returned".

**Using the Supabase CLI (alternative):**

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies both files in supabase/migrations, in order
```

Then run `import_existing_content.sql` (and optionally `seed.sql`) from the SQL editor.

Every script is idempotent: running one again does no harm and never overwrites content you have
edited.

> **Already set up the first version?** Just run file 3 (`20260925000000_cms_extensions.sql`) once.
> Nothing needs to be deleted.

**Removing the demo content before going live:**

```sql
delete from public.articles where slug like 'demo-%';
delete from public.projects where slug like 'demo-%';
update public.site_settings set contact_email = null where contact_email = 'hello@example.com';
```

---

## Storage setup

The migrations create both buckets and their policies, so there is nothing to click. For reference:

| Bucket | Used for | Allowed files | Max size | Access |
| --- | --- | --- | --- | --- |
| `media` | Images for articles, projects, gallery, covers, About | JPEG, PNG, WebP, GIF, AVIF | 5 MB | Public read, admin-only write |
| `resources` | Downloadable resources and book sample chapters | PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), JPEG, PNG, WebP | 20 MB | Public read, admin-only write |

SVG and other script-capable formats are rejected on purpose. Files are validated in the browser, in
the server action, and by the bucket itself. You can check both buckets under **Storage** in the
Supabase dashboard; each should be marked *Public*.

---

## Admin account setup

1. In Supabase open **Authentication → Users → Add user → Create new user**.
   Enter the owner's e-mail and a strong password and tick **Auto Confirm User**.
   (Alternatively, register at `/account/register` and confirm the e-mail.)
2. Open **SQL Editor** and run, replacing the e-mail:

   ```sql
   insert into public.profiles (user_id, email, is_admin)
   select id, email, true from auth.users where email = 'owner@example.com'
   on conflict (user_id) do update set is_admin = true;
   ```

3. Visit `/admin/login` and sign in.

To add another admin, repeat step 2 for that account. To revoke access, run
`update public.profiles set is_admin = false where email = '...';`.

---

## Vercel deployment

1. Push the repository to GitHub.
2. On [vercel.com](https://vercel.com) click **Add New → Project** and import the repository.
   The framework is detected as **Next.js**; keep the default build settings (`npm run build`).
3. Under **Environment Variables** add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `NEXT_PUBLIC_SITE_URL` for the *Production*, *Preview* and *Development* environments.
4. Click **Deploy**.
5. In Supabase, set the **Site URL** and add the `/auth/callback` **Redirect URL** for the Vercel domain
   (see [Supabase setup](#supabase-setup)).
6. Open `https://<your-site>/admin/login` and sign in.

Every push to the main branch redeploys automatically. Content changes made in `/admin` appear on the
public site immediately and need no redeploy.

**Custom domain:** Vercel → Project → **Settings → Domains**. Afterwards update `NEXT_PUBLIC_SITE_URL`,
the Supabase Site URL and Redirect URLs, and redeploy.

---

## Security notes

- **Row Level Security is enabled on every table.** The public can only read published rows
  (articles, projects, gallery, resources, books, lectures) and the settings. It can only *insert*
  contact messages and comments.
- **Admin rights come only from `profiles.is_admin`.** New accounts always start without it; a
  database trigger stops users from changing their own `is_admin`, user id or e-mail. Every admin
  server action re-checks admin rights, and RLS checks them again in the database.
- **Comments** are always stored *pending* (a trigger forces it) and appear only after approval.
  - A trigger ties each comment to the signed-in user's account (if any), and checks that the target content
    exists and is published.
  - Comments are rate-limited: 5 per author per 10 minutes, 200 per hour site-wide.
  - The public reads comments through `get_approved_comments()`, which never returns e-mails or user
    ids, and hides names on anonymous comments.
- **Contact messages** can be read only by admins, and are rate-limited: 3 per e-mail per 10 minutes,
  100 per hour. Both forms also use a honeypot field and a minimum fill time against bots.
- **Rich text** is sanitised with an allow-list on save and again on render.
- **YouTube** embeds are built only from a validated 11-character video id; no pasted HTML is ever
  rendered.
- **Storage** writes are admin-only in both buckets, with MIME-type and size limits.
- **Only the public anon key** is used by the app; the service-role key is never needed or exposed.
- Security headers are set (nosniff, frame options, referrer policy, permissions policy).

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `/admin/login` says Supabase is not configured | The two `NEXT_PUBLIC_SUPABASE_*` variables are missing. Add them, then restart `npm run dev` or redeploy. |
| Gallery, resources, books or lectures are empty | Run `20260925000000_cms_extensions.sql` (it creates the tables and imports the old content), and check items are *published*. |
| Admin pages show "تعذّر تحميل الصفحة" | The database is unreachable or a migration has not been run. On the free plan, check the project is not **paused** (inactive projects pause after about a week; restore them from the dashboard). |
| Signed in, but "غير مصرّح بالدخول" (not authorised) | The account is not an admin. Run the SQL in [Admin account setup](#admin-account-setup). |
| Registration says sign-ups are closed | Enable **Allow new users to sign up** in Supabase (see [Supabase setup](#supabase-setup)). |
| The confirmation link shows "رابط التأكيد غير صالح" | Add `<your-site>/auth/callback` to Supabase **Redirect URLs**, and check `NEXT_PUBLIC_SITE_URL`. Links expire after a while; register again or use password recovery. |
| A comment does not appear | Comments appear only after approval in `/admin/comments`. |
| An edit does not appear on the public site | Saving refreshes the cache instantly. Hard-refresh the browser (Ctrl/Cmd + Shift + R). |
| Upload fails with "no permission" | Make sure the migrations ran (they create the buckets and policies) and your profile has `is_admin = true`. |
| Upload fails with "type not allowed" or "too large" | Check the [storage limits](#storage-setup). For photos, use the editor's max-width and quality options. |
| A lecture cannot be published | Add a valid YouTube link or an external URL first. |
| A resource cannot be published | Upload a file or add an external URL first. |
| Error mentioning an unconfigured image hostname | `NEXT_PUBLIC_SUPABASE_URL` was missing when the site was built. Set it and redeploy. |
| `npm run build` crashes with "out of memory" | Run `NEXT_BUILD_LOW_MEMORY=1 npm run build`. |

---

## Project structure

```
app/
  (site)/                  public pages and visitor account pages (navbar/footer layout)
  admin/login/             admin sign-in
  admin/(dashboard)/       CMS pages; [collection]/ serves gallery, resources, books and lectures
  auth/callback/           e-mail confirmation handler
  layout.tsx               <html>, fonts, theme CSS variables, toasts
  sitemap.ts, robots.ts, rss.xml/
components/
  admin/                   CMS UI (forms, editor, media library, collections, settings, moderation)
  comments/, account/      public comments and account forms
  home/, articles/, portfolio/, gallery/, resources/, lectures/, contact/, layout/, shared/, ui/
lib/
  supabase/                browser, server, public (cookie-less) and middleware clients
  actions/                 server actions (admin actions re-check admin rights)
  data/                    cached public queries
  collections.ts           declarative definitions of the gallery/resources/books/lectures CMS
  about.ts, site-settings.ts, theme.ts, fonts.ts
  datetime.ts              timezone-stable date formatting (hydration-safe)
  sanitize.ts, youtube.ts, media.ts, resource-files.ts
supabase/                  SQL migrations, article import and optional seed
middleware.ts              refreshes sessions, guards /admin/* and /account/*
```

---

## Database reference

| Table | Purpose | Public access (RLS) |
| --- | --- | --- |
| `profiles` | One row per auth user; `is_admin` grants CMS access | Own row (update name etc., never `is_admin`); a safe subset via `get_public_profile()` |
| `articles` | Blog posts (draft/published, rich text) | Read published |
| `projects` | Portfolio items | Read published |
| `gallery_items` | Gallery images (`media_id` → `media`), title, caption, category, order | Read published |
| `resources` | Files in the `resources` bucket or external links | Read published |
| `books` | Books with cover, links, featured flag, order | Read published |
| `lectures` | YouTube id and/or external URL, speaker, date, featured flag, order | Read published |
| `comments` | Comments on articles/projects/books/lectures, anonymous flag, approval, read state | Insert only; approved ones via `get_approved_comments()` |
| `media` | Metadata for files in the `media` bucket | None |
| `messages` | Contact form submissions | Insert only |
| `site_settings` | Single row: site texts, social links, `homepage`, `about` and `theme_settings` JSON | Read |

Admins (`profiles.is_admin = true`) can read and write everything. Empty settings fall back to the
original site content defined in `lib/site-settings.ts` and `lib/about.ts`.
