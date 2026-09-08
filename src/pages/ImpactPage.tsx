import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Quote,
  Stethoscope,
} from "lucide-react";
import { DonateButton } from "@/components/DonateButton";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

const SNAPSHOT_DATE = "September 5, 2026";

const testimonials = [
  {
    initials: "J.B.",
    branch: "U.S. Army",
    state: "Michigan",
    quote:
      "For years, I was just a name on a VA waiting list. I was a soldier, a wife, and a mother, but I felt like I was disappearing. ValorWell stepped in when the system failed, providing the therapy I desperately needed to be present for my children again. They didn't just provide a service; they gave me my family back.",
  },
  {
    initials: "M.G.",
    branch: "U.S. Marine Corps",
    state: "Nevada",
    quote:
      "I spent years believing I had to fight the war in my head alone. When I finally asked for help, the VA told me I was on a list—but while I waited, the walls were closing in. I felt invisible to the country I served. ValorWell didn't just find me a therapist; they gave me a lifeline when I was at my lowest point. For the first time in a decade, I feel like I’m finally coming home.",
  },
  {
    initials: "B.F.",
    branch: "U.S. Navy",
    state: "Arkansas",
    quote:
      "I could feel my family slipping away from me. My marriage was fracturing, and I was becoming a stranger to my own children. I reached out to the VA repeatedly, but my crisis was treated like a clerical error—I was told to wait, over and over, while my home life fell apart. ValorWell stepped in when I had nothing left to give. They provided the therapy that gave me the tools to understand my trauma and, more importantly, how to communicate through it. Because of ValorWell, I didn't just get help—I got my family back.",
  },
];

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
      onClick={() => trackHomeEvent(event, { page: "impact" })}
      className={className}
    >
      {children}
    </Link>
  );
}

