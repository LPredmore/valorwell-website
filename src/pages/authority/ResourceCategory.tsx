import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { ResourceMarkdoc } from "@/components/resources/ResourceContent";
import { compileResourceMarkdoc } from "@/content/resource-markdoc-config.mjs";
import NotFound from "@/pages/NotFound";
import {
  type WebsiteResource,
  usePublishedCategory,
  usePublishedCategoryArticles,
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
  const featured = list.find((article) => article.featured) ?? null;
  const remaining = featured
    ? list.filter((article) => article.id !== featured.id)
    : list;
  const categoryContent = compileResourceMarkdoc(category.body_markdown, {
    schemaVersion: category.content_schema_version,
  });

  return (
    <Layout>
      <SEO
        title={category.seo_title || `${category.title} | ValorWell`}
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
          <div className="container-wide py-12 md:py-16 lg:py-20">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#3B5147] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Resource Library
            </Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
              Topic
            </p>
            <h1 className="mt-3 max-w-5xl text-4xl font-bold leading-[1.05] md:text-5xl lg:text-6xl">
              {category.title}
            </h1>
            {category.summary && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
                {category.summary}
              </p>
            )}
          </div>
        </header>

        <main className="container-wide py-10 md:py-14 lg:py-16">
          {categoryContent.source && (
            <section className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,760px)_280px] lg:items-start lg:gap-12">
              <div className="rounded-[1.5rem] border border-[#3B5147]/12 bg-white px-6 py-7 shadow-[0_20px_65px_-52px_rgba(17,24,20,0.5)] sm:px-8 md:px-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
                  About this topic
                </p>
                <div className="mt-3 resource-category-content">
                  <ResourceMarkdoc content={categoryContent.content} sources={[]} />
                </div>
              </div>

              <aside className="rounded-2xl border border-[#3B5147]/12 bg-[#111814] p-6 text-white lg:sticky lg:top-24">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D7A92E]">
                  Need care?
                </p>
                <p className="mt-3 leading-7 text-white/72">
                  If you are looking for treatment rather than general guidance, go directly to the care pathway.
                </p>
                <Link
                  to="/get-care"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#F4F1E8] px-5 py-2.5 text-sm font-bold text-[#111814]"
                >
                  Find Care
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </aside>
            </section>
          )}

          {featured && (
            <section className="mx-auto mt-12 max-w-[1180px]" aria-labelledby="start-here-heading">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
                Start here
              </p>
              <h2 id="start-here-heading" className="mt-2 text-2xl font-bold md:text-3xl">
                A useful first guide.
              </h2>
              <FeaturedArticleCard categorySlug={category.slug} article={featured} />
            </section>
          )}

          <section
            className="mx-auto mt-12 max-w-[1180px]"
            aria-labelledby="topic-articles-heading"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
                  Guides
                </p>
                <h2 id="topic-articles-heading" className="mt-2 text-2xl font-bold md:text-3xl">
                  Articles in this topic
                </h2>
              </div>
              {list.length > 0 && (
                <p className="text-sm text-[#111814]/50">
                  {list.length} {list.length === 1 ? "resource" : "resources"}
                </p>
              )}
            </div>

            {articlesPending && list.length === 0 ? (
              <p className="mt-8 text-[#111814]/64" role="status" aria-live="polite">
                Loading articles…
              </p>
            ) : list.length === 0 ? (
              <p className="mt-8 max-w-2xl leading-7 text-[#111814]/64">
                New guidance for this topic is being written. Check back soon, or explore
                the rest of the resource library.
              </p>
            ) : remaining.length === 0 && featured ? null : (
              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {remaining.map((article) => (
                  <ArticleCard
                    key={article.id}
                    categorySlug={category.slug}
                    article={article}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="mx-auto mt-14 max-w-[1180px] border-t border-[#3B5147]/12 pt-8">
            <Link
              to="/resources"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Explore all resource topics
            </Link>
          </div>
        </main>
      </div>
    </Layout>
  );
}

function ArticleCard({
  categorySlug,
  article,
}: {
  categorySlug: string;
  article: WebsiteResource;
}) {
  const compiled = compileResourceMarkdoc(article.body_markdown, {
    schemaVersion: article.content_schema_version,
  });

  return (
    <Link
      to={`/resources/${categorySlug}/${article.slug}`}
      className="group flex min-h-64 flex-col justify-between rounded-2xl border border-[#3B5147]/12 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3B5147]/28 hover:shadow-md motion-reduce:transform-none"
    >
      <div>
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#3B5147]">
          <span>{article.editorial_type}</span>
          <span className="inline-flex items-center gap-1.5 text-[#111814]/45">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {compiled.readingMinutes} min
          </span>
        </div>
        <h3 className="mt-4 text-xl font-bold leading-7 text-[#111814] group-hover:text-[#3B5147]">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#111814]/62">
          {article.summary}
        </p>
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
        Read guide
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function FeaturedArticleCard({
  categorySlug,
  article,
}: {
  categorySlug: string;
  article: WebsiteResource;
}) {
  const compiled = compileResourceMarkdoc(article.body_markdown, {
    schemaVersion: article.content_schema_version,
  });

  return (
    <Link
      to={`/resources/${categorySlug}/${article.slug}`}
      className="group mt-6 grid overflow-hidden rounded-[1.5rem] border border-[#3B5147]/15 bg-white shadow-sm transition hover:border-[#3B5147]/28 hover:shadow-md md:grid-cols-[minmax(0,1fr)_14rem]"
    >
      <div className="p-7 md:p-8">
        <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#3B5147]">
          <span>{article.editorial_type}</span>
          <span className="text-[#111814]/42">·</span>
          <span className="text-[#111814]/50">{compiled.readingMinutes} min read</span>
        </div>
        <h3 className="mt-4 text-2xl font-bold leading-8 text-[#111814] md:text-3xl">
          {article.title}
        </h3>
        <p className="mt-4 max-w-2xl leading-7 text-[#111814]/64">{article.summary}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
          Start with this guide
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="hidden border-l border-[#3B5147]/10 bg-[#EDF1EC] md:flex md:items-center md:justify-center">
        <ArrowRight className="h-10 w-10 text-[#3B5147]/55" aria-hidden="true" />
      </div>
    </Link>
  );
}
