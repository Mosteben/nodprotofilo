-- =============================================================================
-- Contact form: only the message is required. Name, e-mail and subject become
-- optional (NULL). The existing length/format checks still apply to any value
-- that is given, and RLS is unchanged (visitors can only insert).
--
-- Rate limiting: the per-e-mail limit is kept; messages without an e-mail get
-- their own site-wide limit (10 per 10 minutes), on top of the global 100/hour.
--
-- Run after 20260926000000_rich_text_descriptions.sql. Idempotent.
-- =============================================================================

alter table public.messages alter column name drop not null;
alter table public.messages alter column email drop not null;
alter table public.messages alter column subject drop not null;

create or replace function public.guard_message_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.is_read := false;
  new.created_at := now();
  -- Empty strings are stored as NULL.
  new.name := nullif(trim(new.name), '');
  new.email := nullif(lower(trim(new.email)), '');
  new.subject := nullif(trim(new.subject), '');

  if new.email is not null then
    if (
      select count(*) from public.messages m
      where m.email = new.email and m.created_at > now() - interval '10 minutes'
    ) >= 3 then
      raise exception 'rate_limited' using errcode = 'P0001';
    end if;
  elsif (
    select count(*) from public.messages m
    where m.email is null and m.created_at > now() - interval '10 minutes'
  ) >= 10 then
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
