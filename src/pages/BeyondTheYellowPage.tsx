import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  HeartHandshake,
  PlayCircle,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BtyNominationForm } from "@/components/intake/BtyNominationForm";
import { UnifiedBtyForm } from "@/components/intake/UnifiedBtyForm";
import { trackHomeEvent } from "@/lib/tracking";
import btyHeroAsset from "@/assets/bty-hero.png.asset.json";

const btyOgImage = `https://www.valorwell.org${btyHeroAsset.url}`;

const FORM_ANCHOR = "bty-story-form";

type LaneValue = "share-story" | "nominate";

const faqs = [
  {
    value: "veterans-only",
    question: "Is Beyond The Yellow only for veteran organizations?",
    answer:
      "No. Veteran-serving and military-family organizations are a priority because they are closely connected to ValorWell's mission, but Beyond The Yellow can feature work in other cause areas when the story is strong and the work has real substance.",
  },
  {
    value: "promotion",
    question: "Is Beyond The Yellow a way to advertise ValorWell?",
    answer:
      "No. Beyond The Yellow is not a promotional vehicle for ValorWell or the ValorWell Foundation. Being featured is not an endorsement of ValorWell, and featured guests are not asked for referrals, partnerships, or testimonials. The series exists because organizations that spend their funding on their mission instead of on advertising tend to go unnoticed, and that should not cost them the attention their work has earned.",
  },
  {
    value: "self-submission",
    question: "Can an organization submit itself, or does someone else have to nominate it?",
    answer:
      "Either works. Organizations and individuals can put their own work forward using the submission form on this page, and anyone can nominate a person or organization they think deserves attention. Submitting yourself carries no disadvantage in how work is considered.",
  },
  {
    value: "cost",
    question: "Is there a cost to be considered or featured?",
    answer:
      "No. There is no fee to submit a story, nominate someone, be selected, record the conversation, or participate as an editorial guest. Financial support does not purchase a feature or determine editorial selection.",
  },
  {
    value: "selection",
    question: "How are stories selected?",
    answer:
      "Beyond The Yellow is curated. We look for work with a real-world consequence, people who would notice if that work disappeared, something viewers can learn from the person doing it, and enough depth to support a full conversation. Not every submission becomes an episode.",
  },
  {
    value: "receive",
    question: "What does a selected guest receive?",
    answer:
      "The core feature is a produced long-form conversation and, when appropriate, a permanent editorial feature page on ValorWell. A feature may also support clips, quotes, social posts, and additional distribution depending on the production plan. Specific audience or fundraising outcomes are not guaranteed.",
  },
] as const;

const track = (name: string, params: Record<string, unknown> = {}) =>
  trackHomeEvent(name, {
    page: "beyond-the-yellow",
    ...params,
  });

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

