import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  HeartHandshake,
  PlayCircle,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const videoId = "zsaTKjNVeew";
const videoUrl = "https://www.youtube.com/watch?v=zsaTKjNVeew";
const gallantFewUrl = "https://gallantfew.org/";
const reportsUrl = "https://gallantfew.org/reports";

const impact = [
  { value: "2010", label: "GallantFew founded" },
  { value: "8,000+", label: "Military-community members assisted since founding" },
  { value: "1,500+", label: "Veterans GallantFew says it connects, coaches, and counsels each year" },
] as const;

const work = [
  {
    icon: Users,
    title: "Connection",
    body: "GallantFew creates community through veteran gatherings, climbing, fitness, Ranger-focused programming, and the Ranger Outreach Center in Columbus, Georgia.",
  },
  {
    icon: Compass,
    title: "Coaching",
    body: "The Azimuth Check and coaching programs help veterans evaluate emotional, physical, spiritual, professional, and social areas of life and identify practical next steps.",
  },
  {
    icon: HeartHandshake,
    title: "Counseling",
    body: "GallantFew also provides clinical counseling as part of its broader model for removing barriers to care and supporting veterans through transition and other challenges.",
  },
] as const;

export default function GallantFewPage() {
  return (
    <>
      <Helmet>
        <title>GallantFew | Beyond The Yellow | ValorWell</title>
        <meta
          name="description"
          content="Explore ValorWell's Beyond The Yellow feature with GallantFew and founder and clinical director Karl Monger on connection, coaching, counseling, and direction after military service."
        />
        <meta property="og:title" content="GallantFew | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A Beyond The Yellow conversation about transition, direction, connection, coaching, and counseling after military service."
        />
        <meta property="og:image" content={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/gallantfew" />
      </Helmet>

      <Header />
      <main id="main" className="overflow-hidden bg-background">
        <section className="relative border-b border-white/10 bg-[hsl(var(--navy))] text-white">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-36 top-24 h-96 w-96 rounded-full bg-[hsl(var(--gold-accent))]/10 blur-3xl" />
            <div className="absolute -right-24 -top-24 h-[30rem] w-[30rem] rounded-full bg-white/[0.04] blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-24">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--gold-accent))]">
                Beyond The Yellow · Feature Story
              </p>
              <h1 className="mt-7 text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-5xl lg:text-6xl xl:text-7xl">
                The mission ends.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">The need for direction doesn’t.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                GallantFew is an Army Ranger-led military-support nonprofit built around connection, coaching, and counseling for Rangers, veterans, and their families.
              </p>
              <div className="mt-8 border-l-2 border-[hsl(var(--gold-accent))] pl-5">
                <p className="text-sm font-bold text-white">Karl Monger</p>
                <p className="mt-1 text-sm text-white/60">Founder &amp; Clinical Director · GallantFew</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/40">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title="Beyond The Yellow conversation with Karl Monger of GallantFew"
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Why GallantFew is featured</p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Transition is not only about finding a job. It is also about rebuilding structure, connection, and direction.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                In the Beyond The Yellow conversation, Monger describes the problem of leaving a highly structured military environment and having to build a civilian system around purpose, accountability, relationships, health, and work.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(var(--navy))] py-14 text-white md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 sm:grid-cols-3">
              {impact.map((item) => (
                <div key={item.value} className="border-l border-white/15 pl-5">
                  <p className="text-4xl font-black tracking-tight text-[hsl(var(--gold-accent))] md:text-5xl">{item.value}</p>
                  <p className="mt-2 max-w-[18rem] text-sm leading-6 text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-9 text-xs leading-5 text-white/55">
              GallantFew public figures reviewed September 6, 2026. {" "}
              <a href={gallantFewUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">
                GallantFew website
              </a>
              {" · "}
              <a href={reportsUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">
                GallantFew reports
              </a>
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">How the work operates</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Connection, coaching, and counseling are distinct parts of the model.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {work.map(({ icon: Icon, title, body }) => (
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Continue with GallantFew</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Program details and current services belong with GallantFew.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-muted-foreground">
                ValorWell is publishing the conversation and feature. GallantFew owns its programs, eligibility, services, events, and current operating information.
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <a
                href={gallantFewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white"
              >
                Visit GallantFew
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[hsl(var(--section-alt))] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Beyond The Yellow</p>
            <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
              Explore more published organization features.
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
