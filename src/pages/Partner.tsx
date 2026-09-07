import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  HeartHandshake,
  Network,
  Stethoscope,
  Users,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { OverflowReferralSourceForm } from "@/components/forms/OverflowReferralSourceForm";
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
      onClick={() => trackHomeEvent(event, { page: "partner" })}
      className={className}
    >
      {children}
    </Link>
  );
}

const partnershipTypes = [
  {
    title: "Referral & resource relationships",
    copy: "Connect veterans and military families with appropriate care, services, education, or community resources.",
    examples: "Veteran organizations · family programs · community services",
    Icon: Stethoscope,
  },
  {
    title: "Community collaboration",
    copy: "Work together on a defined need where both organizations can contribute useful reach, expertise, relationships, or services.",
    examples: "Employers · nonprofits · local organizations · community programs",
    Icon: Building2,
  },
  {
    title: "Beyond The Yellow",
    copy: "Nominate or introduce organizations and people whose work may be a fit for a Beyond The Yellow conversation or feature.",
    examples: "Guest introductions · featured organizations · story discovery",
    Icon: HeartHandshake,
  },
  {
    title: "Infrastructure & introductions",
    copy: "Help connect ValorWell with clinicians, technology, operational resources, funders, or organizations that can strengthen the work.",
    examples: "Clinician networks · technology · strategic introductions",
    Icon: Network,
  },
] as const;

const partnershipStartPoints = [
  "Referral or resource connection",
  "Community collaboration",
  "Beyond The Yellow introduction",
  "Clinical, technology, or strategic introduction",
] as const;

