import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  HeartHandshake,
  Network,
  Stethoscope,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";
import missionCoverAsset from "@/assets/mission-cover-new.png.asset.json";

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
      onClick={() => trackHomeEvent(event, { page: "mission" })}
      className={className}
    >
      {children}
    </Link>
  );
}

export default function MissionPage() {
  useEffect(() => {
    trackHomeEvent("mission_page_view", { page: "mission" });
  }, []);

  return (
    <Layout>
      <SEO
        title="ValorWell Mission | Make Mental Health Support Easier to Reach"
        description="ValorWell works to make mental health care and support easier to reach for veterans and military families while connecting communities around useful action."
        canonical="/mission"
      />

      <div className="mission-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .mission-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .mission-theme h1,
          .mission-theme h2,
          .mission-theme h3,
          .mission-theme h4 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#D7A92E]/[0.09] blur-3xl" />
            <div className="absolute -bottom-48 -left-40 h-[28rem] w-[28rem] rounded-full bg-[#3B5147]/[0.08] blur-3xl" />
          </div>

          <div className="container-wide relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-12 lg:py-28">
            <div className="lg:col-span-7">
              <Eyebrow>Our Mission</Eyebrow>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                Make mental health care and support easier to reach, understand, and use.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#111814]/70 md:text-xl">
                ValorWell focuses on veterans and military families because care often sits behind a complicated mix of coverage rules, provider availability, referrals, authorizations, and handoffs. Our work is designed to reduce that burden and create additional paths when existing ones fail.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <TrackedLink
                  to="/get-care"
                  event="mission_hero_care"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#31443B]"
                >
                  Find Care
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  to="/about"
                  event="mission_hero_about"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#3B5147]/30 px-6 py-3 text-sm font-bold text-[#3B5147] transition hover:bg-white/60"
                >
                  About ValorWell
                </TrackedLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-[#3B5147]/15 bg-white shadow-xl">
                <img
                  src={missionCoverAsset.url}
                  alt="ValorWell mission"
                  className="aspect-[4/5] h-full w-full object-cover lg:aspect-[5/6]"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>The Problem</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                A service can exist and still be difficult to reach.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-lg leading-8 text-white/70">
              <p>
                People seeking mental health care may have to understand eligibility rules, locate an available clinician, obtain authorization, coordinate records, and repeat their story across disconnected systems.
              </p>
              <p>
                When one part of that chain breaks, the practical result can be the same as having no service at all: the person still does not receive care.
              </p>
              <p>
                ValorWell is built around reducing those gaps wherever we can—through treatment, clearer pathways, clinician infrastructure, donor-funded care, and community relationships.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>How the Mission Works</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Care. Impact. Community.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#111814]/65">
                Each area addresses a different part of access and support.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8">
                <Stethoscope className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Care</h3>
                <p className="mt-4 leading-7 text-[#111814]/64">
                  Provide telehealth mental health treatment and maintain the clinician, billing, coverage, and access systems required to support it.
                </p>
                <TrackedLink to="/get-care" event="mission_care" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                  Find Care <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>

              <article className="rounded-3xl bg-[#111814] p-8 text-white">
                <HeartHandshake className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Impact</h3>
                <p className="mt-4 leading-7 text-white/64">
                  Use donor funding to pay for therapy when veterans have sought help through existing systems but still cannot reach a clinician.
                </p>
                <TrackedLink to="/impact" event="mission_impact" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white">
                  See Impact <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>

              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8">
                <Network className="h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Community</h3>
                <p className="mt-4 leading-7 text-[#111814]/64">
                  Use Beyond The Yellow, partnerships, resources, and public content to help people find organizations and opportunities worth engaging with.
                </p>
                <TrackedLink to="/beyond-the-yellow" event="mission_community" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                  Explore Beyond The Yellow <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow>Who We Serve</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Veterans and military family members are both core populations.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-lg leading-8 text-[#111814]/68">
              <p>
                Veterans may need care shaped by military service, transition, trauma, disability, VA access, and the systems around those experiences.
              </p>
              <p>
                Military family members face their own mental health needs, pressures, and coverage questions. Their care is not treated as secondary to the veteran's care.
              </p>
              <p>
                Beyond The Yellow extends the mission into the wider community by highlighting organizations that turn support into programs, services, opportunities, and direct help.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow light>What We Measure</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                The mission has to produce outcomes people can see.
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/70">
                ValorWell tracks donor-funded therapy separately from broader organizational activity so supporters can see what their funding produced. As of September 5, 2026, donor funding had paid for 540+ hours of direct therapy for 45+ veterans.
              </p>
              <TrackedLink
                to="/impact"
                event="mission_measure_impact"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#3B5147]"
              >
                View Impact Details
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="bg-[#111814] text-white">
          <div className="container-wide grid gap-10 py-16 md:py-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <Eyebrow light>Next Step</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Start with care, learn more about the organization, or see where support is going.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <TrackedLink to="/get-care" event="mission_final_care" className="inline-flex min-h-12 items-center rounded-md bg-white px-5 py-3 text-sm font-bold text-[#111814]">
                Find Care
              </TrackedLink>
              <TrackedLink to="/about" event="mission_final_about" className="inline-flex min-h-12 items-center rounded-md border border-white/30 px-5 py-3 text-sm font-bold text-white">
                About ValorWell
              </TrackedLink>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
