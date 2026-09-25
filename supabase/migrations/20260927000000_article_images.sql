-- =============================================================================
-- Multiple images per article.
--
--   article_images: one row per image, ordered by sort_order (0 = primary image),
--   linked to the article (deleted with it) and optionally to the media-library
--   row the file came from.
--
-- Backward compatibility: articles.cover_image_url is kept and always mirrors the
-- primary image (set_article_images() updates it), so every place that shows a
-- single image keeps working. Existing covers are copied into article_images as
-- image #1 below.
--
-- Run after 20260926020000_message_replies.sql. Idempotent.
-- =============================================================================

create table if not exists public.article_images (
  id            uuid primary key default gen_random_uuid(),
  article_id    uuid not null references public.articles (id) on delete cascade,
  media_id      uuid references public.media (id) on delete set null,
  image_url     text not null check (char_length(image_url) between 1 and 2000),
  storage_path  text,
  alt_text      text check (char_length(alt_text) <= 300),
  sort_order    integer not null default 0 check (sort_order >= 0),
  created_at    timestamptz not null default now()
);

create index if not exists article_images_article_order_idx
  on public.article_images (article_id, sort_order, created_at);
create index if not exists article_images_media_idx on public.article_images (media_id);

-- Existing single images become image #1 (only for articles without images yet).
insert into public.article_images (article_id, image_url, sort_order)
select a.id, a.cover_image_url, 0
from public.articles a
where a.cover_image_url is not null
  and a.cover_image_url <> ''
  and not exists (select 1 from public.article_images i where i.article_id = a.id);

-- Replaces an article's images with the given ordered list, atomically, and keeps
-- articles.cover_image_url equal to the first image. Runs with the caller's rights
-- (RLS applies) and additionally requires an admin.
--   p_images: [{ "image_url": "...", "media_id": "..."|null, "storage_path": "..."|null,
--                "alt_text": "..."|null }, ...]   (array order = display order)
create or replace function public.set_article_images(p_article_id uuid, p_images jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if jsonb_typeof(p_images) <> 'array' then
    raise exception 'p_images must be an array' using errcode = '22023';
  end if;

  delete from public.article_images where article_id = p_article_id;

  insert into public.article_images (article_id, media_id, image_url, storage_path, alt_text, sort_order)
  select p_article_id,
         nullif(e ->> 'media_id', '')::uuid,
         e ->> 'image_url',
         nullif(e ->> 'storage_path', ''),
         nullif(e ->> 'alt_text', ''),
         (t.ord - 1)::integer
  from jsonb_array_elements(p_images) with ordinality as t(e, ord);

  update public.articles
  set cover_image_url = nullif(p_images -> 0 ->> 'image_url', '')
  where id = p_article_id
    and cover_image_url is distinct from nullif(p_images -> 0 ->> 'image_url', '');
end;
$$;

grant select on public.article_images to anon;
grant select, insert, update, delete on public.article_images to authenticated;
-- Functions are executable by PUBLIC by default; only signed-in users may call this one
-- (and the function itself still requires an admin).
revoke execute on function public.set_article_images(uuid, jsonb) from public, anon;
grant execute on function public.set_article_images(uuid, jsonb) to authenticated;

alter table public.article_images enable row level security;

-- Visitors see the images of published articles only; admins manage everything.
drop policy if exists "article_images_select_published" on public.article_images;
create policy "article_images_select_published" on public.article_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.articles a
    where a.id = article_images.article_id and a.status = 'published'
  ));

drop policy if exists "article_images_all_admin" on public.article_images;
create policy "article_images_all_admin" on public.article_images
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
