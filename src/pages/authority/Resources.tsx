import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardCheck,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

type ResourceCategory = {
  name: string;
  href: string;
  body: string;
  Icon: LucideIcon;
};

const categories: ResourceCategory[] = [
  {
    name: "CHAMPVA",
    href: "/resources/champva",
    body: "Provider access, telehealth, participation questions, patient responsibility, and information to confirm before relying on a care pathway.",
    Icon: HeartPulse,
  },
  {
    name: "VA Community Care",
    href: "/resources/va-community-care",
    body: "Referrals, authorization, provider pathways, records to keep, and questions to ask when the process stalls.",
    Icon: ShieldCheck,
  },
  {
    name: "Clinical Documentation",
    href: "/resources/documentation",
    body: "Treatment records, functional impact, documentation boundaries, and the role clinical documentation can play across care systems.",
    Icon: ClipboardCheck,
  },
  {
    name: "Veteran Mental Health",
    href: "/resources/veteran-mental-health",
    body: "Therapy access, PTSD-related concerns, family strain, transition stress, telehealth, and deciding what kind of help to seek next.",
    Icon: Stethoscope,
  },
  {
    name: "Family Systems",
    href: "/resources/family-systems",
    body: "Communication, parenting systems, emotional regulation, conflict repair, family meetings, and repeatable household frameworks.",
    Icon: Users,
  },
];

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

export default function Resources() {
  useEffect(() => {
    trackHomeEvent("resources_page_view", { page: "resources" });
  }, []);

  return (
    <Layout>
      <SEO
        title="Veteran & Family Mental Health Resources | ValorWell"
        description="Browse ValorWell resources on CHAMPVA, VA Community Care, veteran mental health, clinical documentation, and family systems."
        canonical="/resources"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
        ]}
      />

      <div className="resources-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .resources-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .resources-theme h1,
          .resources-theme h2,
          .resources-theme h3 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden border-b border-[#3B5147]/15">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#D7A92E]/[0.08] blur-3xl" />
            <div className="absolute -bottom-44 -left-36 h-96 w-96 rounded-full bg-[#3B5147]/[0.08] blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:items-end lg:py-28">
            <div className="lg:col-span-8">
              <Eyebrow>ValorWell Resources</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                Practical guidance for navigating care, coverage, documentation, and family systems.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
                Choose the topic closest to the question in front of you. Resource pages explain terminology, common process steps, questions to ask, and when current information should be confirmed with the responsible program or provider.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right">
              <Link
                to="/get-care"
                onClick={() => trackHomeEvent("resources_hero_care", { page: "resources" })}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white"
              >
                Find Care
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <Eyebrow>Resource Categories</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Browse by topic.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {categories.map(({ name, href, body, Icon }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() =>
                    trackHomeEvent("resources_category", {
                      page: "resources",
                      destination: href,
                    })
                  }
                  className="group rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <Icon className="h-7 w-7 text-[#3B5147]" aria-hidden="true" />
                  <h3 className="mt-6 text-2xl font-bold">{name}</h3>
                  <p className="mt-4 leading-7 text-[#111814]/64">{body}</p>
                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                    Explore this category
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>Using the Library</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Use educational guidance for orientation, then confirm details that can change.
              </h2>
            </div>

            <div className="lg:col-span-7">
              <div className="space-y-5">
                {[
                  "Use resource pages to understand terminology, common process steps, and questions worth asking next.",
                  "Confirm current eligibility, authorization, provider participation, and administrative requirements with the responsible program when those details affect care or payment.",
                  "Treat mental health information as general education rather than an individual diagnosis or treatment plan.",
                  "If you are already looking for a ValorWell care pathway, use Find Care instead of starting with the resource library.",
                ].map((item) => (
                  <div key={item} className="flex gap-4 border-b border-white/10 pb-5 last:border-b-0">
                    <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#D7A92E]" aria-hidden="true" />
                    <p className="leading-7 text-white/70">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#F4F1E8]">
          <div className="container-wide grid gap-8 py-16 md:py-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <Eyebrow>Need Something Else?</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                Go directly to care or contact ValorWell with a specific question.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link
                to="/get-care"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white"
              >
                Find Care
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
      </div>
    </Layout>
  );
}
