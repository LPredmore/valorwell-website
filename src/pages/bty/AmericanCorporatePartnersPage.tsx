import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Network,
  PlayCircle,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const videoUrl = "https://www.youtube.com/watch?v=JHuLEqw2yG8";
const videoEmbedUrl = "https://www.youtube-nocookie.com/embed/JHuLEqw2yG8?rel=0";

const acpLinks = {
  programs: "https://www.acp-usa.org/programs/",
  mentor: "https://www.acp-usa.org/become-a-mentor/",
  overview: "https://www.acp-usa.org/",
  impact: "https://www.acp-usa.org/our-impact/",
  partners: "https://www.acp-usa.org/partners/",
};

const currentProof = [
  { value: "43,000+", label: "ACP participants mentored since 2010" },
  { value: "98%", label: "Participant satisfaction rate" },
  { value: "5,000+", label: "Participants currently in active mentorships" },
  { value: "12 months", label: "Standard one-on-one mentorship period" },
] as const;

const results2025 = [
  { value: "4,864", label: "Protégés became ACP alumni in 2025" },
  { value: "2,335", label: "Protégés obtained employment or a promotion in 2025" },
  { value: "8,556", label: "Mentors represented 2,250+ companies in 2025" },
  { value: "$40K+", label: "Average incremental salary increase reported for protégés who obtained employment during mentorship" },
] as const;

const model = [
  {
    icon: GraduationCap,
    title: "One person, one mentor",
    body: "ACP matches transitioning service members, veterans, and active-duty military spouses with experienced professionals around individual career goals.",
  },
  {
    icon: HeartHandshake,
    title: "A full year",
    body: "The mentorship is structured to last 12 months, giving the relationship time to move beyond a résumé review or a single introduction.",
  },
  {
    icon: Network,
    title: "Built to work remotely",
    body: "ACP describes its mentorships as virtual and asks mentors to commit about one hour each month for one year.",
  },
] as const;

function ExternalCta({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        primary
          ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--gold-accent))] px-6 py-3 text-sm font-black text-[hsl(var(--navy))] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          : "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition hover:border-[hsl(var(--navy))]/45 hover:bg-[hsl(var(--section-alt))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--navy))]"
      }
    >
      {children}
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

