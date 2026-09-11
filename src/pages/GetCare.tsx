import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  HelpCircle,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PORTAL_URL = "https://client.valorwell.org";
const TRICARE_INTEREST_URL =
  "mailto:info@valorwell.org?subject=TRICARE%20mental%20health%20care%20interest";

type Audience = "veteran" | "family";
type Coverage = "champva" | "tricare" | "vaccn" | "unsure";
type PathTone = "active" | "limited" | "pending" | "help";

type CoverageOption = {
  value: Coverage;
  label: string;
  description: string;
  Icon: LucideIcon;
};

type PathDetail = {
  eyebrow: string;
  title: string;
  body: string;
  note: string;
  cta: string;
  href: string;
  external?: boolean;
  secondaryCta?: string;
  secondaryHref?: string;
  tone: PathTone;
};

const familyCoverage: CoverageOption[] = [
  {
    value: "champva",
    label: "CHAMPVA",
    description: "ValorWell's active general care pathway for eligible veteran family members.",
    Icon: CheckCircle2,
  },
  {
    value: "tricare",
    label: "TRICARE",
    description: "Not active yet. Tell us where the need exists while contracting continues.",
    Icon: CircleAlert,
  },
];

const veteranCoverage: CoverageOption[] = [
  {
    value: "vaccn",
    label: "VA Community Care",
    description: "Limited and authorization-dependent. Start with the current pathway information.",
    Icon: ShieldCheck,
  },
  {
    value: "tricare",
    label: "TRICARE",
    description: "Not active yet. Tell us where the need exists while contracting continues.",
    Icon: CircleAlert,
  },
  {
    value: "unsure",
    label: "I'm not sure",
    description: "You do not need to know the program name before asking for help finding the next step.",
    Icon: HelpCircle,
  },
];

const pathDetails: Record<Coverage, PathDetail> = {
  champva: {
    eyebrow: "Active care pathway",
    title: "You can begin the CHAMPVA intake process now.",
    body: "ValorWell provides telehealth mental health care through CHAMPVA where state licensure, clinician availability, capacity, pathway verification, and clinical fit align.",
    note: "ValorWell bills CHAMPVA directly. Applicable CHAMPVA cost share or other patient responsibility may still apply.",
    cta: "Start CHAMPVA Intake",
    href: PORTAL_URL,
    external: true,
    secondaryCta: "Review CHAMPVA Resources",
    secondaryHref: "/resources/champva",
    tone: "active",
  },
  vaccn: {
    eyebrow: "Limited and authorization-dependent",
    title: "VA Community Care starts with a real authorization and an eligible provider path.",
    body: "ValorWell's VA Community Care availability is limited. Whether a path is possible depends on your VA referral or authorization, state, region, clinician eligibility, current capacity, and clinical fit. We will not describe Community Care as available when those pieces are not in place.",
    note: "ValorWell does not guarantee VA authorization, referral, placement, disability outcomes, claim approval, or any other VA outcome.",
    cta: "Review Community Care Resources",
    href: "/resources/va-community-care",
    secondaryCta: "Ask About Current Availability",
    secondaryHref: "/contact",
    tone: "limited",
  },
  tricare: {
    eyebrow: "Pathway not active yet",
    title: "ValorWell is still completing the TRICARE contracting pathway.",
    body: "We will not describe TRICARE care as available before the required contracting and activation work is complete. You can tell us you need this pathway so we can understand where demand is strongest.",
    note: "Submitting interest is not an appointment request and does not guarantee future network participation or availability.",
    cta: "Tell Us You Need TRICARE",
    href: TRICARE_INTEREST_URL,
    external: true,
    secondaryCta: "See Current Care Options",
    secondaryHref: "/resources",
    tone: "pending",
  },
  unsure: {
    eyebrow: "You do not need to know the answer yet",
    title: "Start with what you know. We can help route the question.",
    body: "Tell us what you know about your veteran status, current coverage, and whether the VA has discussed Community Care with you. We can point you toward the most appropriate current ValorWell or resource path without pretending every option is available everywhere.",
    note: "ValorWell's current care pathways remain subject to coverage or authorization, licensure, availability, capacity, and clinical fit.",
    cta: "Ask for Pathway Help",
    href: "/contact",
    secondaryCta: "Browse Resources",
    secondaryHref: "/resources",
    tone: "help",
  },
};

