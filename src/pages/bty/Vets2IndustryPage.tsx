import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Network,
  PlayCircle,
  Search,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import vets2IndustryLogoAsset from "@/assets/vets2industry-logo.png.asset.json";

const videoId = "iVDPZL_PEWo";
const videoUrl = "https://www.youtube.com/watch?v=iVDPZL_PEWo";
const websiteUrl = "https://vets2industry.org/";
const resourceLibraryUrl = "https://vets2industry.org/resource-library";
const linkedinUrl = "https://www.linkedin.com/company/vets2industry";

const proof = [
  { value: "Free", label: "Core military-community resource library" },
  { value: "109K+", label: "LinkedIn followers when reviewed September 6, 2026" },
  { value: "Nationwide", label: "Online resource and networking reach" },
] as const;

const work = [
  {
    icon: Search,
    title: "Resource discovery",
    body: "VETS2INDUSTRY organizes military-community resources so service members, veterans, spouses, families, and caregivers can search by need instead of already knowing which organization to find.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Career support",
    body: "The organization publishes career tools and webinars around transition, résumés, interviews, job discovery, education, and professional development.",
  },
  {
    icon: Users,
    title: "Networking",
    body: "Virtual networking events bring military-connected job seekers, recruiters, employers, mentors, veteran organizations, and other professionals into the same environment.",
  },
] as const;

const categories = [
  "Career & jobs",
  "Education",
  "Mentorship",
  "Scholarships",
  "Mental health",
  "Financial resources",
  "SkillBridge",
  "Networking",
] as const;

export default function Vets2IndustryPage() {
  return (
    <>
      <Helmet>
        <title>VETS2INDUSTRY | Beyond The Yellow | ValorWell</title>
        <meta
          name="description"
          content="Explore ValorWell's Beyond The Yellow feature with VETS2INDUSTRY and president Matthew Philip Wee on resource discovery, career tools, and professional networking for the military community."
        />
        <meta property="og:title" content="VETS2INDUSTRY | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A Beyond The Yellow feature on making military-community resources, career support, and professional connections easier to find."
        />
        <meta property="og:image" content={vets2IndustryLogoAsset.url} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/vets2industry" />
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
                The resources exist.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">Finding the right one is the hard part.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                VETS2INDUSTRY maintains a free military-community resource library and combines it with career tools, webinars, and networking opportunities designed to help information become a useful next step.
              </p>
              <div className="mt-8 border-l-2 border-[hsl(var(--gold-accent))] pl-5">
                <p className="text-sm font-bold text-white">Matthew Philip Wee</p>
                <p className="mt-1 text-sm text-white/60">President · VETS2INDUSTRY</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/40">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title="Beyond The Yellow conversation with Matthew Philip Wee of VETS2INDUSTRY"
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Why V2I is featured</p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                A resource is only useful when the person who needs it can find it and understand what to do next.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                The Beyond The Yellow conversation focuses on the gap between having thousands of military and veteran resources somewhere on the internet and giving people context, relationships, and navigation that help them choose among those options.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(var(--navy))] py-14 text-white md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 sm:grid-cols-3">
              {proof.map((item) => (
                <div key={item.value} className="border-l border-white/15 pl-5">
                  <p className="text-4xl font-black tracking-tight text-[hsl(var(--gold-accent))] md:text-5xl">{item.value}</p>
                  <p className="mt-2 max-w-[18rem] text-sm leading-6 text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-9 text-xs leading-5 text-white/55">
              Public information reviewed September 6, 2026 from {" "}
              <a href={resourceLibraryUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">
                VETS2INDUSTRY's resource library
              </a>
              {" "}and its {" "}
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">
                LinkedIn organization page
              </a>
              . Follower counts change over time.
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">How the work operates</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Search, career support, and networking solve different parts of the same navigation problem.
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
              <BookOpen className="h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-black tracking-tight text-foreground">Resource categories span more than employment.</h3>
              <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span key={category} className="rounded-full border border-border bg-[hsl(var(--section-alt))] px-3 py-2 text-sm font-bold text-foreground/75">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Continue with VETS2INDUSTRY</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Search current resources at the organization that maintains them.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-muted-foreground">
                ValorWell is publishing the conversation and feature. VETS2INDUSTRY owns the resource library, events, career tools, eligibility details, and current organization information.
              </p>
            </div>
            <div className="grid gap-3 lg:col-span-5">
              <a href={resourceLibraryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white">
                Browse V2I Resources
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-black text-foreground">
                Visit VETS2INDUSTRY
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[hsl(var(--section-alt))] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <Network className="mx-auto h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
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
