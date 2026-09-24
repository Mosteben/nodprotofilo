-- =============================================================================
-- Portfolio CMS — initial schema
--
-- Run once on a fresh Supabase project:
--   • Supabase Dashboard → SQL Editor → paste this file → Run, or
--   • Supabase CLI: `supabase link` then `supabase db push`.
-- The script is idempotent, so running it again is safe.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Types & helpers
-- -----------------------------------------------------------------------------
do $$
begin
  create type public.content_status as enum ('draft', 'published');
exception
  when duplicate_object then null;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles — one row per auth user; `is_admin` grants CMS access
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  name        text check (char_length(name) <= 120),
  bio         text check (char_length(bio) <= 2000),
  avatar_url  text,
  email       text,
  phone       text check (char_length(phone) <= 40),
  location    text check (char_length(location) <= 120),
  website     text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- SECURITY DEFINER so policies on `profiles` itself can call it without recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where user_id = (select auth.uid()) and is_admin
  );
$$;

-- Create a (non-admin) profile whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Public-safe subset of the site owner's profile (no e-mail / phone).
create or replace function public.get_public_profile()
returns table (name text, bio text, avatar_url text, location text, website text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.name, p.bio, p.avatar_url, p.location, p.website
  from public.profiles p
  where p.is_admin
  order by p.created_at
  limit 1;
$$;

-- -----------------------------------------------------------------------------
-- articles
-- -----------------------------------------------------------------------------
create table if not exists public.articles (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 200),
  slug             text not null unique
                     check (char_length(slug) between 1 and 200 and slug ~ '^[^/\s?#%]+$'),
  excerpt          text check (char_length(excerpt) <= 500),
  content          text not null default '',
  cover_image_url  text,
  category         text check (char_length(category) <= 60),
  tags             text[] not null default '{}',
  status           public.content_status not null default 'draft',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);

-- Stamp the publication date the first time an article is published.
create or replace function public.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists articles_set_published_at on public.articles;
create trigger articles_set_published_at
  before insert or update on public.articles
  for each row execute function public.set_published_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 200),
  slug             text not null unique
                     check (char_length(slug) between 1 and 200 and slug ~ '^[^/\s?#%]+$'),
  description      text check (char_length(description) <= 500),
  content          text not null default '',
  cover_image_url  text,
  category         text check (char_length(category) <= 60),
  client           text check (char_length(client) <= 120),
  year             integer check (year between 1900 and 2100),
  project_url      text,
  github_url       text,
  featured         boolean not null default false,
  published        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists projects_published_idx
  on public.projects (published, featured, year desc);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- media — metadata for files in the `media` storage bucket
-- -----------------------------------------------------------------------------
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid default auth.uid() references auth.users (id) on delete set null,
  file_name   text not null check (char_length(file_name) <= 255),
  file_path   text not null unique,
  file_url    text not null,
  alt_text    text check (char_length(alt_text) <= 300),
  mime_type   text not null,
  size        bigint not null check (size > 0),
  width       integer,
  height      integer,
  created_at  timestamptz not null default now()
);

create index if not exists media_created_at_idx on public.media (created_at desc);

-- -----------------------------------------------------------------------------
-- messages — contact form submissions
-- -----------------------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 100),
  email       text not null
                check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject     text not null check (char_length(subject) between 1 and 200),
  message     text not null check (char_length(message) between 1 and 5000),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