const pathwayOverviewOrder: Coverage[] = ["champva", "vaccn", "tricare", "unsure"];

const serviceGroups = [
  {
    title: "Anxiety, depression, grief, and stress",
    body: "Outpatient therapy for concerns affecting work, relationships, sleep, concentration, mood, and day-to-day functioning.",
  },
  {
    title: "Trauma and PTSD-related concerns",
    body: "Therapy that respects the pace, context, and complexity of military and non-military traumatic experiences.",
  },
  {
    title: "Military-family and caregiver strain",
    body: "Support for spouses, caregivers, parents, and families carrying responsibilities that are often invisible to everyone else.",
  },
  {
    title: "Children and teens",
    body: "Care when clinician licensure, age range, availability, coverage, and clinical fit align with the young person's needs.",
  },
  {
    title: "Identity, transition, and daily overwhelm",
    body: "A place to work through burnout, life transitions, relationship strain, purpose, and the weight of holding too much for too long.",
  },
];

const faqs = [
  {
    q: "Who does ValorWell currently serve?",
    a: "ValorWell's current public care pathways are designed for veterans and veteran family members. Actual care remains subject to coverage or authorization, state licensure, clinician availability, capacity, clinical fit, and the services ValorWell provides.",
  },
  {
    q: "Does selecting a coverage option guarantee care?",
    a: "No. The selector identifies the most appropriate current next path. Actual care depends on coverage or authorization, state, clinician licensure, availability, capacity, and clinical fit.",
  },
  {
    q: "How does CHAMPVA payment work at ValorWell?",
    a: "ValorWell bills CHAMPVA directly for eligible telehealth mental health services. Applicable CHAMPVA cost share or other patient responsibility may still apply depending on the person's coverage and circumstances.",
  },
  {
    q: "Can veterans use ValorWell through VA Community Care?",
    a: "Sometimes, but the pathway is limited and authorization-dependent. It requires a legitimate VA referral or authorization plus an eligible clinician path. Availability varies and is not guaranteed.",
  },
  {
    q: "Can I use TRICARE at ValorWell?",
    a: "Not currently. ValorWell is still working through the required contracting pathway and will not describe TRICARE as active before activation is complete.",
  },
  {
    q: "Is care provided through telehealth?",
    a: "Yes. ValorWell is telehealth-first. Care remains subject to the treating clinician being appropriately licensed where the client is physically located and to the other requirements of the care pathway.",
  },
  {
    q: "What services are not provided?",
    a: "ValorWell does not currently provide psychiatry, medication management, psychological testing, inpatient care, or crisis services.",
  },
  {
    q: "What if I am in crisis?",
    a: "ValorWell is not a crisis service. Call or text 988 for immediate support. Veterans and their loved ones can call 988 and press 1, or text 838255.",
  },
];

