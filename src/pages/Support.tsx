import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { DonateButton } from "@/components/DonateButton";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

const SNAPSHOT_DATE = "September 5, 2026";

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.2em] ${
        light ? "text-[#D7A92E]" : "text-[#3B5147]"
      }`}
    >
      {children}
    </p>
  );
}

function TrackedLink({
  to,
  event,
  children,
  className = "",
}: {
  to: string;
  event: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      onClick={() => trackHomeEvent(event, { page: "support" })}
      className={className}
    >
      {children}
    </Link>
  );
}

export default function Support() {
  useEffect(() => {
    trackHomeEvent("support_page_view", { page: "support" });
  }, []);

  return (
    <Layout>
      <SEO
        title="Support ValorWell | Help Fund Therapy for Veterans"
        description="Support the ValorWell Foundation's donor-funded therapy program and review the dated completed-care impact that the program reports."
        canonical="/support"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Support ValorWell", url: "/support" },
        ]}
      />

      <div className="support-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .support-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .support-theme h1,
          .support-theme h2,
          .support-theme h3,
          .support-theme h4 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden border-b border-white/10 bg-[#111814] text-white">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#D7A92E]/10 blur-3xl" />
            <div className="absolute -bottom-44 -left-36 h-96 w-96 rounded-full bg-[#3B5147]/35 blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:py-28">
            <div className="lg:col-span-7">
              <Eyebrow light>Support the ValorWell Foundation</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                Help fund therapy for veterans who still cannot reach care.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/72 md:text-xl">
                The Foundation supports ValorWell&apos;s donor-funded therapy program for veterans who have sought mental-health care but still do not have an available treatment path.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <DonateButton
                  source="support-hero"
                  utmCampaign="support-valorwell"
                  utmContent="hero"
                  className="min-h-12 bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] transition hover:brightness-95"
                >
                  Donate to the Foundation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </DonateButton>
                <TrackedLink
                  to="/impact"
                  event="support_hero_impact"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Review Impact Methodology
                </TrackedLink>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                  Completed-care snapshot
                </p>
                <p className="mt-5 text-5xl font-bold text-[#D7A92E]">540+</p>
                <p className="mt-2 text-lg font-bold">hours of direct therapy</p>
                <p className="mt-6 border-t border-white/12 pt-6 text-3xl font-bold">45+</p>
                <p className="mt-2 text-sm text-white/65">unique veterans who received donor-funded care</p>
                <p className="mt-5 text-sm text-white/50">Snapshot through {SNAPSHOT_DATE}</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>What Support Has Produced</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Report completed care, not projected impact.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#111814]/65">
                These figures describe completed donor-funded therapy through {SNAPSHOT_DATE}. They do not represent every clinical service or organizational activity operated by ValorWell.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8">
                <Clock className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <p className="mt-6 text-5xl font-bold text-[#3B5147]">540+</p>
                <h3 className="mt-4 text-xl font-bold">hours of direct therapy</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  Direct time between veterans and therapists during completed donor-funded care.
                </p>
              </article>

              <article className="rounded-3xl bg-[#111814] p-8 text-white">
                <Users className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-5xl font-bold text-[#D7A92E]">45+</p>
                <h3 className="mt-4 text-xl font-bold">veterans who received care</h3>
                <p className="mt-3 leading-7 text-white/65">
                  Unique veterans are counted once even when they receive multiple donor-funded sessions.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>How Support Reaches Care</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Donations support the program; completed therapy is the public impact measure.
              </h2>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-8">
                <Stethoscope className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Program flow</h3>
                <div className="mt-5 space-y-4 text-white/72">
                  <p>1. A supporter donates to the ValorWell Foundation.</p>
                  <p>2. Funding is available to the donor-funded therapy program as eligible care opportunities arise.</p>
                  <p>3. A therapist provides an eligible session and is paid for the completed care.</p>
                  <p>4. Completed direct-therapy time is added to the public impact snapshot.</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-6 text-white/55">
                ValorWell uses Zeffy for online donations. Financial accounting and the completed-care impact metric are separate: the public therapy-hour total does not attempt to describe the disposition of every donated dollar.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow>Why the Program Exists</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Some veterans ask for care and still do not reach a therapist.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-lg leading-8 text-[#111814]/68">
              <p>
                VA Community Care can provide treatment outside the VA when eligibility, authorization, network participation, and provider availability align. Veterans can still reach the end of that process without an available therapist.
              </p>
              <p>
                Donor-funded therapy gives ValorWell another treatment-funding path when a veteran has already sought care but the existing path did not produce an available appointment.
              </p>
              <TrackedLink
                to="/impact"
                event="support_impact_detail"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]"
              >
                Read the Impact Methodology
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow light>Before You Donate</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Support care without implying control over care.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/70">
                A donation supports the donor-funded therapy program. It does not reserve a clinician, purchase a referral, select a patient, guarantee an appointment, or guarantee a clinical outcome.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                ["Completed care", "Impact figures are updated from therapy that has already been delivered, not projected sessions."],
                ["Clinical independence", "Treatment decisions remain with the treating clinician and the applicable care process."],
                ["Program availability", "Care remains subject to clinician availability, capacity, clinical fit, and program requirements."],
              ].map(([title, copy]) => (
                <article key={title} className="rounded-3xl border border-white/12 bg-white/[0.05] p-7">
                  <CheckCircle2 className="h-7 w-7 text-[#D7A92E]" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-white/65">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <ShieldCheck className="h-9 w-9 text-[#3B5147]" aria-hidden="true" />
            </div>
            <div className="lg:col-span-7">
              <Eyebrow>Reporting Standard</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                The same definitions appear on Support and Impact.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#111814]/68">
                Direct therapy hours, unique veterans, snapshot date, exclusions, and program scope are defined on the Impact page so donor-facing language can be checked against one public methodology.
              </p>
              <TrackedLink
                to="/impact"
                event="support_methodology"
                className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]"
              >
                Review the Current Snapshot
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="bg-[#3B5147] text-white">
          <div className="container-wide py-20 text-center md:py-24">
            <HeartHandshake className="mx-auto h-10 w-10 text-[#D7A92E]" aria-hidden="true" />
            <Eyebrow light>Support Care</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
              Help fund additional therapy through the ValorWell Foundation.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <DonateButton
                source="support-final"
                utmCampaign="support-valorwell"
                utmContent="final"
                className="min-h-12 bg-white px-6 py-3 text-sm font-bold text-[#3B5147] hover:bg-[#F4F1E8]"
              >
                Donate to the ValorWell Foundation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </DonateButton>
              <TrackedLink
                to="/impact"
                event="support_final_impact"
                className="inline-flex min-h-12 items-center rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white"
              >
                View Impact
              </TrackedLink>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
