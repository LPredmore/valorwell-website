-- Privacy-isolated invitations and short-lived sessions for the short therapist qualification form.
-- No historic backfill or sending on migration. The Invitation to Interview campaign is untouched.
create table if not exists public.therapist_application_invites (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 submission_id uuid not null unique references public.website_submissions(id) on delete cascade,
 email text not null,
 invite_token text not null unique,
 expires_at timestamptz not null,
 used_at timestamptz,
 last_requested_at timestamptz not null default clock_timestamp(),
 email_status text not null default 'queued'
   check (email_status in ('queued','processing','sent','failed','cancelled')),
 email_attempts integer not null default 0 check(email_attempts between 0 and 20),
 next_attempt_at timestamptz not null default clock_timestamp(),
 email_sent_at timestamptz,
 updated_at timestamptz not null default clock_timestamp(),
 created_at timestamptz not null default clock_timestamp()
);
create index if not exists therapist_application_invites_delivery_idx
 on public.therapist_application_invites(email_status,next_attempt_at);
create index if not exists therapist_application_invites_email_idx
 on public.therapist_application_invites(tenant_id,lower(email));
alter table public.therapist_application_invites enable row level security;
revoke all on public.therapist_application_invites from public,anon,authenticated;
grant all on public.therapist_application_invites to service_role;

create table if not exists public.therapist_application_sessions (
 token_hash text primary key,
 invite_id uuid not null references public.therapist_application_invites(id) on delete cascade,
 expires_at timestamptz not null,
 created_at timestamptz not null default clock_timestamp()
);
create index if not exists therapist_application_sessions_expires_idx
 on public.therapist_application_sessions(expires_at);
alter table public.therapist_application_sessions enable row level security;
revoke all on public.therapist_application_sessions from public,anon,authenticated;
grant all on public.therapist_application_sessions to service_role;

create or replace function private.enqueue_therapist_application_invite()
returns trigger language plpgsql security definer set search_path = ''
as $fn$
declare v_email text;
begin
  -- New submissions only, no automatic emailing of existing website or Indeed applicants.
  if new.submission_type<>'clinician_application'
     or new.source_system<>'website'
     or new.consent is distinct from true
     or new.payload->>'source'<>'clinician_interest_form'
  then return new; end if;
  v_email := lower(btrim(coalesce(new.payload->>'email','')));
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
     or v_email like 'info+%@valorwell.org'
     or v_email='info@valorwell.org'
  then return new; end if;
  insert into public.therapist_application_invites
    (tenant_id,submission_id,email,invite_token,expires_at)
  values
    (new.tenant_id,new.id,v_email,
      replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),
      clock_timestamp()+interval '7 days')
  on conflict(submission_id) do nothing;
  return new;
end $fn$;
revoke all on function private.enqueue_therapist_application_invite()
 from public,anon,authenticated;
drop trigger if exists enqueue_therapist_application_invite on public.website_submissions;
create trigger enqueue_therapist_application_invite
 after insert on public.website_submissions
 for each row execute function private.enqueue_therapist_application_invite();
