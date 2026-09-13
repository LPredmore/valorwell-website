import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Building2,
  FileText,
  HeartHandshake,
  Stethoscope,
  Users,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { BreadcrumbSchema, SEO } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-[#D7A92E]" : "text-[#3B5147]"}`}>
      {children}
    </p>
  );
}

function TrackedLink({
  to,
  event,
  children,
  className,
}: {
  to: string;
  event: string;
  children: ReactNode;
  className: string;
}) {
  return (
    <Link
      to={to}
      onClick={() => trackHomeEvent(event, { page: "how-it-works" })}
      className={className}
    >
      {children}
    </Link>
  );
}

function AccessWallVisual({ larger = false }: { larger?: boolean }) {
  return (
    <div className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-5 sm:p-7" aria-label={larger ? "VA Community Care access diagram" : "CHAMPVA access diagram"}>
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <Users className="mx-auto h-8 w-8 text-[#3B5147]" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-[#111814]">{larger ? "Veteran with authorization" : "Family with coverage"}</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-xl border border-[#B24A3A]/25 bg-[#B24A3A]/10 px-4 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8C392E]">The wall</p>
            <p className="mt-1 text-xs leading-5 text-[#111814]/65">reimbursement · credentialing · paperwork</p>
          </div>
          <ArrowDown className="h-5 w-5 text-[#3B5147] sm:hidden" aria-hidden="true" />
          <ArrowRight className="hidden h-5 w-5 text-[#3B5147] sm:block" aria-hidden="true" />
        </div>
        <div className="rounded-2xl bg-[#3B5147] p-5 text-center text-white shadow-sm">
          <Stethoscope className="mx-auto h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold">ValorWell removes the operational burden</p>
          <p className="mt-2 text-xs leading-5 text-white/70">Coverage can turn into an actual appointment.</p>
        </div>
      </div>
    </div>
  );
}

function FundingFlowVisual() {
  const nodes = [
    ["Donor", HeartHandshake],
    ["ValorWell Foundation", Building2],
    ["Therapist", Stethoscope],
    ["Veteran or family member", Users],
  ] as const;

  return (
    <div className="rounded-3xl border border-[#D7A92E]/30 bg-[#111814] p-5 text-white sm:p-7" aria-label="Foundation funding flow from donor to treatment">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
        {nodes.map(([label, Icon], index) => (
          <div key={label} className="contents">
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 text-center">
              <Icon className="mx-auto h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
              <p className="mt-3 text-sm font-bold">{label}</p>
              {label === "ValorWell Foundation" && (
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#D7A92E]">0% retained</p>
              )}
            </div>
            {index < nodes.length - 1 && (
              <div className="flex justify-center text-[#D7A92E]">
                <ArrowDown className="h-5 w-5 md:hidden" aria-hidden="true" />
                <ArrowRight className="hidden h-5 w-5 md:block" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  useEffect(() => {
    trackHomeEvent("how_it_works_page_view", { page: "how-it-works" });
  }, []);

  return (
    <Layout>
      <SEO
        title="How ValorWell Works | CHAMPVA, VA Community Care & Foundation"
        description="See how ValorWell turns VA coverage into usable care through CHAMPVA access, VA Community Care infrastructure, and Foundation funding when the system still fails."
        canonical="/how-it-works"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "How It Works", url: "/how-it-works" },
        ]}
      />

      <div className="how-it-works-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .how-it-works-theme,
          .how-it-works-theme h1,
          .how-it-works-theme h2,
          .how-it-works-theme h3 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
        `}</style>

        <section className="border-b border-[#3B5147]/15">
          <div className="container-wide py-16 md:py-24 lg:py-28">
            <div className="max-w-4xl">
              <Eyebrow>How It Works</Eyebrow>
              <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
                Three programs. One reason they all exist.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/70 md:text-xl">
                Each one was built because the last one wasn&apos;t enough to close the gap.
              </p>
              <TrackedLink
                to="/about"
                event="how_it_works_story"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147] underline decoration-[#3B5147]/30 underline-offset-4 hover:decoration-[#3B5147]"
              >
                If you haven&apos;t read how this started, start with our story <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="lg:col-span-6">
              <Eyebrow>01 — CHAMPVA Access</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Coverage existed. Providers who&apos;d take it didn&apos;t.
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-8 text-[#111814]/70">
                <p>
                  CHAMPVA is the VA&apos;s health coverage for eligible family members of certain veterans and survivors. On paper, it works like insurance. In practice, mental-health providers told us directly that reimbursement rates, slow credentialing, and claims paperwork made it too difficult to take on.
                </p>
                <p>
                  ValorWell&apos;s first fix was direct: build a network of licensed therapists who accept CHAMPVA, and handle the operational and billing work that makes it viable for them to say yes. A family with CHAMPVA coverage can come through ValorWell and turn that coverage into an actual appointment.
                </p>
              </div>
            </div>
            <div className="lg:col-span-6">
              <AccessWallVisual />
            </div>
          </div>
          <div className="container-wide pb-16 md:pb-20">
            <p className="mx-auto max-w-4xl border-l-4 border-[#D7A92E] pl-5 text-xl font-bold leading-8 text-[#3B5147]">
              The CHAMPVA network worked. Then it became clear the same wall existed for a much larger group of veterans.
            </p>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-6">
              <AccessWallVisual larger />
            </div>
            <div className="order-1 lg:order-2 lg:col-span-6">
              <Eyebrow>02 — VA Community Care (VACCN)</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Authorized for outside care. Still couldn&apos;t get an appointment.
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-8 text-[#111814]/70">
                <p>
                  The VA&apos;s Community Care Network is supposed to let veterans see outside providers when the VA itself cannot provide timely or reasonably accessible care. Authorization, though, is not the same thing as an appointment.
                </p>
                <p>
                  The red tape runs both directions. Veterans face authorization and referral requirements. Therapists face credentialing, reimbursement, and administrative overhead that can make VACCN impractical for a small practice — the same basic problem we had already seen with CHAMPVA, at a larger scale.
                </p>
                <p>
                  ValorWell built the same kind of infrastructure here: managing the authorization and referral process on the veteran&apos;s side, and handling enough of the administrative burden on the provider&apos;s side that therapists can participate. The goal is the same as with CHAMPVA — coverage that actually converts into care.
                </p>
              </div>
            </div>
          </div>
          <div className="container-wide pb-16 md:pb-20">
            <p className="mx-auto max-w-4xl border-l-4 border-[#D7A92E] pl-5 text-xl font-bold leading-8 text-[#3B5147]">
              Both of these fixes work — when the barrier is paperwork and process. Not everything broken in this system is a paperwork problem.
            </p>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="lg:col-span-6">
              <Eyebrow light>03 — The ValorWell Foundation</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                When the fix has to be structural, someone still needs care today.
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-8 text-white/72">
                <p>
                  Some of what&apos;s broken in CHAMPVA and VACCN isn&apos;t a process problem ValorWell can route around — it&apos;s a policy or structural problem inside a federal system, and those take time to change. That timeline does not help a veteran or family member who is entitled to coverage and still cannot use it.
                </p>
                <p>
                  That&apos;s what the Foundation exists for. It is not a substitute for CHAMPVA or VACCN, and it isn&apos;t for people who can get seen through those channels. It is for the narrower group the system is currently failing — people with real coverage on paper and no real way to use it yet.
                </p>
                <p className="font-bold text-white">
                  $75 funds one completed therapy session. 100% of every donation goes directly to the treating therapist. None of it goes to ValorWell.
                </p>
              </div>
            </div>
            <div className="lg:col-span-6">
              <FundingFlowVisual />
            </div>
          </div>
          <div className="container-wide flex flex-wrap gap-3 pb-16 md:pb-20">
            <TrackedLink
              to="/foundation"
              event="how_it_works_foundation_detail"
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#111814] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
            >
              Learn More About the Foundation <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TrackedLink>
            <TrackedLink
              to="/donate"
              event="how_it_works_fund_session"
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Fund a Session — $75 <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TrackedLink>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-14 md:py-18">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">The model at a glance</p>
            <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
              {[
                ["CHAMPVA", "Built the provider network"],
                ["VACCN", "Scaled the same fix for a larger population"],
                ["Foundation", "Covers what&apos;s left while the harder fix is in progress"],
              ].map(([title, copy], index) => (
                <div key={title} className="contents">
                  <article className="rounded-2xl border border-[#3B5147]/15 bg-[#F4F1E8] p-6 text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#3B5147]">{title}</p>
                    <p className="mt-3 leading-7 text-[#111814]/65" dangerouslySetInnerHTML={{ __html: copy }} />
                  </article>
                  {index < 2 && (
                    <div className="flex items-center justify-center text-[#D7A92E]">
                      <ArrowDown className="h-6 w-6 md:hidden" aria-hidden="true" />
                      <ArrowRight className="hidden h-6 w-6 md:block" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#3B5147] text-white">
          <div className="container-wide py-16 text-center md:py-24">
            <div className="mx-auto max-w-4xl">
              <Eyebrow light>Where this leads</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                The Foundation is the stopgap. Here&apos;s the case for supporting it — and what it would take to make it unnecessary.
              </h2>
              <TrackedLink
                to="/foundation"
                event="how_it_works_final_foundation"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#111814] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
              >
                See the Foundation <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
