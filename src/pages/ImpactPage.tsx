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
        description="See how donations to ValorWell funded 540+ hours of direct therapy for 45+ veterans in 2026, read real veteran testimonials, and learn how donated funds pay therapists."
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
                Donor-funded therapy, counted after the care is delivered.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/72 md:text-xl">
                This page reports completed therapy provided through ValorWell&apos;s donor-funded care program for veterans who had sought mental-health care but still did not have an available treatment path.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <TrackedLink
                  to="/donate"
                  event="impact_hero_donate"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white hover:bg-[#31443b]"
                >
                  Support Donor-Funded Therapy
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <div className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#3B5147]/20 bg-white/70 px-5 py-3 text-sm font-bold text-[#3B5147]">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Snapshot {SNAPSHOT_DATE}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="rounded-3xl bg-[#111814] p-8 text-white shadow-xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                  Completed care in 2026
                </p>
                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-5xl font-bold text-[#D7A92E]">540+</p>
                    <p className="mt-2 text-sm text-white/65">hours of direct therapy</p>
                  </div>
                  <div className="border-t border-white/12 pt-6">
                    <p className="text-4xl font-bold">45+</p>
                    <p className="mt-2 text-sm text-white/60">unique veterans who received donor-funded care</p>
                  </div>
                </div>
                <p className="mt-7 border-t border-white/12 pt-5 text-sm leading-6 text-white/55">
                  These figures describe the donor-funded therapy program, not every service or activity operated by ValorWell.
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
                Asking for care does not always end with an available therapist.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-lg leading-8 text-white/75">
              <p>
                Veterans can encounter authorization, provider-network, capacity, scheduling, and other access barriers even after they have started seeking mental-health care.
              </p>
              <p>
                The donor-funded program gives ValorWell another way to pay for treatment when an existing pathway has not produced an available therapy option.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Eyebrow>How Donor-Funded Care Works</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Funding becomes impact when a therapy session is completed.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#111814]/65">
                Support for the ValorWell Foundation helps fund therapy through this program. The impact snapshot counts care that has already occurred rather than projected sessions or fundraising promises.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8 text-center">
                <HeartHandshake className="mx-auto h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6814]">01</p>
                <h3 className="mt-3 text-2xl font-bold">Support enters the program.</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  Donations support the Foundation&apos;s donor-funded therapy work.
                </p>
              </article>

              <article className="rounded-3xl bg-[#111814] p-8 text-center text-white">
                <Stethoscope className="mx-auto h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">02</p>
                <h3 className="mt-3 text-2xl font-bold">A therapist provides care.</h3>
                <p className="mt-3 leading-7 text-white/62">
                  The program pays for eligible completed therapy rather than asking the veteran to cover that session.
                </p>
              </article>

              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">03</p>
                <h3 className="mt-3 text-2xl font-bold">Completed care is counted.</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  Therapy time enters the public impact total only after the clinical service has been delivered.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide py-16 text-center md:py-20">
            <Eyebrow light>How Donations Relate to Care</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-5xl text-3xl font-bold leading-tight md:text-5xl">
              100% of the donated funds ValorWell receives go directly to therapists to pay for treatment.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/75">
              Donated funds are not used for administrative, technology, marketing, staffing, or other operating costs. Those expenses are funded separately.
            </p>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>Real Veterans. Real Impact.</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                The numbers tell us how much care was provided. These veterans tell us what that care meant.
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
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Eyebrow>You Do Not Have to Solve the Whole Problem Yourself</Eyebrow>
              <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
                Most supporters are building this one manageable monthly gift at a time.
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68">
                Across the donation platforms ValorWell uses, most donors are not funding an entire course of therapy by themselves. Their donations combine with support from other people to make the care possible.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-7">
                <p className="text-5xl font-bold text-[#3B5147]">72%</p>
                <h3 className="mt-4 text-xl font-bold">of 2026 donors give monthly</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  Recurring support gives ValorWell a more dependable way to keep therapy available when veterans reach out.
                </p>
              </article>

              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-7">
                <p className="text-5xl font-bold text-[#8A6814]">$25</p>
                <h3 className="mt-4 text-xl font-bold">is the most common monthly gift</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  Small recurring gifts matter because many supporters funding care together can do what one donor does not have to do alone.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[#111814] text-white">
          <div className="container-wide py-20 text-center md:py-24">
            <HeartHandshake className="mx-auto h-10 w-10 text-[#D7A92E]" aria-hidden="true" />
            <Eyebrow light>Support Donor-Funded Care</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
              Help make another completed therapy session possible.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
              Support goes through the ValorWell Foundation and helps fund the donor-funded therapy program described on this page.
            </p>
            <TrackedLink
              to="/donate"
              event="impact_final_donate"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] hover:bg-[#e2b943]"
            >
              Donate to the ValorWell Foundation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TrackedLink>
          </div>
        </section>
      </div>
    </Layout>
  );
}