export default function Partner() {
  useEffect(() => {
    trackHomeEvent("partner_page_view", { page: "partner" });
  }, []);

  return (
    <Layout>
      <SEO
        title="Partner With ValorWell | Referral, Community & Mission Partnerships"
        description="Explore partnership opportunities with ValorWell around care access, veteran and family resources, community collaboration, Beyond The Yellow, and strategic introductions."
        canonical="/partner"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Partner With ValorWell", url: "/partner" },
        ]}
      />

      <div className="partner-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .partner-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .partner-theme h1,
          .partner-theme h2,
          .partner-theme h3,
          .partner-theme h4 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#D7A92E]/[0.08] blur-3xl" />
            <div className="absolute -bottom-44 -left-32 h-96 w-96 rounded-full bg-[#3B5147]/[0.08] blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:py-28">
            <div className="lg:col-span-7">
              <Eyebrow>Partner With ValorWell</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                Build a partnership around a specific way to help.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/70 md:text-xl">
                ValorWell works with veteran organizations, community groups, employers, creators, clinicians, and other partners when there is a clear opportunity to improve access, connect resources, reach the right people, or strengthen the systems around the work.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <TrackedLink
                  to="/contact"
                  event="partner_hero_contact"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#31443B]"
                >
                  Start a Partnership Conversation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  to="/about"
                  event="partner_hero_about"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#3B5147]/30 px-6 py-3 text-sm font-bold text-[#3B5147] transition hover:bg-white/60"
                >
                  About ValorWell
                </TrackedLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-[#3B5147]/15 bg-white p-7 shadow-xl md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                  Current Partnership Paths
                </p>
                <h2 className="mt-4 text-2xl font-bold leading-tight md:text-3xl">
                  Start with the relationship you actually need.
                </h2>
                <div className="mt-7 divide-y divide-[#3B5147]/12 border-y border-[#3B5147]/12">
                  {partnershipStartPoints.map((item, index) => (
                    <div key={item} className="grid grid-cols-[2rem_1fr] gap-3 py-4">
                      <span className="text-xs font-bold tracking-[0.12em] text-[#8A6814]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="font-bold leading-6 text-[#111814]/80">{item}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-6 text-[#111814]/58">
                  A partnership starts with a defined audience, contribution, next step, and owner. Financial support and clinical or editorial decisions remain separate.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>Partnership Approach</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Start with the outcome, then define each organization's role.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-lg leading-8 text-white/70">
              <p>
                A useful partnership should make it easy to explain what is being attempted, who is responsible for what, and what the next step is for the people the relationship is meant to serve.
              </p>
              <p>
                Some partnerships may be simple introductions or resource-sharing relationships. Others may involve coordinated outreach, referrals, content, clinical infrastructure, fundraising, or a longer-term program.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>Ways to Work Together</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Common partnership paths.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {partnershipTypes.map(({ title, copy, examples, Icon }) => (
                <article key={title} className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8">
                  <Icon className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                  <h3 className="mt-6 text-2xl font-bold">{title}</h3>
                  <p className="mt-4 leading-7 text-[#111814]/64">{copy}</p>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#3B5147]/65">
                    {examples}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-24">
            <div className="mb-10 max-w-4xl">
              <Eyebrow>Overflow Referral Network</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Already serving veterans and military families through your own practice?
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#111814]/68">
                Independent practices that are already credentialed with eligible programs can register as possible overflow referral options when ValorWell cannot accept a veteran or family member.
              </p>
            </div>
            <OverflowReferralSourceForm />
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow>What to Include When You Reach Out</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                A short, specific proposal is enough to start.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <div className="divide-y divide-[#3B5147]/15 border-y border-[#3B5147]/15">
                {[
                  ["What your organization does", "A concise description of the population, service, program, audience, or capability you bring."],
                  ["What you want to accomplish", "The problem or opportunity you think ValorWell and your organization could address together."],
                  ["What you are proposing", "An introduction, referral relationship, event, content opportunity, program idea, resource exchange, or other concrete next step."],
                  ["Who should be involved", "The appropriate contact from your organization and any timing or geographic constraints that matter."],
                ].map(([title, copy]) => (
                  <div key={title} className="py-7">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="mt-2 leading-7 text-[#111814]/64">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow light>Important Boundaries</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Partnership does not change clinical or editorial decisions.
              </h2>
              <div className="mt-8 space-y-4 text-lg leading-8 text-white/70">
                <p>Financial support does not purchase treatment priority, referrals, endorsements, or Beyond The Yellow editorial selection.</p>
                <p>Clinical decisions remain with the treating clinician and the applicable care pathway.</p>
                <p>Partnership announcements do not substitute for measured outcomes; impact claims should be tied to the work that actually occurred.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-6 lg:grid-cols-3">
              <TrackedLink
                to="/beyond-the-yellow"
                event="partner_path_bty"
                className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8"
              >
                <HeartHandshake className="h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Beyond The Yellow</h3>
                <p className="mt-4 leading-7 text-[#111814]/64">Nominate a person or organization whose work may be a fit for a conversation or feature.</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
                  Explore Beyond The Yellow <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </TrackedLink>

              <TrackedLink
                to="/network"
                event="partner_path_network"
                className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8"
              >
                <Network className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Featured Organizations</h3>
                <p className="mt-4 leading-7 text-[#111814]/64">See organizations already featured through Beyond The Yellow and learn about their work.</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
                  Explore the Network <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </TrackedLink>

              <TrackedLink
                to="/contact"
                event="partner_path_contact"
                className="rounded-3xl bg-[#111814] p-8 text-white"
              >
                <Users className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-bold">Start a Conversation</h3>
                <p className="mt-4 leading-7 text-white/64">Send the basic idea and the right contact information. We can determine whether a useful next step exists.</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white">
                  Contact ValorWell <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="bg-[#111814] text-white">
          <div className="container-wide py-20 text-center md:py-24">
            <Eyebrow light>Partnerships</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
              Have a specific way ValorWell and your organization could help the same people?
            </h2>
            <TrackedLink
              to="/contact"
              event="partner_final_contact"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#111814]"
            >
              Start a Partnership Conversation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TrackedLink>
          </div>
        </section>
      </div>
    </Layout>
  );
}
