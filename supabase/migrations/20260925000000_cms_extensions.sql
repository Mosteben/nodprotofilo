-- =============================================================================
-- CMS extensions: gallery, resources, books, lectures, comments, About content,
-- public user accounts and a `resources` storage bucket.
--
-- Run AFTER 20260924000000_initial_schema.sql (SQL Editor → paste → Run, or
-- `supabase db push`). Idempotent: safe to run again.
--
-- The existing static books, lectures, gallery images and (draft) resources are
-- imported at the end of this file, so the public pages keep their content.
-- =============================================================================

-- Content tables use `sort_order` (ascending) for manual ordering from the admin.

-- -----------------------------------------------------------------------------
-- gallery_items — images shown on /gallery (image files live in the media bucket)
-- -----------------------------------------------------------------------------
create table if not exists public.gallery_items (
  id          uuid primary key default gen_random_uuid(),
  media_id    uuid references public.media (id) on delete set null,
  image_url   text not null check (char_length(image_url) <= 2000),
  alt_text    text check (char_length(alt_text) <= 300),
  title       text check (char_length(title) <= 200),
  caption     text check (char_length(caption) <= 1000),
  category    text check (char_length(category) <= 60),
  sort_order  integer not null default 0,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists gallery_items_public_idx on public.gallery_items (published, sort_order);
create index if not exists gallery_items_media_idx on public.gallery_items (media_id);

drop trigger if exists gallery_items_set_updated_at on public.gallery_items;
create trigger gallery_items_set_updated_at
  before update on public.gallery_items
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- resources — downloadable files (PDFs, documents, images) or external links
-- -----------------------------------------------------------------------------
create table if not exists public.resources (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 1 and 200),
  description    text check (char_length(description) <= 1000),
  category       text check (char_length(category) <= 60),
  author         text check (char_length(author) <= 120),
  file_path      text unique,                 -- key in the `resources` bucket
  file_url       text,                        -- public URL of that file
  file_name      text check (char_length(file_name) <= 255),
  mime_type      text,
  file_size      bigint check (file_size > 0),
  thumbnail_url  text,
  external_url   text,
  sort_order     integer not null default 0,
  published      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- A published resource must point somewhere.
  constraint resources_publishable
    check (not published or file_url is not null or external_url is not null)
);

create index if not exists resources_public_idx on public.resources (published, sort_order);

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- books
-- -----------------------------------------------------------------------------
create table if not exists public.books (
  id                uuid primary key default gen_random_uuid(),
  title             text not null check (char_length(title) between 1 and 200),
  slug              text not null unique
                      check (char_length(slug) between 1 and 200 and slug ~ '^[^/\s?#%]+$'),
  description       text check (char_length(description) <= 3000),
  author            text check (char_length(author) <= 120),
  publication_year  integer check (publication_year between 1000 and 2100),
  category          text check (char_length(category) <= 60),
  cover_image_url   text,
  pages             integer check (pages > 0),
  price_label       text check (char_length(price_label) <= 80),
  purchase_url      text,
  sample_url        text,
  featured          boolean not null default false,
  published         boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists books_public_idx on public.books (published, sort_order);

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- lectures — YouTube videos and/or external lecture links
-- -----------------------------------------------------------------------------
create table if not exists public.lectures (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 1 and 200),
  slug           text not null unique
                   check (char_length(slug) between 1 and 200 and slug ~ '^[^/\s?#%]+$'),
  description    text check (char_length(description) <= 3000),
  speaker        text check (char_length(speaker) <= 120),
  lecture_date   date,
  category       text check (char_length(category) <= 60),
  -- Only the 11-character video id is stored; embeds are built from it.
  youtube_id     text check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  external_url   text,
  thumbnail_url  text,
  duration       text check (char_length(duration) <= 20),
  featured       boolean not null default false,
  published      boolean not null default false,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint lectures_has_link
    check (not published or youtube_id is not null or external_url is not null)
);

create index if not exists lectures_public_idx on public.lectures (published, sort_order);

