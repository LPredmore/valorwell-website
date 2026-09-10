import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Building2,
  HeartHandshake,
  Network,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

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
      onClick={() => trackHomeEvent(event, { page: "about" })}
      className={className}
    >
      {children}
    </Link>
  );
}

export default function AboutPage() {
  useEffect(() => {
    trackHomeEvent("about_page_view", { page: "about" });
  }, []);

  return (
    <Layout>
      <SEO
        title="About ValorWell | Care Platform & ValorWell Foundation"
        description="Learn the difference between ValorWell, a nationwide mental-health care platform for veterans and military families, and the separate ValorWell Foundation, which pays qualified community therapists for veteran treatment."
        canonical="/about"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "About ValorWell", url: "/about" },
        ]}
      />

      <div className="about-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .about-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .about-theme h1,
          .about-theme h2,
          .about-theme h3,
          .about-theme h4 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-36 -top-40 h-96 w-96 rounded-full bg-[#D7A92E]/[0.08] blur-3xl" />
            <div className="absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#3B5147]/[0.08] blur-3xl" />
          </div>

          <div className="container-wide relative py-16 md:py-24 lg:py-28">
            <div className="max-w-5xl">
              <Eyebrow>About ValorWell</Eyebrow>
              <h1 className="mt-6 text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                ValorWell provides care. The ValorWell Foundation separately funds therapy.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/70 md:text-xl">
                ValorWell is a nationwide platform for providing mental-health therapy to veterans and their families. The ValorWell Foundation is a separate organization that pays qualified mental-health therapists in the community to treat veterans who cannot get seen through the appropriate VA care channels.
              </p>
              <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-[#3B5147]">
                100% of donations to the ValorWell Foundation go directly to therapists providing that treatment. None of those donations go to ValorWell.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <TrackedLink
                  to="/get-care"
                  event="about_hero_care"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#31443B]"
                >
                  Find Care
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  to="/impact"
                  event="about_hero_foundation"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#3B5147]/30 px-6 py-3 text-sm font-bold text-[#3B5147] transition hover:bg-white/60"
                >
                  See Foundation Impact
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow light>At a Glance</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Care, charitable funding, and community work have different roles.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <article className="rounded-3xl border border-white/12 bg-white/[0.05] p-8">
                <Stethoscope className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">ValorWell Care</h3>
                <p className="mt-4 leading-7 text-white/65">
                  Nationwide telehealth mental-health treatment and the clinician, coverage, billing, scheduling, and access systems that support it.
                </p>
                <TrackedLink to="/get-care" event="about_care" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white">
                  Care Options <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>

              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-8">
                <HeartHandshake className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">ValorWell Foundation</h3>
                <p className="mt-4 leading-7 text-white/65">
                  A separate organization that pays qualified community therapists when veterans have sought care but still cannot reach treatment through the appropriate VA channels.
                </p>
                <TrackedLink to="/impact" event="about_impact" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white">
                  Foundation Impact <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>

              <article className="rounded-3xl border border-white/12 bg-white/[0.05] p-8">
                <Network className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Community</h3>
                <p className="mt-4 leading-7 text-white/65">
                  Beyond The Yellow, featured organizations, educational content, partnerships, and ways for people to participate.
                </p>
                <TrackedLink to="/beyond-the-yellow" event="about_community" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white">
                  Beyond The Yellow <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow>Who We Serve</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Veterans and military families are the center of ValorWell&apos;s care work.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-lg leading-8 text-[#111814]/68">
              <p>
                Veterans often navigate mental-health needs alongside VA access, military transition, trauma, disability, and other systems shaped by service.
              </p>
              <p>
                Military family members have their own mental-health needs and barriers to care. ValorWell treats family care as a core part of the clinical mission.
              </p>
              <p>
                The ValorWell Foundation&apos;s charitable funding is specifically used to pay for veteran therapy when the appropriate VA care pathway has not produced access to treatment.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-4xl">
              <Eyebrow>Organization Structure</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                ValorWell and the ValorWell Foundation are not the same organization.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#111814]/65">
                They work toward the same goal of getting veterans into appropriate mental-health treatment, but they have different functions and separate funding roles.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl bg-[#111814] p-8 text-white">
                <Stethoscope className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">ValorWell</p>
                <h3 className="mt-3 text-2xl font-bold">Nationwide mental-health care platform</h3>
                <p className="mt-4 leading-7 text-white/68">
                  ValorWell provides therapy pathways for veterans and military families and operates the clinical, technology, scheduling, billing, resource, and partnership infrastructure represented across this website.
                </p>
                <p className="mt-4 text-sm font-semibold leading-6 text-white">
                  Foundation donation dollars do not fund ValorWell&apos;s operations.
                </p>
              </article>

              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8">
                <HeartHandshake className="h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6814]">ValorWell Foundation</p>
                <h3 className="mt-3 text-2xl font-bold">Direct payment for veteran therapy</h3>
                <p className="mt-4 leading-7 text-[#111814]/68">
                  The Foundation pays qualified mental-health therapists in the community for treatment provided to veterans who cannot get seen through the appropriate VA care channels.
                </p>
                <p className="mt-4 text-sm font-bold leading-6 text-[#111814]">
                  100% of Foundation donations go directly to those therapists. None goes to ValorWell. $75 funds one completed therapy session.
                </p>
              </article>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedLink to="/impact" event="about_structure_impact" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                Review Foundation Impact <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
              <TrackedLink to="/impact" event="about_structure_support" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                Support the Foundation <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>How to Use the Site</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Go directly to the part of the work that matches what you need.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                [Stethoscope, "Need care", "Review current care pathways and start the intake process.", "/get-care", "Find Care", "about_path_care"],
                [BookOpen, "Need information", "Browse resources on CHAMPVA, Community Care, veteran mental health, and family systems.", "/resources", "Browse Resources", "about_path_resources"],
                [Building2, "Represent an organization", "Explore referral, service, community, and mission-aligned partnerships with ValorWell.", "/partner", "Partner With ValorWell", "about_path_partner"],
                [HeartHandshake, "Want to fund therapy", "$75 funds one completed veteran therapy session through the ValorWell Foundation.", "/impact", "Support the Foundation", "about_path_support"],
              ].map(([Icon, title, copy, to, cta, event]) => {
                const CardIcon = Icon as typeof Stethoscope;
                return (
                  <article key={title as string} className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-7">
                    <CardIcon className="h-7 w-7 text-[#3B5147]" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-bold">{title as string}</h3>
                    <p className="mt-3 leading-7 text-[#111814]/62">{copy as string}</p>
                    <TrackedLink to={to as string} event={event as string} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                      {cta as string} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </TrackedLink>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <Users className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
              </div>
            </div>
            <div className="lg:col-span-8">
              <Eyebrow light>Leadership</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Luke Predmore — Founder, ValorWell · Host, Beyond The Yellow
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
                The founder role covers organizational direction, product and systems development, partnerships, fundraising, and public communication. Clinical care itself remains clinician-led and subject to professional licensure, scope, and judgment.
              </p>
              <div className="mt-7 flex flex-wrap gap-5">
                <TrackedLink to="/mission" event="about_leadership_mission" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white">
                  Read the Mission <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink to="/clinicians" event="about_leadership_clinicians" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white">
                  Clinician Model <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide grid gap-12 py-16 md:py-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <ShieldCheck className="h-10 w-10 text-[#3B5147]" aria-hidden="true" />
            </div>
            <div className="lg:col-span-8">
              <Eyebrow>Public Proof</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Use the work itself to evaluate ValorWell and the Foundation.
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68">
                Review current care pathways, the Foundation&apos;s completed-therapy impact, published Beyond The Yellow conversations, featured organization pages, resources, clinician terms, and partnership routes directly from this site.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#111814] text-white">
          <div className="container-wide grid gap-10 py-16 md:py-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <Eyebrow light>Next Step</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Find care, understand the organizations, or help fund a therapy session.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <TrackedLink to="/get-care" event="about_final_care" className="inline-flex min-h-12 items-center rounded-md bg-white px-5 py-3 text-sm font-bold text-[#111814]">
                Find Care
              </TrackedLink>
              <TrackedLink to="/impact" event="about_final_impact" className="inline-flex min-h-12 items-center rounded-md border border-white/30 px-5 py-3 text-sm font-bold text-white">
                Foundation Impact
              </TrackedLink>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
