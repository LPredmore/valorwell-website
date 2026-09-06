import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  HeartHandshake,
  Network,
  PlayCircle,
  Users,
  Video,
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
const LATEST_VIDEO_URL = "https://www.youtube.com/watch?v=A4CUe3c8rJE";

type LaneValue = "share-story" | "nominate";

const featuredOrganizations = [
  {
    name: "Veterans Breakfast Club",
    route: "/veteransbreakfastclub",
    statement:
      "Creating spaces where veterans can tell the stories they have carried—and where families and civilians can hear them.",
  },
  {
    name: "GallantFew",
    route: "/gallantfew",
    statement:
      "Helping veterans find direction, connection, and purpose after military service.",
  },
  {
    name: "Veterans Outreach of Wisconsin",
    route: "/VOW",
    statement:
      "Tiny homes, food access, peer support, and a path back to permanent stability.",
  },
  {
    name: "Military Missions in Action",
    route: "/mmia",
    statement:
      "Ramps, furnished homes, transportation, and practical help for veterans and families.",
  },
  {
    name: "VETS2INDUSTRY",
    route: "/vets2industry",
    statement:
      "Making the military and veteran resource ecosystem easier to find and use.",
  },
] as const;

const faqs = [
  {
    value: "veterans-only",
    question: "Is Beyond The Yellow only for veteran organizations?",
    answer:
      "No. Veteran-serving and military-family organizations are a priority because they are closely connected to ValorWell's mission, but Beyond The Yellow can feature work in other cause areas when the story is strong and useful to viewers.",
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
      "Beyond The Yellow is curated. We look for a specific body of work, a clear reason the story matters, a conversation that can teach viewers something, and enough substance to support a full feature. Not every submission becomes an episode.",
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
        <title>Beyond The Yellow | Featured Organizations & Conversations | ValorWell</title>
        <meta
          name="description"
          content="Beyond The Yellow features conversations with organizations, founders, volunteers, and community leaders doing work worth knowing about."
        />
        <meta property="og:title" content="Beyond The Yellow | ValorWell" />
        <meta
          property="og:description"
          content="Watch conversations and explore organizations featured through Beyond The Yellow."
        />
        <meta
          property="og:image"
          content="https://i.ytimg.com/vi/A4CUe3c8rJE/maxresdefault.jpg"
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

            <div className="container-wide relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:py-28">
              <div className="lg:col-span-7">
                <Eyebrow light>Beyond The Yellow</Eyebrow>
                <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl lg:text-7xl">
                  Conversations with people and organizations doing work worth knowing about.
                </h1>
                <p className="mt-7 max-w-3xl text-lg leading-8 text-white/72 md:text-xl">
                  Beyond The Yellow is ValorWell's interview and feature series about organizations, founders, volunteers, and community leaders building programs, services, resources, and opportunities that affect people's lives.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <a
                    href={LATEST_VIDEO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("bty_hero_watch")}
                    className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] transition hover:brightness-95"
                  >
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    Watch the Latest Conversation
                  </a>
                  <button
                    type="button"
                    onClick={() => chooseLane("nominate", "bty_hero_nominate")}
                    className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Nominate Someone
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-3xl border border-white/12 bg-white/[0.06] shadow-2xl">
                  <a
                    href={LATEST_VIDEO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("bty_hero_latest")}
                    className="group block"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src="https://i.ytimg.com/vi/A4CUe3c8rJE/maxresdefault.jpg"
                        alt="Veterans Breakfast Club Beyond The Yellow conversation"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
                      <div className="absolute bottom-5 left-5 right-5">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D7A92E]">Latest conversation</p>
                        <p className="mt-2 text-2xl font-bold text-white">Veterans Breakfast Club</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-[#3B5147]/15 bg-white">
            <div className="container-wide py-20 md:py-28">
              <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-8">
                  <Eyebrow>Featured Organizations</Eyebrow>
                  <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                    Explore organizations already featured through Beyond The Yellow.
                  </h2>
                </div>
                <div className="lg:col-span-4 lg:text-right">
                  <Link
                    to="/network"
                    onClick={() => track("bty_network")}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#3B5147]/25 px-5 py-3 text-sm font-bold text-[#3B5147]"
                  >
                    <Network className="h-4 w-4" aria-hidden="true" />
                    Explore the Network
                  </Link>
                </div>
              </div>

              <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featuredOrganizations.map((organization) => (
                  <Link
                    key={organization.name}
                    to={organization.route}
                    onClick={() => track("bty_featured_org", { organization: organization.name })}
                    className="group rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-7 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <Building2 className="h-7 w-7 text-[#3B5147]" aria-hidden="true" />
                    <h3 className="mt-5 text-2xl font-bold">{organization.name}</h3>
                    <p className="mt-4 leading-7 text-[#111814]/64">{organization.statement}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
                      Read the Feature <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 bg-[#3B5147] text-white">
            <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <Eyebrow light>What We Look For</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  A specific body of work and a conversation worth having.
                </h2>
              </div>
              <div className="lg:col-span-7">
                <div className="divide-y divide-white/12 border-y border-white/12">
                  {[
                    ["There is something concrete to discuss", "A program, service, organization, project, approach, or result gives the conversation substance."],
                    ["The audience can learn something", "The guest can explain the problem, the work, the decisions behind it, or how people can participate."],
                    ["The story can support a full feature", "There is enough depth for a long-form conversation rather than only a short promotional mention."],
                  ].map(([title, copy]) => (
                    <div key={title} className="py-7">
                      <h3 className="text-xl font-bold">{title}</h3>
                      <p className="mt-2 leading-7 text-white/65">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
            <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <Eyebrow>Watch More</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  Interviews, clips, and other ValorWell video content live in Watch.
                </h2>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[#111814]/65">
                  Use Watch for Beyond The Yellow conversations alongside practical veteran and family content from ValorWell.
                </p>
              </div>
              <div className="lg:col-span-5 lg:text-right">
                <Link
                  to="/watch"
                  onClick={() => track("bty_watch_hub")}
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white"
                >
                  <Video className="h-4 w-4" aria-hidden="true" />
                  Watch ValorWell
                </Link>
              </div>
            </div>
          </section>

          <section id={FORM_ANCHOR} className="scroll-mt-24 border-b border-[#3B5147]/15 bg-white">
            <div className="container-wide py-20 md:py-28">
              <div className="max-w-3xl">
                <Eyebrow>Submit a Story</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  Share your work or nominate someone else.
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#111814]/65">
                  Choose the path that matches your relationship to the story. Submissions are reviewed for editorial fit; submitting does not guarantee a feature.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-3" role="tablist" aria-label="Beyond The Yellow submission type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedLane === "share-story"}
                  onClick={() => chooseLane("share-story", "bty_form_share")}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-md px-5 py-3 text-sm font-bold ${
                    selectedLane === "share-story"
                      ? "bg-[#3B5147] text-white"
                      : "border border-[#3B5147]/25 text-[#3B5147]"
                  }`}
                >
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Share My Work
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedLane === "nominate"}
                  onClick={() => chooseLane("nominate", "bty_form_nominate")}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-md px-5 py-3 text-sm font-bold ${
                    selectedLane === "nominate"
                      ? "bg-[#3B5147] text-white"
                      : "border border-[#3B5147]/25 text-[#3B5147]"
                  }`}
                >
                  <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                  Nominate Someone
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
            <div className="container-wide py-20 text-center md:py-24">
              <Eyebrow light>Beyond The Yellow</Eyebrow>
              <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
                Know an organization or person whose work deserves a closer look?
              </h2>
              <button
                type="button"
                onClick={() => chooseLane("nominate", "bty_final_nominate")}
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#111814]"
              >
                Nominate Someone
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
