import { useEffect, type ReactNode } from "react";
import { BadgeCheck, HeartHandshake, Receipt, Stethoscope, Users } from "lucide-react";
import { DonateButton } from "@/components/DonateButton";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

const SESSION_COST = "$75";
const FOUNDATION_EIN = "93-3129745";

const moneyFlow = [
  {
    icon: HeartHandshake,
    title: "You donate to the Foundation.",
    copy: "Your gift goes to the ValorWell Foundation, a registered 501(c)(3) nonprofit, and is designated for veteran therapy.",
  },
  {
    icon: Stethoscope,
    title: "The Foundation pays a clinician in the community.",
    copy: "When a veteran has sought care but cannot get seen through the appropriate VA channels, the Foundation pays a qualified mental-health clinician to treat them.",
  },
  {
    icon: Users,
    title: "A veteran is seen.",
    copy: "The veteran receives treatment they could not otherwise reach, with the cost of that session covered by the Foundation.",
  },
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

export default function DonatePage() {
  useEffect(() => {
    trackHomeEvent("donate_page_view", { page: "donate" });
  }, []);

  return (
    <Layout>
      <SEO
        title="Donate | $75 Funds One Therapy Session | ValorWell Foundation"
        description="Donate to the ValorWell Foundation, a registered 501(c)(3). $75 funds one completed therapy session for a veteran, and 100% of every donation pays clinicians providing that care."
        canonical="/donate"
      />

      <div className="donate-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .donate-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .donate-theme h1,
          .donate-theme h2,
          .donate-theme h3,
          .donate-theme h4 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-[#D7A92E]/[0.10] blur-3xl" />
            <div className="absolute -bottom-40 -left-28 h-80 w-80 rounded-full bg-[#3B5147]/[0.09] blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:py-28">
            <div className="lg:col-span-7">
              <Eyebrow>Donate</Eyebrow>
              <h1 className="mt-6 text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl">
                {SESSION_COST} pays for one therapy session for a veteran who cannot get one.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#111814]/72 md:text-xl">
                Not {SESSION_COST} toward awareness. Not {SESSION_COST} toward overhead. {SESSION_COST} is what one
                completed session costs, and that is what your donation buys.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <DonateButton size="lg" source="donate_hero" withIcon>
                  Fund a Session
                </DonateButton>
                <p className="text-sm font-bold text-[#111814]/60">
                  ValorWell Foundation · 501(c)(3) · EIN {FOUNDATION_EIN}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-[#3B5147]/20 bg-white p-8 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">What your gift covers</p>
                <dl className="mt-6 space-y-5">
                  {[
                    [SESSION_COST, "One completed therapy session"],
                    ["$300", "A month of weekly therapy"],
                    ["$975", "A full 13-week course of care"],
                  ].map(([amount, label]) => (
                    <div key={amount} className="flex items-baseline justify-between gap-4 border-b border-[#3B5147]/10 pb-4 last:border-0 last:pb-0">
                      <dt className="text-3xl font-bold text-[#111814]">{amount}</dt>
                      <dd className="text-right text-sm leading-6 text-[#111814]/65">{label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-4xl">
              <Eyebrow>Where the money goes</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Three steps, and none of them are us.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#111814]/68">
                There is no step in this path where a donated dollar becomes ValorWell revenue. The Foundation
                receives your donation and pays a clinician for treating a veteran.
              </p>
            </div>

            <ol className="mt-12 grid gap-6 lg:grid-cols-3">
              {moneyFlow.map(({ icon: Icon, title, copy }, index) => (
                <li key={title} className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B5147] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <Icon className="h-5 w-5 text-[#3B5147]" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold leading-7">{title}</h3>
                  <p className="mt-3 leading-7 text-[#111814]/68">{copy}</p>
                </li>
              ))}
            </ol>

            <p className="mt-10 text-xl font-bold leading-8">
              Donor → Foundation → clinician → veteran.
            </p>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>The commitment</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                100% of your donation pays for care.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-white/72 lg:col-span-7">
              <p>
                Every dollar donated to the ValorWell Foundation goes to paying qualified mental-health clinicians for
                treating veterans. Foundation donations are not spent on administration, technology, marketing,
                staffing, or operating costs.
              </p>
              <p className="font-bold text-white">
                The Foundation does not keep a percentage, and ValorWell does not take one.
              </p>
              <p>
                That is only possible because the Foundation is deliberately small and the work of running it is not
                paid for out of donations.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <Eyebrow>Legitimacy</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  Who you are actually giving to.
                </h2>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-[#3B5147]/20 bg-white p-8 md:p-10">
                  <div className="flex items-start gap-4">
                    <BadgeCheck className="mt-1 h-6 w-6 shrink-0 text-[#3B5147]" aria-hidden="true" />
                    <div>
                      <h3 className="text-xl font-bold">ValorWell Foundation</h3>
                      <p className="mt-2 leading-7 text-[#111814]/68">
                        A registered 501(c)(3) nonprofit organization.
                      </p>
                    </div>
                  </div>

                  <dl className="mt-8 grid gap-5 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#3B5147]/12 bg-[#F4F1E8] p-5">
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">Tax status</dt>
                      <dd className="mt-2 text-lg font-bold">501(c)(3)</dd>
                    </div>
                    <div className="rounded-2xl border border-[#3B5147]/12 bg-[#F4F1E8] p-5">
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">EIN</dt>
                      <dd className="mt-2 text-lg font-bold">{FOUNDATION_EIN}</dd>
                    </div>
                  </dl>

                  <div className="mt-8 flex items-start gap-3 text-sm leading-6 text-[#111814]/65">
                    <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-[#3B5147]" aria-hidden="true" />
                    <p>
                      Donations to the ValorWell Foundation are tax-deductible to the extent allowed by law. You will
                      receive a receipt for your records at the email address you provide.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <DonateButton size="lg" source="donate_page_footer" withIcon>
                    Fund a Session
                  </DonateButton>
                  <p className="text-sm leading-6 text-[#111814]/60">
                    {SESSION_COST} is one session a veteran does not have to wait for.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
