import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import NotFound from "@/pages/NotFound";
import {
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

  return (
    <Layout>
      <SEO
        title={`${category.title} | ValorWell`}
        description={category.summary}
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
        <section className="border-b border-[#3B5147]/15 py-14 md:py-20">
          <div className="container-narrow">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
              ValorWell Resources
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
              {category.title}
            </h1>
            {category.summary && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
                {category.summary}
              </p>
            )}
          </div>
        </section>

        <section className="border-b border-[#3B5147]/12 bg-white py-12 md:py-16">
          <div className="container-narrow">
            <h2 className="mb-7 text-2xl font-bold md:text-4xl">Articles in this topic</h2>

            {articlesPending && list.length === 0 ? (
              <p className="text-[#111814]/64" role="status" aria-live="polite">
                Loading articles…
              </p>
            ) : list.length === 0 ? (
              <p className="max-w-2xl leading-7 text-[#111814]/64">
                New guidance for this topic is being written. Check back soon, or explore
                the rest of the resource library.
              </p>
            ) : (
              <ul className="max-w-3xl divide-y divide-[#3B5147]/12 border-y border-[#3B5147]/12">
                {list.map((article) => (
                  <li key={article.slug}>
                    <Link
                      to={`/resources/${category.slug}/${article.slug}`}
                      className="group flex min-h-14 items-center justify-between gap-4 py-5 text-lg font-bold text-[#111814] transition hover:text-[#3B5147] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
                    >
                      <span>{article.title}</span>
                      <ArrowRight
                        className="h-5 w-5 shrink-0 text-[#3B5147] transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="bg-[#F4F1E8] py-12 md:py-16">
          <div className="container-narrow flex flex-wrap gap-3">
            <Link
              to="/get-care"
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white"
            >
              Find Care
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/resources"
              className="inline-flex min-h-12 items-center rounded-md border border-[#3B5147]/25 px-6 py-3 text-sm font-bold text-[#3B5147]"
            >
              Explore All Resources
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
