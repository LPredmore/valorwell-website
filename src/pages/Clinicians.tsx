import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileText,
  Settings2,
  Stethoscope,
  WalletCards,
  Workflow,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { SEO, JobPostingSchema, BreadcrumbSchema } from "@/components/SEO";
import { ClinicianInterestForm } from "@/components/forms/ClinicianInterestForm";
import { OverflowReferralSourceForm } from "@/components/forms/OverflowReferralSourceForm";

const scrollToInterest = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  document
    .getElementById("raise-your-hand")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--cl-ember)] md:text-xs">
    {children}
  </div>
);

const roleFacts = [
  ["Current pay", "$75 per completed session"],
  ["Pay cadence", "Weekly"],
  ["Schedule", "You set your availability"],
  ["Structure", "1099 · Telehealth-first"],
  ["Billing", "Handled by ValorWell"],
] as const;

const roleFeatures = [
  {
    title: "Set your availability",
    body: "Choose the hours you can sustainably offer. Caseload volume is not guaranteed.",
    icon: CalendarClock,
  },
  {
    title: "Make clinical decisions",
    body: "Assessment, treatment planning, and clinical judgment remain with the independently licensed clinician.",
    icon: Stethoscope,
  },
  {
    title: "Use shared infrastructure",
    body: "ValorWell provides the telehealth, scheduling, documentation, and billing environment around the clinical work.",
    icon: Workflow,
  },
  {
    title: "Get paid weekly",
    body: "Current direct-clinician compensation is $75 for each completed session, paid on a weekly cadence.",
    icon: WalletCards,
  },
] as const;

const onboardingSteps = [
  ["1", "Submit interest", "Share your contact information and basic professional details."],
  ["2", "Review the clinician environment", "Learn about the role, technology, documentation expectations, compensation, and populations served."],
  ["3", "Complete qualification steps", "ValorWell reviews licensing and the additional information required for the clinical role."],
  ["4", "Set up access and availability", "Approved clinicians complete onboarding, configure availability, and begin using the clinical platform."],
] as const;

