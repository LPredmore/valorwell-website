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
} from "lucide-react";
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

export default function FoundationPage() {
  useEffect(() => {
    trackHomeEvent("foundation_page_view", { page: "foundation" });
  }, []);

  return (
    <Layout>
      <SEO
        title="ValorWell Foundation | How the Nonprofit Funds Veteran Therapy"
        description="Learn how the ValorWell Foundation, a registered 501(c)(3) nonprofit (EIN 93-3129745), uses donations to fund veteran mental-health therapy, how the Foundation is separate from ValorWell, and how to donate."
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

        <section className="relative overflow-hidden border-b border-[#3B5147]/15">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-[#D7A92E]/[0.10] blur-3xl" />
            <div className="absolute -bottom-40 -left-28 h-80 w-80 rounded-full bg-[#3B5147]/[0.09] blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:py-28">
            <div className="lg:col-span-8">
              <Eyebrow>ValorWell Foundation</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                The ValorWell Foundation turns donations directly into veteran therapy.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/72 md:text-xl">
                The ValorWell Foundation is a separate {FOUNDATION_STATUS} nonprofit, EIN {FOUNDATION_EIN}. It uses donations to pay qualified community mental-health therapists for treating veterans who have sought care but still cannot reach treatment through the appropriate VA channels.
              </p>
              <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-[#3B5147]">
                100% of Foundation donations go directly to qualified mental-health therapists providing veteran treatment. None of those donations go to ValorWell.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <DonateButton size="lg" source="foundation_hero" withIcon>
                  Donate to the Foundation
                </DonateButton>
                <Link
                  to="/impact"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#3B5147]/25 bg-white/60 px-6 py-3 text-sm font-bold text-[#3B5147] transition hover:bg-white"
                >
                  See Foundation Impact
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="rounded-3xl bg-[#111814] p-8 text-white shadow-xl">
                <BadgeCheck className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                  Nonprofit identity
                </p>
                <dl className="mt-6 space-y-5">
                  <div>
                    <dt className="text-sm text-white/55">Legal name</dt>
                    <dd className="mt-1 text-xl font-bold">ValorWell Foundation</dd>
                  </div>
                  <div className="border-t border-white/12 pt-5">
                    <dt className="text-sm text-white/55">Federal tax status</dt>
                    <dd className="mt-1 text-xl font-bold">{FOUNDATION_STATUS}</dd>
                  </div>
                  <div className="border-t border-white/12 pt-5">
                    <dt className="text-sm text-white/55">Employer Identification Number</dt>
                    <dd className="mt-1 text-2xl font-bold tracking-wide text-[#D7A92E]">{FOUNDATION_EIN}</dd>
                  </div>
                  <div className="border-t border-white/12 pt-5">
                    <dt className="text-sm text-white/55">Founded</dt>
                    <dd className="mt-1 font-bold">{FOUNDATION_FOUNDED}</dd>
                  </div>
                </dl>
                <p className="mt-6 border-t border-white/12 pt-5 text-sm leading-6 text-white/55">
                  Use EIN {FOUNDATION_EIN} when looking up or verifying the Foundation in public nonprofit and tax records.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>Why the Foundation Exists</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                A veteran can ask for care and still have no therapist to see.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-white/75 lg:col-span-7">
              <p>
                Veterans can pursue the appropriate VA care pathway and still encounter provider shortages, scheduling delays, authorization problems, limited capacity, or another barrier that leaves treatment out of reach.
              </p>
              <p>
                The Foundation exists for that gap. Its charitable role is to pay qualified mental-health therapists in the community for treatment provided to veterans who otherwise still cannot reach care through the appropriate VA channels.
              </p>
              <p className="font-bold text-white">
                The Foundation funds treatment. It does not replace VA eligibility or authorization decisions, and it does not direct a clinician&apos;s professional judgment.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Eyebrow>How the Foundation Works</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Donor → Foundation → therapist → veteran.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#111814]/65">
                The model is deliberately simple: donations are made to the nonprofit Foundation, the Foundation pays qualified clinicians for completed veteran treatment, and the veteran receives the therapy.
              </p>
            </div>

            <ol className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
              <li className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8">
                <HeartHandshake className="h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6814]">01</p>
                <h3 className="mt-3 text-2xl font-bold">A donation goes to the Foundation.</h3>
                <p className="mt-3 leading-7 text-[#111814]/65">
                  The gift is made to the ValorWell Foundation, not to ValorWell, and is used for veteran therapy.
                </p>
              </li>
              <li className="rounded-3xl bg-[#111814] p-8 text-white">
                <Stethoscope className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">02</p>
                <h3 className="mt-3 text-2xl font-bold">The Foundation pays the therapist.</h3>
                <p className="mt-3 leading-7 text-white/65">
                  A qualified community mental-health therapist is paid for completed treatment provided to the veteran.
                </p>
              </li>
              <li className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8">
                <CheckCircle2 className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">03</p>
                <h3 className="mt-3 text-2xl font-bold">The veteran receives therapy.</h3>
                <p className="mt-3 leading-7 text-[#111814]/65">
                  Completed treatment is counted as delivered care in the Foundation&apos;s public impact reporting.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-4xl">
              <Eyebrow light>Separate Organizations</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                ValorWell provides care infrastructure. The ValorWell Foundation separately funds therapy.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl border border-white/12 bg-white/[0.05] p-8">
                <Stethoscope className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">ValorWell</p>
                <h3 className="mt-3 text-2xl font-bold">Mental-health care platform</h3>
                <p className="mt-4 leading-7 text-white/68">
                  ValorWell operates the clinical, technology, scheduling, billing, resource, and partnership infrastructure surrounding its care pathways for veterans and military families.
                </p>
                <p className="mt-4 font-bold leading-7 text-white">
                  Foundation donation dollars do not fund ValorWell&apos;s operations.
                </p>
              </article>

              <article className="rounded-3xl border border-[#D7A92E]/40 bg-[#D7A92E]/10 p-8">
                <HeartHandshake className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">ValorWell Foundation</p>
                <h3 className="mt-3 text-2xl font-bold">Charitable funding for veteran therapy</h3>
                <p className="mt-4 leading-7 text-white/68">
                  The Foundation is the nonprofit organization that receives donations and uses them to pay qualified mental-health therapists for veteran treatment.
                </p>
                <p className="mt-4 font-bold leading-7 text-white">
                  None of those donations are transferred to ValorWell.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <Eyebrow>How Donations Are Used</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  100% of Foundation donations pay for care.
                </h2>
              </div>
              <div className="lg:col-span-7">
                <p className="text-lg leading-8 text-[#111814]/68">
                  Foundation donations are not used for ValorWell administration, technology, marketing, staffing, or operating costs. They pay qualified mental-health clinicians in the community for treating veterans.
                </p>
                <p className="mt-5 text-lg font-bold leading-8 text-[#111814]">
                  The Foundation does not keep a percentage, and ValorWell does not take one.
                </p>

                <dl className="mt-10 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#3B5147]/15 bg-white p-5">
                    <dt className="text-3xl font-bold">{SESSION_COST}</dt>
                    <dd className="mt-2 text-sm leading-6 text-[#111814]/62">One completed therapy session</dd>
                  </div>
                  <div className="rounded-2xl border border-[#3B5147]/15 bg-white p-5">
                    <dt className="text-3xl font-bold">$300</dt>
                    <dd className="mt-2 text-sm leading-6 text-[#111814]/62">A month of weekly therapy</dd>
                  </div>
                  <div className="rounded-2xl border border-[#3B5147]/15 bg-white p-5">
                    <dt className="text-3xl font-bold">$975</dt>
                    <dd className="mt-2 text-sm leading-6 text-[#111814]/62">A 13-week course of weekly care</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide grid gap-8 py-20 md:py-28 lg:grid-cols-2">
            <article className="rounded-3xl bg-[#111814] p-8 text-white md:p-10">
              <CalendarDays className="h-7 w-7 text-[#D7A92E]" aria-hidden="true" />
              <Eyebrow light>Current Impact Snapshot</Eyebrow>
              <p className="mt-5 text-6xl font-bold text-[#D7A92E]">{THERAPY_HOURS}</p>
              <h2 className="mt-3 text-2xl font-bold">hours of direct therapy paid for</h2>
              <p className="mt-4 leading-7 text-white/65">
                This snapshot reflects completed therapy delivered as of {IMPACT_SNAPSHOT}. The Impact page carries the Foundation&apos;s detailed public impact reporting.
              </p>
              <Link
                to="/impact"
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white"
              >
                Review Foundation Impact
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="rounded-3xl border border-[#3B5147]/20 bg-[#F4F1E8] p-8 md:p-10">
              <Receipt className="h-7 w-7 text-[#3B5147]" aria-hidden="true" />
              <Eyebrow>Verification & Tax Information</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold">Look up the nonprofit by EIN.</h2>
              <dl className="mt-7 space-y-5">
                <div>
                  <dt className="text-sm font-bold text-[#3B5147]">Organization</dt>
                  <dd className="mt-1 text-lg">ValorWell Foundation</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold text-[#3B5147]">Tax status</dt>
                  <dd className="mt-1 text-lg">{FOUNDATION_STATUS}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold text-[#3B5147]">EIN</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-wide">{FOUNDATION_EIN}</dd>
                </div>
              </dl>
              <p className="mt-6 text-sm leading-6 text-[#111814]/65">
                Donations to the ValorWell Foundation are tax-deductible to the extent allowed by law. Donation receipts are provided for donor records.
              </p>
            </article>
          </div>
        </section>

        <section className="bg-[#3B5147] text-white">
          <div className="container-wide py-20 text-center md:py-24">
            <Eyebrow light>Fund the Next Session</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
              {SESSION_COST} funds one completed therapy session.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
              Your donation goes to the ValorWell Foundation and pays for veteran mental-health treatment—not ValorWell operations.
            </p>
            <div className="mt-8 flex justify-center">
              <DonateButton size="lg" source="foundation_footer" withIcon>
                Donate to the Foundation
              </DonateButton>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
