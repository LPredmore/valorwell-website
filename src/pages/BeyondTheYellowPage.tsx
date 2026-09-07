import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
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

const FORM_ANCHOR = "bty-story-form";

const episodes = [
  {
    organization: "Veterans Breakfast Club",
    route: "/veteransbreakfastclub",
    videoId: "A4CUe3c8rJE",
    videoUrl: "https://www.youtube.com/watch?v=A4CUe3c8rJE",
    line: "Some veterans carry a story for decades. Sometimes the right room is what finally lets it out.",
    current: true,
  },
  {
    organization: "Veterans Outreach of Wisconsin",
    route: "/VOW",
    videoId: "hLvZfGcycOQ",
    videoUrl: "https://www.youtube.com/watch?v=hLvZfGcycOQ",
    line: "A tiny home is the beginning. Stability takes more than a roof.",
    current: false,
  },
  {
    organization: "GallantFew",
    route: "/gallantfew",
    videoId: "zsaTKjNVeew",
    videoUrl: "https://www.youtube.com/watch?v=zsaTKjNVeew",
    line: "The mission ends. The need for direction doesn’t.",
    current: false,
  },
  {
    organization: "Military Missions in Action",
    route: "/mmia",
    videoId: "19JpCgF-d9Q",
    videoUrl: "https://www.youtube.com/watch?v=19JpCgF-d9Q",
    line: "Practical support. A ramp. A furnished room. A ride.",
    current: false,
  },
] as const;

const currentEpisode = episodes[0];

type LaneValue = "share-story" | "nominate";

