-- =============================================================================
-- OPTIONAL development seed data.
--
-- Run after the schema migration to get example content to click around with.
-- Every seeded article and project has a slug starting with `demo-`, so you can
-- remove them all before going live with the "REMOVE SEED DATA" block at the end.
-- Site settings are only filled where they are still empty — nothing is overwritten.
-- =============================================================================

-- Example articles ------------------------------------------------------------
insert into public.articles
  (title, slug, excerpt, content, cover_image_url, category, tags, status, published_at)
values
  (
    'مقالة تجريبية: كيف أنظّم وقت المذاكرة',
    'demo-study-schedule',
    'مقالة تجريبية توضّح شكل المقالات في المدونة — احذفيها قبل النشر الفعلي.',
    '<h2>مقدمة</h2><p>هذه <strong>مقالة تجريبية</strong> لعرض إمكانيات المحرر: العناوين، والقوائم، والاقتباسات.</p><ul><li>قسّمي اليوم إلى فترات قصيرة.</li><li>خذي راحة بعد كل فترة.</li><li>راجعي ما ذاكرتِه قبل النوم.</li></ul><blockquote><p>القليل الدائم خيرٌ من الكثير المنقطع.</p></blockquote>',
    'https://images.unsplash.com/photo-1604549944235-3e5579b15cc2?q=80&w=1200&auto=format&fit=crop',
    'تعليم',
    array['تنظيم', 'مذاكرة']::text[],
    'published',
    now() - interval '3 days'
  ),
  (
    'مقالة تجريبية: لماذا نكتب؟',
    'demo-why-we-write',
    'نص تجريبي قصير عن الكتابة كوسيلة للفهم.',
    '<p>الكتابة طريقة لترتيب الأفكار قبل مشاركتها. هذا <em>نص تجريبي</em> يمكن حذفه بأمان.</p><h3>عنوان فرعي</h3><p>فقرة ثانية مع <a href="https://example.com">رابط تجريبي</a>.</p>',
    'https://images.unsplash.com/photo-1553734713-7f90be49b96f?q=80&w=1200&auto=format&fit=crop',
    'نثر',
    array['كتابة']::text[],
    'published',
    now() - interval '1 day'
  ),
  (
    'مسودة تجريبية لم تُنشر بعد',
    'demo-draft',
    'هذه مسودة — لا تظهر في الموقع العام.',
    '<p>محتوى المسودة يظهر فقط في لوحة التحكم.</p>',
    null,
    'تعليم',
    '{}'::text[],
    'draft',
    null
  )
on conflict (slug) do nothing;

-- Example projects ------------------------------------------------------------
insert into public.projects
  (title, slug, description, content, cover_image_url, category, client, year,
   project_url, github_url, featured, published)
values
  (
    'مشروع تجريبي: سلسلة محاضرات الجبر',
    'demo-algebra-series',
    'سلسلة فيديوهات تعليمية مبسّطة — مثال على صفحة مشروع.',
    '<p>وصف تفصيلي للمشروع: الفكرة، والأدوات المستخدمة، والنتائج.</p><ul><li>٣ محاضرات مسجّلة</li><li>أوراق عمل مصاحبة</li></ul>',
    'https://images.unsplash.com/photo-1758685734303-e85757067f28?q=80&w=1200&auto=format&fit=crop',
    'محتوى تعليمي',
    'قناة يوتيوب',
    2026,
    'https://example.com',
    null,
    true,
    true
  ),
  (
    'مشروع تجريبي: مجموعة قصصية',
    'demo-short-stories',
    'مجموعة قصص قصيرة — مثال على مشروع كتابة إبداعية.',
    '<p>نبذة عن المجموعة القصصية ومراحل كتابتها.</p>',
    'https://images.unsplash.com/photo-1521033719794-41049d18b8d4?q=80&w=1200&auto=format&fit=crop',
    'كتابة إبداعية',
    null,
    2025,
    null,
    null,
    true,
    true
  ),
  (
    'مشروع تجريبي غير منشور',
    'demo-unpublished-project',
    'مشروع قيد الإعداد — لا يظهر في الموقع العام.',
    '<p>تفاصيل لاحقًا.</p>',
    null,
    'تصميم',
    null,
    2026,
    null,
    'https://github.com/example/example',
    false,
    false
  )
on conflict (slug) do nothing;

-- Example site settings (fills empty fields only) -----------------------------
update public.site_settings
set
  hero_title        = coalesce(hero_title, E'أكتب عن ما أحلم\nبلغة تصل للقلب'),
  hero_description  = coalesce(hero_description, 'نص تجريبي للقسم الرئيسي — عدّليه من لوحة التحكم ← الواجهة.'),
  about_title       = coalesce(about_title, 'نبذة عني'),
  about_description = coalesce(about_description, 'نص تجريبي لقسم النبذة — عدّليه من لوحة التحكم.'),
  contact_email     = coalesce(contact_email, 'hello@example.com')
where id = 1;

-- =============================================================================
-- REMOVE SEED DATA — run this block before going live:
--
--   delete from public.articles where slug like 'demo-%';
--   delete from public.projects where slug like 'demo-%';
--   update public.site_settings
--     set contact_email = null where contact_email = 'hello@example.com';
-- =============================================================================
