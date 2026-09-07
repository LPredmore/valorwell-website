import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Home,
  MessageCircle,
  PlayCircle,
  Radio,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const videoId = "A4CUe3c8rJE";
const videoUrl = "https://www.youtube.com/watch?v=A4CUe3c8rJE";
const websiteUrl = "https://veteransbreakfastclub.org/";
const whatWeDoUrl = "https://veteransbreakfastclub.org/what-we-do/";
const eventsUrl = "https://veteransbreakfastclub.org/events/";

const impact = [
  { value: "2008", label: "Veterans Breakfast Club storytelling gatherings began" },
  { value: "15,500+", label: "Quarterly magazine distribution per issue" },
  { value: "Nearly 5K", label: "Weekly VBC Bulletin subscribers" },
  { value: "2026", label: "First permanent VBC Welcome Center opened" },
] as const;

const programs = [
  {
    icon: Users,
    title: "In-person storytelling",
    body: "Veterans, family members, friends, and civilians gather for informal events centered on first-person military stories and conversation.",
  },
  {
    icon: Radio,
    title: "Live and online conversations",
    body: "VBC extends those conversations online so veterans from different eras and locations can participate and listeners can hear directly from people who served.",
  },
  {
    icon: BookOpen,
    title: "Published and archived stories",
    body: "VBC Magazine, the weekly Bulletin, oral-history work, and other media keep stories available beyond the room where they were first told.",
  },
  {
    icon: Home,
    title: "A permanent gathering place",
    body: "The VBC Welcome Center in Pittsburgh provides a physical home for storytelling, education, community events, and veteran connection.",
  },
] as const;

export default function VeteransBreakfastClubPage() {
  return (
    <>
      <Helmet>
        <title>Veterans Breakfast Club | Beyond The Yellow | ValorWell</title>
        <meta
          name="description"
          content="Explore ValorWell's Beyond The Yellow feature with Veterans Breakfast Club and Director of Programming Shaun Hall on veteran storytelling, listening, community, and preserving first-person military history."
        />
        <meta property="og:title" content="Veterans Breakfast Club | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A Beyond The Yellow feature on veteran storytelling, active listening, live conversations, publishing, and community."
        />
        <meta property="og:image" content={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/veteransbreakfastclub" />
      </Helmet>

      <Header />
      <main id="main" className="overflow-hidden bg-background">
        <section className="relative border-b border-white/10 bg-[hsl(var(--navy))] text-white">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-[hsl(var(--gold-accent))]/12 blur-3xl" />
            <div className="absolute -right-24 -top-24 h-[30rem] w-[30rem] rounded-full bg-white/[0.04] blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-24">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--gold-accent))]">
                Beyond The Yellow · Feature Story
              </p>
              <h1 className="mt-7 text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Some veterans carry a story for decades.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">Sometimes the right room is what lets it out.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                Veterans Breakfast Club builds in-person and online communities around veterans telling first-person stories and other people listening closely enough to preserve them.
              </p>
              <div className="mt-8 border-l-2 border-[hsl(var(--gold-accent))] pl-5">
                <p className="text-sm font-bold text-white">Shaun Hall</p>
                <p className="mt-1 text-sm text-white/60">Director of Programming · Veterans Breakfast Club</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/40">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title="Beyond The Yellow conversation with Shaun Hall of Veterans Breakfast Club"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
              >
                <PlayCircle className="h-4 w-4 text-[hsl(var(--gold-accent))]" aria-hidden="true" />
                Watch on YouTube
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Why VBC is featured</p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Listening can be an operating model, not just a sentiment.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                The Beyond The Yellow conversation examines what happens when veterans are given low-pressure places to tell stories in their own words—stories that may be funny, difficult, historically important, ordinary, or never previously shared with family members.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(var(--navy))] py-14 text-white md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {impact.map((item) => (
                <div key={item.value} className="border-l border-white/15 pl-5">
                  <p className="text-4xl font-black tracking-tight text-[hsl(var(--gold-accent))] md:text-5xl">{item.value}</p>
                  <p className="mt-2 max-w-[18rem] text-sm leading-6 text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-9 text-xs leading-5 text-white/55">
              Veterans Breakfast Club public program and reach information reviewed September 6, 2026. {" "}
              <a href={whatWeDoUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">
                Review VBC's program information
              </a>
              .
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">How the work operates</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                The same storytelling mission moves across rooms, broadcasts, publications, and a permanent center.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {programs.map(({ icon: Icon, title, body }) => (
                <article key={title} className="rounded-2xl border border-border bg-background p-7 md:p-8">
                  <Icon className="h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
                  <h3 className="mt-6 text-2xl font-black tracking-tight text-foreground">{title}</h3>
                  <p className="mt-4 leading-7 text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Continue with Veterans Breakfast Club</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Events, publications, and current programs are maintained by VBC.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-muted-foreground">
                ValorWell is publishing the conversation and feature. Veterans Breakfast Club owns its event calendar, Welcome Center information, publications, subscriptions, and current program details.
              </p>
            </div>
            <div className="grid gap-3 lg:col-span-5">
              <a href={eventsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white">
                View VBC Events
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-black text-foreground">
                Visit Veterans Breakfast Club
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[hsl(var(--section-alt))] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <MessageCircle className="mx-auto h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
            <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
              Explore more published Beyond The Yellow features.
            </h2>
            <a href="/network" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white">
              Featured Organizations
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
