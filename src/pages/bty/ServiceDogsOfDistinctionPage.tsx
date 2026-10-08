import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowUpRight, Compass, Dog, HeartHandshake, PlayCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const videoId = "cxLjuFLlIV0";
const videoUrl = "https://www.youtube.com/watch?v=cxLjuFLlIV0";
const organizationUrl = "https://servicedogsofdistinction.org/";

const moreParts = [
  "BTvg8C7xl68",
  "BBWwWOlaXN0",
  "bcD_4EfPhKU",
  "xuttiRTcV08",
  "m4aWfo2s0xo",
  "KkVTsb2QJtg",
  "6i08oDhoq4U",
] as const;

const themes = [
  {
    icon: Dog,
    title: "Service dogs",
    body: "Gardner explains what a trained service dog actually does for the person it is paired with, and why the match between dog and handler matters.",
  },
  {
    icon: Compass,
    title: "Independence",
    body: "The conversation focuses on what changes in daily life when a veteran can do more on their own terms, with a partner trained to help.",
  },
  {
    icon: HeartHandshake,
    title: "Belonging and purpose",
    body: "Beyond the practical tasks, the series explores how the bond with a service dog can restore connection, routine, and a reason to get moving again.",
  },
] as const;

export default function ServiceDogsOfDistinctionPage() {
  return (
    <>
      <Helmet>
        <title>Service Dogs of Distinction | Beyond The Yellow | ValorWell</title>
        <meta
          name="description"
          content="Explore the Beyond The Yellow serialized conversation with Don Gardner of Service Dogs of Distinction on service dogs, veteran independence, belonging, and purpose."
        />
        <meta property="og:title" content="Service Dogs of Distinction | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A serialized Beyond The Yellow conversation with Don Gardner about service dogs, veteran independence, belonging, and purpose."
        />
        <meta property="og:image" content={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/service-dogs-of-distinction" />
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
                Beyond The Yellow · Serialized Conversation
              </p>
              <h1 className="mt-7 text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-5xl lg:text-6xl xl:text-7xl">
                A service dog is a partner.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">Independence is the point.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
                Don Gardner of Service Dogs of Distinction in a multi-part conversation about service dogs, veteran independence, belonging, and purpose. Start with Part 1 below.
              </p>
              <div className="mt-8 border-l-2 border-[hsl(var(--gold-accent))] pl-5">
                <p className="text-sm font-bold text-white">Don Gardner</p>
                <p className="mt-1 text-sm text-white/60">Service Dogs of Distinction</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/40">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title="Beyond The Yellow conversation with Don Gardner of Service Dogs of Distinction, Part 1"
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
                Watch Part 1 on YouTube
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Why this feature exists</p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                For some veterans, the next step toward independence has four legs.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                This feature is built around a serialized Beyond The Yellow conversation released in parts rather than a single full-length episode. Across the series, Gardner talks about what service dogs make possible, and what it takes to prepare a dog and a veteran for life together.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">What the series covers</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Practical help that changes what a day can look like.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {themes.map(({ icon: Icon, title, body }) => (
                <article key={title} className="rounded-2xl border border-border bg-background p-7 md:p-8">
                  <Icon className="h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
                  <h3 className="mt-6 text-2xl font-black tracking-tight text-foreground">{title}</h3>
                  <p className="mt-4 leading-7 text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Keep watching</p>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-4xl">
              More parts of the conversation
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {moreParts.map((id) => (
                <li key={id}>
                  <a
                    href={`https://www.youtube.com/watch?v=${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--navy))]"
                    aria-label="Watch another part of the Service Dogs of Distinction conversation on YouTube"
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
                    />
                    <span className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-foreground">
                      <PlayCircle className="h-4 w-4 text-[hsl(var(--navy))]" aria-hidden="true" />
                      Watch on YouTube
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-background py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Continue with Service Dogs of Distinction</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Program details belong with the organization.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-muted-foreground">
                ValorWell is publishing the conversation and feature. Service Dogs of Distinction owns its programs, eligibility, application process, and current operating information.
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <a
                href={organizationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white"
              >
                Visit Service Dogs of Distinction
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
