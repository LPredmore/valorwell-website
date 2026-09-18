import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, FileText } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import NotFound from "@/pages/NotFound";
import { compileResourceMarkup } from "@/content/resourceContent";
import {
  usePublishedCategory,
  usePublishedCategoryArticles,
  type WebsiteResource,
} from "@/lib/websiteResources";

type ResourceCategoryProps = {
  categorySlug?: string;
};

function CategoryStatus({ message }: { message: string }) {
  return (
    <Layout>
      <div className="bg-[#F4F1E8] text-[#111814]">
        <div className="container-narrow py-24 md:py-32">
          <p className="text-lg text-[#111814]/68" role="status" aria-live="polite">
            {message}
          </p>
        </div>
      </div>
    </Layout>
  );
}

function editorialLabel(resource: WebsiteResource): string {
  if (resource.editorial_type === "explainer") return "Explainer";
  if (resource.editorial_type === "checklist") return "Checklist";
  if (resource.editorial_type === "reference") return "Reference";
  return "Guide";
}

export default function ResourceCategory({
  categorySlug: categorySlugProp,
}: ResourceCategoryProps) {
  const params = useParams<{ categorySlug: string }>();
  const categorySlug = categorySlugProp ?? params.categorySlug;

  const { data: category, isPending, isError } = usePublishedCategory(categorySlug);
  const { data: articles, isPending: articlesPending } =
    usePublishedCategoryArticles(categorySlug);

  if (!categorySlug) return <NotFound />;
  if (isPending) return <CategoryStatus message="Loading resources…" />;
  if (isError) {
    return (
      <CategoryStatus message="We could not load this topic right now. Please refresh the page and try again." />
    );
  }
  if (!category) return <NotFound />;

  const path = `/resources/${category.slug}`;
  const list = articles ?? [];
  const featured = list.find((article) => article.featured) ?? list[0] ?? null;
  const rest = featured ? list.filter((article) => article.id !== featured.id) : list;
  const compiled = compileResourceMarkup(category.body_markdown);
  const categoryName = category.title.replace(/\s+Resources$/i, "");

  return (
    <Layout>
      <SEO
        title={category.seo_title ?? category.title}
        description={category.seo_description ?? category.summary}
        canonical={path}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
          { name: category.title, url: path },
        ]}
      />

      <div className="bg-[#F4F1E8] text-[#111814]">
        <section className="border-b border-[#3B5147]/12">
          <div className="container-wide py-12 md:py-16 lg:py-20">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#3B5147] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Resource Library
            </Link>

            <div className="mt-7 max-w-5xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
                Topic Center
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.06] tracking-[-0.035em] md:text-5xl lg:text-6xl">
                {categoryName}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
                {category.summary}
              </p>
            </div>
          </div>
        </section>

        {featured && (
          <section className="border-b border-[#3B5147]/12 bg-white">
            <div className="container-wide py-12 md:py-16">
              <div className="grid gap-7 rounded-[2rem] border border-[#3B5147]/13 bg-[#111814] p-7 text-white md:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                    Recommended starting point
                  </p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight md:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 max-w-2xl leading-7 text-white/65">
                    {featured.summary}
                  </p>
                </div>
                <Link
                  to={`/resources/${category.slug}/${featured.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#F4F1E8] px-5 py-2.5 text-sm font-bold text-[#111814] transition hover:bg-white"
                >
                  Read {editorialLabel(featured).toLowerCase()}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {compiled.publicMarkup && (
          <section className="border-b border-[#3B5147]/12 bg-[#F4F1E8]">
            <div className="container-wide py-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,760px)] lg:gap-12">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                    About this topic
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#111814]/55">
                    Use this overview to understand what belongs in this resource center before choosing a detailed guide.
                  </p>
                </div>
                <div className="resource-category-richtext rounded-[1.5rem] border border-[#3B5147]/12 bg-white px-6 py-7 shadow-sm sm:px-8">
                  <div className="resource-richtext resource-richtext-category">
                    {compiled.rendered}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white">
          <div className="container-wide py-14 md:py-18">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                  Detailed guidance
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.025em] md:text-4xl">
                  All {categoryName.toLowerCase()} resources
                </h2>
              </div>
              {list.length > 0 && (
                <p className="text-sm font-semibold text-[#111814]/50">
                  {list.length} {list.length === 1 ? "resource" : "resources"}
                </p>
              )}
            </div>

            {articlesPending && list.length === 0 ? (
              <p className="mt-8 text-[#111814]/64" role="status" aria-live="polite">
                Loading articles…
              </p>
            ) : list.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-[#3B5147]/12 bg-[#F4F1E8] p-7">
                <p className="max-w-2xl leading-7 text-[#111814]/64">
                  New guidance for this topic is being written. Explore the rest of the resource library in the meantime.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {list.map((article) => (
                  <Link
                    key={article.id}
                    to={`/resources/${category.slug}/${article.slug}`}
                    className="group flex min-h-[260px] flex-col justify-between rounded-3xl border border-[#3B5147]/13 bg-[#F4F1E8] p-7 transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#3B5147]">
                          {article.editorial_type === "checklist" ? (
                            <FileText className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                          )}
                          {editorialLabel(article)}
                        </span>
                        {article.featured && (
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#111814]/50">
                            Start here
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 text-xl font-bold leading-[1.22] tracking-[-0.015em]">
                        {article.title}
                      </h3>
                      <p className="mt-4 line-clamp-4 leading-7 text-[#111814]/62">
                        {article.summary}
                      </p>
                    </div>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
                      Read resource
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-[#3B5147]/12 bg-[#F4F1E8]">
          <div className="container-wide flex flex-wrap items-center justify-between gap-5 py-10 md:py-12">
            <p className="max-w-2xl text-sm leading-6 text-[#111814]/58">
              Resource guidance is educational. Verify current eligibility, authorization, benefits, legal requirements, or program-specific rules with the responsible official source when they affect an individual decision.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/resources"
                className="inline-flex min-h-11 items-center rounded-md border border-[#3B5147]/25 px-5 py-2.5 text-sm font-bold text-[#3B5147]"
              >
                All Resources
              </Link>
              <Link
                to="/get-care"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#3B5147] px-5 py-2.5 text-sm font-bold text-white"
              >
                Find Care
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
