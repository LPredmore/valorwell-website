import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Building2,
  HeartHandshake,
  Network,
  PlayCircle,
  Stethoscope,
  Users,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, OrganizationSchema } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

const LATEST_BTY_VIDEO_URL = "https://www.youtube.com/watch?v=A4CUe3c8rJE";
const LATEST_BTY_THUMBNAIL = "https://i.ytimg.com/vi/A4CUe3c8rJE/maxresdefault.jpg";

const featuredOrganizations = [
  ["Veterans Breakfast Club", "/veteransbreakfastclub"],
  ["GallantFew", "/gallantfew"],
  ["VETS2INDUSTRY", "/vets2industry"],
  ["Veterans Outreach of Wisconsin", "/VOW"],
  ["Military Missions in Action", "/mmia"],
] as const;

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
    <Link to={to} onClick={() => trackHomeEvent(event)} className={className}>
      {children}
    </Link>
  );
}

export default function HomePage() {
  useEffect(() => {
    trackHomeEvent("homepage_view");
  }, []);

  return (
    <Layout>
      <SEO
        title="ValorWell | Mental Health Care for Veterans & Military Families"
        description="ValorWell provides telehealth mental health care pathways for veterans and military families, donor-funded therapy for veterans, and Beyond The Yellow community conversations."
        canonical="/"
      />
      <OrganizationSchema />

      <div className="home-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .home-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .home-theme h1,
          .home-theme h2,
          .home-theme h3,
          .home-theme h4 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-36 -top-40 h-96 w-96 rounded-full bg-[#3B5147]/[0.07] blur-3xl" />
            <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#D7A92E]/[0.08] blur-3xl" />
          </div>

          <div className="container-wide relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-12 lg:py-28">
            <div className="lg:col-span-7">
              <Eyebrow>ValorWell</Eyebrow>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.03] text-[#111814] sm:text-5xl md:text-6xl lg:text-7xl">
                Mental health care and support for veterans and military families.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#111814]/70 md:text-xl">
                ValorWell operates telehealth care pathways, supports donor-funded therapy for veterans who still cannot reach care, and publishes Beyond The Yellow conversations with organizations doing useful work.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <TrackedLink
                  to="/get-care"
                  event="homepage_hero_care"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#31443B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
                >
                  Find Care
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  to="/about"
                  event="homepage_hero_about"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#3B5147]/35 px-6 py-3 text-sm font-bold text-[#3B5147] transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
                >
                  Explore ValorWell
                </TrackedLink>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-3xl bg-[#111814] p-8 text-white shadow-xl md:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                  2026 completed-care snapshot
                </p>
                <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <p className="text-5xl font-bold text-[#D7A92E]">540+</p>
                    <p className="mt-2 text-sm leading-6 text-white/65">hours of direct donor-funded therapy</p>
                  </div>
                  <div className="border-t border-white/12 pt-6 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                    <p className="text-5xl font-bold">45+</p>
                    <p className="mt-2 text-sm leading-6 text-white/65">unique veterans who received donor-funded care</p>
                  </div>
                </div>
                <p className="mt-7 border-t border-white/12 pt-5 text-sm leading-6 text-white/55">
                  Snapshot through September 5, 2026. Counts completed direct therapy; see the Impact page for definitions and scope.
                </p>
                <TrackedLink
                  to="/impact"
                  event="homepage_hero_impact_methodology"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white"
                >
                  Review Impact Methodology
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-8 py-10 md:py-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">
                Looking for care?
              </p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                Start with the coverage and care pathway that applies to you.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5">
              <div className="rounded-xl border border-white/15 bg-white/[0.07] p-4">
                <p className="text-sm font-bold">CHAMPVA</p>
                <p className="mt-1 text-xs leading-5 text-white/65">
                  Telehealth care is available subject to clinician availability and fit.
                </p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/[0.07] p-4">
                <p className="text-sm font-bold">VA Community Care</p>
                <p className="mt-1 text-xs leading-5 text-white/65">
                  Availability depends on authorization, clinician network status, and region.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2 lg:text-right">
              <TrackedLink
                to="/get-care"
                event="homepage_care_options"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-bold text-[#3B5147] transition hover:bg-[#F4F1E8]"
              >
                See Care Options
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>What ValorWell Does</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Care, impact, and community serve different parts of the same mission.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8">
                <Stethoscope className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">Care</p>
                <h3 className="mt-3 text-2xl font-bold">Mental health care and access pathways.</h3>
                <p className="mt-4 leading-7 text-[#111814]/65">
                  Telehealth treatment, clinician infrastructure, coverage pathways, and the operational systems that support care.
                </p>
                <TrackedLink to="/get-care" event="homepage_model_care" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                  Find Care <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>

              <article className="rounded-3xl bg-[#111814] p-8 text-white">
                <HeartHandshake className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">Impact</p>
                <h3 className="mt-3 text-2xl font-bold">Completed donor-funded therapy.</h3>
                <p className="mt-4 leading-7 text-white/65">
                  As of September 5, 2026, the donor-funded program reports 540+ hours of completed direct therapy for 45+ veterans.
                </p>
                <TrackedLink to="/impact" event="homepage_model_impact" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white">
                  See the Impact <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>

              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8">
                <Network className="h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6814]">Community</p>
                <h3 className="mt-3 text-2xl font-bold">Published conversations and featured organizations.</h3>
                <p className="mt-4 leading-7 text-[#111814]/65">
                  Beyond The Yellow gives visitors actual conversations and organization pages to watch, evaluate, and explore.
                </p>
                <TrackedLink to="/beyond-the-yellow" event="homepage_model_bty" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                  Explore Beyond The Yellow <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <Eyebrow light>2026 Impact</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  540+ hours of therapy for 45+ veterans.
                </h2>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">
                  These figures count completed donor-funded time spent directly between veterans and therapists. Administrative work and other operating activity are not included as therapy hours.
                </p>
              </div>
              <div className="lg:col-span-5 lg:text-right">
                <TrackedLink
                  to="/impact"
                  event="homepage_impact_detail"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  View Impact Details
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide grid items-center gap-14 py-20 md:py-28 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <a
                href={LATEST_BTY_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackHomeEvent("homepage_bty_latest_video")}
                className="group block overflow-hidden rounded-3xl border border-[#D7A92E]/30 bg-[#111814] shadow-lg"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={LATEST_BTY_THUMBNAIL}
                    alt="Veterans Breakfast Club Beyond The Yellow conversation"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" aria-hidden="true" />
                  <PlayCircle className="absolute left-5 top-5 h-10 w-10 text-white drop-shadow" aria-hidden="true" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D7A92E]">Latest conversation</p>
                    <p className="mt-2 text-2xl font-bold">Veterans Breakfast Club</p>
                  </div>
                </div>
              </a>
            </div>

            <div className="lg:col-span-6">
              <Eyebrow>Beyond The Yellow</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Explore the work through published conversations and organization pages.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#111814]/68">
                Beyond The Yellow features organizations, founders, volunteers, and community leaders whose work gives people something concrete to participate in, support, or learn from.
              </p>

              <div className="mt-7 border-y border-[#3B5147]/15 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">Featured organizations</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#111814]/70">
                  {featuredOrganizations.map(([name, route]) => (
                    <Link key={name} to={route} className="min-h-11 py-3 hover:text-[#3B5147]">
                      {name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <TrackedLink
                  to="/beyond-the-yellow"
                  event="homepage_bty_explore"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#3B5147] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#31443B]"
                >
                  Explore Beyond The Yellow
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  to="/network"
                  event="homepage_bty_network"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#3B5147]/30 px-5 py-3 text-sm font-bold text-[#3B5147] transition hover:bg-white/60"
                >
                  Featured Organizations
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <Eyebrow>Learn & Navigate</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  Understand the systems around care before you have to navigate them alone.
                </h2>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[#111814]/65">
                  ValorWell resources cover CHAMPVA, VA Community Care, veteran mental health, military-family care, documentation, and related topics.
                </p>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <TrackedLink
                  to="/resources"
                  event="homepage_resources"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#3B5147]/30 px-5 py-3 text-sm font-bold text-[#3B5147]"
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Browse Resources
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>Get Involved</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Choose the role that matches what you can contribute.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <article className="rounded-3xl border border-[#3B5147]/15 bg-white p-8">
                <Users className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Clinicians</h3>
                <p className="mt-4 leading-7 text-[#111814]/64">
                  Join ValorWell&apos;s telehealth clinician network and provide care to veterans and military families.
                </p>
                <TrackedLink to="/clinicians" event="homepage_clinicians" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                  Clinician Opportunities <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>

              <article className="rounded-3xl border border-[#3B5147]/15 bg-white p-8">
                <Building2 className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Organizations</h3>
                <p className="mt-4 leading-7 text-[#111814]/64">
                  Build referral, community, service, or mission-aligned partnerships with ValorWell.
                </p>
                <TrackedLink to="/partner" event="homepage_partner" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                  Partner With ValorWell <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>

              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8">
                <HeartHandshake className="h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Supporters</h3>
                <p className="mt-4 leading-7 text-[#111814]/64">
                  Help fund therapy for veterans who have asked for care but still cannot reach a therapist.
                </p>
                <TrackedLink to="/support" event="homepage_support" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                  Support the Work <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[#111814] text-white">
          <div className="container-wide grid gap-10 py-16 md:py-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <Eyebrow light>Start Here</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Need care, want to understand the work, or looking for a way to participate?
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <TrackedLink to="/get-care" event="homepage_final_care" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#111814]">
                Find Care
              </TrackedLink>
              <TrackedLink to="/about" event="homepage_final_about" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white">
                About ValorWell
              </TrackedLink>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
