import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { ResourceSearch } from "@/components/resources/ResourceSearch";
import {
  useFeaturedArticles,
  usePublishedCategories,
} from "@/lib/websiteResources";
import { trackHomeEvent } from "@/lib/tracking";

type ResourceCategory = {
  name: string;
  href: string;
  body: string;
  Icon: LucideIcon;
};

const iconBySlug: Record<string, LucideIcon> = {
  champva: HeartPulse,
  "va-community-care": ShieldCheck,
  documentation: ClipboardCheck,
  "veteran-mental-health": Stethoscope,
  "family-systems": Users,
  "military-health-benefits": ShieldCheck,
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

function categoryLabel(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Resources() {
  useEffect(() => {
    trackHomeEvent("resources_page_view", { page: "resources" });
  }, []);

  const { data, isPending, isError } = usePublishedCategories();
  const { data: featured = [] } = useFeaturedArticles();

  const categories: ResourceCategory[] = (data ?? []).map((resource) => ({
    name: resource.title,
    href: `/resources/${resource.slug}`,
    body: resource.summary,
    Icon: iconBySlug[resource.slug] ?? BookOpen,
  }));

  return (
    <Layout>
      <SEO
        title="Veteran & Family Mental Health Resources | ValorWell"
        description="Search practical ValorWell guidance on VA Community Care, CHAMPVA, military family issues, veteran mental health, documentation, and military health benefits."
        canonical="/resources"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
        ]}
      />

      <div className="resources-theme bg-[#F4F1E8] text-[#111814]">
        <header className="relative overflow-hidden border-b border-[#3B5147]/15">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#D7A92E]/[0.08] blur-3xl" />
            <div className="absolute -bottom-44 -left-36 h-96 w-96 rounded-full bg-[#3B5147]/[0.08] blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-10 py-14 md:py-20 lg:grid-cols-12 lg:items-end lg:py-24">
            <div className="lg:col-span-9">
              <Eyebrow>ValorWell Resource Library</Eyebrow>
              <h1 className="mt-5 max-w-5xl text-4xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-5xl md:text-6xl lg:text-[4.25rem]">
                Clear answers for complicated veteran and military-family systems.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
                Search by the question you actually have. The library is organized to explain what a rule means, what is commonly misunderstood, what to do next, and which official source to verify when the details matter.
              </p>
            </div>

            <div className="lg:col-span-3 lg:text-right">
              <Link
                to="/get-care"
                onClick={() => trackHomeEvent("resources_hero_care", { page: "resources" })}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#31443B]"
              >
                Find Care
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="relative z-10 border-b border-[#3B5147]/12 bg-white">
            <div className="container-wide py-10 md:py-14">
              <div className="mx-auto max-w-5xl">
                <ResourceSearch />
              </div>
            </div>
          </section>

          <section className="border-b border-[#3B5147]/12 bg-[#F4F1E8]">
            <div className="container-wide py-14 md:py-20">
              <div className="max-w-3xl">
                <Eyebrow>Browse by topic</Eyebrow>
                <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] md:text-5xl">
                  Start with the system you are trying to navigate.
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#111814]/62">
                  Each topic hub collects explainers and practical guides around one durable area instead of making you guess which article title contains the answer.
                </p>
              </div>

              {isPending && (
                <p className="mt-10 text-[#111814]/64" role="status" aria-live="polite">
                  Loading resources…
                </p>
              )}

              {isError && (
                <p className="mt-10 text-[#111814]/64" role="status" aria-live="polite">
                  We could not load the resource library right now. Please refresh the page and try again.
                </p>
              )}

              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                    className="group flex min-h-72 flex-col justify-between rounded-3xl border border-[#3B5147]/15 bg-white p-7 shadow-[0_18px_55px_-48px_rgba(17,24,20,0.5)] transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <div>
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2EE] text-[#3B5147]">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="mt-5 text-2xl font-bold leading-tight">{name}</h3>
                      <p className="mt-3 leading-7 text-[#111814]/62">{body}</p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
                      Explore topic
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {featured.length > 0 && (
            <section className="border-b border-[#3B5147]/12 bg-white">
              <div className="container-wide py-14 md:py-20">
                <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
                  <div className="max-w-xl">
                    <Eyebrow>Start here</Eyebrow>
                    <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] md:text-5xl">
                      Core guidance across the library.
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-[#111814]/62">
                      These are foundational resources selected to help people get oriented quickly before drilling into narrower questions.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {featured.slice(0, 6).map((article) => (
                      <Link
                        key={article.id}
                        to={`/resources/${article.category_slug}/${article.slug}`}
                        className="group rounded-2xl border border-[#3B5147]/12 bg-[#F8F6EF] p-6 transition hover:border-[#3B5147]/30 hover:bg-[#F4F1E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#3B5147]">
                          {article.category_slug ? categoryLabel(article.category_slug) : "Resource"}
                        </p>
                        <h3 className="mt-2 text-xl font-bold leading-6 text-[#111814]">
                          {article.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#111814]/60">
                          {article.summary}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
                          Read guide
                          <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="border-b border-white/10 bg-[#111814] text-white">
            <div className="container-wide grid gap-12 py-16 md:py-20 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <Eyebrow light>How to use these resources</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                  Understand first. Verify the details that can change.
                </h2>
              </div>

              <div className="lg:col-span-7">
                <div className="space-y-5">
                  {[
                    "Use each guide to understand terminology, decision points, common mistakes, and useful next questions.",
                    "When eligibility, authorization, payment, or legal rights depend on a current rule, follow the cited primary source or confirm with the responsible program.",
                    "Mental-health resources are educational and do not replace an individual clinical assessment or treatment plan.",
                    "Sources and update dates are shown where they materially help you judge how the guidance was built.",
                  ].map((item) => (
                    <div key={item} className="flex gap-4 border-b border-white/10 pb-5 last:border-b-0">
                      <ShieldCheck
                        className="mt-1 h-5 w-5 shrink-0 text-[#D7A92E]"
                        aria-hidden="true"
                      />
                      <p className="leading-7 text-white/72">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#F4F1E8]">
            <div className="container-wide grid gap-8 py-14 md:py-18 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <Eyebrow>Need individualized support?</Eyebrow>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
                  The library can help you understand the landscape. Care is for the part that needs to be personal.
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
        </main>
      </div>
    </Layout>
  );
}
