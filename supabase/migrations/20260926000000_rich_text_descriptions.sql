-- =============================================================================
-- Book and lecture descriptions are now edited with the rich-text editor and
-- stored as sanitised HTML, which is longer than the plain text they held.
-- Raise the length limit from 3,000 to 20,000 characters (the application
-- enforces the same limit). Existing plain-text values stay valid and are still
-- rendered correctly.
--
-- Run after 20260925000000_cms_extensions.sql. Idempotent.
-- =============================================================================

alter table public.books drop constraint if exists books_description_check;
alter table public.books
  add constraint books_description_check check (char_length(description) <= 20000);

alter table public.lectures drop constraint if exists lectures_description_check;
alter table public.lectures
  add constraint lectures_description_check check (char_length(description) <= 20000);
