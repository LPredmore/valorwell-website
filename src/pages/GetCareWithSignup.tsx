import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import GetCare from "./GetCare";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  billingHubSupabase,
  createWebsiteSubmissionKey,
} from "@/integrations/supabase/client";
import {
  CLIENT_SIGNUP_FORM_ID,
  CLIENT_SIGNUP_FORM_NAME,
  trackClientSignupSuccess,
} from "@/lib/clientSignupConversionTracking";

const CLIENT_PORTAL_URL = "https://client.valorwell.org/auth";
const CLIENT_PORTAL_HOSTS = new Set([
  "client.valorwell.org",
  "clients.valorwell.org",
]);

interface SignupFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
}

const initialForm: SignupFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  website: "",
};

export default function GetCareWithSignup() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SignupFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionId = useMemo(() => createWebsiteSubmissionKey(), [open]);

  // Direct entry point (/get-care?signup=1) so Google Ads' guided conversion
  // setup can load the page with the signup form already open.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("signup") === "1" || params.get("form") === "signup") {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const interceptCareSignup = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (
        !anchor ||
        anchor.dataset.directPortal === "true" ||
        !anchor.closest(".clinicians-theme")
      ) {
        return;
      }

      try {
        const destination = new URL(anchor.href, window.location.href);
        if (!CLIENT_PORTAL_HOSTS.has(destination.hostname)) return;
        event.preventDefault();
        setError(null);
        setOpen(true);
      } catch {
        // Leave malformed or non-HTTP links to the browser.
      }
    };

    document.addEventListener("click", interceptCareSignup);
    return () => document.removeEventListener("click", interceptCareSignup);
  }, []);

  const closeModal = () => {
    if (submitting) return;
    setOpen(false);
    setSubmitted(false);
    setError(null);
    setForm(initialForm);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }
    closeModal();
  };

  const updateField = (field: keyof SignupFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const { data, error: functionError } = await billingHubSupabase.functions
        .invoke("register-client-website", {
          body: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            website: form.website,
            submissionId,
          },
        });

      if (functionError) throw functionError;

      // Billing Hub is authoritative about whether this request created a new
      // account. Existing accounts, repeated requests, and honeypot submissions
      // may receive the same generic public success message but must not count
      // as new Google Ads leads.
      if (data?.conversionEligible === true) {
        trackClientSignupSuccess(submissionId);
      }

      if (!data?.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "We could not create your account. Please try again.",
        );
      }

      setSubmitted(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="pb-24 sm:pb-0">
        <GetCare />
      </div>

      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-4 right-4 z-40 min-h-12 justify-center rounded-full px-6 font-bold shadow-2xl sm:left-auto sm:right-5"
      >
        Start CHAMPVA Intake
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-h-[92vh] w-[calc(100%-2rem)] max-w-xl gap-0 overflow-y-auto rounded-2xl border-0 bg-white p-6 shadow-2xl md:p-8"
          onEscapeKeyDown={(event) => {
            if (submitting) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (submitting) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (submitting) event.preventDefault();
          }}
        >
          {submitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-8 w-8 text-emerald-700" aria-hidden="true" />
              </div>
              <DialogTitle
                id="client-signup-title"
                className="mt-5 text-3xl font-bold leading-tight text-slate-950"
              >
                Check your email to continue
              </DialogTitle>
              <DialogDescription className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
                We sent secure account-access instructions to the email address
                you provided. Open that message, choose your password, and then
                continue your registration in the ValorWell client portal.
              </DialogDescription>
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm text-emerald-950">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p>
                    The email contains a one-time secure link. ValorWell will not
                    email you a reusable password.
                  </p>
                </div>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button type="button" onClick={closeModal} variant="outline">
                  Return to Get Care
                </Button>
                <Button asChild>
                  <a href={CLIENT_PORTAL_URL} data-direct-portal="true">
                    Go to Client Login
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="pr-10 text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
                Secure initial signup
              </p>
              <DialogTitle
                id="client-signup-title"
                className="mt-3 pr-10 text-3xl font-bold leading-tight text-slate-950"
              >
                Create your ValorWell client account
              </DialogTitle>
              <DialogDescription className="mt-3 text-base leading-relaxed text-slate-600">
                Complete this brief first step here. We will email you a secure
                one-time link so you can choose a password and continue the full
                intake inside the client portal.
              </DialogDescription>

              <form
                id={CLIENT_SIGNUP_FORM_ID}
                name={CLIENT_SIGNUP_FORM_NAME}
                onSubmit={submitSignup}
                className="mt-7 space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="signup-first-name">First name</Label>
                    <Input
                      id="signup-first-name"
                      autoComplete="given-name"
                      required
                      maxLength={80}
                      value={form.firstName}
                      onChange={(event) =>
                        updateField("firstName", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-last-name">Last name</Label>
                    <Input
                      id="signup-last-name"
                      autoComplete="family-name"
                      required
                      maxLength={80}
                      value={form.lastName}
                      onChange={(event) =>
                        updateField("lastName", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone number</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={40}
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </div>

                <div
                  className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <Label htmlFor="signup-website">Website</Label>
                  <Input
                    id="signup-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) =>
                      updateField("website", event.target.value)
                    }
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
                  >
                    {error}
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                    <p>
                      Submitting creates only your account. The rest of your
                      registration and intake remains inside the secure client
                      portal.
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="min-h-12 w-full font-bold">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Creating your account...
                    </>
                  ) : (
                    "Create Account and Email Instructions"
                  )}
                </Button>

                <p className="text-center text-xs leading-relaxed text-slate-500">
                  By continuing, you agree that ValorWell may use this contact
                  information to create your client account and send account-access
                  instructions. Care remains subject to eligibility, licensure,
                  availability, capacity, and clinical fit.
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
