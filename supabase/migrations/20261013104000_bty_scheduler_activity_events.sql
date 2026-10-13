-- Applied to Billing Hub via Supabase migration bty_scheduler_activity_funnel_20261013.
-- Source-controlled schema for the BTY funnel telemetry.
CREATE TABLE IF NOT EXISTS public.bty_scheduler_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  visitor_session_id uuid NOT NULL,
  booking_attempt_id uuid,
  event_type text NOT NULL CHECK (event_type IN
    ('page_opened','invitation_verified','invitation_rejected','availability_viewed',
     'slot_selected','booking_submitted','booking_confirmed','booking_failed',
     'booking_client_error','booking_crm_sync_warning')),
  organization_id uuid,
  contact_id uuid,
  opportunity_id uuid,
  meeting_type text CHECK (meeting_type IN ('pre_interview','bty_interview')),
  requested_start_utc timestamptz,
  failure_stage text,
  failure_code text,
  http_status integer,
  calendar_event_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bty_scheduler_events_time_idx
  ON public.bty_scheduler_activity_events(tenant_id,created_at DESC);
CREATE INDEX IF NOT EXISTS bty_scheduler_events_session_idx
  ON public.bty_scheduler_activity_events(visitor_session_id,created_at);
CREATE INDEX IF NOT EXISTS bty_scheduler_events_org_idx
  ON public.bty_scheduler_activity_events(organization_id,created_at DESC)
  WHERE organization_id IS NOT NULL;
ALTER TABLE public.bty_scheduler_activity_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bty_scheduler_activity_events FROM anon,authenticated;
GRANT SELECT ON public.bty_scheduler_activity_events TO authenticated;
DO $migration$ BEGIN
 IF NOT EXISTS (
   SELECT 1 FROM pg_policies
   WHERE schemaname='public' AND tablename='bty_scheduler_activity_events'
     AND policyname='bty_scheduler_events_crm_read'
 ) THEN
   CREATE POLICY bty_scheduler_events_crm_read
   ON public.bty_scheduler_activity_events FOR SELECT TO authenticated
   USING(EXISTS(
     SELECT 1 FROM public.crm_user_capabilities cap
     WHERE cap.profile_id=(SELECT auth.uid())
       AND cap.tenant_id=bty_scheduler_activity_events.tenant_id
       AND cap.crm_role<>'crm_none'::public.crm_capability_role
   ));
 END IF;
END $migration$;