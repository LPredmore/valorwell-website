import { useEffect } from "react";
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
  usePublishedArticles,
  usePublishedCategories,
  type WebsiteResource,
} from "@/lib/websiteResources";
import { trackHomeEvent } from "@/lib/tracking";

const iconBySlug: Record<string, LucideIcon> = {
  champva: HeartPulse,
  "va-community-care": ShieldCheck,
  documentation: ClipboardCheck,
  "veteran-mental-health": Stethoscope,
  "family-systems": Users,
  "military-health-benefits": ShieldCheck,
};

function categoryName(resource: WebsiteResource): string {
  return resource.title.replace(/\s+Resources$/i, "");
}

function editorialLabel(resource: WebsiteResource): string {
  if (resource.editorial_type === "explainer") return "Explainer";
  if (resource.editorial_type === "checklist") return "Checklist";
  if (resource.editorial_type === "reference") return "Reference";
  return "Guide";
}

export default function Resources() {
  useEffect(() => {
    trackHomeEvent("resources_page_view", { page: "resources" });
  }, []);

  const {
    data: categoryData,
    isPending: categoriesPending,
    isError: categoriesError,
  } = usePublishedCategories();
  const {
    data: articleData,
    isPending: articlesPending,
    isError: articlesError,
  } = usePublishedArticles();

  const categories = categoryData ?? [];
  const articles = articleData ?? [];
  const featured = articles
    .filter((article) => article.featured)
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order || a.title.localeCompare(b.title),
    )
    .slice(0, 6);

  const articleCountByCategory = new Map<string, number>();
  for (const article of articles) {
    if (!article.category_slug) continue;
    articleCountByCategory.set(
      article.category_slug,
      (articleCountByCategory.get(article.category_slug) ?? 0) + 1,
    );
  }

  const categoryLabels = new Map(
    categories.map((category) => [category.slug, categoryName(category)]),
  );

  return (
    <Layout>
      <SEO
        title="Veteran & Family Mental Health Resources | ValorWell"
        description="Search and browse ValorWell guides on VA Community Care, CHAMPVA, military health benefits, veteran mental health, documentation, and military family life."
        canonical="/resources"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
        ]}
      />

      <div className="resources-theme bg-[#F4F1E8] text-[#111814]">
        <section className="border-b border-[#3B5147]/12">
          <div className="container-wide grid gap-10 py-14 md:py-20 lg:grid-cols-12 lg:items-end lg:py-24">
            <div className="lg:col-span-9">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
                ValorWell Resource Library
              </p>
              <h1 className="mt-5 max-w-5xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] sm:text-5xl md:text-6xl">
                Clear answers for complicated veteran and military-family systems.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
                Search practical guides built around the questions veterans, spouses, and families are actually trying to answer—then verify program-specific details with the responsible official source when they matter.
              </p>
            </div>

            <div className="lg:col-span-3 lg:text-right">
              <Link
                to="/get-care"
                onClick={() => trackHomeEvent("resources_hero_care", { page: "resources" })}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2F4239]"
              >
                Find Care
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="container-wide py-8 md:py-12">
          {categoriesPending || articlesPending ? (
            <div className="rounded-[2rem] bg-[#111814] p-8 text-white">
              <p role="status" aria-live="polite" className="text-white/65">
                Loading the resource library…
              </p>
            </div>
          ) : categoriesError || articlesError ? (
            <div className="rounded-[2rem] border border-[#B24A3A]/20 bg-white p-8">
              <p role="status" aria-live="polite" className="text-[#111814]/68">
                We could not load the resource library right now. Please refresh the page and try again.
              </p>
            </div>
          ) : (
            <ResourceLibrarySearch articles={articles} categories={categories} />
          )}
        </section>

        {featured.length > 0 && (
          <section className="border-y border-[#3B5147]/12 bg-white">
            <div className="container-wide py-16 md:py-20">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                    Start here
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-0.025em] md:text-4xl">
                    Featured guidance
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-[#111814]/62">
                    High-value guides selected as starting points across the library.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {featured.map((article) => (
                  <Link
                    key={article.id}
                    to={`/resources/${article.category_slug}/${article.slug}`}
                    className="group flex min-h-[250px] flex-col justify-between rounded-3xl border border-[#3B5147]/13 bg-[#F4F1E8] p-7 transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.13em]">
                        <span className="text-[#3B5147]">{editorialLabel(article)}</span>
                        <span className="text-[#111814]/30">•</span>
                        <span className="text-[#111814]/48">
                          {categoryLabels.get(article.category_slug ?? "") ?? article.category_slug}
                        </span>
                      </div>
                      <h3 className="mt-4 text-2xl font-bold leading-[1.2] tracking-[-0.02em]">
                        {article.title}
                      </h3>
                      <p className="mt-4 line-clamp-4 leading-7 text-[#111814]/62">
                        {article.summary}
                      </p>
                    </div>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
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
          </section>
        )}

        <section className="bg-[#F4F1E8]">
          <div className="container-wide py-16 md:py-22">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                Browse by topic
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.025em] md:text-4xl">
                Resource centers built around the system you are navigating.
              </h2>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => {
                const Icon = iconBySlug[category.slug] ?? BookOpen;
                const count = articleCountByCategory.get(category.slug) ?? 0;

                return (
                  <Link
                    key={category.id}
                    to={`/resources/${category.slug}`}
                    onClick={() =>
                      trackHomeEvent("resources_category", {
                        page: "resources",
                        destination: `/resources/${category.slug}`,
                      })
                    }
                    className="group rounded-3xl border border-[#3B5147]/14 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF1EC]">
                        <Icon className="h-6 w-6 text-[#3B5147]" aria-hidden="true" />
                      </span>
                      <span className="rounded-full bg-[#F4F1E8] px-3 py-1 text-xs font-bold text-[#111814]/55">
                        {count} {count === 1 ? "guide" : "guides"}
                      </span>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold">{categoryName(category)}</h3>
                    <p className="mt-3 line-clamp-4 leading-7 text-[#111814]/62">
                      {category.summary}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
                      Explore topic
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#111814] text-white">
          <div className="container-wide grid gap-10 py-14 md:py-16 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                How to use this library
              </p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Understand the system first. Verify the details that can change.
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-white/65">
                ValorWell resources are educational. Eligibility, authorizations, network participation, legal requirements, and program rules should be confirmed with the responsible program or professional when they affect an individual decision.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link
                to="/get-care"
                className="inline-flex min-h-11 items-center rounded-md bg-[#F4F1E8] px-5 py-2.5 text-sm font-bold text-[#111814]"
              >
                Find Care
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center rounded-md border border-white/25 px-5 py-2.5 text-sm font-bold text-white"
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