export default function ImpactPage() {
  useEffect(() => {
    trackHomeEvent("impact_page_view", { page: "impact" });
  }, []);

  return (
    <Layout>
      <SEO
        title="ValorWell Impact | Donor-Funded Therapy for Veterans"
        description="See how donors helped fund 540+ hours of direct therapy for 45+ veterans in 2026, read real veteran testimonials, and see how donated funds pay therapists."
        canonical="/impact"
      />

      <div className="impact-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .impact-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .impact-theme h1,
          .impact-theme h2,
          .impact-theme h3,
          .impact-theme h4 {
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
            <div className="lg:col-span-8">
              <Eyebrow>2026 Impact</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                Veterans asked for help. Donors made sure they got therapy.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/72 md:text-xl">
                When the normal path failed to get veterans into treatment, ValorWell used donated funds to pay therapists directly. In 2026, that meant 540+ hours of therapy for 45+ veterans who had already sought mental-health care but still did not have an available path into treatment.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <DonateButton
                  source="impact-hero"
                  utmCampaign="the-valorwell-bridge-fund"
                  utmContent="hero"
                  className="min-h-12 bg-[#3B5147] px-6 py-3 text-sm font-bold text-white hover:bg-[#31443b]"
                >
                  Help Pay for the Next Therapy Session
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </DonateButton>
                <div className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#3B5147]/20 bg-white/70 px-5 py-3 text-sm font-bold text-[#3B5147]">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Snapshot {SNAPSHOT_DATE}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="rounded-3xl bg-[#111814] p-8 text-white shadow-xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                  What donors made possible in 2026
                </p>
                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-5xl font-bold text-[#D7A92E]">540+</p>
                    <p className="mt-2 text-sm text-white/65">hours of direct therapy</p>
                  </div>
                  <div className="border-t border-white/12 pt-6">
                    <p className="text-4xl font-bold">45+</p>
                    <p className="mt-2 text-sm text-white/60">veterans who received donor-funded care</p>
                  </div>
                </div>
                <p className="mt-7 border-t border-white/12 pt-5 text-sm leading-6 text-white/55">
                  This is the impact of ValorWell&apos;s donor-funded therapy program—not every service or activity operated by ValorWell.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>Why the Program Exists</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Asking for help shouldn&apos;t end with another waiting list.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-lg leading-8 text-white/75">
              <p>
                These veterans had already taken the hardest step: they asked for mental-health care.
              </p>
              <p>
                But authorization problems, provider shortages, scheduling barriers, limited capacity, and other breakdowns still left them without a therapist.
              </p>
              <p className="font-semibold text-white">
                That is the gap this program exists to fill. When the existing care pathway does not get a veteran into treatment, donor funding gives ValorWell another option: pay the therapist and get the veteran into care.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Eyebrow>How Donor-Funded Care Works</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                A donation becomes therapy. That&apos;s the point.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#111814]/65">
                The model is deliberately simple: people donate, ValorWell pays the therapist, and the veteran gets care. We count the impact after treatment is actually delivered—not when money is pledged and not when a session is merely planned.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8 text-center">
                <HeartHandshake className="mx-auto h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6814]">01</p>
                <h3 className="mt-3 text-2xl font-bold">People give.</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  Donations support the ValorWell Foundation&apos;s donor-funded therapy program.
                </p>
              </article>

              <article className="rounded-3xl bg-[#111814] p-8 text-center text-white">
                <Stethoscope className="mx-auto h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">02</p>
                <h3 className="mt-3 text-2xl font-bold">ValorWell pays the therapist.</h3>
                <p className="mt-3 leading-7 text-white/62">
                  Donated funds cover the therapist&apos;s time so the veteran does not have to pay for that session.
                </p>
              </article>

              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">03</p>
                <h3 className="mt-3 text-2xl font-bold">The veteran gets therapy.</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  Once the session actually happens, that completed treatment becomes part of the impact shown on this page.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide py-16 text-center md:py-20">
            <Eyebrow light>Where the Money Goes</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-5xl text-3xl font-bold leading-tight md:text-5xl">
              100% of the donated funds ValorWell receives go directly to therapists to pay for treatment.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/75">
              Not administration. Not technology. Not marketing. Not staffing. Those costs are funded separately. Donated funds pay therapists to provide mental-health treatment to veterans.
            </p>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>Real Veterans. Real Impact.</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                540+ hours is a number. This is what some of those hours meant.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <article
                  key={testimonial.initials}
                  className={
                    index === 1
                      ? "flex h-full flex-col rounded-3xl bg-[#111814] p-8 text-white"
                      : "flex h-full flex-col rounded-3xl border border-[#3B5147]/15 bg-white p-8"
                  }
                >
                  <Quote
                    className={index === 1 ? "h-8 w-8 text-[#D7A92E]" : "h-8 w-8 text-[#3B5147]"}
                    aria-hidden="true"
                  />
                  <blockquote
                    className={
                      index === 1
                        ? "mt-6 flex-1 text-lg leading-8 text-white/78"
                        : "mt-6 flex-1 text-lg leading-8 text-[#111814]/68"
                    }
                  >
                    “{testimonial.quote}”
                  </blockquote>
                  <div className={index === 1 ? "mt-8 border-t border-white/12 pt-5" : "mt-8 border-t border-[#3B5147]/12 pt-5"}>
                    <p className={index === 1 ? "font-bold text-white" : "font-bold text-[#111814]"}>
                      {testimonial.initials}
                    </p>
                    <p className={index === 1 ? "mt-1 text-sm text-white/55" : "mt-1 text-sm text-[#111814]/55"}>
                      {testimonial.branch} · {testimonial.state}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-7">
                <Eyebrow>This Only Works Because People Do It Together</Eyebrow>
                <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
                  Most people don&apos;t change their whole budget to help. They change one small priority.
                </h2>
                <div className="mt-6 max-w-3xl space-y-5 text-lg leading-8 text-[#111814]/68">
                  <p>
                    For one person, it might be one meal out each month. For someone else, it might be one Starbucks coffee a week.
                  </p>
                  <p>
                    On its own, that doesn&apos;t feel like much. <strong className="text-[#111814]">But you&apos;re not doing this on your own.</strong>
                  </p>
                  <p>
                    You&apos;re joining other people who have already decided that helping a veteran get mental-health treatment matters more than one small thing they could have spent that money on instead.
                  </p>
                  <p className="font-bold text-[#3B5147]">
                    And when enough people make that choice together, those small decisions become something much bigger: they become therapy.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-7">
                  <p className="text-5xl font-bold text-[#3B5147]">72%</p>
                  <h3 className="mt-4 text-xl font-bold">of 2026 donors give monthly</h3>
                  <p className="mt-3 leading-7 text-[#111814]/62">
                    Most of the people supporting this work aren&apos;t writing enormous checks. They&apos;re simply deciding, month after month, that this belongs on the list of things worth making room for.
                  </p>
                </article>

                <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-7">
                  <p className="text-5xl font-bold text-[#8A6814]">$25</p>
                  <h3 className="mt-4 text-xl font-bold">is the most common monthly gift</h3>
                  <p className="mt-3 leading-7 text-[#111814]/62">
                    Twenty-five dollars does not have to fund an entire course of therapy. It doesn&apos;t have to. Another person gives $25. Someone else gives $50. Someone else gives what they can. Together, it becomes enough to put a veteran in front of a therapist.
                  </p>
                </article>
              </div>
            </div>

            <div className="mt-12 rounded-3xl bg-[#111814] p-8 text-white md:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                The Question Is Smaller Than You Think
              </p>
              <h3 className="mt-4 max-w-4xl text-2xl font-bold leading-tight md:text-4xl">
                What is one thing in your month that matters less to you than helping make sure a veteran gets care?
              </h3>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">
                A dinner out. A few coffees. Another subscription. Something else entirely.
              </p>
              <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-white">
                A lot of people have already made that choice. You can be one of them.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#111814] text-white">
          <div className="container-wide py-20 text-center md:py-24">
            <HeartHandshake className="mx-auto h-10 w-10 text-[#D7A92E]" aria-hidden="true" />
            <Eyebrow light>Help the Next Veteran Get Seen</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
              The next veteran shouldn&apos;t keep waiting because the system stalled.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
              Another veteran will ask for mental-health care and still struggle to reach a therapist. Your donation gives ValorWell another option: you help us pay the therapist, and we help the veteran get into treatment.
            </p>
            <DonateButton
              source="impact-final"
              utmCampaign="the-valorwell-bridge-fund"
              utmContent="final"
              className="mt-8 min-h-12 bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] hover:bg-[#e2b943]"
            >
              Help Pay for the Next Therapy Session
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </DonateButton>
          </div>
        </section>
      </div>
    </Layout>
  );
}