const faqs = [
  {
    value: "veterans-only",
    question: "Is Beyond The Yellow only for veteran organizations?",
    answer:
      "No. Veteran-serving and military-family organizations are a priority because they are closely connected to ValorWell's mission, but Beyond The Yellow can feature work in other cause areas when the story is strong and the work has real substance.",
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

function circularOffset(index: number, activeIndex: number) {
  const length = episodes.length;
  let offset = index - activeIndex;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

function carouselStyle(offset: number) {
  const distance = Math.abs(offset);

  if (distance === 0) {
    return {
      opacity: 1,
      zIndex: 30,
      transform: "translate(-50%, -50%) translateZ(0) scale(1) rotateY(0deg)",
    };
  }

  if (distance === 1) {
    return {
      opacity: 0.64,
      zIndex: 20,
      transform: `translate(-50%, -50%) translateX(${offset * 64}%) translateZ(-120px) scale(0.8) rotateY(${offset * -38}deg)`,
    };
  }

  return {
    opacity: 0.2,
    zIndex: 5,
    transform: "translate(-50%, -50%) translateZ(-330px) scale(0.64) rotateY(0deg)",
  };
}

export default function BeyondTheYellowPage() {
  const [selectedLane, setSelectedLane] = useState<LaneValue>("share-story");
  const [activeEpisode, setActiveEpisode] = useState(0);

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

  const rotateEpisodes = (direction: -1 | 1) => {
    setActiveEpisode((current) => (current + direction + episodes.length) % episodes.length);
    track("bty_episode_carousel", { direction: direction === 1 ? "next" : "previous" });
  };

  return (
    <>
      <Helmet>
        <title>Beyond The Yellow | Meet the People Doing the Work | ValorWell</title>
        <meta
          name="description"
          content="Beyond The Yellow puts the focus on people and organizations doing the work—not just talking about the problem. Watch the current conversation and meet the doers."
        />
        <meta property="og:title" content="Beyond The Yellow | ValorWell" />
        <meta
          property="og:description"
          content="Meet the people who stopped waiting for somebody else to solve the problem and started doing the work."
        />
        <meta
          property="og:image"
          content={`https://i.ytimg.com/vi/${currentEpisode.videoId}/maxresdefault.jpg`}
        />
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
                  <a
                    href={currentEpisode.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("bty_hero_watch")}
                    className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    Watch the Current Episode
                  </a>
                  <button
                    type="button"
                    onClick={() => chooseLane("nominate", "bty_hero_nominate")}
                    className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Nominate a Doer
                  </button>
                </div>

                <p className="mt-7 text-sm font-bold uppercase tracking-[0.14em] text-white/45">
                  Current episode · {currentEpisode.organization}
                </p>
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

          <section className="overflow-hidden border-b border-[#3B5147]/15 bg-[#F4F1E8]">
            <div className="container-wide py-20 text-center md:py-28">
              <Eyebrow>Meet the Doers</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-5xl text-3xl font-bold leading-tight md:text-5xl">
                These people didn&apos;t wait for somebody else to solve it.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#111814]/65">
                Start with the current episode, then move through a few of the people and organizations we have already sat down with.
              </p>

              <div
                className="relative mx-auto mt-10 h-[270px] max-w-6xl overflow-hidden sm:h-[350px] lg:h-[430px]"
                style={{ perspective: "1200px" }}
                aria-label="Beyond The Yellow episode carousel"
              >
                {episodes.map((episode, index) => {
                  const offset = circularOffset(index, activeEpisode);
                  const distance = Math.abs(offset);
                  const isActive = distance === 0;
                  const isSide = distance === 1;

                  return (
                    <article
                      key={episode.organization}
                      className="absolute left-1/2 top-1/2 w-[min(78vw,650px)] overflow-hidden rounded-3xl border border-[#111814]/15 bg-[#111814] text-left shadow-2xl transition-[transform,opacity] duration-500 motion-reduce:transition-none"
                      style={{
                        ...carouselStyle(offset),
                        transformStyle: "preserve-3d",
                        pointerEvents: distance > 1 ? "none" : "auto",
                      }}
                      aria-hidden={distance > 1}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={`https://i.ytimg.com/vi/${episode.videoId}/maxresdefault.jpg`}
                          alt={`${episode.organization} Beyond The Yellow episode`}
                          className="h-full w-full object-cover"
                          loading={isActive ? "eager" : "lazy"}
                          onError={(event) => {
                            event.currentTarget.src = `https://i.ytimg.com/vi/${episode.videoId}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" aria-hidden="true" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D7A92E] sm:text-xs">
                            {episode.current ? "Current episode" : "Past episode"}
                          </p>
                          <h3 className="mt-2 text-xl font-bold sm:text-2xl md:text-3xl">{episode.organization}</h3>
                          <p className="mt-2 hidden max-w-xl text-sm leading-6 text-white/70 sm:block">{episode.line}</p>
                        </div>
                      </div>

                      {isActive ? (
                        <Link
                          to={episode.route}
                          onClick={() => track("bty_episode_open", { organization: episode.organization })}
                          className="absolute inset-0 z-20 rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D7A92E]"
                          aria-label={`Open ${episode.organization} Beyond The Yellow feature`}
                        />
                      ) : isSide ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEpisode(index);
                            track("bty_episode_select", { organization: episode.organization });
                          }}
                          className="absolute inset-0 z-20 rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D7A92E]"
                          aria-label={`Bring ${episode.organization} episode forward`}
                        />
                      ) : null}
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => rotateEpisodes(-1)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#3B5147]/25 bg-white text-[#3B5147] transition hover:bg-[#3B5147] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
                  aria-label="Previous episode"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <p className="min-w-24 text-sm font-bold text-[#111814]/55" aria-live="polite">
                  {activeEpisode + 1} of {episodes.length}
                </p>
                <button
                  type="button"
                  onClick={() => rotateEpisodes(1)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#3B5147]/25 bg-white text-[#3B5147] transition hover:bg-[#3B5147] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
                  aria-label="Next episode"
                >
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <Link
                to="/network"
                onClick={() => track("bty_past_episodes")}
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-[#3B5147] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
              >
                See All Past Episodes
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
                  Tell Us What You&apos;re Building
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
