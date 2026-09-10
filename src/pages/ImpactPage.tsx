import { useEffect, type ReactNode } from "react";
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
const THERAPY_HOURS = "540+";
const SESSION_COST = "$75";

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

export default function ImpactPage() {
  useEffect(() => {
    trackHomeEvent("impact_page_view", { page: "impact" });
  }, []);

  return (
    <Layout>
      <SEO
        title="ValorWell Foundation Impact | $75 Funds One Therapy Session"
        description="See the ValorWell Foundation's donor-funded therapy impact. $75 funds one completed therapy session, and 100% of Foundation donations go directly to qualified mental-health therapists—not to ValorWell."
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
              <Eyebrow>ValorWell Foundation Impact</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                Every Foundation donation pays for therapy. None goes to ValorWell.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/72 md:text-xl">
                ValorWell and the ValorWell Foundation are separate organizations. ValorWell is a nationwide platform for providing therapy to veterans and their families. The ValorWell Foundation pays qualified mental-health therapists in the community to treat veterans who cannot get seen through the appropriate VA care channels.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <DonateButton
                  source="impact-hero"
                  utmCampaign="the-valorwell-bridge-fund"
                  utmContent="hero"
                  className="min-h-12 bg-[#3B5147] px-6 py-3 text-sm font-bold text-white hover:bg-[#31443b]"
                >
                  Fund One $75 Therapy Session
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
                  Therapy actually delivered
                </p>
                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-5xl font-bold text-[#D7A92E]">{THERAPY_HOURS}</p>
                    <p className="mt-2 text-sm text-white/65">hours of direct therapy paid for</p>
                  </div>
                  <div className="border-t border-white/12 pt-6">
                    <p className="text-4xl font-bold">{SESSION_COST}</p>
                    <p className="mt-2 text-sm text-white/60">funds one completed therapy session</p>
                  </div>
                </div>
                <p className="mt-7 border-t border-white/12 pt-5 text-sm leading-6 text-white/55">
                  We report completed therapy—not total donations received or total dollars spent.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-4xl">
              <Eyebrow light>Two Organizations. Different Roles.</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                The Foundation is not ValorWell, and Foundation donations do not fund ValorWell.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl border border-white/12 bg-white/[0.05] p-8">
                <Stethoscope className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">ValorWell</p>
                <h3 className="mt-3 text-2xl font-bold">Nationwide therapy platform</h3>
                <p className="mt-4 leading-7 text-white/68">
                  ValorWell provides mental-health care pathways for veterans and their families, including the clinician, technology, scheduling, billing, and care infrastructure that supports treatment.
                </p>
                <p className="mt-4 font-semibold leading-7 text-white">
                  ValorWell does not receive the money donated to the ValorWell Foundation.
                </p>
              </article>

              <article className="rounded-3xl border border-[#D7A92E]/40 bg-[#D7A92E]/10 p-8">
                <HeartHandshake className="h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">ValorWell Foundation</p>
                <h3 className="mt-3 text-2xl font-bold">Pays therapists for veteran treatment</h3>
                <p className="mt-4 leading-7 text-white/68">
                  The Foundation provides payment for therapy when a veteran has sought care but cannot get seen through the appropriate VA channels. The money is paid to qualified mental-health therapists in the community for providing that treatment.
                </p>
                <p className="mt-4 font-semibold leading-7 text-white">
                  100% of Foundation donations go directly to therapists providing care.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>Why the Foundation Exists</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Asking for help should not end with another waiting list.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-lg leading-8 text-white/75">
              <p>
                Veterans can do everything they are supposed to do—ask for mental-health care, pursue the appropriate VA pathway, and still be left without an available therapist.
              </p>
              <p>
                Authorization problems, provider shortages, scheduling barriers, limited capacity, and other breakdowns can still leave a veteran waiting for treatment.
              </p>
              <p className="font-semibold text-white">
                The ValorWell Foundation exists to close that gap by paying qualified community therapists to provide the treatment the veteran otherwise could not reach.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Eyebrow>How a Donation Becomes Therapy</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Donor → Foundation → therapist → veteran.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#111814]/65">
                There is no step where Foundation donation dollars are transferred to ValorWell. The Foundation uses those donations to pay qualified mental-health therapists for completed veteran treatment.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8 text-center">
                <HeartHandshake className="mx-auto h-8 w-8 text-[#8A6814]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6814]">01</p>
                <h3 className="mt-3 text-2xl font-bold">You donate to the Foundation.</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  Your donation is made to the ValorWell Foundation for veteran therapy.
                </p>
              </article>

              <article className="rounded-3xl bg-[#111814] p-8 text-center text-white">
                <Stethoscope className="mx-auto h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">02</p>
                <h3 className="mt-3 text-2xl font-bold">The Foundation pays the therapist.</h3>
                <p className="mt-3 leading-7 text-white/62">
                  Every $75 funds one completed therapy session with a qualified mental-health therapist.
                </p>
              </article>

              <article className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">03</p>
                <h3 className="mt-3 text-2xl font-bold">The veteran receives therapy.</h3>
                <p className="mt-3 leading-7 text-[#111814]/62">
                  Once treatment is delivered, that completed therapy is added to the public impact total.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide py-16 text-center md:py-20">
            <Eyebrow light>Where 100% of the Money Goes</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-5xl text-3xl font-bold leading-tight md:text-5xl">
              100% of every donation to the ValorWell Foundation goes directly to qualified mental-health therapists providing treatment to veterans.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/75">
              None of it goes to ValorWell. Foundation donations are not used for ValorWell administration, technology, marketing, staffing, or operating costs. They pay therapists in the community for providing veteran mental-health treatment.
            </p>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-8 md:grid-cols-2">
              <article className="rounded-3xl bg-[#111814] p-8 text-white">
                <p className="text-6xl font-bold text-[#D7A92E]">{THERAPY_HOURS}</p>
                <h2 className="mt-4 text-2xl font-bold">hours of direct therapy paid for</h2>
                <p className="mt-4 leading-7 text-white/65">
                  The public impact total counts therapy that was actually delivered between veterans and therapists.
                </p>
              </article>
              <article className="rounded-3xl border border-[#D7A92E]/35 bg-[#F8F3E4] p-8">
                <p className="text-6xl font-bold text-[#8A6814]">{SESSION_COST}</p>
                <h2 className="mt-4 text-2xl font-bold">funds one therapy session</h2>
                <p className="mt-4 leading-7 text-[#111814]/65">
                  That is the donor math we want to make clear. We do not need a total-dollars-raised or total-dollars-spent figure to explain the impact.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>Real Veterans. Real Impact.</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                {THERAPY_HOURS} hours is a number. This is what some of those hours meant.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <article
                  key={testimonial.initials}
                  className={
                    index === 1
                      ? "flex h-full flex-col rounded-3xl bg-[#111814] p-8 text-white"
                      : "flex h-full flex-col rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8"
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

        <section className="bg-[#111814] text-white">
          <div className="container-wide py-20 text-center md:py-24">
            <HeartHandshake className="mx-auto h-10 w-10 text-[#D7A92E]" aria-hidden="true" />
            <Eyebrow light>Fund the Next Session</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
              $75 funds one therapy session for a veteran who could not reach care through the appropriate VA channels.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/70">
              100% of your donation to the ValorWell Foundation goes directly to qualified mental-health therapists providing treatment. None of it goes to ValorWell.
            </p>
            <DonateButton
              source="impact-final"
              utmCampaign="the-valorwell-bridge-fund"
              utmContent="final"
              className="mt-8 min-h-12 bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] hover:bg-[#e2b943]"
            >
              Fund One $75 Therapy Session
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </DonateButton>
          </div>
        </section>
      </div>
    </Layout>
  );
}
