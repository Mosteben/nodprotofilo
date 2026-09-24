# Architecture

## Starting point (before the CMS work)

- **Framework:** Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS 3.
- **Language/direction:** Arabic, `dir="rtl"`, `lang="ar"`.
- **Visual identity:** navy (`#0B1F3A`) + gold (`#D4AF37`) palette, Aref Ruqaa for display
  headings, Cairo for body copy, Tajawal for UI text, the animated gold `InkStroke`
  underline, "marginalia" eyebrows, `RevealOnScroll` framer-motion reveals.
- **Content:** hard-coded in `lib/constants/content.ts` (articles, lectures, books,
  resources, gallery, timeline, stats) and `lib/constants/site.ts` (name, links).
- **Routes:** `/`, `/about`, `/articles`, `/articles/[slug]`, `/lectures`, `/lectures/[slug]`,
  `/books`, `/books/[slug]`, `/resources`, `/gallery`, `/contact`, `/rss.xml`,
  `/sitemap.xml`, `/robots.txt`.
- **Backend:** none. The contact form only faked a success state.

## Target architecture

```
Browser ──► Next.js on Vercel ──► Supabase (Postgres + Auth + Storage)
             │
             ├─ app/(site)/*        public website (server components, cached reads)
             ├─ app/admin/login     Supabase Auth email/password sign-in
             ├─ app/admin/(dashboard)/*  protected CMS (server components + server actions)
             └─ middleware.ts       refreshes the Supabase session, guards /admin/*
```

- **Public reads** use a cookie-less anon client (`lib/supabase/public.ts`) wrapped in
  `unstable_cache` with tags (`articles`, `projects`, `settings`). Row Level Security only
  exposes published rows. Admin mutations call `revalidateTag`, so pages stay static
  and update immediately after an edit.
- **Admin writes** go through server actions (`lib/actions/*`) that use the signed-in
  user's session. Every action re-checks admin status, and RLS enforces the same rule in
  the database (`public.is_admin()`).
- **Media uploads** go straight from the browser to Supabase Storage (so Vercel's request
  body limit never applies), then a server action records the file in `media`.
- **Rich text** is authored with Tiptap and stored as HTML that is sanitised with
  `sanitize-html` both on save and on render.
- **Theme** settings are preset keys stored in `site_settings.theme_settings`, mapped to
  CSS custom properties in the root layout. Tailwind colours read those variables, so
  every existing class (`bg-navy`, `text-gold-dark`, …) follows the chosen theme.

## Decisions

| Topic | Decision |
| --- | --- |
| `/articles` vs `/blog` | `/blog` is canonical; `/articles/*` permanently redirects. |
| Books / lectures / resources / gallery | Kept as-is (static) — outside the CMS scope. |
| Admin identity | `profiles.is_admin`; public sign-ups should be disabled in Supabase. |
| Contact abuse | Honeypot + minimum fill time in the server action, plus a DB trigger that rate-limits per e-mail and globally. |
| Allowed uploads | JPEG, PNG, WebP, GIF, AVIF up to 5 MB (enforced client-side, by the bucket, and by the server action). SVG is rejected (XSS risk). |
| Existing articles | Imported by `supabase/import_existing_content.sql`. |
