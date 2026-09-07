import { useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  Network,
  Users,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { ClinicianFitCheck } from "@/components/clinicians/ClinicianFitCheck";
import { ClinicianInterestForm } from "@/components/forms/ClinicianInterestForm";
import { trackHomeEvent } from "@/lib/tracking";

const jobPostingSchema = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "Licensed Mental Health Therapist",
  description:
    "Join ValorWell as an independently licensed telehealth mental-health clinician serving veterans and military families. Clinicians control their availability and clinical work while ValorWell manages credentialing, authorizations, billing, and payer administration. Straightforward per-session compensation is paid weekly, including no-shows.",
  hiringOrganization: {
    "@type": "Organization",
    name: "ValorWell",
    sameAs: "https://www.valorwell.org",
    logo: "https://www.valorwell.org/brand/valorwell-logo.png",
  },
  employmentType: "CONTRACTOR",
  jobLocationType: "TELECOMMUTE",
  applicantLocationRequirements: {
    "@type": "Country",
    name: "United States",
  },
  datePosted: "2026-07-19",
  validThrough: "2026-12-31",
  qualifications:
    "Independently licensed mental health clinician (LCSW, LPC, LMFT, or Psychologist). Experience with trauma-informed care preferred.",
  responsibilities:
    "Provide telehealth mental-health care within the clinician's license and scope, make independent clinical decisions, and complete timely required clinical documentation.",
  industry: "Mental Health Care",
  occupationalCategory: "Mental Health Counselors",
};

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.22em] ${
        light ? "text-[#D7A92E]" : "text-[#3B5147]"
      }`}
    >
      {children}
    </p>
  );
}

export default function Clinicians() {
  const [showApplication, setShowApplication] = useState(false);

  const scrollToFitCheck = () => {
    trackHomeEvent("clinician_fit_check_started", { page: "clinicians" });
    document
      .getElementById("clinician-fit-check")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const revealApplication = () => {
    setShowApplication(true);
    window.setTimeout(() => {
      document
        .getElementById("raise-your-hand")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  const skipToApply = () => {
    trackHomeEvent("clinician_skip_to_apply", { page: "clinicians", source: "hero" });
    revealApplication();
  };

  return (
    <div className="clinicians-theme bg-[#F4F1E8] text-[#111814]">
      <Layout>
        <SEO
          title="Telehealth Mental Health Clinician Opportunities | ValorWell"
          description="Join ValorWell's clinician network with control over your schedule and clinical work, weekly per-session pay, paid no-shows, and ValorWell-managed credentialing, authorizations, and billing."
          canonical="/clinicians"
        />
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(jobPostingSchema)}</script>
        </Helmet>
        <BreadcrumbSchema
          items={[
            { name: "Home", url: "/" },
            { name: "Clinicians", url: "/clinicians" },
          ]}
        />

        <section className="relative overflow-hidden border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-28 -top-36 h-[30rem] w-[30rem] rounded-full bg-[#D7A92E]/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-36 h-[30rem] w-[30rem] rounded-full bg-[#3B5147]/10 blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:py-28">
            <div className="lg:col-span-7">
              <Eyebrow>Licensed Mental Health Clinicians</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                You handle the therapy. We handle almost everything else.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/72 md:text-xl">
                Choose when you work, how much you work, who you treat, and how
                you practice. ValorWell handles credentialing, authorizations,
                billing, payer administration, and the infrastructure surrounding
                your care.
              </p>
              <p className="mt-7 max-w-3xl text-xl font-bold leading-8 text-[#3B5147] md:text-2xl">
                Hundreds of veterans and family members are already waiting for
                clinicians across the country.
              </p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#111814]/65">
                You don't have to change your career to help. You just have to
                decide how much room you want to make.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={scrollToFitCheck}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#3B5147] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#111814] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
                >
                  See If ValorWell Fits the Way I Practice
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={skipToApply}
                  className="inline-flex min-h-12 items-center justify-center px-5 py-3 text-sm font-bold text-[#3B5147] underline decoration-[#3B5147]/35 underline-offset-4 transition hover:decoration-[#3B5147] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
                >
                  Skip to Apply
                </button>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#111814]/55">
                Independently licensed clinicians only · Telehealth-first · 1099
                independent contractor relationship
              </p>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-3xl border border-[#3B5147]/15 bg-[#111814] p-7 text-white shadow-2xl md:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D7A92E]">
                  The Demand Is Already Here
                </p>
                <div className="mt-7 divide-y divide-white/12 border-y border-white/12">
                  <div className="py-6">
                    <p className="text-4xl font-bold md:text-5xl">Hundreds</p>
                    <p className="mt-2 leading-7 text-white/65">
                      Veterans and family members currently waiting for care.
                    </p>
                  </div>
                  <div className="py-6">
                    <p className="text-2xl font-bold">Virtually every state</p>
                    <p className="mt-2 leading-7 text-white/65">
                      Current or emerging clinician need as Community Care expands.
                    </p>
                  </div>
                  <div className="py-6">
                    <p className="text-2xl font-bold">Your schedule</p>
                    <p className="mt-2 leading-7 text-white/65">
                      You decide how much availability you give us and when.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-4xl">
              <Eyebrow light>Why ValorWell Exists</Eyebrow>
              <h2 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
                Two groups are looking for each other. We built the bridge.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
              <article className="rounded-3xl border border-white/12 bg-white/[0.05] p-7 md:p-8">
                <HeartHandshake className="h-7 w-7 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/50">Therapists</p>
                <h3 className="mt-3 text-2xl font-bold">Want to serve this population without mastering the system around it.</h3>
                <p className="mt-4 leading-7 text-white/65">
                  Keep control of your practice without taking on VA bureaucracy,
                  credentialing, authorizations, and billing yourself.
                </p>
              </article>

              <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
                <ArrowRight className="h-7 w-7 text-[#D7A92E]" />
              </div>

              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#3B5147] p-7 md:p-8">
                <Network className="h-7 w-7 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/55">ValorWell</p>
                <h3 className="mt-3 text-2xl font-bold">Handles the machinery that makes the relationship possible.</h3>
                <p className="mt-4 leading-7 text-white/72">
                  Credentialing · Authorizations · Billing · Payer administration ·
                  Technology · Scheduling infrastructure
                </p>
              </article>

              <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
                <ArrowRight className="h-7 w-7 text-[#D7A92E]" />
              </div>

              <article className="rounded-3xl border border-white/12 bg-white/[0.05] p-7 md:p-8">
                <Users className="h-7 w-7 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/50">Veterans + Families</p>
                <h3 className="mt-3 text-2xl font-bold">Are already looking for clinicians who have room to say yes.</h3>
                <p className="mt-4 leading-7 text-white/65">
                  Hundreds are waiting today, with need across the country as
                  access expands.
                </p>
              </article>
            </div>

            <div className="mt-12 max-w-4xl border-l-4 border-[#D7A92E] pl-6 md:pl-8">
              <p className="text-2xl font-bold leading-tight md:text-3xl">
                ValorWell is not here to practice therapy. We're here to serve the therapists who do.
              </p>
              <p className="mt-4 text-lg leading-8 text-white/68">
                We believe the best way for ValorWell to support veterans and
                their families is to support the clinicians who actually see
                them, assess them, and decide what their care should look like.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow>We Trust the License</Eyebrow>
              <h2 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
                You've already proved you can make clinical decisions. We're not going to pretend we know better.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-5 text-lg leading-8 text-[#111814]/70">
                <p>
                  Independently licensed clinicians have already met the
                  education, examination, supervision, and professional
                  requirements necessary to practice. Licensing and credentialing
                  bodies whose job is to make that determination have decided
                  that you are qualified.
                </p>
                <p className="text-2xl font-bold text-[#111814]">
                  We think that should mean something.
                </p>
                <p>
                  You're also the person actually sitting with the client. You
                  hear what they say. You perform the assessment. You understand
                  the clinical picture.
                </p>
                <p>
                  Within the legal, ethical, and professional requirements of
                  your license, the direction of treatment belongs to you.
                  ValorWell supports your judgment on clinical fit, diagnosis,
                  modality, treatment planning, frequency, referrals, discharge,
                  and the direction of care.
                </p>
              </div>

              <div className="mt-8 rounded-3xl bg-[#F4F1E8] p-7 md:p-9">
                <div className="flex items-start gap-4">
                  <BadgeCheck className="mt-1 h-7 w-7 shrink-0 text-[#3B5147]" aria-hidden="true" />
                  <div>
                    <p className="text-xl font-bold">
                      ValorWell does not substitute administrative judgment for clinical judgment.
                    </p>
                    <p className="mt-3 leading-7 text-[#111814]/65">
                      Our job is not to practice over your shoulder. Our job is
                      to make it easier for you to practice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="clinician-fit-check"
          className="scroll-mt-24 border-b border-white/10 bg-[#3B5147] text-white"
        >
          <div className="container-wide py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Eyebrow light>The ValorWell Fit Check</Eyebrow>
              <h2 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
                We built ValorWell around a few beliefs about how clinicians should be treated. Do you agree?
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70">
                ValorWell won't be the right environment for every clinician—and
                that's okay. See whether the way we operate matches the way you
                want to practice.
              </p>
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-white/55">
                7 principles · About 60 seconds
              </p>
            </div>

            <div className="mt-12">
              <ClinicianFitCheck onApply={revealApplication} />
            </div>
          </div>
        </section>

        {showApplication ? (
          <section
            id="raise-your-hand"
            className="scroll-mt-24 bg-[#111814] text-white"
          >
            <div className="container-wide py-20 md:py-28">
              <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-5">
                  <Eyebrow light>Ready to Talk?</Eyebrow>
                  <h2 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
                    Raise your hand.
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-white/72">
                    You don't need to complete a full clinical application right
                    now. Start with your name and email. We'll send you what you
                    need to review the opportunity and continue the process.
                  </p>
                  <div className="mt-8 space-y-4 border-t border-white/15 pt-7 text-sm leading-6 text-white/60">
                    <p>Independently licensed clinicians only.</p>
                    <p>
                      ValorWell clinicians are non-exclusive 1099 independent
                      contractors and maintain their own malpractice coverage.
                    </p>
                    <p>
                      Straightforward per-session compensation is paid weekly.
                      Caseload volume is not guaranteed.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <ClinicianInterestForm />
                </div>
              </div>

              <div className="mt-14 grid gap-4 border-t border-white/12 pt-10 md:grid-cols-3">
                {[
                  ["01", "Raise your hand", "Start with your name and email."],
                  ["02", "Send your professional information", "We verify qualification and manage the credentialing process."],
                  ["03", "Set your availability", "Once approved and ready, decide what hours you want to offer."],
                ].map(([number, title, body]) => (
                  <div key={number} className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
                    <p className="text-xs font-bold tracking-[0.16em] text-[#D7A92E]">{number}</p>
                    <p className="mt-4 text-lg font-bold">{title}</p>
                    <p className="mt-2 leading-6 text-white/60">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-[#111814] text-white">
            <div className="container-wide flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#D7A92E]">Already Know You're Interested?</p>
                <p className="mt-2 text-xl font-bold">You can skip the Fit Check and raise your hand now.</p>
              </div>
              <button
                type="button"
                onClick={skipToApply}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#111814] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
              >
                Skip to Apply
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </Layout>
    </div>
  );
}
