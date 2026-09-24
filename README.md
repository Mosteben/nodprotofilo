# Nadine Mohamed — Portfolio & CMS

An Arabic (RTL) personal portfolio with a built-in content management system. The site owner edits
articles, projects, images, homepage content, colours and fonts, and reads contact messages from
`/admin`, without touching code.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Supabase (Postgres, Auth,
Storage) · Vercel. Everything runs on free tiers; no Docker, no VPS, no paid services.

---

## Contents

- [Features](#features)
- [Local development](#local-development)
- [Supabase setup](#supabase-setup)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Storage setup](#storage-setup)
- [Admin account setup](#admin-account-setup)
- [Vercel deployment](#vercel-deployment)
- [Troubleshooting](#troubleshooting)
- [Project structure](#project-structure)
- [Database reference](#database-reference)

---

## Features

**Public site**

| Route | Content |
| --- | --- |
| `/` | Hero, stats, about, featured projects, latest articles, quote, lectures, featured book, testimonials, newsletter, contact call-to-action (each section can be hidden from the admin) |
| `/about` | About page (intro editable from the admin) |
| `/blog`, `/blog/[slug]` | Published articles: search, category filter, reading time, related articles, share buttons |
| `/portfolio`, `/portfolio/[slug]` | Published projects: category filter, project facts and links |
| `/contact` | Contact form saved to the database (validated, spam-protected, rate-limited) |
| `/books`, `/lectures`, `/resources`, `/gallery` | Unchanged static sections |
| `/sitemap.xml`, `/robots.txt`, `/rss.xml` | Generated from published content |

`/articles/*` permanently redirects to `/blog/*`.

**Admin CMS** (`/admin`, sign-in required)

| Route | What the owner can do |
| --- | --- |
| `/admin` | Dashboard: article/draft/project/unread counts, recent articles and messages |
| `/admin/articles` | Create, edit, delete, draft/publish/unpublish, search, filter, sort; rich-text editor with preview |
| `/admin/projects` | Create, edit, delete, publish, feature on the homepage |
| `/admin/media` | Upload (drag & drop, progress), crop/rotate/resize/compress, alt text, copy URL, delete |
| `/admin/messages` | Read/unread, search, open, reply by e-mail, delete |
| `/admin/appearance` | Homepage content and section visibility; colours, fonts, button and corner styles |
| `/admin/settings` | Site name and description, contact e-mail, social links, own profile |

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

The public site works without Supabase. It shows empty states and the built-in default texts, and
`/admin/login` explains what is missing. Set up Supabase to use the CMS.

---

## Supabase setup

1. Create a free account at [supabase.com](https://supabase.com) and click **New project**.
2. Choose a name, a strong database password (store it somewhere safe) and the region closest to
   your visitors. Wait until the project is ready.
3. **Disable public sign-ups**, since only the site owner needs an account:
   **Authentication → Sign In / Providers → Email** → turn off **Allow new users to sign up** → Save.
   (Even if someone did sign up, they would not get admin rights; this just keeps the user list clean.)
4. **Authentication → URL Configuration → Site URL**: set it to your production URL once you know it
   (for example `https://your-site.vercel.app`).

Then continue with [environment variables](#environment-variables) and [database setup](#database-setup).

---

## Environment variables

Copy `.env.example` to `.env.local` for local development. Add the same variables in Vercel for
production.

| Variable | Required | Where to find it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → **Project Settings → API** (or **Data API**) → *Project URL*, e.g. `https://abcd1234.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → **Project Settings → API Keys** → the `anon` `public` key (newer projects may call it the *publishable* key) |
| `NEXT_PUBLIC_SITE_URL` | Recommended in production | Your public URL without a trailing slash, e.g. `https://your-site.vercel.app`. Used for canonical URLs, the sitemap, RSS and share links. On Vercel it falls back to the project's production domain. |

> **Never** add the `service_role` / secret key to this project. The app only needs the public anon key;
> the database's Row Level Security decides what each visitor may do.

`NEXT_PUBLIC_*` values are baked in at build time. After changing them, restart `npm run dev` or
redeploy on Vercel.

---

## Database setup

All SQL lives in [`supabase/`](supabase):

| File | Purpose | Run it |
| --- | --- | --- |
| `migrations/20260924000000_initial_schema.sql` | Tables, triggers, Row Level Security policies, storage bucket and policies | **Required**, once |
| `import_existing_content.sql` | Imports the 4 articles that used to be hard-coded in the site | Recommended, once |
| `seed.sql` | Optional demo articles/projects (slugs start with `demo-`) for trying out the CMS | Optional |

**Using the Supabase dashboard (simplest):**

1. Open **SQL Editor → New query**.
2. Paste the full contents of `supabase/migrations/20260924000000_initial_schema.sql` and click **Run**.
   It should finish with "Success. No rows returned".
3. Repeat with `supabase/import_existing_content.sql` to bring back the existing articles.
4. Optionally repeat with `supabase/seed.sql` for demo content.

**Using the Supabase CLI (alternative):**

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies supabase/migrations
```

Then run `import_existing_content.sql` (and optionally `seed.sql`) from the SQL editor.

All scripts are idempotent, so running one twice does no harm.

**Removing the demo content before going live:**

```sql
delete from public.articles where slug like 'demo-%';
delete from public.projects where slug like 'demo-%';
update public.site_settings set contact_email = null where contact_email = 'hello@example.com';
```

---

## Storage setup

The migration already creates everything needed, so there is nothing to click. For reference:

- Bucket **`media`**: public read, so images load fast without signed URLs.
- Allowed types: JPEG, PNG, WebP, GIF, AVIF. **SVG is rejected on purpose** (it can contain scripts).
- Maximum size: **5 MB per file**. Larger photos can be shrunk with the built-in editor before upload.
- Only admins can upload, replace or delete files (storage policies use `public.is_admin()`).

You can verify it under **Storage** in the Supabase dashboard. A bucket named `media` should exist
and be marked *Public*.

---

## Admin account setup

1. In Supabase open **Authentication → Users → Add user → Create new user**.
   Enter the owner's e-mail and a strong password and tick **Auto Confirm User**.
2. Open **SQL Editor** and run, replacing the e-mail:

   ```sql
   insert into public.profiles (user_id, email, is_admin)
   select id, email, true from auth.users where email = 'owner@example.com'
   on conflict (user_id) do update set is_admin = true;
   ```

3. Visit `/admin/login` and sign in.

To add another admin, repeat both steps. To revoke access, run
`update public.profiles set is_admin = false where email = '...';`.
To change a password: **Authentication → Users → ⋯ → Send password recovery**, or delete and recreate
the user.

---

## Vercel deployment

1. Push the repository to GitHub.
2. On [vercel.com](https://vercel.com) click **Add New → Project** and import the repository.
   The framework is detected as **Next.js**; keep the default build settings.
3. Under **Environment Variables** add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   (recommended) `NEXT_PUBLIC_SITE_URL` for the *Production*, *Preview* and *Development* environments.
4. Click **Deploy**.
5. Back in Supabase, set **Authentication → URL Configuration → Site URL** to the Vercel URL.
6. Open `https://<your-site>/admin/login` and sign in.

Every push to the main branch redeploys automatically. Content changes made in `/admin` appear on the
public site immediately; they do **not** need a redeploy.

**Custom domain:** Vercel → Project → **Settings → Domains**. Afterwards update `NEXT_PUBLIC_SITE_URL`,
the Supabase *Site URL*, and redeploy.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `/admin/login` says Supabase is not configured | The two `NEXT_PUBLIC_SUPABASE_*` variables are missing. Add them, then restart `npm run dev` or redeploy on Vercel (they are read at build time). |
| Login fails with "e-mail or password incorrect" | Check the user exists under Authentication → Users and is confirmed. Reset the password if unsure. |
| Signed in, but "غير مصرّح بالدخول" (not authorised) | The account is not an admin yet. Run the SQL in [Admin account setup](#admin-account-setup). |
| Admin pages show "تعذّر تحميل الصفحة" | The database is unreachable or the migration has not been run. Run the migration. On the free plan, check the project is not **paused** (inactive projects pause after about a week; restore them from the dashboard). |
| Public blog is empty | No article is *published* yet, or `import_existing_content.sql` was not run. |
| An edit does not appear on the public site | Saving refreshes the cache instantly. Hard-refresh the browser (Ctrl/Cmd + Shift + R). As a fallback, every page also refreshes at least once an hour. |
| Upload fails with "no permission" | Make sure the migration ran (it creates the bucket and policies) and that your profile has `is_admin = true`. |
| Upload fails with "type not allowed" or "too large" | Only JPEG/PNG/WebP/GIF/AVIF up to 5 MB. Use the editor's max-width and quality options to shrink the image. |
| Error mentioning an unconfigured image hostname | `NEXT_PUBLIC_SUPABASE_URL` was missing when the site was built. Set it and redeploy. |
| Contact form says too many messages were sent | Built-in rate limit: 3 messages per e-mail per 10 minutes and 100 per hour site-wide. |
| `npm run build` crashes with "out of memory" on a small machine | Run `NEXT_BUILD_LOW_MEMORY=1 npm run build` (builds with a single worker). |

---

## Project structure

```
app/
  (site)/            public pages (share the navbar/footer layout)
  admin/login/       sign-in page
  admin/(dashboard)/ protected CMS pages (sidebar layout, admin check)
  layout.tsx         <html>, fonts, theme CSS variables, toasts
  sitemap.ts, robots.ts, rss.xml/
components/
  admin/             CMS UI (forms, editor, media library, settings)
  home/, articles/, portfolio/, contact/, layout/, shared/, ui/
lib/
  supabase/          browser, server, public (cookie-less) and middleware clients
  actions/           server actions (all admin actions re-check admin rights)
  data/              cached public queries (tag-revalidated on save)
  site-settings.ts   homepage/settings schema and defaults
  theme.ts, fonts.ts appearance presets
  sanitize.ts        rich-text HTML allow-list
supabase/            SQL migration, import and seed scripts
middleware.ts        refreshes the session and guards /admin/*
```

More background is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Database reference

| Table | Purpose | Public access (RLS) |
| --- | --- | --- |
| `profiles` | One row per auth user; `is_admin` grants CMS access | None (a safe subset via `get_public_profile()`) |
| `articles` | Blog posts: title, unique slug, excerpt, HTML content, cover, category, tags, `draft`/`published`, `published_at` | Read published rows only |
| `projects` | Portfolio items: details, links, `featured`, `published` | Read published rows only |
| `media` | Metadata for files in the `media` bucket (path, URL, alt text, type, size, dimensions) | None |
| `messages` | Contact form submissions, `is_read` | Insert only (always unread, rate-limited) |
| `site_settings` | Single row (`id = 1`): site texts, social links, `homepage` JSON, `theme_settings` JSON | Read |

Admins (`profiles.is_admin = true`) can read and write everything. Empty settings fall back to the
original site content defined in `lib/site-settings.ts`.
