import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Compass,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { ResourceDocument } from "@/components/resources/ResourceDocument";
import { ResourceSearch } from "@/components/resources/ResourceSearch";
import NotFound from "@/pages/NotFound";
import { compileResourceDocument } from "@/lib/resourceMarkdoc";
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

function editorialLabel(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ArticleCard({
  article,
  categorySlug,
  prominent = false,
}: {
  article: WebsiteResource;
  categorySlug: string;
  prominent?: boolean;
}) {
  const readTime = compileResourceDocument(
    article.body_markdown,
    article.content_schema_version,
  ).readingMinutes;

  return (
    <Link
      to={`/resources/${categorySlug}/${article.slug}`}
      className={`group flex h-full flex-col justify-between rounded-2xl border border-[#3B5147]/15 bg-white transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none ${
        prominent ? "p-7 md:p-8" : "p-6"
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#3B5147]">
          <span>{editorialLabel(article.editorial_type)}</span>
          <span className="text-[#111814]/25" aria-hidden="true">/</span>
          <span className="inline-flex items-center gap-1.5 text-[#111814]/45">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {readTime} min
          </span>
        </div>
        <h3
          className={`mt-3 font-bold leading-tight text-[#111814] ${
            prominent ? "text-2xl md:text-3xl" : "text-xl"
          }`}
        >
          {article.title}
        </h3>
        <p className="mt-3 leading-7 text-[#111814]/62">{article.summary}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
        Read guide
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
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
  const featured = list.filter((article) => article.featured);
  const featuredIds = new Set(featured.map((article) => article.id));
  const rest = list.filter((article) => !featuredIds.has(article.id));
  const categoryDocument = compileResourceDocument(
    category.body_markdown,
    category.content_schema_version,
  );

  return (
    <Layout>
      <SEO
        title={`${category.seo_title || category.title} | ValorWell`}
        description={category.seo_description || category.summary}
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
        <header className="border-b border-[#3B5147]/15">
          <div className="container-wide py-10 md:py-16 lg:py-20">
            <nav
              aria-label="Breadcrumb"
              className="mb-7 flex flex-wrap items-center gap-2 text-sm text-[#111814]/55"
            >
              <Link to="/resources" className="font-semibold transition hover:text-[#3B5147]">
                Resources
              </Link>
              <ChevronRight className="h-4 w-4 text-[#3B5147]/45" aria-hidden="true" />
              <span aria-current="page">{category.title}</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
              Resource topic
            </p>
            <h1 className="mt-4 max-w-5xl text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-6xl">
              {category.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
              {category.summary}
            </p>
          </div>
        </header>

        <main>
          <section className="border-b border-[#3B5147]/12 bg-white">
            <div className="container-wide grid gap-8 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                  About this topic
                </p>
                <div className="mt-4 resource-category-intro">
                  <ResourceDocument content={categoryDocument.content} />
                </div>
              </div>
              <div className="rounded-2xl bg-[#F4F1E8] p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Compass className="h-5 w-5 text-[#3B5147]" aria-hidden="true" />
                  <h2 className="font-bold">Search this topic</h2>
                </div>
                <ResourceSearch category={category.title.replace(/\s+Resources$/i, "")} compact />
              </div>
            </div>
          </section>

          {featured.length > 0 && (
            <section className="border-b border-[#3B5147]/12 bg-[#F4F1E8]">
              <div className="container-wide py-14 md:py-18">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                    Start here
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-0.025em] md:text-4xl">
                    Core guidance for this topic
                  </h2>
                  <p className="mt-3 leading-7 text-[#111814]/62">
                    These guides answer the questions people most often need to get oriented before moving into the details.
                  </p>
                </div>
                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                  {featured.slice(0, 4).map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      categorySlug={category.slug}
                      prominent={index === 0}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="bg-white">
            <div className="container-wide py-14 md:py-20">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                    Browse guidance
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-0.025em] md:text-4xl">
                    {featured.length > 0 ? "More resources" : "Resources in this topic"}
                  </h2>
                </div>
                {list.length > 0 && (
                  <p className="text-sm font-semibold text-[#111814]/48">
                    {list.length} {list.length === 1 ? "guide" : "guides"}
                  </p>
                )}
              </div>

              {articlesPending && list.length === 0 ? (
                <p className="mt-8 text-[#111814]/64" role="status" aria-live="polite">
                  Loading articles…
                </p>
              ) : list.length === 0 ? (
                <div className="mt-8 max-w-2xl rounded-2xl border border-[#3B5147]/12 bg-[#F4F1E8] p-6">
                  <BookOpen className="h-6 w-6 text-[#3B5147]" aria-hidden="true" />
                  <p className="mt-4 font-bold">New guidance is being prepared.</p>
                  <p className="mt-2 leading-7 text-[#111814]/62">
                    Explore the rest of the resource library or check back as this topic grows.
                  </p>
                </div>
              ) : (
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {(featured.length > 0 ? rest : list).map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      categorySlug={category.slug}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="border-t border-[#3B5147]/12 bg-[#111814] text-white">
            <div className="container-wide grid gap-6 py-10 md:grid-cols-[1fr_auto] md:items-center md:py-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                  Need more than information?
                </p>
                <h2 className="mt-2 max-w-3xl text-2xl font-bold md:text-3xl">
                  Use the library to understand the issue. Use care when you need individualized support.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/get-care"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#F4F1E8] px-6 py-3 text-sm font-bold text-[#111814]"
                >
                  Find Care
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/resources"
                  className="inline-flex min-h-12 items-center rounded-md border border-white/25 px-6 py-3 text-sm font-bold text-white"
                >
                  All Resources
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
