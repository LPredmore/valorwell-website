import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  ExternalLink,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Network,
  PlayCircle,
  Target,
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
  medalOfHonorVideo: "https://youtu.be/lzHK-SynYAo",
};

const suppliedProof = [
  { value: "43,000+", label: "Veterans and Active-Duty Military Spouses have completed an ACP mentorship" },
  { value: "26,000+", label: "C-suite executives and employees have volunteered as ACP Mentors" },
  { value: "2,200+", label: "Companies represented by ACP's Mentor community" },
  { value: "98%", label: "Protégé satisfaction reported in ACP's 2026 materials" },
] as const;

const mentorshipModel = [
  {
    icon: Handshake,
    title: "Human-driven matching",
    body: "ACP looks at each person's goals, experience, and needs to find a Mentor who can be useful for that specific career journey.",
  },
  {
    icon: Compass,
    title: "A full 12 months",
    body: "The relationship is designed to last one year and asks for roughly one hour each month, giving the mentorship time to become useful without making it unrealistic for working professionals.",
  },
  {
    icon: HeartHandshake,
    title: "ACP stays involved",
    body: "Mentors and Protégés are not left to manage the relationship alone. ACP supports both sides with regular check-ins, a resource library, and personalized help throughout the mentorship.",
  },
  {
    icon: Network,
    title: "Virtual and flexible",
    body: "More than 90% of ACP mentorships are virtual. Mentors do not need a military background; civilian experience is part of what helps participants navigate the civilian workforce.",
  },
] as const;

const outcomes2025 = [
  { value: "4,864", label: "Veterans and Active-Duty Military Spouses became ACP alumni in 2025" },
  { value: "2,335", label: "Protégés obtained meaningful employment during the course of their mentorship in 2025" },
  { value: "$105,000+", label: "Average starting salary for Protégés who obtained a job during their mentorship" },
] as const;

const protegeFocus = [
  { value: "66%", label: "Improving résumé and interview skills" },
  { value: "58%", label: "Translating military experience into civilian terms" },
  { value: "57%", label: "Refining civilian career goals and professional ambitions" },
  { value: "53%", label: "Building a network of professionals" },
  { value: "47%", label: "Learning about career opportunities" },
] as const;

const programs = [
  {
    icon: BriefcaseBusiness,
    title: "Veteran Mentoring Program",
    body: "One-on-one career mentorship for post-9/11 Service Members and Veterans navigating civilian careers and career transitions.",
  },
  {
    icon: Users,
    title: "Active-Duty Military Spouse Program",
    body: "Career mentorship for Active-Duty Military Spouses whose professional paths may need to adapt around relocations and military life.",
  },
  {
    icon: Target,
    title: "Ventures Entrepreneurship Program",
    body: "A mentorship path for participants whose career goals involve starting, developing, or growing a business.",
  },
  {
    icon: Building2,
    title: "Citizens Program",
    body: "Expands ACP's Mentor pool with professionals from industries not represented by its formal Corporate Partners.",
  },
] as const;

