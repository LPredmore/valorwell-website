import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUpRight,
  HeartHandshake,
  Home,
  PlayCircle,
  ShoppingBasket,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const videoId = "hLvZfGcycOQ";
const videoUrl = "https://www.youtube.com/watch?v=hLvZfGcycOQ";
const vowUrl = "https://vowvillages.com/";
const reportUrl = "https://vowvillages.com/sites/default/files/inline-files/VOW%202025.pdf";

const impact2025 = [
  { value: "837,898", label: "Pounds of food distributed in 2025" },
  { value: "850+", label: "Veteran families served through the Marketplace" },
  { value: "32", label: "Veterans served in the Village in 2025" },
  { value: "10", label: "Village residents moved to permanent housing in 2025" },
] as const;

const work = [
  {
    icon: Home,
    title: "Veteran Village",
    body: "The James A. Peterson Veteran Village provides private tiny-home housing for veterans experiencing homelessness or housing instability while they work toward longer-term stability.",
  },
  {
    icon: ShoppingBasket,
    title: "Veterans Marketplace",
    body: "The Marketplace gives eligible veterans and surviving spouses access to food, household essentials, and personal-care items in a grocery-style setting.",
  },
  {
    icon: HeartHandshake,
    title: "Support beyond housing",
    body: "Peer support, case management, financial education, employment assistance, wellness activities, and housing-placement work operate alongside the housing and food programs.",
  },
] as const;

export default function VeteransOutreachWisconsinPage() {
  return (
    <>
      <Helmet>
        <title>Veterans Outreach of Wisconsin | Beyond The Yellow | ValorWell</title>
        <meta
          name="description"
          content="Explore ValorWell's Beyond The Yellow feature with Veterans Outreach of Wisconsin on tiny-home housing, food access, peer support, and the path toward permanent stability."
        />
        <meta property="og:title" content="Veterans Outreach of Wisconsin | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A Beyond The Yellow feature on housing, food access, peer support, and long-term stability for veterans in Wisconsin."
        />
        <meta property="og:image" content={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/VOW" />
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
                A tiny home is the beginning.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">Stability takes more than a roof.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                Veterans Outreach of Wisconsin combines transitional tiny-home housing, food access, peer support, case management, and practical services for veterans working toward permanent stability.
              </p>
              <div className="mt-8 border-l-2 border-[hsl(var(--gold-accent))] pl-5">
                <p className="text-sm font-bold text-white">John Shaw</p>
                <p className="mt-1 text-sm text-white/60">Peer Support Specialist · Veterans Outreach of Wisconsin</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/40">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title="Beyond The Yellow conversation with John Shaw of Veterans Outreach of Wisconsin"
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Why VOW is featured</p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Housing, food, peer connection, and the next permanent step are treated as connected problems.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                The Beyond The Yellow conversation focuses on what happens after immediate shelter is available: routine, food security, relationships, services, and the work required to move from temporary stability into permanent housing.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(var(--navy))] py-14 text-white md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {impact2025.map((item) => (
                <div key={item.value} className="border-l border-white/15 pl-5">
                  <p className="text-4xl font-black tracking-tight text-[hsl(var(--gold-accent))] md:text-5xl">{item.value}</p>
                  <p className="mt-2 max-w-[18rem] text-sm leading-6 text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-9 text-xs leading-5 text-white/55">
              2025 figures from Veterans Outreach of Wisconsin's published annual summary, reviewed September 6, 2026. {" "}
              <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">
                View the 2025 source
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
                Multiple programs address different parts of the stability problem.
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Continue with VOW</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Current eligibility, services, and support information belong with VOW.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-muted-foreground">
                ValorWell is publishing the interview and feature. Veterans Outreach of Wisconsin owns its program eligibility, current services, volunteer opportunities, and operating information.
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <a
                href={vowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white"
              >
                Visit Veterans Outreach of Wisconsin
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[hsl(var(--section-alt))] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <Users className="mx-auto h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
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
