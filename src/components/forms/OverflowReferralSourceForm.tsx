import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Loader2,
  X,
} from "lucide-react";
import {
  billingHubSupabase,
  createWebsiteSubmissionKey,
} from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const OVERFLOW_PROGRAM_OPTIONS = [
  ["champva", "CHAMPVA"],
  ["vaccn", "VA Community Care Network (VACCN)"],
  ["tricare", "TRICARE"],
] as const;

type ProgramCode = (typeof OVERFLOW_PROGRAM_OPTIONS)[number][0];

const formSchema = z.object({
  practiceName: z.string().trim().min(1, "Practice name is required.").max(200),
  primaryContactName: z
    .string()
    .trim()
    .min(1, "Primary contact name is required.")
    .max(200),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255),
  phone: z.string().trim().max(40).optional(),
  credentialedPrograms: z
    .array(z.enum(["champva", "vaccn", "tricare"]))
    .min(1, "Select at least one program."),
  companyWebsite: z.string().max(200).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function OverflowReferralSourceForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      practiceName: "",
      primaryContactName: "",
      email: "",
      phone: "",
      credentialedPrograms: [],
      companyWebsite: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);

    const { data: response, error } = await billingHubSupabase.rpc(
      "submit_overflow_referral_source",
      {
        p_payload: {
          practice_name: data.practiceName.trim(),
          primary_contact_name: data.primaryContactName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.trim() || null,
          credentialed_programs: data.credentialedPrograms,
          company_website: data.companyWebsite?.trim() ?? "",
          submission_key: createWebsiteSubmissionKey(),
          source_page: "/clinicians",
          user_agent:
            typeof navigator === "undefined"
              ? null
              : navigator.userAgent.slice(0, 500),
        },
      },
    );

    if (error || response?.success !== true) {
      setSubmitError(
        "We could not add your practice right now. Please try again.",
      );
      return;
    }

    setIsSubmitted(true);
  };

  const closeForm = () => {
    reset();
    setSubmitError(null);
    setIsOpen(false);
  };

  return (
    <div className="border border-[color:var(--cl-evergreen)]/25 bg-white/45 shadow-sm">
      <div className="grid min-w-0 gap-8 p-7 md:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Building2
              className="h-6 w-6 text-[color:var(--cl-ember)]"
              aria-hidden="true"
            />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--cl-ember)]">
              Independent Practices
            </p>
          </div>
          <h2 className="mt-5 max-w-4xl text-2xl font-bold leading-tight md:text-4xl">
            Already credentialed with VACCN, CHAMPVA, or TRICARE?
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-relaxed text-[color:var(--cl-ink)]/75 md:text-lg">
            Register your independent practice as a possible overflow referral
            option when ValorWell cannot accept a veteran or family member.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-[color:var(--cl-ink)]/60">
            This does not create a ValorWell login, clinician account, employment
            relationship, contractor relationship, or credentialing relationship.
          </p>
        </div>

        {!isOpen && !isSubmitted ? (
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            className="min-h-12 w-full whitespace-normal rounded-none bg-[color:var(--cl-evergreen)] px-7 py-3 text-center text-sm font-bold uppercase leading-snug tracking-wide text-[color:var(--cl-canvas)] hover:bg-[color:var(--cl-ink)] sm:w-auto"
          >
            Join the Overflow Referral Network
            <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {isSubmitted ? (
        <div
          role="status"
          className="border-t border-[color:var(--cl-evergreen)]/20 bg-[color:var(--cl-evergreen)] p-8 text-center text-[color:var(--cl-canvas)] md:p-10"
        >
          <CheckCircle2
            className="mx-auto h-12 w-12 text-[color:var(--cl-ember)]"
            aria-hidden="true"
          />
          <h3 className="mt-5 text-2xl font-bold">
            Your practice has been added to our overflow referral reference list.
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-[color:var(--cl-canvas)]/75">
            ValorWell may contact you to confirm program participation, current
            capacity, and referral details before sending a patient.
          </p>
        </div>
      ) : null}

      {isOpen && !isSubmitted ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border-t border-[color:var(--cl-evergreen)]/20 bg-[color:var(--cl-ink)] p-7 text-[color:var(--cl-canvas)] md:p-10"
          noValidate
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Register your practice</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[color:var(--cl-canvas)]/70">
                Only select programs for which the practice is already fully
                credentialed and currently able to accept eligible patients.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-[color:var(--cl-canvas)]/25 text-[color:var(--cl-canvas)]/75 hover:bg-[color:var(--cl-canvas)]/10"
              aria-label="Close overflow referral form"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="overflow-practice-name"
                className="text-[color:var(--cl-canvas)]"
              >
                Practice name
              </Label>
              <Input
                id="overflow-practice-name"
                autoComplete="organization"
                className="mt-2 border-[color:var(--cl-canvas)]/30 bg-[color:var(--cl-canvas)] text-[color:var(--cl-ink)]"
                aria-invalid={Boolean(errors.practiceName)}
                {...register("practiceName")}
              />
              {errors.practiceName ? (
                <p className="mt-2 text-sm text-[color:var(--cl-ember)]">
                  {errors.practiceName.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label
                htmlFor="overflow-contact-name"
                className="text-[color:var(--cl-canvas)]"
              >
                Primary contact name
              </Label>
              <Input
                id="overflow-contact-name"
                autoComplete="name"
                className="mt-2 border-[color:var(--cl-canvas)]/30 bg-[color:var(--cl-canvas)] text-[color:var(--cl-ink)]"
                aria-invalid={Boolean(errors.primaryContactName)}
                {...register("primaryContactName")}
              />
              {errors.primaryContactName ? (
                <p className="mt-2 text-sm text-[color:var(--cl-ember)]">
                  {errors.primaryContactName.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label
                htmlFor="overflow-email"
                className="text-[color:var(--cl-canvas)]"
              >
                Email
              </Label>
              <Input
                id="overflow-email"
                type="email"
                autoComplete="email"
                className="mt-2 border-[color:var(--cl-canvas)]/30 bg-[color:var(--cl-canvas)] text-[color:var(--cl-ink)]"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-2 text-sm text-[color:var(--cl-ember)]">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label
                htmlFor="overflow-phone"
                className="text-[color:var(--cl-canvas)]"
              >
                Phone (optional)
              </Label>
              <Input
                id="overflow-phone"
                type="tel"
                autoComplete="tel"
                className="mt-2 border-[color:var(--cl-canvas)]/30 bg-[color:var(--cl-canvas)] text-[color:var(--cl-ink)]"
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="mt-2 text-sm text-[color:var(--cl-ember)]">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>
          </div>

          <fieldset className="mt-7">
            <legend className="text-sm font-semibold text-[color:var(--cl-canvas)]">
              Fully credentialed to accept patients through
            </legend>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {OVERFLOW_PROGRAM_OPTIONS.map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-start gap-3 border border-[color:var(--cl-canvas)]/20 p-4 text-sm leading-relaxed hover:bg-[color:var(--cl-canvas)]/5"
                >
                  <input
                    type="checkbox"
                    value={value}
                    className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--cl-ember)]"
                    {...register("credentialedPrograms")}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {errors.credentialedPrograms ? (
              <p className="mt-2 text-sm text-[color:var(--cl-ember)]">
                {errors.credentialedPrograms.message}
              </p>
            ) : null}
          </fieldset>

          <div
            className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
            aria-hidden="true"
          >
            <Label htmlFor="overflow-company-website">Company website</Label>
            <Input
              id="overflow-company-website"
              tabIndex={-1}
              autoComplete="off"
              {...register("companyWebsite")}
            />
          </div>

          {submitError ? (
            <p
              role="alert"
              className="mt-6 border border-[color:var(--cl-ember)]/50 bg-[color:var(--cl-ember)]/10 p-4 text-sm"
            >
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 min-h-12 rounded-none bg-[color:var(--cl-ember)] px-7 text-sm font-bold uppercase tracking-wide text-white hover:bg-[color:var(--cl-canvas)] hover:text-[color:var(--cl-ink)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Adding practice…
              </>
            ) : (
              "Add My Practice"
            )}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