const snapshotGroups = [
  {
    title: "Education",
    values: ["29% graduate degree or above", "34% bachelor's degree", "37% less than a four-year degree"],
  },
  {
    title: "Age",
    values: ["Average age: 38", "25% age 30 or younger", "44% age 40 or older"],
  },
  {
    title: "Military rank",
    values: ["79% enlisted", "21% officer"],
  },
  {
    title: "Branch",
    values: [
      "44% U.S. Army",
      "22% U.S. Navy",
      "19% U.S. Air Force",
      "13% U.S. Marine Corps",
      "2% U.S. Coast Guard",
      "<1% U.S. Space Force",
    ],
  },
  {
    title: "Gender",
    values: ["68% men", "32% women"],
  },
  {
    title: "Ethnicity",
    values: [
      "25% Black/African American",
      "15% Hispanic",
      "46% White",
      "15% Other / Did Not Disclose",
    ],
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
          content="Explore American Corporate Partners' free, customized, yearlong one-on-one career mentorship for post-9/11 Service Members, Veterans, and Active-Duty Military Spouses."
        />
        <meta property="og:title" content="American Corporate Partners | Beyond The Yellow" />
        <meta
          property="og:description"
          content="A Beyond The Yellow feature on ACP's free, fully supported one-on-one career mentorship model and the people it serves."
        />
        <meta property="og:image" content="https://i.ytimg.com/vi/JHuLEqw2yG8/maxresdefault.jpg" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://valorwell.org/americancorporatepartners" />
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
              <div className="mt-7 inline-flex items-center gap-3 rounded-md border border-white/15 bg-white/[0.06] px-4 py-2.5">
                <span className="text-xl font-black tracking-[-0.03em] text-[hsl(var(--gold-accent))]">ACP</span>
                <span className="h-5 w-px bg-white/20" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/70">
                  American Corporate Partners
                </span>
              </div>
              <h1 className="mt-7 text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-5xl lg:text-6xl xl:text-7xl">
                A year of career mentorship.
                <span className="mt-2 block text-[hsl(var(--gold-accent))]">
                  Built around the person.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                American Corporate Partners is a nonprofit focused on underemployment through free, customized, fully supported one-on-one mentorships for post-9/11 Service Members, Veterans, and Active-Duty Military Spouses.
              </p>
              <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/75">
                {["Free to participants", "12 months", "≈ 1 hour / month", "90%+ virtual"].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-2">
                    {item}
                  </span>
                ))}
              </div>
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
                Military experience can be valuable without translating cleanly into the civilian workforce.
              </h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                Veterans and Active-Duty Military Spouses bring leadership, adaptability, and problem-solving skills into civilian careers, but translating those strengths into job titles, résumés, interviews, networks, advancement, or entrepreneurship can take sustained guidance. ACP builds that guidance around a person rather than a generic career track.
              </p>
            </div>
          </div>
        </section>

        <section className="relative bg-[hsl(var(--navy))] py-14 text-white md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {suppliedProof.map((item) => (
                <div key={item.value} className="border-l border-white/15 pl-5">
                  <p className="text-4xl font-black tracking-tight text-[hsl(var(--gold-accent))] md:text-5xl">
                    {item.value}
                  </p>
                  <p className="mt-2 max-w-[16rem] text-sm leading-6 text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-9 text-xs leading-5 text-white/55">
              Figures from American Corporate Partners' 2026 program materials and follow-up information provided to ValorWell for this feature.
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">
                  How the mentorship works
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                  The match matters. The support around the match matters too.
                </h2>
              </div>
              <p className="text-base leading-8 text-muted-foreground lg:col-span-5 md:text-lg">
                ACP's team described the program as a human-driven match with a full year of support around both the Mentor and the Protégé.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {mentorshipModel.map(({ icon: Icon, title, body }) => (
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
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">
                Two sides of the mentorship
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Come to ACP looking for guidance—or ready to give it.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="rounded-[2rem] border border-border bg-[hsl(var(--section-alt))] p-7 md:p-10">
                <GraduationCap className="h-8 w-8 text-[hsl(var(--navy))]" aria-hidden="true" />
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  For Veterans &amp; Active-Duty Military Spouses
                </p>
                <h3 className="mt-3 text-3xl font-black tracking-tight text-foreground">
                  Turn military experience into a civilian career strategy.
                </h3>
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  ACP's matching process looks at each person's goals, experience, and needs. One participant may be changing industries, another may be pursuing a promotion, another may be launching a business, and a Military Spouse may be rebuilding a career after another move.
                </p>
                <ul className="mt-7 space-y-3 text-sm leading-6 text-foreground/85">
                  {["Career direction and professional goals", "Résumé and interview development", "Civilian networking and opportunity discovery", "Entrepreneurship and business-building goals"].map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--navy))]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <ExternalCta href={acpLinks.programs}>Explore ACP Mentoring Programs</ExternalCta>
                </div>
              </article>

              <article className="rounded-[2rem] border border-white/10 bg-[hsl(var(--navy))] p-7 text-white md:p-10">
                <Network className="h-8 w-8 text-[hsl(var(--gold-accent))]" aria-hidden="true" />
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                  For prospective Mentors
                </p>
                <h3 className="mt-3 text-3xl font-black tracking-tight text-white">
                  You do not need a military background to be a Mentor.
                </h3>
                <p className="mt-5 text-base leading-8 text-white/70">
                  ACP specifically emphasizes that civilian professionals are who Veterans and Active-Duty Military Spouses need to help them navigate the civilian workforce. The mentorship is virtual and flexible, and ACP remains available throughout the entire 12 months.
                </p>
                <ul className="mt-7 space-y-3 text-sm leading-6 text-white/80">
                  {["About one hour each month", "ACP check-ins, resources, and personalized support", "Bring industry knowledge, perspective, and a civilian network", "Gain new perspective and strengthen your own leadership"].map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--gold-accent))]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <ExternalCta href={acpLinks.mentor} primary>Become an ACP Mentor</ExternalCta>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">
                  2025 mentoring program success
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                  Results from ACP's supplied 2026 At A Glance.
                </h2>
              </div>
              <p className="text-base leading-8 text-muted-foreground lg:col-span-5 md:text-lg">
                These figures are reproduced from the 2026 program material ACP provided after the Beyond The Yellow conversation.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
              {outcomes2025.map((item) => (
                <div key={item.value} className="bg-background p-7 md:p-8">
                  <p className="text-4xl font-black tracking-tight text-[hsl(var(--navy))]">{item.value}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-20 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-12 lg:items-start lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">
                What Protégés work on
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                Career transition is rarely one problem.
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground md:text-lg">
                ACP's supplied 2026 snapshot shows how often the work spans communication, translation, direction, networking, and opportunity discovery at the same time.
              </p>
            </div>
            <div className="grid gap-4 lg:col-span-7">
              {protegeFocus.map((item) => (
                <div key={item.label} className="flex items-start gap-5 rounded-2xl border border-border bg-[hsl(var(--section-alt))] p-5 md:p-6">
                  <p className="w-16 shrink-0 text-2xl font-black text-[hsl(var(--navy))]">{item.value}</p>
                  <p className="pt-1 leading-7 text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-[hsl(var(--section-alt))] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--navy))]">ACP programs</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                The program is broader than one career path.
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

        <section className="bg-background py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">2026 at a glance</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                More of the participant snapshot ACP provided.
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                This detail stays available without competing with the primary explanation of how the mentorship works.
              </p>
            </div>

            <details className="group mx-auto mt-10 max-w-5xl rounded-2xl border border-border bg-[hsl(var(--section-alt))] open:shadow-sm">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 px-6 py-4 text-left font-black text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--navy))] md:px-8">
                <span>View the additional ACP 2026 program snapshot</span>
                <span className="text-2xl leading-none text-[hsl(var(--navy))] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <div className="border-t border-border px-6 py-7 md:px-8 md:py-9">
                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                  {snapshotGroups.map((group) => (
                    <div key={group.title}>
                      <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[hsl(var(--navy))]">{group.title}</h3>
                      <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                        {group.values.map((value) => <li key={value}>{value}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="mt-8 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                  Snapshot percentages are reproduced from ACP's supplied 2026 At A Glance material and may reflect rounding.
                </p>
              </div>
            </details>
          </div>
        </section>

        <section className="bg-[hsl(var(--navy))] py-20 text-white md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold-accent))]">
                  Official ACP resources
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  Continue with the resources ACP sent for this feature.
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
                  ACP owns eligibility, matching, mentorships, applications, and current program information. These links are the official paths ACP provided to ValorWell.
                </p>
              </div>
              <div className="grid gap-3 lg:col-span-5">
                {[
                  ["Service Member & Military Spouse Applications", acpLinks.programs],
                  ["Mentor Application", acpLinks.mentor],
                  ["Program Overview", acpLinks.overview],
                  ["Program Success Metrics", acpLinks.impact],
                  ["Corporate Partners", acpLinks.partners],
                  ["Congressional Medal of Honor Society Video", acpLinks.medalOfHonorVideo],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:border-[hsl(var(--gold-accent))]/55 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold-accent))]"
                  >
                    <span>{label}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[hsl(var(--gold-accent))]" aria-hidden="true" />
                  </a>
                ))}
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
