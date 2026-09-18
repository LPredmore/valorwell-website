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
import { ResourceLibrarySearch } from "@/components/resources/ResourceLibrarySearch";
import {
  usePublishedCategories,
  usePublishedFeaturedArticles,
} from "@/lib/websiteResources";
import { compileResourceMarkdoc } from "@/content/resource-markdoc-config.mjs";
import { trackHomeEvent } from "@/lib/tracking";

type ResourceCategory = {
  slug: string;
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

export default function Resources() {
  useEffect(() => {
    trackHomeEvent("resources_page_view", { page: "resources" });
  }, []);

  const { data, isPending, isError } = usePublishedCategories();
  const { data: featuredArticles } = usePublishedFeaturedArticles();

  const categories: ResourceCategory[] = (data ?? []).map((resource) => ({
    slug: resource.slug,
    name: resource.title,
    href: `/resources/${resource.slug}`,
    body: resource.summary,
    Icon: iconBySlug[resource.slug] ?? BookOpen,
  }));

  return (
    <Layout>
      <SEO
        title="Veteran & Family Mental Health Resources | ValorWell"
        description="Search and browse practical ValorWell guidance on VA Community Care, CHAMPVA, military health benefits, veteran mental health, documentation, and military family systems."
        canonical="/resources"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
        ]}
      />

      <div className="resources-theme bg-[#F4F1E8] text-[#111814]">
        <section className="relative overflow-hidden border-b border-[#3B5147]/15">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#D7A92E]/[0.08] blur-3xl" />
            <div className="absolute -bottom-44 -left-36 h-96 w-96 rounded-full bg-[#3B5147]/[0.08] blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:items-end lg:py-28">
            <div className="lg:col-span-8">
              <Eyebrow>ValorWell Resource Library</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                Clear answers for complicated veteran and military-family systems.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
                Search practical guidance, understand the rules behind the issue, and leave with clearer questions and next steps.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right">
              <Link
                to="/get-care"
                onClick={() => trackHomeEvent("resources_hero_care", { page: "resources" })}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2F423A]"
              >
                Find Care
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="container-wide -mt-1 py-10 md:py-14">
          <ResourceLibrarySearch
            categories={categories.map(({ slug, name }) => ({ slug, label: name }))}
          />
        </section>

        {(featuredArticles ?? []).length > 0 && (
          <section className="border-y border-[#3B5147]/12 bg-white">
            <div className="container-wide py-16 md:py-20">
              <div className="max-w-3xl">
                <Eyebrow>Start Here</Eyebrow>
                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                  Frequently useful guides.
                </h2>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {(featuredArticles ?? []).map((article) => {
                  const compiled = compileResourceMarkdoc(article.body_markdown, {
                    schemaVersion: article.content_schema_version,
                  });

                  return (
                    <Link
                      key={article.id}
                      to={`/resources/${article.category_slug}/${article.slug}`}
                      className="group flex min-h-64 flex-col justify-between rounded-2xl border border-[#3B5147]/15 bg-[#F4F1E8] p-6 transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md motion-reduce:transform-none"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#3B5147]">
                          <span>{article.editorial_type}</span>
                          <span className="text-[#111814]/45">
                            {compiled.readingMinutes} min read
                          </span>
                        </div>
                        <h3 className="mt-4 text-xl font-bold leading-7 text-[#111814]">
                          {article.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#111814]/62">
                          {article.summary}
                        </p>
                      </div>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
                        Read guide
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="bg-[#F4F1E8]">
          <div className="container-wide py-16 md:py-24">
            <div className="max-w-3xl">
              <Eyebrow>Browse by Topic</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Choose the system closest to the question in front of you.
              </h2>
            </div>

            {isPending && (
              <p className="mt-12 text-[#111814]/64" role="status" aria-live="polite">
                Loading resources…
              </p>
            )}

            {isError && (
              <p className="mt-12 text-[#111814]/64" role="status" aria-live="polite">
                We could not load the resource library right now. Please refresh the page and try again.
              </p>
            )}

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
                  className="group rounded-3xl border border-[#3B5147]/15 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none"
                >
                  <Icon className="h-7 w-7 text-[#3B5147]" aria-hidden="true" />
                  <h3 className="mt-6 text-2xl font-bold">{name}</h3>
                  <p className="mt-4 leading-7 text-[#111814]/64">{body}</p>
                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                    Explore topic
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#111814] text-white">
          <div className="container-wide grid gap-12 py-16 md:py-20 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Eyebrow light>How to Use the Library</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                Understand the system first. Verify the details that can change.
              </h2>
            </div>

            <div className="lg:col-span-7">
              <div className="space-y-5">
                {[
                  "Use the guides to understand terminology, common process steps, and the questions worth asking next.",
                  "For eligibility, authorization, billing, legal, or program-specific decisions, confirm the current facts with the responsible official program or professional.",
                  "Mental-health resources are educational and do not replace an individual clinical assessment or treatment plan.",
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
      </div>
    </Layout>
  );
}