export default function Clinicians() {
  return (
    <div className="clinicians-theme bg-[color:var(--cl-canvas)] text-[color:var(--cl-ink)]">
      <Layout>
        <SEO
          title="Mental Health Clinician Opportunities — $75 per session"
          description="Join ValorWell's telehealth clinician network: $75 per completed session, weekly pay, flexible availability, billing support, and independent clinical judgment."
          canonical="/clinicians"
        />
        <JobPostingSchema />
        <BreadcrumbSchema
          items={[
            { name: "Home", url: "/" },
            { name: "Clinicians", url: "/clinicians" },
          ]}
        />

        <section className="relative overflow-hidden border-b border-[color:var(--cl-evergreen)]/20">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[color:var(--cl-ember)]/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[color:var(--cl-evergreen)]/10 blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Eyebrow>Licensed Mental Health Clinicians</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.03] tracking-tight md:text-6xl lg:text-7xl">
                Provide telehealth care with a schedule you control.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-relaxed text-[color:var(--cl-ink)]/80 md:text-xl">
                ValorWell contracts with independently licensed mental health clinicians to serve veterans and military families through a telehealth-first clinical environment.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#raise-your-hand"
                  onClick={scrollToInterest}
                  className="inline-flex items-center justify-center gap-2 bg-[color:var(--cl-evergreen)] px-7 py-4 text-sm font-bold uppercase tracking-wide text-[color:var(--cl-canvas)] transition-colors hover:bg-[color:var(--cl-ink)]"
                >
                  Start Clinician Onboarding
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center border border-[color:var(--cl-evergreen)] px-7 py-4 text-sm font-bold uppercase tracking-wide text-[color:var(--cl-evergreen)] transition-colors hover:bg-[color:var(--cl-evergreen)] hover:text-[color:var(--cl-canvas)]"
                >
                  About ValorWell
                </Link>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[color:var(--cl-ink)]/65">
                Independently licensed clinicians only. Current direct-clinician structure is telehealth-first 1099 contract work. Caseload volume is not guaranteed.
              </p>
            </div>

            <aside className="lg:col-span-5">
              <div className="border border-[color:var(--cl-evergreen)]/25 bg-[color:var(--cl-ink)] p-7 text-[color:var(--cl-canvas)] shadow-xl md:p-9">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--cl-ember)]">
                  Role Summary
                </div>
                <dl className="mt-6 divide-y divide-[color:var(--cl-canvas)]/15 border-y border-[color:var(--cl-canvas)]/15">
                  {roleFacts.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[1fr_auto] gap-5 py-5">
                      <dt className="text-sm font-semibold text-[color:var(--cl-canvas)]/65">
                        {label}
                      </dt>
                      <dd className="text-right text-base font-bold text-[color:var(--cl-canvas)] md:text-lg">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-[color:var(--cl-evergreen)]/20 bg-[color:var(--cl-evergreen)] text-[color:var(--cl-canvas)]">
          <div className="container-wide py-16 md:py-20">
            <div className="max-w-3xl">
              <Eyebrow>What the Role Includes</Eyebrow>
              <h2 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
                Clinical work supported by shared operations.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {roleFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="border border-[color:var(--cl-canvas)]/15 bg-[color:var(--cl-canvas)]/[0.06] p-7">
                    <Icon className="h-6 w-6 text-[color:var(--cl-ember)]" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-bold leading-tight">{feature.title}</h3>
                    <p className="mt-3 leading-relaxed text-[color:var(--cl-canvas)]/72">{feature.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-[color:var(--cl-evergreen)]/20 bg-[color:var(--cl-canvas)]">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow>Professional Expectations</Eyebrow>
              <h2 className="mt-6 text-3xl font-bold leading-tight md:text-5xl">
                The clinician owns the clinical work.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-[color:var(--cl-ink)]/72">
                ValorWell supports the surrounding workflow, but clinicians remain responsible for assessment, treatment decisions, timely documentation, professional boundaries, and practicing within their license and scope.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="divide-y divide-[color:var(--cl-evergreen)]/15 border-y border-[color:var(--cl-evergreen)]/15">
                {[
                  [CheckCircle2, "Independent clinical judgment", "Clinical decisions are made by the treating clinician based on the client's needs and the clinician's professional judgment."],
                  [Settings2, "Availability you set", "Clinicians determine the availability they offer rather than accepting a required fixed caseload."],
                  [FileText, "Timely documentation", "Documentation is part of the role and must be completed in the clinical system according to the applicable requirements."],
                  [Workflow, "Shared operations", "ValorWell handles the surrounding platform, scheduling, and billing workflows used by the practice."],
                ].map(([Icon, title, body]) => {
                  const RowIcon = Icon as typeof CheckCircle2;
                  return (
                    <div key={title as string} className="grid gap-3 py-7 sm:grid-cols-[42px_1fr]">
                      <RowIcon className="mt-1 h-6 w-6 text-[color:var(--cl-evergreen)]" aria-hidden="true" />
                      <div>
                        <h3 className="text-xl font-bold">{title as string}</h3>
                        <p className="mt-2 leading-7 text-[color:var(--cl-ink)]/64">{body as string}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[color:var(--cl-evergreen)]/20 bg-[color:var(--cl-ink)] text-[color:var(--cl-canvas)]">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>Onboarding</Eyebrow>
              <h2 className="mt-6 text-3xl font-bold leading-tight md:text-5xl">
                Start with interest, then complete the qualification process.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {onboardingSteps.map(([number, title, body]) => (
                <article key={number} className="border border-[color:var(--cl-canvas)]/15 bg-[color:var(--cl-canvas)]/[0.05] p-7">
                  <p className="text-sm font-bold text-[color:var(--cl-ember)]">{number}</p>
                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-[color:var(--cl-canvas)]/65">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="raise-your-hand"
          className="scroll-mt-24 bg-[color:var(--cl-evergreen)] text-[color:var(--cl-canvas)]"
        >
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--cl-ember)] md:text-xs">
                  Clinician Interest
                </div>
                <h2 className="mt-6 text-3xl font-bold leading-tight md:text-5xl">
                  Interested in joining ValorWell's clinician network?
                </h2>
                <p className="mt-7 text-lg leading-relaxed text-[color:var(--cl-canvas)]/78">
                  Share your contact information to begin. This first step creates a path into the clinician onboarding process so you can review the environment and complete the required qualification steps.
                </p>
                <p className="mt-7 border-t border-[color:var(--cl-canvas)]/20 pt-7 text-sm leading-relaxed text-[color:var(--cl-canvas)]/68">
                  Submitting interest is not the full clinical application and does not guarantee acceptance or caseload volume.
                </p>
              </div>

              <div className="lg:col-span-7">
                <ClinicianInterestForm />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[color:var(--cl-evergreen)]/20 bg-[color:var(--cl-canvas)]">
          <div className="container-wide py-16 md:py-20">
            <OverflowReferralSourceForm />
          </div>
        </section>
      </Layout>
    </div>
  );
}
