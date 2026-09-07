import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  billingHubSupabase,
  createWebsiteSubmissionKey,
} from "@/integrations/supabase/client";
import { trackClinicianInterestRegistered } from "@/lib/clinicianConversionTracking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255),
  communicationConsent: z
    .boolean()
    .refine((value) => value, "Communication consent is required."),
  company: z.string().max(200).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ClinicianInterestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      communicationConsent: false,
      company: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    const submissionKey = createWebsiteSubmissionKey();

    const { data: response, error } = await billingHubSupabase.functions.invoke(
      "register-clinician-interest",
      {
        body: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          communicationConsent: data.communicationConsent,
          company: data.company?.trim() ?? "",
          submissionKey,
        },
      },
    );

    if (error || response?.ok !== true) {
      setSubmitError(
        response?.message ??
          "We could not register your interest right now. Please try again.",
      );
      return;
    }

    trackClinicianInterestRegistered(submissionKey);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div
        role="status"
        className="rounded-3xl border border-white/15 bg-white/[0.06] p-8 text-center md:p-12"
      >
        <CheckCircle2
          className="mx-auto h-14 w-14 text-[#D7A92E]"
          aria-hidden="true"
        />
        <h3 className="mt-6 text-2xl font-bold leading-tight text-white md:text-3xl">
          You raised your hand. We'll take it from here.
        </h3>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/72 md:text-lg">
          Check your email for the next steps and the information you need to
          keep exploring ValorWell as a clinician.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 md:p-9"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="clinician-first-name" className="text-white">
            First name
          </Label>
          <Input
            id="clinician-first-name"
            autoComplete="given-name"
            className="mt-2 border-white/25 bg-white text-[#111814]"
            aria-invalid={Boolean(errors.firstName)}
            {...register("firstName")}
          />
          {errors.firstName ? (
            <p className="mt-2 text-sm text-[#F2B7AA]">
              {errors.firstName.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="clinician-last-name" className="text-white">
            Last name
          </Label>
          <Input
            id="clinician-last-name"
            autoComplete="family-name"
            className="mt-2 border-white/25 bg-white text-[#111814]"
            aria-invalid={Boolean(errors.lastName)}
            {...register("lastName")}
          />
          {errors.lastName ? (
            <p className="mt-2 text-sm text-[#F2B7AA]">
              {errors.lastName.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <Label htmlFor="clinician-email" className="text-white">
          Email
        </Label>
        <Input
          id="clinician-email"
          type="email"
          autoComplete="email"
          className="mt-2 border-white/25 bg-white text-[#111814]"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-2 text-sm text-[#F2B7AA]">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <Label htmlFor="clinician-company">Company</Label>
        <Input
          id="clinician-company"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-white/80">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-[#D7A92E]"
            aria-invalid={Boolean(errors.communicationConsent)}
            {...register("communicationConsent")}
          />
          <span>
            I agree to receive clinician onboarding and recruiting communications
            from ValorWell.
          </span>
        </label>
        {errors.communicationConsent ? (
          <p className="mt-2 text-sm text-[#F2B7AA]">
            {errors.communicationConsent.message}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-[#B24A3A]/60 bg-[#B24A3A]/15 p-4 text-sm text-white"
        >
          {submitError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 min-h-12 w-full rounded-md bg-[#D7A92E] px-7 text-sm font-bold text-[#111814] hover:brightness-95"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          "Raise My Hand"
        )}
      </Button>

      <p className="mt-5 text-xs leading-relaxed text-white/55">
        This first step is for independently licensed clinicians. Registering
        interest is not a full application and does not guarantee acceptance,
        referrals, or caseload volume.
      </p>
    </form>
  );
}
