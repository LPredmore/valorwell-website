import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUpRight,
  Gamepad2,
  Laptop,
  LifeBuoy,
  PlayCircle,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const videoId = "oT4TSM3Q82k";
const videoUrl = "https://www.youtube.com/watch?v=oT4TSM3Q82k";
const websiteUrl = "https://alwaysgiveback.org/";
const programsUrl = "https://alwaysgiveback.org/programs";
const impactUrl = "https://alwaysgiveback.org/impact";
const applyUrl = "https://alwaysgiveback.org/apply";

const impact = [
  { value: "200+", label: "Veteran computers built since November 2019" },
  { value: "2,000+", label: "People helped through free tech support" },
  { value: "Nationwide", label: "Veterans served across the United States" },
] as const;

const work = [
  {
    icon: Laptop,
    title: "Veteran PC Program",
    body: "Always Give Back provides qualifying disabled veterans with custom-built computer systems at no cost, helping remove a technology barrier to school, work, telehealth, creative projects, and everyday connection.",
  },
  {
    icon: LifeBuoy,
    title: "Tech support & literacy",
    body: "AGB pairs access to hardware with practical technical support and digital-literacy help so veterans can use computers, online services, communication tools, and telehealth with more confidence.",
  },
  {
    icon: Users,
    title: "Community connection",
    body: "Technology is also used as a bridge into community through gaming, shared interests, events, technical help, and spaces where veterans can reconnect with other people.",
  },
] as const;

export default function AlwaysGiveBackPage() {
  return (
    <>
      <Helmet>
        <title>Always Give Back | Beyond The Yellow | ValorWell</title>
        <meta
          name="description"
          content="Explore ValorWell's Beyond The Yellow feature with Always Give Back on veteran technology access, custom PC builds, practical tech support, and community connection."
        />
        <meta property="og:title" content="Always Give Back | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A Beyond The Yellow feature on using technology as a practical doorway to education, work, telehealth, community, and connection for veterans."
        />
        <meta property="og:image" content={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/alwaysgiveback" />
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
                A computer is not the mission.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">It is the doorway.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                Always Give Back uses custom-built computers, technical support, digital literacy, and community to help veterans access the next opportunity in front of them.
              </p>
              <div className="mt-8 border-l-2 border-[hsl(var(--gold-accent))] pl-5">
                <p className="text-sm font-bold text-white">Lawrence “Peeps”</p>
                <p className="mt-1 text-sm text-white/60">Founder · Always Give Back</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/40">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title="Beyond The Yellow conversation with Always Give Back founder Peeps"
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Why AGB is featured</p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Technology matters most when it changes what somebody can do next.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                The Beyond The Yellow conversation looks beyond the computer itself. For a veteran, capable technology can become access to school, employment, telehealth, creative work, gaming communities, technical independence, and a reason to reconnect.
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
              Always Give Back public impact information reviewed September 28, 2026.{" "}
              <a href={impactUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">
                Review AGB's impact and transparency information
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
                Hardware, support, and community solve different parts of the same access problem.
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
              <Gamepad2 className="h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-black tracking-tight text-foreground">The machine is meant to stay useful after delivery day.</h3>
              <p className="mt-4 max-w-4xl leading-7 text-muted-foreground">
                AGB describes its model as more than handing off a device. Its programs include setup, technical assistance, digital-literacy support, and community connection intended to help veterans keep using technology as a practical tool.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Continue with Always Give Back</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Current programs, eligibility, applications, and support belong with AGB.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-muted-foreground">
                ValorWell is publishing the conversation and feature. Always Give Back owns its veteran PC application, program rules, technical-support services, community spaces, and current operating information.
              </p>
            </div>
            <div className="grid gap-3 lg:col-span-5">
              <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white">
                Apply for a Veteran PC
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={programsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-black text-foreground">
                Explore AGB Programs
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 text-sm font-bold text-foreground/70">
                Visit Always Give Back
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
