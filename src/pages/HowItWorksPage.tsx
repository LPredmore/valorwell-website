import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, ShieldCheck, Stethoscope } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { BreadcrumbSchema, SEO } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
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

export default function HowItWorksPage() {
  useEffect(() => {
    trackHomeEvent("how_it_works_page_view", { page: "how-it-works" });
  }, []);

  return (
    <Layout>
      <SEO
        title="How ValorWell Works | Three Paths to Mental Health Care"
        description="See how ValorWell addresses mental-health access through CHAMPVA care, VA Community Care, and separate Foundation funding when coverage still does not produce treatment."
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
                One access problem. Three ways we learned to attack it.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/70 md:text-xl">
                ValorWell evolved in sequence. Each path solved a real part of the access problem, then exposed the next place where coverage and care could still separate.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-16 md:py-24">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16">
              <div>
                <Stethoscope className="h-9 w-9 text-[#3B5147]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">01 — CHAMPVA</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">Make covered care reachable.</h2>
              </div>
              <div className="space-y-5 text-lg leading-8 text-[#111814]/70">
                <p>
                  ValorWell began with a military family that had CHAMPVA coverage and still could not find a therapist who would accept it. The first response was practical: build a clinical network and the operating systems needed to make that coverage usable.
                </p>
                <p className="font-bold text-[#3B5147]">
                  That created a path for military families, but it also revealed that unusable coverage was not limited to CHAMPVA.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide py-16 md:py-24">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16">
              <div>
                <ShieldCheck className="h-9 w-9 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">02 — VA Community Care (VACCN)</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">Work inside the authorized-care pathway.</h2>
              </div>
              <div className="space-y-5 text-lg leading-8 text-white/75">
                <p>
                  Veterans can be authorized for community care and still struggle to turn that authorization into an appointment. ValorWell works within VA Community Care where authorization, provider eligibility, region, clinician availability, and fit align.
                </p>
                <p className="font-bold text-white">
                  That helps close gaps inside the coverage system. It cannot solve every situation from outside that system.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-16 md:py-24">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16">
              <div>
                <HeartHandshake className="h-9 w-9 text-[#8A6814]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">03 — ValorWell Foundation</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">Cover the gap when care still does not happen.</h2>
              </div>
              <div className="space-y-5 text-lg leading-8 text-[#111814]/70">
                <p>
                  The ValorWell Foundation is separate from ValorWell. When a veteran is entitled to coverage but genuinely cannot reach treatment through the appropriate pathway, the Foundation can pay a qualified mental-health therapist directly for veteran treatment.
                </p>
                <p className="font-bold text-[#3B5147]">
                  100% of Foundation donations go directly to qualified mental-health therapists providing veteran treatment. None of those donations goes to ValorWell.
                </p>
                <p>
                  This is a stopgap that produces treatment now while the larger access problems continue to be addressed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#111814] text-white">
          <div className="container-wide py-16 md:py-20">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7A92E]">Start with your situation</p>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  Find the path that matches what is happening now.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
                <TrackedLink
                  to="/get-care"
                  event="how_it_works_find_care"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#F4F1E8] px-6 py-3 text-sm font-bold text-[#111814] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
                >
                  Find Care <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  to="/impact"
                  event="how_it_works_impact"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/35 px-6 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
                >
                  Foundation Impact <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}