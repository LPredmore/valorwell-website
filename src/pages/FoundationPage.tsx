import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Receipt,
  Stethoscope,
  Users,
} from "lucide-react";
import heroFamily from "@/assets/hero-family.jpg";
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
      className={`text-xs font-bold uppercase tracking-[0.2em] ${
        light ? "text-[#D7A92E]" : "text-[#3B5147]"
      }`}
    >
      {children}
    </p>
  );
}

function FlowArrow() {
  return (
    <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
      <div className="h-px w-8 bg-[#3B5147]/25" />
      <ArrowRight className="-ml-1 h-5 w-5 text-[#3B5147]/55" />
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
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden bg-[#111814] text-white">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#3B5147]/40 blur-3xl" />
            <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-[#D7A92E]/10 blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-10 py-14 md:py-20 lg:grid-cols-12 lg:items-center lg:py-24">
            <div className="lg:col-span-7">
              <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                <span>ValorWell Foundation</span>
                <span className="h-1 w-1 rounded-full bg-[#D7A92E]" aria-hidden="true" />
                <span>{FOUNDATION_STATUS}</span>
                <span className="h-1 w-1 rounded-full bg-[#D7A92E]" aria-hidden="true" />
                <span>EIN {FOUNDATION_EIN}</span>
              </div>

              <h1 className="mt-7 max-w-5xl text-5xl font-bold leading-[0.98] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                Every donated dollar becomes care.
              </h1>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/72 md:text-xl">
                The ValorWell Foundation is a separate nonprofit created to fund mental-health treatment for veterans and their immediate family members when care would otherwise remain out of reach.
              </p>
              <p className="mt-5 max-w-3xl text-xl font-bold leading-8 text-white md:text-2xl">
                Because the entire team matters.
              </p>

              <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-5">
                  <p className="text-4xl font-bold text-[#D7A92E]">100%</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/78">
                    of donated funds pay community therapists for treatment
                  </p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-5">
                  <p className="text-4xl font-bold">$0</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/68">
                    of Foundation donations goes to ValorWell
                  </p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-5">
                  <p className="text-4xl font-bold">$0</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/68">
                    of donated funds pays board members
                  </p>
                </div>
              </div>

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

            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-xl lg:max-w-none">
                <div className="absolute -inset-3 rounded-[2rem] border border-[#D7A92E]/25" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-[1.75rem] bg-[#3B5147] shadow-2xl">
                  <img
                    src={heroFamily}
                    alt="Military family spending time together"
                    className="aspect-[4/5] h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111814] via-[#111814]/10 to-transparent" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#D7A92E] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#111814]">
                      <Users className="h-4 w-4" aria-hidden="true" />
                      Veterans + immediate family
                    </div>
                    <p className="mt-4 max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl">
                      Mental health affects the whole team. Care should be able to reach the whole team too.
                    </p>
                  </div>
                </div>

                <div className="relative -mt-5 ml-5 mr-5 rounded-2xl border border-[#D7A92E]/30 bg-[#F4F1E8] p-5 text-[#111814] shadow-xl sm:ml-10 sm:mr-10">
                  <div className="flex items-start gap-4">
                    <BadgeCheck className="mt-1 h-6 w-6 shrink-0 text-[#3B5147]" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">Public nonprofit identity</p>
                      <p className="mt-1 text-xl font-bold">EIN {FOUNDATION_EIN}</p>
                      <p className="mt-1 text-sm leading-6 text-[#111814]/62">
                        Use this EIN to verify the ValorWell Foundation in public nonprofit and tax records.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#D7A92E] text-[#111814]">
          <div className="container-wide grid gap-0 py-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["100%", "Donated funds go to therapist payment"],
              ["$0", "Foundation donations go to ValorWell"],
              ["$0", "Donated funds go to board compensation"],
              [FOUNDATION_EIN, "EIN for public nonprofit lookup"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={`px-5 py-6 ${index > 0 ? "border-t border-[#111814]/15 sm:border-t-0 sm:border-l" : ""}`}
              >
                <p className="text-3xl font-bold">{value}</p>
                <p className="mt-1 text-sm font-bold leading-6 text-[#111814]/70">{label}</p>
              </div>
            ))}
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

        <section className="relative overflow-hidden bg-[#111814] text-white">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#D7A92E]/10 blur-3xl" />
          </div>
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

            <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-[1fr_220px_1fr] lg:items-stretch">
              <article className="rounded-3xl border border-white/12 bg-white/[0.05] p-8 md:p-9">
                <Stethoscope className="h-9 w-9 text-white/70" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/50">ValorWell</p>
                <h3 className="mt-3 text-3xl font-bold">Builds and operates the care infrastructure.</h3>
                <p className="mt-5 leading-7 text-white/65">
                  ValorWell manages the clinical, technology, scheduling, billing, resource, and partnership infrastructure surrounding its care pathways for veterans and military families.
                </p>
                <div className="mt-7 border-t border-white/12 pt-6">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/45">Foundation donation revenue received</p>
                  <p className="mt-2 text-5xl font-bold text-white">$0</p>
                </div>
              </article>

              <div className="flex flex-col items-center justify-center rounded-3xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-6 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#D7A92E] bg-[#111814]">
                  <span className="text-4xl font-bold text-[#D7A92E]">$0</span>
                </div>
                <p className="mt-5 text-sm font-bold uppercase tracking-[0.15em] text-[#D7A92E]">crosses this line</p>
                <p className="mt-3 text-sm leading-6 text-white/68">
                  No Foundation donation dollars are transferred to ValorWell.
                </p>
              </div>

              <article className="rounded-3xl border border-[#D7A92E]/45 bg-[#D7A92E]/10 p-8 md:p-9">
                <HeartHandshake className="h-9 w-9 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">ValorWell Foundation</p>
                <h3 className="mt-3 text-3xl font-bold">Receives donations and funds treatment.</h3>
                <p className="mt-5 leading-7 text-white/68">
                  The Foundation receives charitable gifts and uses 100% of those donated funds to pay qualified community mental-health therapists for treatment provided to veterans and their immediate family members.
                </p>
                <div className="mt-7 border-t border-[#D7A92E]/25 pt-6">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#D7A92E]">Donated funds committed to therapist payment</p>
                  <p className="mt-2 text-5xl font-bold text-[#D7A92E]">100%</p>
                </div>
              </article>
            </div>

            <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 text-center">
              <p className="text-lg font-bold leading-8 text-white">
                This separation is not fine print. It is a Foundation policy we are proud to make easy to see.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Eyebrow>Follow a Donated Dollar</Eyebrow>
              <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                Donor → Foundation → community therapist → veteran or immediate family member.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#111814]/65">
                That is the entire path. There is no operating percentage carved out for ValorWell and no board compensation taken from donated funds.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-7xl gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
              <article className="rounded-3xl border border-[#3B5147]/15 bg-white p-7">
                <HeartHandshake className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">01 · Donor</p>
                <h3 className="mt-3 text-2xl font-bold">A gift is made to the Foundation.</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  The donation is made to the nonprofit ValorWell Foundation, not to ValorWell.
                </p>
              </article>

              <FlowArrow />

              <article className="rounded-3xl border border-[#D7A92E]/40 bg-[#F8F3E4] p-7">
                <BadgeCheck className="h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#8A6814]">02 · Foundation</p>
                <h3 className="mt-3 text-2xl font-bold">The Foundation holds the charitable funds.</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  It does not pass a percentage to ValorWell and does not use donated funds to compensate board members.
                </p>
              </article>

              <FlowArrow />

              <article className="rounded-3xl bg-[#111814] p-7 text-white">
                <Stethoscope className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#D7A92E]">03 · Therapist</p>
                <h3 className="mt-3 text-2xl font-bold">A community therapist is paid for treatment.</h3>
                <p className="mt-3 leading-7 text-white/62">
                  Donated funds are used to pay qualified mental-health therapists for completed care.
                </p>
              </article>

              <FlowArrow />

              <article className="rounded-3xl border border-[#3B5147]/20 bg-[#3B5147] p-7 text-white">
                <Users className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#D7A92E]">04 · Care</p>
                <h3 className="mt-3 text-2xl font-bold">A veteran or immediate family member receives therapy.</h3>
                <p className="mt-3 leading-7 text-white/68">
                  Completed treatment becomes part of the Foundation&apos;s public impact reporting.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <Eyebrow light>Our Donation Policy</Eyebrow>
              <p className="mt-5 text-[6rem] font-bold leading-none text-[#D7A92E] sm:text-[8rem]">100%</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
                of Foundation donations pay community therapists for treatment.
              </h2>
            </div>

            <div className="lg:col-span-7">
              <p className="text-xl font-bold leading-8 text-white">
                This is Foundation policy—not a temporary campaign promise.
              </p>
              <p className="mt-4 text-lg leading-8 text-white/72">
                No donated dollars are used for ValorWell administration, technology, marketing, staffing, or operating costs. No donated dollars compensate Foundation board members. The donated funds are reserved for paying qualified community therapists for treatment provided to veterans and their immediate family members.
              </p>

              <div className="mt-9 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5">
                  <p className="text-4xl font-bold">$0</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/65">ValorWell operations</p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5">
                  <p className="text-4xl font-bold">$0</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/65">Board compensation from donations</p>
                </div>
                <div className="rounded-2xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-5">
                  <p className="text-4xl font-bold text-[#D7A92E]">100%</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/75">Community therapist payment</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-6">
                <Eyebrow>What That Looks Like in Care</Eyebrow>
                <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                  Simple donor math. Measurable treatment.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#111814]/65">
                  The Foundation reports completed therapy delivered—not vague awareness metrics or money passed between organizations.
                </p>
              </div>
              <div className="lg:col-span-6 lg:text-right">
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
            <CheckCircle2 className="mx-auto h-10 w-10 text-[#D7A92E]" aria-hidden="true" />
            <Eyebrow light>Fund the Next Session</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
              {SESSION_COST} can put a therapist in someone&apos;s corner.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/72">
              100% of your donation to the ValorWell Foundation is used to pay qualified community mental-health therapists for treatment for veterans and their immediate family members.
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
