CREATE TABLE public.therapist_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  source_submission_id uuid REFERENCES public.website_submissions(id) ON DELETE SET NULL,
  provider_applicant_id uuid,
  first_name text,
  last_name text,
  license_category text,
  states text[] NOT NULL DEFAULT '{}',
  license_numbers jsonb NOT NULL DEFAULT '{}'::jsonb,
  npi text,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE UNIQUE INDEX therapist_applications_email_unique ON public.therapist_applications (tenant_id, lower(email));
GRANT ALL ON public.therapist_applications TO service_role;
ALTER TABLE public.therapist_applications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.touch_therapist_applications_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER touch_therapist_applications_updated_at BEFORE UPDATE ON public.therapist_applications FOR EACH ROW EXECUTE FUNCTION public.touch_therapist_applications_updated_at();

CREATE TABLE public.therapist_application_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX therapist_application_codes_email_idx ON public.therapist_application_codes (tenant_id, lower(email), created_at DESC);
GRANT ALL ON public.therapist_application_codes TO service_role;
ALTER TABLE public.therapist_application_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.therapist_application_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  submission_id uuid NOT NULL REFERENCES public.website_submissions(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  resend_id text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE UNIQUE INDEX therapist_application_invites_submission_unique ON public.therapist_application_invites (tenant_id, submission_id);
GRANT ALL ON public.therapist_application_invites TO service_role;
ALTER TABLE public.therapist_application_invites ENABLE ROW LEVEL SECURITY;