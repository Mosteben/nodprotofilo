-- =============================================================================
-- Admin inbox: remember when the owner marked a message as replied.
--
-- The site does not send e-mail itself — replies are written in the admin and
-- sent from the owner's own mail app — so this timestamp is set manually by
-- the admin ("mark as replied"), never automatically. Admin-only like the rest
-- of the table (existing RLS); visitors cannot set it on insert.
--
-- Run after 20260926010000_optional_contact_fields.sql. Idempotent.
-- =============================================================================

alter table public.messages add column if not exists replied_at timestamptz;

create or replace function public.guard_message_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.is_read := false;
  new.replied_at := null;
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
