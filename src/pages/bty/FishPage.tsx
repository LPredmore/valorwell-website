import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  HeartHandshake,
  PlayCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const videoId = "0E9YWKQ5iXY";
const videoUrl = "https://www.youtube.com/watch?v=0E9YWKQ5iXY";
const websiteUrl = "https://friendsinserviceofheroes.org/";
const missionUrl = "https://friendsinserviceofheroes.org/mission/";
const donateUrl = "https://friendsinserviceofheroes.networkforgood.com/";
const volunteerUrl = "https://friendsinserviceofheroes.org/volunteer/";

const impact = [
  { value: "45", label: "Trained, certified service dogs given to veterans with PTSD and anxiety" },
  { value: "1,500+", label: "Veterans and families aided with financial support" },
  { value: "55", label: "Veterans awarded mobility power scooters" },
  { value: "8,000+", label: "Meals provided to veterans and their families" },
] as const;

const work = [
  {
    icon: HeartHandshake,
    title: "Health & mobility",
    body: "F.I.S.H. provides service and companion dogs, mobility chairs, medical equipment, and other adaptability or resilience aids intended to improve day-to-day quality of life.",
  },
  {
    icon: BadgeDollarSign,
    title: "Financial assistance",
    body: "The organization provides emergency and living-expense support for veterans and military families facing immediate financial hardship.",
  },
  {
    icon: ShieldCheck,
    title: "Recognition & connection",
    body: "Heroes Dinners, veteran events, and speaker programs create opportunities to recognize service, preserve stories, and keep veterans connected to community.",
  },
] as const;

export default function FishPage() {
  return (
    <>
      <Helmet>
        <title>F.I.S.H. | Beyond The Yellow | ValorWell</title>
        <meta
          name="description"
          content="Explore ValorWell's Beyond The Yellow feature with Friends In Service of Heroes founder Paul Chapa on service dogs, mobility support, financial assistance, recognition, and helping veterans before a crisis gets worse."
        />
        <meta property="og:title" content="F.I.S.H. | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A Beyond The Yellow feature on finding veterans in need and providing practical support without making them beg for help."
        />
        <meta property="og:image" content={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/fish" />
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
                Veterans shouldn't have to beg for help.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">Someone should notice first.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                Friends In Service of Heroes supports veterans and military families through health and mobility assistance, emergency financial help, recognition, and community.
              </p>
              <div className="mt-8 border-l-2 border-[hsl(var(--gold-accent))] pl-5">
                <p className="text-sm font-bold text-white">Paul Chapa</p>
                <p className="mt-1 text-sm text-white/60">Founder &amp; President · Friends In Service of Heroes</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/40">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title="Beyond The Yellow conversation with Paul Chapa of Friends In Service of Heroes"
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Why F.I.S.H. is featured</p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                The hardest part of helping can be reaching somebody before they are ready to ask.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                In the Beyond The Yellow conversation, Chapa describes a model built around finding veterans who are struggling, protecting their dignity, and stepping in with practical help before hardship becomes a deeper crisis.
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
              F.I.S.H. public impact figures reviewed September 29, 2026.{" "}
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">
                Review F.I.S.H.'s current public information
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
                Health, financial support, and recognition address different parts of the same problem.
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

            <div className="mt-12 rounded-2xl border border-border bg-background p-7 md:p-9">
              <Users className="h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-black tracking-tight text-foreground">The model centers dignity as much as assistance.</h3>
              <p className="mt-4 max-w-4xl leading-7 text-muted-foreground">
                F.I.S.H. says many veterans are reluctant to ask for help. Its approach is built around meeting practical needs while preserving privacy, respect, and the veteran's sense of independence.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Continue with F.I.S.H.</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Current assistance, volunteering, and donation information belongs with F.I.S.H.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-muted-foreground">
                ValorWell is publishing the conversation and feature. Friends In Service of Heroes owns its eligibility rules, assistance programs, events, volunteer opportunities, and current operating information.
              </p>
            </div>
            <div className="grid gap-3 lg:col-span-5">
              <a href={missionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white">
                Explore F.I.S.H. Programs
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={volunteerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-black text-foreground">
                Volunteer with F.I.S.H.
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={donateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 text-sm font-bold text-foreground/70">
                Donate to F.I.S.H.
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