drop trigger if exists lectures_set_updated_at on public.lectures;
create trigger lectures_set_updated_at
  before update on public.lectures
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- comments — visitor comments/reviews on articles, projects, books and lectures
-- -----------------------------------------------------------------------------
create table if not exists public.comments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete set null,
  content_type   text not null check (content_type in ('article', 'project', 'book', 'lecture')),
  content_id     uuid not null,
  author_name    text not null check (char_length(author_name) between 1 and 80),
  author_email   text check (char_length(author_email) <= 254 and author_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  body           text not null check (char_length(body) between 2 and 3000),
  is_anonymous   boolean not null default false,
  is_approved    boolean not null default false,
  is_read        boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists comments_target_idx on public.comments (content_type, content_id, is_approved, created_at);
create index if not exists comments_moderation_idx on public.comments (is_approved, created_at desc);

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- Whether a piece of public content exists and is published (validates the
-- polymorphic content_type/content_id pair).
create or replace function public.is_published_content(p_type text, p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case p_type
    when 'article' then exists (select 1 from public.articles where id = p_id and status = 'published')
    when 'project' then exists (select 1 from public.projects where id = p_id and published)
    when 'book'    then exists (select 1 from public.books    where id = p_id and published)
    when 'lecture' then exists (select 1 from public.lectures where id = p_id and published)
    else false
  end;
$$;

-- New comments: bound to the caller's account (if any), always pending/unread,
-- must target published content, and are rate-limited.
create or replace function public.guard_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.user_id := auth.uid();
  new.is_approved := false;
  new.is_read := false;
  new.created_at := now();
  new.author_email := nullif(lower(trim(new.author_email)), '');

  if not public.is_published_content(new.content_type, new.content_id) then
    raise exception 'invalid_target' using errcode = 'P0001';
  end if;

  -- 5 per author (account or e-mail) per 10 minutes, 200 site-wide per hour.
  if (
    select count(*) from public.comments c
    where c.created_at > now() - interval '10 minutes'
      and ((new.user_id is not null and c.user_id = new.user_id)
        or (new.user_id is null and new.author_email is not null and c.author_email = new.author_email))
  ) >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if (select count(*) from public.comments c where c.created_at > now() - interval '1 hour') >= 200 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists comments_guard_insert on public.comments;
create trigger comments_guard_insert
  before insert on public.comments
  for each row execute function public.guard_comment_insert();

-- Approved comments for one item, without e-mail/user id; anonymous ones have no name.
create or replace function public.get_approved_comments(p_type text, p_id uuid)
returns table (id uuid, display_name text, body text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id,
         case when c.is_anonymous then null else c.author_name end,
         c.body,
         c.created_at
  from public.comments c
  where c.content_type = p_type
    and c.content_id = p_id
    and c.is_approved
    and public.is_published_content(p_type, p_id)
  order by c.created_at;
$$;

-- -----------------------------------------------------------------------------
-- About page content (structured lists) on the existing settings row
-- -----------------------------------------------------------------------------
alter table public.site_settings
  add column if not exists about jsonb not null default '{}'::jsonb;

-- The About image used to be stored in the homepage settings; move it.
update public.site_settings
set about = jsonb_set(about, '{imageUrl}', homepage -> 'aboutImageUrl'),
    homepage = homepage - 'aboutImageUrl'
where homepage ? 'aboutImageUrl' and not about ? 'imageUrl';

-- -----------------------------------------------------------------------------
-- Public user accounts: users may edit their own profile, never `is_admin`
-- -----------------------------------------------------------------------------
-- SECURITY INVOKER on purpose: current_user is then the caller's role. Only Data API
-- callers (anon/authenticated) are restricted; the SQL editor (admin setup) is not.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') and not public.is_admin() then
    if new.is_admin is distinct from old.is_admin
      or new.user_id is distinct from old.user_id
      or new.email is distinct from old.email then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- New accounts keep the display name given at registration (is_admin stays false).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, name)
  values (new.id, new.email, nullif(left(trim(new.raw_user_meta_data ->> 'name'), 120), ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
grant select on public.gallery_items, public.resources, public.books, public.lectures to anon;
grant insert on public.comments to anon;
grant select, insert, update, delete
  on public.gallery_items, public.resources, public.books, public.lectures, public.comments
  to authenticated;
grant execute on function public.get_approved_comments(text, uuid) to anon, authenticated;
grant execute on function public.is_published_content(text, uuid) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.gallery_items enable row level security;
alter table public.resources     enable row level security;
alter table public.books         enable row level security;
alter table public.lectures      enable row level security;
alter table public.comments      enable row level security;

-- Published rows are public; admins manage everything.
do $$
declare
  t text;
begin
  foreach t in array array['gallery_items', 'resources', 'books', 'lectures'] loop
    execute format('drop policy if exists %I on public.%I', t || '_select_published', t);
    execute format('create policy %I on public.%I for select to anon, authenticated using (published)',
                   t || '_select_published', t);
    execute format('drop policy if exists %I on public.%I', t || '_all_admin', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
                   t || '_all_admin', t);
  end loop;
end
$$;

-- comments: anyone may submit (the trigger forces pending/unread and the owner);
-- nobody but admins reads the table directly — the public uses get_approved_comments().
drop policy if exists "comments_insert_public" on public.comments;
create policy "comments_insert_public" on public.comments
  for insert to anon, authenticated
  with check (is_approved = false and is_read = false);

drop policy if exists "comments_admin_all" on public.comments;
create policy "comments_admin_all" on public.comments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Storage: public `resources` bucket for downloadable files, admin-only writes
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resources',
  'resources',
  true,
  20971520, -- 20 MB
  array[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "resources_bucket_select_admin" on storage.objects;
create policy "resources_bucket_select_admin" on storage.objects
  for select to authenticated
  using (bucket_id = 'resources' and public.is_admin());

drop policy if exists "resources_bucket_insert_admin" on storage.objects;
create policy "resources_bucket_insert_admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resources' and public.is_admin());

drop policy if exists "resources_bucket_update_admin" on storage.objects;
create policy "resources_bucket_update_admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'resources' and public.is_admin())
  with check (bucket_id = 'resources' and public.is_admin());

drop policy if exists "resources_bucket_delete_admin" on storage.objects;
create policy "resources_bucket_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resources' and public.is_admin());

-- =============================================================================
-- Import of the content that used to be hard-coded in lib/constants/content.ts
-- (existing rows are left untouched on re-run)
-- =============================================================================

insert into public.books
  (title, slug, description, cover_image_url, pages, price_label, purchase_url, sample_url, featured, published, sort_order)
values
  ('غزل البنات — حنان لاشين', 'ghazl-al-banat-hanan-lashin', 'من أشهر روايات حنان لاشين الاجتماعية، تتناول قصة حب وزواج بأسلوب رقيق يمزج الرومانسية بالقيم الأسرية.', '/images/books/ghazl-al-banat-hanan-lashin/1.jpg', null, null, null, null, true, true, 10),
  ('إيكادولي — حنان لاشين', 'ikadoli-hanan-lashin', 'الجزء الأول من سلسلة "مملكة البلاغة" الفانتازية، حيث تستدعي الكتب الحية محاربين من عالم القراء لمواجهة الشر.', '/images/books/ikadoli-hanan-lashin/1.jpg', null, null, null, null, false, true, 20),
  ('الهالة المقدسة — حنان لاشين', 'al-hala-al-muqaddasa-hanan-lashin', 'رواية اجتماعية من أعمال حنان لاشين، تحمل طابعها المعتاد في مزج القيم الإنسانية والدينية بالسرد الروائي.', '/images/books/al-hala-al-muqaddasa-hanan-lashin/1.jpg', null, null, null, null, false, true, 30),
  ('كيغار — مني سلامة', 'kighar-mona-salama', 'أول الأعمال المطبوعة لمني سلامة (2015)، رواية رومانسية اجتماعية تتناول الظلم الإنساني في المناطق العشوائية.', '/images/books/kighar-mona-salama/1.jpg', null, null, null, null, true, true, 40),
  ('من وراء حجاب — مني سلامة', 'min-waraa-hijab-mona-salama', 'من أشهر وأنجح روايات مني سلامة، تمزج بين الرومانسية والفانتازيا والواقعية السحرية.', '/images/books/min-waraa-hijab-mona-salama/1.jpg', null, null, null, null, false, true, 50),
  ('ثاني أكسيد الحب — مني سلامة', 'thani-oksid-al-hub-mona-salama', 'رواية رومانسية اجتماعية لمني سلامة، صدرت في معرض القاهرة الدولي للكتاب 2018 عن دار عصير الكتب.', '/images/books/thani-oksid-al-hub-mona-salama/1.jpg', null, null, null, null, false, true, 60),
  ('ماجدولين (تحت ظلال الزيزفون)', 'majdouline', 'الرواية الرومانسية الكلاسيكية التي عرّبها مصطفى لطفي المنفلوطي عن أصل فرنسي، وأصبحت من أشهر أعمدة الأدب العاطفي العربي. (ملاحظة نادين: اه منك يا ماجدولين يا قرعة هتعنسي عشان راجل ياعنيا الواد ستيفن دا مش متربي 😂)', '/images/books/majdouline/1.jpg', null, null, null, null, false, true, 70)
on conflict (slug) do nothing;

insert into public.lectures
  (title, slug, description, lecture_date, category, youtube_id, thumbnail_url, duration, featured, published, sort_order)
values
  ('طرق البيروني وإيراتوستينس لقياس محيط الأرض والقسمة المطولة', 'tariqat-al-biruni-eratosthenes-qismah-mutawwalah', 'شرح للطريقتين التاريخيتين اللي استخدمهم البيروني وإيراتوستينس لقياس محيط الأرض، مع تطبيق عملي على القسمة المطولة.', '2026-07-01', 'تاريخ العلوم', '7u3k-E7tB-s', 'https://images.unsplash.com/photo-1604549944235-3e5579b15cc2?q=80&w=1200&auto=format&fit=crop', null, true, true, 10),
  ('طريقة الجذور الصماء، فك الأقواس، وطريقة كاردانو', 'al-judhur-al-summa-fak-al-aqwas-cardano', 'شرح طريقة التعامل مع الجذور الصماء وفك الأقواس، بالإضافة لطريقة كاردانو الشهيرة في حل المعادلات.', '2026-07-08', 'جبر', 'p8MgDNli_eU', 'https://images.unsplash.com/photo-1758685734303-e85757067f28?q=80&w=1200&auto=format&fit=crop', null, false, true, 20),
  ('طريقة فيراري لحل معادلة من الدرجة الرابعة', 'tariqat-ferrari-muadala-min-al-daraja-al-rabia', 'شرح تفصيلي لطريقة فيراري الكلاسيكية في حل المعادلات من الدرجة الرابعة خطوة بخطوة.', '2026-07-15', 'جبر', '-QHutrljjE4', 'https://images.unsplash.com/photo-1758685848791-87860bb29292?q=80&w=1200&auto=format&fit=crop', null, false, true, 30)
on conflict (slug) do nothing;

insert into public.gallery_items (id, image_url, alt_text, category, sort_order, published)
values
  ('a0000000-0000-4000-8000-000000000001', '/images/gallery/g7-historic-building.png', 'واجهة مبنى تاريخي بطراز معماري مميز تحت سماء صافية', 'لحظات يومية', 10, true),
  ('a0000000-0000-4000-8000-000000000002', '/images/gallery/g8-sky-branches.png', 'السماء الزرقاء من بين أغصان الأشجار', 'لحظات يومية', 20, true),
  ('a0000000-0000-4000-8000-000000000003', '/images/gallery/g9-sky-city.png', 'سماء صافية بغيوم متناثرة فوق أسطح المدينة ونخلة', 'لحظات يومية', 30, true),
  ('a0000000-0000-4000-8000-000000000004', '/images/gallery/g10-green-field.png', 'حقل أخضر وسط المدينة تحت أشعة الشمس', 'لحظات يومية', 40, true),
  ('a0000000-0000-4000-8000-000000000005', '/images/gallery/g11-sunset-clouds.png', 'غيوم الغروب الدرامية فوق أسطح المدينة', 'لحظات يومية', 50, true),
  ('a0000000-0000-4000-8000-000000000006', '/images/gallery/g12-pine-tree.png', 'شجرة سرو شامخة تحت سماء زرقاء صافية', 'لحظات يومية', 60, true),
  ('a0000000-0000-4000-8000-000000000007', '/images/gallery/g13-flower.png', 'زهرة برتقالية زاهية وسط أوراق خضراء', 'لحظات يومية', 70, true),
  ('a0000000-0000-4000-8000-000000000008', '/images/gallery/g14-beach.png', 'شاطئ بمياه فيروزية صافية من شرفة مطلة على البحر', 'لحظات يومية', 80, true)
on conflict (id) do nothing;

-- Placeholders from the old static page (they had no real files): kept as drafts
-- so a file can be attached before publishing.
insert into public.resources (id, title, description, category, sort_order, published)
values
  ('b0000000-0000-4000-8000-000000000001', 'ملخص الفصل الثاني – العلوم الإعدادية', 'ملخص مبسّط بالرسومات التوضيحية لأهم دروس الفصل الدراسي الثاني.', 'ملخصات', 10, false),
  ('b0000000-0000-4000-8000-000000000002', 'ورقة عمل: الخلية ووظائفها', 'ورقة عمل تفاعلية مع أسئلة تدريبية للمراجعة الذاتية.', 'أوراق عمل', 20, false),
  ('b0000000-0000-4000-8000-000000000003', 'عرض تقديمي: أساسيات التغذية السليمة', 'عرض بوربوينت جاهز للاستخدام في الحصص الدراسية أو المراجعة الذاتية.', 'عروض تقديمية', 30, false)
on conflict (id) do nothing;
