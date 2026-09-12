import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";
import foundationDonationProtection from "@/assets/foundation-donation-protection.webp";
import foundationHero from "@/assets/foundation-hero.webp";
import foundationSupportFlow from "@/assets/foundation-support-flow.webp";
import foundationTwoOrganizations from "@/assets/foundation-two-organizations.webp";
import { DonateButton } from "@/components/DonateButton";
import { Layout } from "@/components/layout/Layout";
import {
  BreadcrumbSchema,
  DonateActionSchema,
  NonprofitOrganizationSchema,
  SEO,
} from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

const FOUNDATION_EIN = "93-3129745";
const FOUNDATION_STATUS = "501(c)(3)";
const FOUNDATION_FOUNDED = "May 13, 2024";
const SESSION_COST = "$75";
const THERAPY_HOURS = "540+";
const IMPACT_SNAPSHOT = "September 5, 2026";

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

function ArtFrame({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-[#D7A92E]/30 bg-[#111814] shadow-[0_28px_80px_rgba(17,24,20,0.24)] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="block h-auto w-full"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}

export default function FoundationPage() {
  useEffect(() => {
    trackHomeEvent("foundation_page_view", { page: "foundation" });
  }, []);

  return (
    <Layout>
      <SEO
        title="ValorWell Foundation | 100% of Donations Fund Therapy"
        description="Learn how the ValorWell Foundation, a registered 501(c)(3) nonprofit (EIN 93-3129745), uses 100% of donated funds to pay community therapists for veterans and their immediate family members."
        canonical="/foundation"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "ValorWell Foundation", url: "/foundation" },
        ]}
      />
      <NonprofitOrganizationSchema />
      <DonateActionSchema />

      <div className="foundation-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .foundation-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .foundation-theme h1,
          .foundation-theme h2,
          .foundation-theme h3,
          .foundation-theme h4 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.03em;
          }
        `}</style>

        <section className="relative overflow-hidden bg-[#101713] text-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,81,71,0.7),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(215,169,46,0.16),transparent_30%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-24 bottom-[18%] h-32 w-[62%] -rotate-6 rounded-[100%] border-t border-[#D7A92E]/25"
            aria-hidden="true"
          />

          <div className="container-wide relative grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:items-center lg:py-24">
            <div className="lg:col-span-5">
              <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/72">
                <span>ValorWell Foundation</span>
                <span className="h-1 w-1 rounded-full bg-[#D7A92E]" aria-hidden="true" />
                <span>{FOUNDATION_STATUS}</span>
                <span className="h-1 w-1 rounded-full bg-[#D7A92E]" aria-hidden="true" />
                <span>EIN {FOUNDATION_EIN}</span>
              </div>

              <h1 className="mt-7 max-w-4xl text-5xl font-bold leading-[0.96] sm:text-6xl lg:text-7xl">
                Every donated dollar becomes care.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
                The ValorWell Foundation is a separate nonprofit created to fund mental-health treatment for veterans and their immediate family members when care would otherwise remain out of reach.
              </p>

              <p className="mt-5 text-xl font-bold text-[#D7A92E] md:text-2xl">
                Healing strengthens what serves.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <DonateButton size="lg" source="foundation_hero" withIcon>
                  Donate to the Foundation
                </DonateButton>
                <Link
                  to="/impact"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/25 bg-white/[0.05] px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  See Foundation Impact
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ArtFrame
                src={foundationHero}
                eager
                alt="Veteran and family meeting with a community therapist, representing Foundation-funded mental-health care"
              />
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-16 md:py-24">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-4">
                <Eyebrow>Donation Protection</Eyebrow>
                <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                  The promise should be easy to understand before you give.
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#111814]/66">
                  Foundation donations have one job: pay qualified community therapists for treatment. They do not subsidize ValorWell clinic operations and they do not compensate Foundation board members.
                </p>
                <div className="mt-7 rounded-2xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-5">
                  <p className="text-5xl font-bold text-[#8A6814]">100%</p>
                  <p className="mt-2 font-bold leading-6">of donated funds pay for treatment</p>
                </div>
              </div>

              <div className="lg:col-span-8">
                <ArtFrame
                  src={foundationDonationProtection}
                  alt="Graphic showing 100% of donated funds pay for treatment, with zero dollars to ValorWell clinic operations and zero dollars of board compensation from donated funds"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <Eyebrow>Why the Foundation Exists</Eyebrow>
              <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                Care does not happen to one person in isolation.
              </h2>
              <div className="mt-8 rounded-3xl bg-[#3B5147] p-7 text-white">
                <Users className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-5 text-2xl font-bold leading-tight">
                  The veteran matters. The spouse matters. The family around them matters.
                </p>
              </div>
            </div>

            <div className="space-y-5 text-lg leading-8 text-[#111814]/68 lg:col-span-7">
              <p>
                A veteran can ask for help and still encounter provider shortages, scheduling delays, authorization problems, limited capacity, or another barrier that leaves treatment out of reach.
              </p>
              <p>
                Their immediate family can be carrying that strain too. Foundation-funded therapy is available for veterans and their immediate family members because mental health, recovery, stability, and family functioning are connected.
              </p>
              <p className="text-xl font-bold leading-8 text-[#111814]">
                The Foundation exists to turn charitable support into actual sessions with qualified mental-health therapists in the community.
              </p>
              <p>
                The Foundation funds treatment. It does not replace eligibility or authorization decisions, and it does not direct a clinician&apos;s professional judgment.
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#101713] text-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_10%,rgba(215,169,46,0.12),transparent_28%)]"
            aria-hidden="true"
          />
          <div className="container-wide relative py-20 md:py-28">
            <div className="mx-auto max-w-5xl text-center">
              <Eyebrow light>Built for Transparency</Eyebrow>
              <h2 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
                Two organizations. Two jobs. One transparent line between them.
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/68">
                ValorWell and the ValorWell Foundation share a commitment to better mental-health access, but they do different work and the money stays clearly separated.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-7xl">
              <ArtFrame
                src={foundationTwoOrganizations}
                alt="Graphic comparing ValorWell, the for-profit mental-health clinic, with the separate nonprofit ValorWell Foundation"
              />
            </div>

            <div className="mx-auto mt-9 grid max-w-5xl gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">ValorWell</p>
                <p className="mt-2 text-lg font-bold">Provides mental-health care and accepts VACCN and CHAMPVA.</p>
              </div>
              <div className="rounded-2xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">ValorWell Foundation</p>
                <p className="mt-2 text-lg font-bold">Pays community therapists when coverage is delayed, denied, or otherwise out of reach.</p>
              </div>
            </div>

            <p className="mx-auto mt-7 max-w-4xl text-center text-lg font-bold leading-8 text-white">
              No Foundation donation dollars are transferred to ValorWell.
            </p>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Eyebrow>How Support Becomes Care</Eyebrow>
              <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                Follow one donated dollar all the way to treatment.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#111814]/65">
                Donor → Foundation → community therapist → veteran or immediate family member.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-7xl">
              <ArtFrame
                src={foundationSupportFlow}
                alt="Graphic showing support flowing from a donor to the ValorWell Foundation, then to a community therapist, and finally to a veteran or immediate family member"
              />
            </div>

            <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["01", "Donor", "A gift is made to the nonprofit Foundation."],
                ["02", "Foundation", "The charitable funds stay with the Foundation."],
                ["03", "Therapist", "A qualified community therapist is paid for completed care."],
                ["04", "Care", "A veteran or immediate family member receives therapy."],
              ].map(([number, title, copy]) => (
                <article key={number} className="rounded-2xl border border-[#3B5147]/15 bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A6814]">{number}</p>
                  <h3 className="mt-2 text-2xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#111814]/62">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <Eyebrow>What That Looks Like in Care</Eyebrow>
                <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                  Simple donor math. Measurable treatment.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#111814]/65">
                  The Foundation reports completed therapy delivered—not vague awareness metrics or money passed between organizations.
                </p>
              </div>
              <div className="lg:col-span-5 lg:text-right">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#3B5147]">Impact snapshot</p>
                <p className="mt-2 text-sm text-[#111814]/55">As of {IMPACT_SNAPSHOT}</p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-3xl bg-[#111814] p-7 text-white">
                <CalendarDays className="h-7 w-7 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-5 text-5xl font-bold text-[#D7A92E]">{THERAPY_HOURS}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-white/65">hours of direct therapy paid for</p>
              </article>
              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-7">
                <p className="text-5xl font-bold">{SESSION_COST}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#111814]/62">funds one completed therapy session</p>
              </article>
              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-7">
                <p className="text-5xl font-bold">$300</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#111814]/62">funds four weekly therapy sessions</p>
              </article>
              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-7">
                <p className="text-5xl font-bold text-[#8A6814]">$975</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#111814]/62">funds thirteen weekly therapy sessions</p>
              </article>
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                to="/impact"
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#3B5147]/20 px-6 py-3 text-sm font-bold text-[#3B5147] transition hover:bg-[#F4F1E8]"
              >
                Review Foundation Impact
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide grid gap-8 py-20 md:py-28 lg:grid-cols-12 lg:items-stretch">
            <article className="relative overflow-hidden rounded-[2rem] bg-[#111814] p-8 text-white md:p-10 lg:col-span-7">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#D7A92E]/15 blur-3xl" aria-hidden="true" />
              <Receipt className="relative h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
              <Eyebrow light>Public Verification</Eyebrow>
              <h2 className="relative mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
                You should never have to guess who you are giving to.
              </h2>
              <p className="relative mt-5 max-w-2xl text-lg leading-8 text-white/68">
                The ValorWell Foundation is a registered {FOUNDATION_STATUS} nonprofit. Use the EIN below to look up and verify the organization in public nonprofit and tax records.
              </p>

              <div className="relative mt-8 rounded-3xl border border-[#D7A92E]/30 bg-[#D7A92E]/10 p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">Employer Identification Number</p>
                <p className="mt-3 text-4xl font-bold tracking-wide text-white sm:text-5xl">{FOUNDATION_EIN}</p>
              </div>
            </article>

            <article className="rounded-[2rem] border border-[#3B5147]/20 bg-white p-8 md:p-10 lg:col-span-5">
              <BadgeCheck className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
              <Eyebrow>Nonprofit Identity</Eyebrow>
              <dl className="mt-7 space-y-6">
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-[#3B5147]">Legal name</dt>
                  <dd className="mt-2 text-2xl font-bold">ValorWell Foundation</dd>
                </div>
                <div className="border-t border-[#3B5147]/12 pt-6">
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-[#3B5147]">Federal tax status</dt>
                  <dd className="mt-2 text-2xl font-bold">{FOUNDATION_STATUS}</dd>
                </div>
                <div className="border-t border-[#3B5147]/12 pt-6">
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-[#3B5147]">Founded</dt>
                  <dd className="mt-2 text-2xl font-bold">{FOUNDATION_FOUNDED}</dd>
                </div>
              </dl>
              <p className="mt-7 border-t border-[#3B5147]/12 pt-6 text-sm leading-6 text-[#111814]/60">
                Donations to the ValorWell Foundation are tax-deductible to the extent allowed by law. Donation receipts are provided for donor records.
              </p>
            </article>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#3B5147] text-white">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -bottom-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#D7A92E]/15 blur-3xl" />
          </div>
          <div className="container-wide relative py-20 text-center md:py-24">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D7A92E]/60 bg-[#111814]">
              <ShieldCheck className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
            </div>
            <Eyebrow light>Fund the Next Session</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
              {SESSION_COST} can put a therapist in someone&apos;s corner.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/72">
              The Foundation receives charitable gifts and uses 100% of those donated funds to pay qualified community mental-health therapists for treatment provided to veterans and their immediate family members.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <DonateButton size="lg" source="foundation_footer" withIcon>
                Donate to the Foundation
              </DonateButton>
              <Link
                to="/impact"
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                See the Impact
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