const toneClasses: Record<PathTone, string> = {
  active: "border-[#3B5147]/30 bg-[#3B5147]/[0.06]",
  limited: "border-[#B24A3A]/30 bg-[#B24A3A]/[0.05]",
  pending: "border-[#111814]/15 bg-[#111814]/[0.04]",
  help: "border-[#D7A92E]/35 bg-[#F8F3E4]",
};

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.2em] ${
        light ? "text-[#D7A92E]" : "text-[#3B5147]"
      }`}
    >
      {children}
    </p>
  );
}

function PathAction({ detail }: { detail: PathDetail }) {
  const primaryClass =
    "inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#31443B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2";

  return (
    <div className="flex flex-wrap gap-3">
      {detail.external ? (
        <a href={detail.href} className={primaryClass}>
          {detail.cta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : (
        <Link to={detail.href} className={primaryClass}>
          {detail.cta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}

      {detail.secondaryHref && detail.secondaryCta ? (
        <Link
          to={detail.secondaryHref}
          className="inline-flex min-h-12 items-center rounded-md border border-[#3B5147]/25 px-6 py-3 text-sm font-bold text-[#3B5147] transition hover:bg-white/60"
        >
          {detail.secondaryCta}
        </Link>
      ) : null}
    </div>
  );
}

function PathwayOverview() {
  return (
    <div className="mt-8 border-t border-[#3B5147]/12 pt-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
        Current pathway status
      </p>
      <h2 className="mt-3 text-2xl font-bold">All current care pathways</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {pathwayOverviewOrder.map((pathway) => {
          const detail = pathDetails[pathway];
          return (
            <article
              key={pathway}
              className={`rounded-2xl border p-5 md:p-6 ${toneClasses[detail.tone]}`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
                {detail.eyebrow}
              </p>
              <h3 className="mt-3 text-xl font-bold leading-snug">{detail.title}</h3>
              <p className="mt-3 leading-7 text-[#111814]/66">{detail.body}</p>
              <p className="mt-3 text-sm leading-6 text-[#111814]/55">{detail.note}</p>
              <div className="mt-5">
                <PathAction detail={detail} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function GetCare() {
  const [audience, setAudience] = useState<Audience | null>(null);
  const [coverage, setCoverage] = useState<Coverage | null>(null);

  const coverageOptions = audience === "family" ? familyCoverage : veteranCoverage;
  const selectedDetail = coverage ? pathDetails[coverage] : null;

  const chooseAudience = (value: Audience) => {
    setAudience(value);
    setCoverage(null);
  };

  return (
    <Layout>
      <SEO
        title="Mental Health Care for Veterans & Veteran Families | ValorWell"
        description="Find the appropriate current ValorWell mental health care pathway for veterans and veteran family members using CHAMPVA, VA Community Care, or future TRICARE access."
        canonical="/get-care"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Find Care", url: "/get-care" },
        ]}
      />

      <div className="clinicians-theme bg-[#F4F1E8] text-[#111814]">
        <div className="bg-[#111814] text-white">
          <div className="container-wide flex flex-col gap-3 py-3 text-sm md:flex-row md:items-center md:justify-between">
            <p className="leading-snug text-white/80">
              <span className="font-bold text-white">Need immediate support right now?</span>{" "}
              ValorWell is not a crisis service. Call or text 988. Veterans and their loved ones can call 988 and press 1 or text 838255.
            </p>
            <a
              href="tel:988"
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-white/30 px-3 py-2 font-bold text-white hover:bg-white/10"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call 988
            </a>
          </div>
        </div>

        <section className="relative overflow-hidden border-b border-[#3B5147]/15">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-[#3B5147]/[0.08] blur-3xl" />
            <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#D7A92E]/[0.08] blur-3xl" />
          </div>

          <div className="container-wide relative py-16 md:py-24 lg:py-28">
            <div className="max-w-4xl">
              <Eyebrow>Find Care</Eyebrow>
              <h1 className="mt-6 text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                Start with who needs care. We will help with the path.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
                You should not need to decode every program before you can take a first step. Answer two questions and ValorWell will show you the most appropriate current path without promising care that is not actually available.
              </p>
            </div>

            <div id="find-your-path" className="mt-12 rounded-3xl border border-[#3B5147]/15 bg-white p-6 shadow-xl md:p-8">
              <div className="border-b border-[#3B5147]/12 pb-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                  Step 1
                </p>
                <h2 className="mt-3 text-2xl font-bold md:text-3xl">Who needs care?</h2>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  {
                    value: "veteran" as const,
                    label: "I am a veteran",
                    description: "Continue to VA Community Care, TRICARE, or pathway help.",
                    Icon: UserRound,
                  },
                  {
                    value: "family" as const,
                    label: "I am a veteran's family member",
                    description: "Continue to CHAMPVA or TRICARE.",
                    Icon: Users,
                  },
                ].map(({ value, label, description, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => chooseAudience(value)}
                    aria-pressed={audience === value}
                    className={`flex min-h-32 items-start gap-4 rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 ${
                      audience === value
                        ? "border-[#3B5147] bg-[#3B5147] text-white"
                        : "border-[#3B5147]/15 bg-[#F4F1E8] hover:border-[#3B5147]/35"
                    }`}
                  >
                    <Icon
                      className={`mt-1 h-6 w-6 shrink-0 ${
                        audience === value ? "text-[#D7A92E]" : "text-[#3B5147]"
                      }`}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-lg font-bold">{label}</span>
                      <span className={`mt-2 block text-sm leading-6 ${audience === value ? "text-white/68" : "text-[#111814]/60"}`}>
                        {description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              {audience ? (
                <div className="mt-8 border-t border-[#3B5147]/12 pt-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">Step 2</p>
                  <h2 className="mt-3 text-2xl font-bold">Which coverage or pathway sounds closest?</h2>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {coverageOptions.map(({ value, label, description, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCoverage(value)}
                        aria-pressed={coverage === value}
                        className={`rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 ${
                          coverage === value
                            ? "border-[#D7A92E] bg-[#F8F3E4]"
                            : "border-[#3B5147]/15 hover:border-[#3B5147]/35"
                        }`}
                      >
                        <Icon className="h-5 w-5 text-[#3B5147]" aria-hidden="true" />
                        <span className="mt-4 block font-bold">{label}</span>
                        <span className="mt-2 block text-sm leading-6 text-[#111814]/58">{description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedDetail ? (
                <div className={`mt-8 rounded-2xl border p-6 md:p-8 ${toneClasses[selectedDetail.tone]}`}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">{selectedDetail.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-bold md:text-3xl">{selectedDetail.title}</h3>
                  <p className="mt-4 max-w-3xl leading-7 text-[#111814]/66">{selectedDetail.body}</p>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-[#111814]/55">{selectedDetail.note}</p>
                  <div className="mt-7">
                    <PathAction detail={selectedDetail} />
                  </div>
                </div>
              ) : null}

              <PathwayOverview />
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>What ValorWell Treats</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Outpatient mental health care for real life, not just one diagnosis.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#111814]/64">
                The exact clinician match depends on licensure, availability, age range, coverage, and clinical fit. These are examples of concerns that can fall within ValorWell's outpatient therapy work when the right path is available.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {serviceGroups.map((service) => (
                <article key={service.title} className="rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-7">
                  <Stethoscope className="h-6 w-6 text-[#3B5147]" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-bold">{service.title}</h3>
                  <p className="mt-3 leading-7 text-[#111814]/62">{service.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#3B5147] text-white">
          <div className="container-wide grid gap-10 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>Care Boundaries</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Clear limits are part of responsible access.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-5">
                {[
                  "ValorWell is telehealth-first and is not an emergency or crisis service.",
                  "Care is not guaranteed by insurance coverage alone; licensure, availability, capacity, and clinical fit still matter.",
                  "VA Community Care requires the appropriate VA authorization and provider pathway. ValorWell cannot create or guarantee that authorization.",
                  "TRICARE is not currently an active ValorWell care pathway.",
                  "ValorWell does not currently provide psychiatry, medication management, psychological testing, or inpatient care.",
                ].map((item) => (
                  <div key={item} className="flex gap-4 border-b border-white/10 pb-5 last:border-b-0">
                    <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#D7A92E]" aria-hidden="true" />
                    <p className="leading-7 text-white/72">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide grid gap-8 py-16 md:py-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <Eyebrow>Need Information Before Care?</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                The Resource Hub separates system questions from the care intake itself.
              </h2>
              <p className="mt-4 max-w-3xl leading-7 text-[#111814]/64">
                Use Resources for CHAMPVA, VA Community Care, documentation, veteran mental health, and family-system guidance. Use Find Care when you are ready to identify a current care path.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link
                to="/resources"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white"
              >
                Browse Resources
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center rounded-md border border-[#3B5147]/25 px-6 py-3 text-sm font-bold text-[#3B5147]"
              >
                Contact ValorWell
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container-wide py-20 md:py-24">
            <div className="mx-auto max-w-3xl">
              <Eyebrow>Frequently Asked Questions</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">Before you start.</h2>
              <Accordion type="single" collapsible className="mt-10">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.q} value={faq.q}>
                    <AccordionTrigger className="text-left text-base font-bold">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-base leading-7 text-[#111814]/65">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