function scrollToForm() {
  if (typeof window === "undefined") return;
  const target = document.getElementById(FORM_ANCHOR);
  if (!target) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export default function BeyondTheYellowPage() {
  const [selectedLane, setSelectedLane] = useState<LaneValue>("share-story");

  useEffect(() => {
    track("bty_page_view");

    const requested = new URLSearchParams(window.location.search).get("form");
    if (requested !== "guest" && requested !== "nomination") return;

    setSelectedLane(requested === "nomination" ? "nominate" : "share-story");
    window.setTimeout(scrollToForm, 120);
  }, []);

  const chooseLane = (lane: LaneValue, event: string) => {
    setSelectedLane(lane);
    track(event, { lane });
    window.setTimeout(scrollToForm, 40);
  };

  return (
    <>
      <Helmet>
        <title>Beyond The Yellow | Meet the People Doing the Work | ValorWell</title>
        <meta
          name="description"
          content="Beyond The Yellow puts the focus on people and organizations doing the work—not just talking about the problem. Nominate a doer, share a story, and watch the conversations."
        />
        <meta property="og:title" content="Beyond The Yellow | ValorWell" />
        <meta
          property="og:description"
          content="Meet the people who stopped waiting for somebody else to solve the problem and started doing the work."
        />
        <meta property="og:image" content={btyOgImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/beyond-the-yellow" />
      </Helmet>

      <Header />
      <main className="bg-[#F4F1E8] text-[#111814]">
        <div className="bty-theme">
          <style>{`
            .bty-theme {
              font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            }
            .bty-theme h1,
            .bty-theme h2,
            .bty-theme h3,
            .bty-theme h4 {
              font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
              letter-spacing: -0.025em;
            }
          `}</style>

          <section className="relative overflow-hidden border-b border-white/10 bg-[#111814] text-white">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -right-36 -top-44 h-[30rem] w-[30rem] rounded-full bg-[#D7A92E]/10 blur-3xl" />
              <div className="absolute -bottom-48 -left-36 h-[30rem] w-[30rem] rounded-full bg-[#3B5147]/35 blur-3xl" />
            </div>

            <div className="container-wide relative py-20 md:py-28 lg:py-32">
              <div className="max-w-6xl">
                <Eyebrow light>Beyond Awareness. Into Action.</Eyebrow>
                <h1 className="mt-6 max-w-6xl text-4xl font-bold leading-[1.01] sm:text-5xl md:text-6xl lg:text-7xl">
                  We hear a lot from people saying someone needs to do something. We built this for the people who already are.
                </h1>
                <div className="mt-8 max-w-4xl space-y-5 text-lg leading-8 text-white/72 md:text-xl">
                  <p>
                    Every day, people post, share, advocate, wear the ribbon, change the profile picture, and tell the world which causes they support. Awareness can matter.
                  </p>
                  <p className="font-bold text-white">
                    But eventually, somebody has to do the work.
                  </p>
                  <p>
                    Beyond The Yellow exists to find those people, sit down with them, and put the attention back where it belongs: on the people turning concern into something another person can actually feel.
                  </p>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => chooseLane("nominate", "bty_hero_nominate")}
                    className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Nominate a Doer
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-[#3B5147]/15 bg-white">
            <div className="container-wide py-20 md:py-28">
              <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-6">
                  <Eyebrow>The Question We Should All Ask</Eyebrow>
                  <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
                    If your support disappeared tomorrow, who would notice?
                  </h2>
                </div>
                <div className="space-y-5 text-lg leading-8 text-[#111814]/68 lg:col-span-6">
                  <p>
                    It is easy to say we support veterans, mental health, families, hunger, homelessness, children, or whatever cause matters to us.
                  </p>
                  <p className="font-bold text-[#111814]">But support should mean something.</p>
                  <p>
                    If you stopped tomorrow, would anyone&apos;s life get harder? Would an organization lose something it needed? Would the people you say you support even know your support disappeared?
                  </p>
                  <p>
                    Those questions are not meant to shame anyone. They matter because there is a difference between caring about a problem and participating in the solution.
                  </p>
                </div>
              </div>

              <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Would a meal stop being served?",
                  "Would a safe place disappear?",
                  "Would someone lose a mentor or a resource?",
                  "Would anybody know you stopped showing up?",
                ].map((question) => (
                  <div key={question} className="rounded-2xl border border-[#3B5147]/15 bg-[#F4F1E8] p-6">
                    <p className="text-lg font-bold leading-7">{question}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 rounded-3xl bg-[#3B5147] p-8 text-white md:p-10">
                <Eyebrow light>Our Guests Can Answer That Question</Eyebrow>
                <h3 className="mt-4 max-w-5xl text-3xl font-bold leading-tight md:text-5xl">
                  If their work stopped, something would disappear. Someone would notice.
                </h3>
                <p className="mt-5 max-w-4xl text-lg leading-8 text-white/72">
                  People would lose services, opportunities, connection, practical help, or a place to turn. That real-world consequence is the point. Those are the people Beyond The Yellow was created to put in front of the camera.
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
            <div className="container-wide py-16 text-center md:py-20">
              <Eyebrow>Meet the people doing the work</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-bold leading-tight md:text-4xl">
                These people didn&apos;t wait for somebody else to solve it.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#111814]/65">
                Every Beyond The Yellow feature is a long-form conversation with someone whose work would leave a real gap if it disappeared. Hear how they started, what the work takes, and how others can take part.
              </p>
              <Link
                to="/network"
                onClick={() => track("bty_watch_stories")}
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
              >
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                Watch the Stories
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className="border-b border-white/10 bg-[#3B5147] text-white">
            <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <Eyebrow light>The Beyond The Yellow Test</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  What happens because you showed up?
                </h2>
              </div>
              <div className="lg:col-span-7">
                <div className="divide-y divide-white/12 border-y border-white/12">
                  {[
                    [
                      "Something changes.",
                      "There should be a real-world consequence to the work. Someone receives something, reaches something, learns something, escapes something, builds something, or becomes better equipped because the work exists.",
                    ],
                    [
                      "Someone would notice if it disappeared.",
                      "The work has enough consequence that taking it away would leave a real gap for the people who rely on it, participate in it, or benefit from it.",
                    ],
                    [
                      "Others can learn from it.",
                      "Beyond The Yellow is not an award. The conversation should help the rest of us understand what doing the work actually takes and how other people can participate.",
                    ],
                  ].map(([title, copy]) => (
                    <div key={title} className="py-7">
                      <h3 className="text-2xl font-bold">{title}</h3>
                      <p className="mt-3 leading-7 text-white/68">{copy}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-8 text-xl font-bold leading-8 text-white">
                  You don&apos;t need to be famous. You don&apos;t need the biggest nonprofit. You don&apos;t need a massive following. You need to be doing something worth paying attention to.
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-[#3B5147]/15 bg-white">
            <div className="container-wide py-20 md:py-28">
              <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-5">
                  <Eyebrow>Why This Exists</Eyebrow>
                  <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                    Good stewardship looks exactly like obscurity from the outside.
                  </h2>
                </div>
                <div className="space-y-5 text-lg leading-8 text-[#111814]/68 lg:col-span-7">
                  <p>
                    An organization that keeps its funding pointed at its mission is an organization that is not buying
                    ads, not retaining a PR firm, and not spending donated money to be seen. So the work stays quiet.
                    Not because it isn&apos;t working, but because nobody paid to tell you about it.
                  </p>
                  <p>
                    That is a bad trade for everyone. The groups being the most careful with their money end up
                    competing for attention against groups that spend money to get it, and losing. Discipline becomes
                    the reason they go unnoticed.
                  </p>
                  <p className="font-bold text-[#111814]">
                    Nobody should be penalized for refusing to spend their donors&apos; money on advertising.
                  </p>
                  <p>
                    Beyond The Yellow exists to take that penalty off the table. We spend the attention so they
                    don&apos;t have to.
                  </p>
                </div>
              </div>

              <div className="mt-12 rounded-3xl border border-[#3B5147]/20 bg-[#F4F1E8] p-8 md:p-10">
                <h3 className="text-2xl font-bold md:text-3xl">This is not a ValorWell commercial.</h3>
                <div className="mt-5 grid gap-5 text-lg leading-8 text-[#111814]/68 lg:grid-cols-2">
                  <p>
                    Beyond The Yellow is not here to promote ValorWell or the ValorWell Foundation. The people we
                    feature are not endorsing us, and we are not selling anything through their story. A guest owes
                    ValorWell nothing afterward: no referral, no partnership, no testimonial, no mention.
                  </p>
                  <p>
                    Nobody pays to be featured, and nobody is featured because they paid. We are not looking for
                    organizations that will say something nice about us. We are looking for work that deserves more
                    attention than it is getting.
                  </p>
                </div>
                <p className="mt-6 text-xl font-bold leading-8 text-[#111814]">
                  If an episode leaves you more interested in the organization we featured than in us, it did its job.
                </p>
              </div>
            </div>
          </section>

          <section id={FORM_ANCHOR} className="scroll-mt-24 border-b border-[#3B5147]/15 bg-white">
            <div className="container-wide py-20 md:py-28">
              <div className="max-w-4xl">
                <Eyebrow>Who Are We Missing?</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  Somebody is doing incredible work right now that almost nobody knows about.
                </h2>
                <div className="mt-5 max-w-3xl space-y-3 text-lg leading-8 text-[#111814]/65">
                  <p>Maybe it&apos;s you.</p>
                  <p>Maybe it&apos;s somebody you have watched quietly keep showing up while everyone else talks about the problem.</p>
                  <p className="font-bold text-[#111814]">Tell us who they are.</p>
                  <p>
                    Organizations are welcome to put themselves forward. Submitting your own work is not bragging
                    here, it is how we find out you exist. Use the first option below for your own organization, or
                    the second to nominate someone else.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-3" role="tablist" aria-label="Beyond The Yellow submission type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedLane === "share-story"}
                  onClick={() => chooseLane("share-story", "bty_form_share")}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-md px-5 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] ${
                    selectedLane === "share-story"
                      ? "bg-[#3B5147] text-white"
                      : "border border-[#3B5147]/25 text-[#3B5147]"
                  }`}
                >
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Submit Your Own Work
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedLane === "nominate"}
                  onClick={() => chooseLane("nominate", "bty_form_nominate")}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-md px-5 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] ${
                    selectedLane === "nominate"
                      ? "bg-[#3B5147] text-white"
                      : "border border-[#3B5147]/25 text-[#3B5147]"
                  }`}
                >
                  <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                  Nominate a Doer
                </button>
              </div>

              <div className="mt-8 rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-5 md:p-8">
                {selectedLane === "share-story" ? <UnifiedBtyForm /> : <BtyNominationForm />}
              </div>
            </div>
          </section>

          <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
            <div className="container-wide py-20 md:py-28">
              <div className="max-w-3xl">
                <Eyebrow>Common Questions</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  About submissions and features.
                </h2>
              </div>

              <Accordion type="single" collapsible className="mt-10 max-w-4xl">
                {faqs.map((item) => (
                  <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger className="text-left text-lg font-bold">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base leading-7 text-[#111814]/65">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <section className="bg-[#111814] text-white">
            <div className="container-wide py-20 text-center md:py-28">
              <Eyebrow light>Beyond The Yellow</Eyebrow>
              <h2 className="mx-auto mt-5 max-w-5xl text-3xl font-bold leading-tight md:text-5xl">
                Caring is where it starts. What you do next is what matters.
              </h2>
              <div className="mx-auto mt-6 max-w-3xl space-y-4 text-lg leading-8 text-white/70">
                <p>
                  There will always be another problem to talk about. Another post to share. Another person saying somebody should do something.
                </p>
                <p className="font-bold text-white">
                  We want to know the people who stopped waiting for “somebody.”
                </p>
              </div>
              <p className="mx-auto mt-8 max-w-4xl text-2xl font-bold text-[#D7A92E] md:text-3xl">
                Others are going Beyond The Yellow. How about you?
              </p>
              <button
                type="button"
                onClick={() => chooseLane("nominate", "bty_final_nominate")}
                className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#111814] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
              >
                Nominate a Doer
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}