-- Normalises new messages and applies a lightweight rate limit:
--   • 3 messages per e-mail address per 10 minutes
--   • 100 messages in total per hour (flood protection)
create or replace function public.guard_message_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.is_read := false;
  new.created_at := now();
  new.email := lower(trim(new.email));

  if (
    select count(*) from public.messages m
    where m.email = new.email and m.created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if (
    select count(*) from public.messages m
    where m.created_at > now() - interval '1 hour'
  ) >= 100 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists messages_guard_insert on public.messages;
create trigger messages_guard_insert
  before insert on public.messages
  for each row execute function public.guard_message_insert();

-- -----------------------------------------------------------------------------
-- site_settings — a single row (id = 1) of editable site content & theme
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                 smallint primary key default 1 check (id = 1),
  site_name          text check (char_length(site_name) <= 120),
  site_description   text check (char_length(site_description) <= 500),
  hero_title         text check (char_length(hero_title) <= 200),
  hero_description   text check (char_length(hero_description) <= 1000),
  hero_image_url     text,
  about_title        text check (char_length(about_title) <= 200),
  about_description  text check (char_length(about_description) <= 3000),
  contact_email      text,
  instagram_url      text,
  linkedin_url       text,
  github_url         text,
  behance_url        text,
  facebook_url       text,
  youtube_url        text,
  whatsapp_url       text,
  theme_settings     jsonb not null default '{}'::jsonb,
  homepage           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Empty values fall back to the defaults in the application code.
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Grants (explicit, in case the project does not auto-grant the Data API roles)
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.articles, public.projects, public.site_settings to anon;
grant insert on public.messages to anon;
grant select, insert, update, delete
  on public.profiles, public.articles, public.projects, public.media,
     public.messages, public.site_settings
  to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.get_public_profile() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.articles      enable row level security;
alter table public.projects      enable row level security;
alter table public.media         enable row level security;
alter table public.messages      enable row level security;
alter table public.site_settings enable row level security;

-- profiles: users see their own row, admins manage all. Non-admins cannot update,
-- so nobody can grant themselves `is_admin`.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- articles
drop policy if exists "articles_select_published" on public.articles;
create policy "articles_select_published" on public.articles
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "articles_select_admin" on public.articles;
create policy "articles_select_admin" on public.articles
  for select to authenticated using (public.is_admin());

drop policy if exists "articles_insert_admin" on public.articles;
create policy "articles_insert_admin" on public.articles
  for insert to authenticated with check (public.is_admin());

drop policy if exists "articles_update_admin" on public.articles;
create policy "articles_update_admin" on public.articles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "articles_delete_admin" on public.articles;
create policy "articles_delete_admin" on public.articles
  for delete to authenticated using (public.is_admin());

-- projects
drop policy if exists "projects_select_published" on public.projects;
create policy "projects_select_published" on public.projects
  for select to anon, authenticated
  using (published);

drop policy if exists "projects_select_admin" on public.projects;
create policy "projects_select_admin" on public.projects
  for select to authenticated using (public.is_admin());

drop policy if exists "projects_insert_admin" on public.projects;
create policy "projects_insert_admin" on public.projects
  for insert to authenticated with check (public.is_admin());

drop policy if exists "projects_update_admin" on public.projects;
create policy "projects_update_admin" on public.projects
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "projects_delete_admin" on public.projects;
create policy "projects_delete_admin" on public.projects
  for delete to authenticated using (public.is_admin());

-- media (admin only; the files themselves are served from the public bucket)
drop policy if exists "media_all_admin" on public.media;
create policy "media_all_admin" on public.media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- messages: anyone may submit (unread), only admins read / update / delete
drop policy if exists "messages_insert_public" on public.messages;
create policy "messages_insert_public" on public.messages
  for insert to anon, authenticated
  with check (is_read = false);

drop policy if exists "messages_select_admin" on public.messages;
create policy "messages_select_admin" on public.messages
  for select to authenticated using (public.is_admin());

drop policy if exists "messages_update_admin" on public.messages;
create policy "messages_update_admin" on public.messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "messages_delete_admin" on public.messages;
create policy "messages_delete_admin" on public.messages
  for delete to authenticated using (public.is_admin());

-- site_settings: public read, admin write
drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "site_settings_insert_admin" on public.site_settings;
create policy "site_settings_insert_admin" on public.site_settings
  for insert to authenticated with check (public.is_admin());

drop policy if exists "site_settings_update_admin" on public.site_settings;
create policy "site_settings_update_admin" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Storage: public `media` bucket, images only, 5 MB max, admin-only writes
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_bucket_select_admin" on storage.objects;
create policy "media_bucket_select_admin" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_bucket_insert_admin" on storage.objects;
create policy "media_bucket_insert_admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_bucket_update_admin" on storage.objects;
create policy "media_bucket_update_admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_bucket_delete_admin" on storage.objects;
create policy "media_bucket_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
