import { Helmet } from "react-helmet-async";
import {
  Accessibility,
  ArrowRight,
  ArrowUpRight,
  Car,
  Home,
  Package,
  PlayCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const videoId = "19JpCgF-d9Q";
const videoUrl = "https://www.youtube.com/watch?v=19JpCgF-d9Q";
const mmiaUrl = "https://www.militarymissionsinaction.org/";

const impact = [
  { value: "126,463", label: "Veterans of all eras served" },
  { value: "832", label: "Building projects completed" },
  { value: "767", label: "Veterans' homes furnished" },
  { value: "87%", label: "Of each dollar reported going to programs and services" },
] as const;

const programs = [
  {
    icon: Accessibility,
    title: "Accessibility projects",
    body: "Operation Building Hope completes ramps and home modifications intended to reduce physical barriers for veterans with disabilities.",
  },
  {
    icon: Home,
    title: "Furnished homes",
    body: "Homes for Healing provides furniture and household essentials for formerly homeless veterans moving into housing.",
  },
  {
    icon: Package,
    title: "Essential supplies",
    body: "Fill The Footlocker turns donated goods into practical supplies for homeless veterans and support for military and veteran families.",
  },
  {
    icon: Car,
    title: "Transportation",
    body: "Warrior Wagon provides handicap-accessible transportation to medical care, employment, groceries, government services, and other essential destinations.",
  },
] as const;

export default function MilitaryMissionsInActionPage() {
  return (
    <>
      <Helmet>
        <title>Military Missions in Action | Beyond The Yellow | ValorWell</title>
        <meta
          name="description"
          content="Explore ValorWell's Beyond The Yellow feature with Military Missions in Action on accessibility projects, furnished homes, essential supplies, transportation, and current public impact figures."
        />
        <meta property="og:title" content="Military Missions in Action | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A Beyond The Yellow feature on practical veteran support through accessibility work, home furnishings, supplies, and transportation."
        />
        <meta property="og:image" content={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/mmia" />
      </Helmet>

      <Header />
      <main id="main" className="overflow-hidden bg-background">
        <section className="relative border-b border-white/10 bg-[hsl(var(--navy))] text-white">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-36 top-20 h-96 w-96 rounded-full bg-[hsl(var(--gold-accent))]/10 blur-3xl" />
            <div className="absolute -right-24 -top-28 h-[32rem] w-[32rem] rounded-full bg-white/[0.04] blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-24">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--gold-accent))]">
                Beyond The Yellow · Feature Story
              </p>
              <h1 className="mt-7 text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-5xl lg:text-6xl xl:text-7xl">
                Practical support.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">A ramp. A furnished room. A ride.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                Military Missions in Action provides veteran support through accessibility projects, furniture and household essentials, donated supplies, and transportation in North Carolina.
              </p>
              <div className="mt-8 border-l-2 border-[hsl(var(--gold-accent))] pl-5">
                <p className="text-sm font-bold text-white">Zak Keisler</p>
                <p className="mt-1 text-sm text-white/60">Executive Director · Military Missions in Action</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/40">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title="Beyond The Yellow conversation with Military Missions in Action"
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Why MMIA is featured</p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Many support gaps are concrete enough to measure and concrete enough to fix.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                The Beyond The Yellow conversation centers on last-mile barriers: housing that is not accessible, an empty apartment after homelessness, a missing ride to an appointment, or essential household items that still have to be obtained.
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
              Current public figures from Military Missions in Action, reviewed September 6, 2026. {" "}
              <a href={mmiaUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">
                Review MMIA's current site
              </a>
              .
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">Programs</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Four program areas address four different practical barriers.
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Continue with MMIA</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Current services, geography, eligibility, and volunteer information belong with MMIA.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-muted-foreground">
                ValorWell is publishing the conversation and feature. Military Missions in Action owns its programs, service criteria, operating figures, donation information, and current opportunities.
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <a
                href={mmiaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white"
              >
                Visit Military Missions in Action
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[hsl(var(--section-alt))] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="mx-auto max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
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