export default function AmericanCorporatePartnersPage() {
  return (
    <>
      <Helmet>
        <title>American Corporate Partners | Beyond The Yellow | ValorWell</title>
        <meta
          name="description"
          content="Explore ValorWell's Beyond The Yellow feature on American Corporate Partners and its yearlong one-on-one career mentorship for transitioning service members, veterans, and active-duty military spouses."
        />
        <meta property="og:title" content="American Corporate Partners | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A Beyond The Yellow feature on ACP's yearlong career mentorship model, current impact, and paths for protégés and mentors."
        />
        <meta property="og:image" content="https://i.ytimg.com/vi/JHuLEqw2yG8/maxresdefault.jpg" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.valorwell.org/americancorporatepartners" />
      </Helmet>

      <Header />
      <main id="main" className="overflow-hidden bg-background">
        <section className="relative border-b border-white/10 bg-[hsl(var(--navy))] text-white">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -right-24 -top-32 h-[34rem] w-[34rem] rounded-full bg-[hsl(var(--gold-accent))]/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-white/[0.05] blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-24">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--gold-accent))]">
                Beyond The Yellow · Feature Story
              </p>
              <p className="mt-7 text-sm font-bold uppercase tracking-[0.14em] text-white/60">
                American Corporate Partners
              </p>
              <h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-5xl lg:text-6xl xl:text-7xl">
                A year of career mentorship.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">
                  Built around the person.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                American Corporate Partners connects transitioning service members, veterans, and active-duty military spouses with experienced professionals for one-on-one career mentorship at no cost to participants.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <ExternalCta href={acpLinks.programs} primary>
                  Explore ACP Programs
                </ExternalCta>
                <a
                  href="#watch"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  Watch Conversation
                </a>
              </div>
            </div>

            <div id="watch" className="scroll-mt-24 lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/35">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={videoEmbedUrl}
                    title="Beyond The Yellow conversation with American Corporate Partners"
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
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <PlayCircle className="h-4 w-4 text-[hsl(var(--gold-accent))]" aria-hidden="true" />
                Open on YouTube
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">
                Why ACP is featured
              </p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Career transition is easier to navigate when the relationship lasts longer than the first question.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                ACP's model gives participants a professional relationship they can use across career direction, translating military experience, interviews, networking, advancement, and entrepreneurship. The program owns the matching and mentorship process; ValorWell's role here is to document and share the work through Beyond The Yellow.
              </p>
            </div>
          </div>
        </section>

        <section className="relative bg-[hsl(var(--navy))] py-14 text-white md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {currentProof.map((item) => (
                <div key={item.value} className="border-l border-white/15 pl-5">
                  <p className="text-4xl font-black tracking-tight text-[hsl(var(--gold-accent))] md:text-5xl">
                    {item.value}
                  </p>
                  <p className="mt-2 max-w-[16rem] text-sm leading-6 text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-9 text-xs leading-5 text-white/55">
              Current public figures from American Corporate Partners, reviewed September 6, 2026. {" "}
              <a
                href={acpLinks.impact}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white underline underline-offset-2"
              >
                Review ACP's impact data
              </a>
              .
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">
                The model
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                One-on-one guidance with enough time to become useful.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {model.map(({ icon: Icon, title, body }) => (
                <article key={title} className="rounded-2xl border border-border bg-background p-7 md:p-8">
                  <Icon className="h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
                  <h3 className="mt-6 text-2xl font-black tracking-tight text-foreground">{title}</h3>
                  <p className="mt-4 leading-7 text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">
                  2025 Results
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                  ACP publishes the operating numbers behind the program.
                </h2>
              </div>
              <p className="text-base leading-8 text-muted-foreground lg:col-span-5 md:text-lg">
                These are ACP's reported 2025 program results, kept separate from current active-program figures so the time periods are clear.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {results2025.map((item) => (
                <div key={item.value} className="bg-[hsl(var(--section-alt))] p-7 md:p-8">
                  <p className="text-4xl font-black tracking-tight text-[hsl(var(--navy))]">{item.value}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 text-xs leading-5 text-muted-foreground">
              Source: {" "}
              <a
                href={acpLinks.impact}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[hsl(var(--navy))] underline underline-offset-2"
              >
                American Corporate Partners — Our Impact
              </a>
              , reviewed September 6, 2026.
            </p>
          </div>
        </section>

        <section className="border-y border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">
                Who the program serves
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Two participant paths and one way to contribute.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <article className="rounded-2xl border border-border bg-background p-7 md:p-8">
                <BriefcaseBusiness className="h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-black">Service Members &amp; Veterans</h3>
                <p className="mt-4 leading-7 text-muted-foreground">
                  One-on-one career mentorship for transitioning service members and veterans navigating civilian careers, advancement, or entrepreneurship.
                </p>
              </article>
              <article className="rounded-2xl border border-border bg-background p-7 md:p-8">
                <Users className="h-7 w-7 text-[hsl(var(--navy))]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-black">Active-Duty Military Spouses</h3>
                <p className="mt-4 leading-7 text-muted-foreground">
                  Career mentorship and resources for spouses managing professional goals alongside military-life transitions and relocations.
                </p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[hsl(var(--navy))] p-7 text-white md:p-8">
                <HeartHandshake className="h-7 w-7 text-[hsl(var(--gold-accent))]" aria-hidden="true" />
                <h3 className="mt-6 text-2xl font-black">Professional Mentors</h3>
                <p className="mt-4 leading-7 text-white/70">
                  Professionals can volunteer about one hour per month for one year and bring industry knowledge, perspective, and networks into a structured mentorship.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(var(--navy))] py-20 text-white md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">
                  Continue with ACP
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  Go to the organization that owns the program.
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
                  ACP manages eligibility, matching, mentorships, applications, and program information. Use the official ACP paths below for current program details.
                </p>
              </div>
              <div className="grid gap-3 lg:col-span-5">
                <ExternalCta href={acpLinks.programs} primary>Explore Mentoring Programs</ExternalCta>
                <ExternalCta href={acpLinks.mentor}>Become an ACP Mentor</ExternalCta>
                <ExternalCta href={acpLinks.impact}>Review ACP Impact</ExternalCta>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 rounded-[2rem] border border-border bg-[hsl(var(--section-alt))] p-7 md:p-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">Beyond The Yellow</p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                  Explore more organizations and conversations.
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                  American Corporate Partners is one of the organizations with a dedicated Beyond The Yellow feature page.
                </p>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <a
                  href="/network"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--navy))] px-6 py-3 text-sm font-black text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--navy))]"
                >
                  Featured Organizations
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
