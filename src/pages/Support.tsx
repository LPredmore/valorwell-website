import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Users,
} from "lucide-react";
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
        description="Support the ValorWell Foundation and help fund direct therapy for veterans who sought mental health care but still could not reach a therapist."
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
                Donor funding allows ValorWell to pay therapists for veterans who sought mental health care through the VA but still did not have an available treatment path.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <TrackedLink
                  to="/donate?vw_entry_source=support-hero&vw_entry_medium=site&vw_entry_campaign=support-valorwell&vw_entry_content=hero"
                  event="support_hero_donate"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] transition hover:brightness-95"
                >
                  Donate to the Foundation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  to="/impact"
                  event="support_hero_impact"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  View Impact Details
                </TrackedLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-sm">
                <HeartHandshake className="h-9 w-9 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                  2026 impact snapshot
                </p>
                <p className="mt-4 text-3xl font-bold leading-snug">
                  540+ hours of direct therapy for 45+ veterans across 11 states.
                </p>
                <p className="mt-4 text-sm text-white/55">As of {SNAPSHOT_DATE}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>2026 Donor-Funded Care</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                What donor funding has paid for so far.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#111814]/65">
                These figures count the donor-funded therapy program through {SNAPSHOT_DATE}. They do not represent every clinical service provided by ValorWell.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8">
                <Clock className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <p className="mt-6 text-5xl font-bold text-[#3B5147]">540+</p>
                <h3 className="mt-4 text-xl font-bold">hours of direct therapy</h3>
              </article>

              <article className="rounded-3xl bg-[#111814] p-8 text-white">
                <Users className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-5xl font-bold text-[#D7A92E]">45+</p>
                <h3 className="mt-4 text-xl font-bold">veterans who received care</h3>
              </article>

              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8">
                <MapPinned className="h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <p className="mt-6 text-5xl font-bold text-[#8A6814]">11</p>
                <h3 className="mt-4 text-xl font-bold">states represented</h3>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>How Donations Are Used</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Foundation funds are used to pay therapists for therapy sessions.
              </h2>
            </div>

            <div className="lg:col-span-7">
              <p className="text-lg leading-8 text-white/75">
                ValorWell and the ValorWell Foundation do not use donated funds for administrative costs, staffing overhead, technology, marketing, or other operating expenses.
              </p>
              <div className="mt-8 rounded-3xl border border-white/15 bg-white/[0.06] p-8">
                <ShieldCheck className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Donation flow</h3>
                <div className="mt-5 space-y-3 text-white/72">
                  <p>1. A supporter donates to the ValorWell Foundation.</p>
                  <p>2. Foundation funds are allocated to eligible donor-funded therapy sessions.</p>
                  <p>3. ValorWell pays the therapist for the completed session.</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-6 text-white/50">
                Third-party payment-processing fees may be deducted before funds are received by the Foundation. ValorWell and the ValorWell Foundation do not retain or redirect donated funds for administrative or other operating costs.
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
                VA Community Care can provide treatment outside the VA when eligibility, authorization, and provider availability align. In practice, veterans can still reach the end of that process without an available therapist.
              </p>
              <p>
                The donor-funded program gives ValorWell another way to pay for treatment when a veteran has already sought care but the existing pathway did not produce an appointment.
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
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <Eyebrow light>Recurring Support</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  Monthly donors make up most of the current supporter base.
                </h2>
                <p className="mt-6 text-lg leading-8 text-white/70">
                  In 2026, 72% of donors give monthly, and $25 is the most common monthly gift. Recurring support helps make future therapy funding more predictable.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
                <article className="rounded-3xl border border-white/12 bg-white/[0.05] p-7">
                  <p className="text-5xl font-bold text-[#D7A92E]">72%</p>
                  <h3 className="mt-4 text-xl font-bold">of 2026 donors give monthly</h3>
                </article>
                <article className="rounded-3xl border border-white/12 bg-white/[0.05] p-7">
                  <p className="text-5xl font-bold text-[#D7A92E]">$25</p>
                  <h3 className="mt-4 text-xl font-bold">most common monthly gift</h3>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#3B5147] text-white">
          <div className="container-wide py-20 text-center md:py-24">
            <HeartHandshake className="mx-auto h-10 w-10 text-[#D7A92E]" aria-hidden="true" />
            <Eyebrow light>Support Care</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
              Help fund additional therapy for veterans who cannot reach care through the pathway available to them.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <TrackedLink
                to="/donate?vw_entry_source=support-final&vw_entry_medium=site&vw_entry_campaign=support-valorwell&vw_entry_content=final"
                event="support_final_donate"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#3B5147] hover:bg-[#F4F1E8]"
              >
                Donate to the ValorWell Foundation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
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
