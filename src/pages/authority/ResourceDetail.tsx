import { Link, useParams } from "react-router-dom";
import { ArrowRight, ChevronRight, Clock3 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema, FAQSchema } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ResourceMarkdoc,
  ResourceSources,
} from "@/components/resources/ResourceContent";
import { compileResourceMarkdoc } from "@/content/resource-markdoc-config.mjs";
import NotFound from "@/pages/NotFound";
import {
  usePublishedArticle,
  usePublishedCategory,
  usePublishedCategoryArticles,
  usePublicResourceSources,
  useRelatedResources,
} from "@/lib/websiteResources";

type ResourceDetailProps = {
  categorySlug?: string;
  articleSlug?: string;
};

function ResourceStatus({ message }: { message: string }) {
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

function categoryLabel(title: string | undefined, slug: string) {
  if (title) return title.replace(/\s+Resources$/i, "");
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPublicDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function ResourceDetail({
  categorySlug: categorySlugProp,
  articleSlug: articleSlugProp,
}: ResourceDetailProps) {
  const params = useParams<{ categorySlug: string; articleSlug: string }>();
  const categorySlug = categorySlugProp ?? params.categorySlug;
  const articleSlug = articleSlugProp ?? params.articleSlug;

  const { data: resource, isPending, isError } = usePublishedArticle(
    categorySlug,
    articleSlug,
  );
  const { data: category } = usePublishedCategory(categorySlug);
  const { data: siblings } = usePublishedCategoryArticles(categorySlug);
  const { data: sources = [] } = usePublicResourceSources(resource?.id);
  const { data: relations = [] } = useRelatedResources(resource?.id);

  if (!categorySlug || !articleSlug) return <NotFound />;
  if (isPending) return <ResourceStatus message="Loading resource…" />;
  if (isError) {
    return (
      <ResourceStatus message="We could not load this resource right now. Please refresh the page and try again." />
    );
  }
  if (!resource) return <NotFound />;

  const compiled = compileResourceMarkdoc(resource.body_markdown, {
    schemaVersion: resource.content_schema_version,
  });
  const toc = compiled.toc.filter((item) => item.level === 2);
  const hasToc = toc.length > 1;
  const topicLabel = categoryLabel(category?.title, categorySlug);
  const publicDate = formatPublicDate(
    resource.public_updated_at || resource.published_at,
  );

  const explicitRelated = relations
    .filter((relation) => relation.relation_type === "related")
    .map((relation) => relation.resource);

  const related =
    explicitRelated.length > 0
      ? explicitRelated.slice(0, 3)
      : (siblings ?? [])
          .filter(
            (candidate) =>
              candidate.resource_kind === "article" &&
              candidate.slug !== resource.slug,
          )
          .slice(0, 3);

  const path = `/resources/${categorySlug}/${resource.slug}`;
  const categoryPath = `/resources/${categorySlug}`;

  return (
    <Layout>
      <SEO
        title={resource.seo_title || `${resource.title} | ValorWell`}
        description={resource.seo_description || resource.summary}
        canonical={path}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
          { name: category?.title ?? topicLabel, url: categoryPath },
          { name: resource.title, url: path },
        ]}
      />
      {resource.faq.length > 0 && <FAQSchema faqs={resource.faq} />}

      <article
        className="resource-article-page bg-[#F4F1E8] text-[#111814]"
        data-pagefind-body
      >
        <div className="sr-only" data-pagefind-ignore>
          <span data-pagefind-filter={`category:${categorySlug}`} />
          <span data-pagefind-meta="category_label">{topicLabel}</span>
          <span data-pagefind-meta="resource_type">{resource.editorial_type}</span>
          {resource.audience_tags.map((tag) => (
            <span key={tag} data-pagefind-filter="audience">
              {tag}
            </span>
          ))}
          {resource.topic_aliases.map((alias) => (
            <span key={alias} data-pagefind-meta="alias">
              {alias}
            </span>
          ))}
        </div>

        <header className="resource-article-hero border-b border-[#3B5147]/12 bg-[#F4F1E8]">
          <div className="container-wide py-10 md:py-14 lg:py-16">
            <nav
              aria-label="Breadcrumb"
              className="resource-print-hidden mb-7 flex flex-wrap items-center gap-2 text-sm text-[#111814]/55"
              data-pagefind-ignore
            >
              <Link to="/resources" className="font-semibold transition hover:text-[#3B5147]">
                Resources
              </Link>
              <ChevronRight className="h-4 w-4 text-[#3B5147]/45" aria-hidden="true" />
              <Link to={categoryPath} className="font-semibold transition hover:text-[#3B5147]">
                {topicLabel}
              </Link>
              <ChevronRight className="h-4 w-4 text-[#3B5147]/45" aria-hidden="true" />
              <span className="max-w-full truncate text-[#111814]/70" aria-current="page">
                {resource.title}
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
                {resource.editorial_type}
              </p>
              <span className="text-[#3B5147]/35">•</span>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#111814]/48">
                {topicLabel}
              </p>
            </div>

            <h1
              data-pagefind-meta="title"
              className="mt-4 max-w-5xl text-4xl font-bold leading-[1.06] tracking-[-0.035em] md:text-5xl lg:text-[3.65rem]"
            >
              {resource.title}
            </h1>
            <p
              data-pagefind-meta="summary"
              className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl"
            >
              {resource.summary}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#111814]/55">
              <span className="inline-flex items-center gap-2 font-semibold">
                <Clock3 className="h-4 w-4 text-[#3B5147]" aria-hidden="true" />
                {compiled.readingMinutes} min read
              </span>
              {publicDate && <span>Updated {publicDate}</span>}
            </div>
          </div>
        </header>

        <div className="resource-article-shell container-wide py-8 md:py-12 lg:py-14">
          {hasToc && (
            <details
              className="resource-print-hidden mb-6 rounded-2xl border border-[#3B5147]/15 bg-white p-5 shadow-sm lg:hidden"
              data-pagefind-ignore
            >
              <summary className="cursor-pointer select-none font-bold text-[#111814]">
                On this page
              </summary>
              <nav aria-label="Article sections" className="mt-4">
                <ol className="space-y-2.5 border-l border-[#3B5147]/15 pl-4">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block py-0.5 text-sm leading-5 text-[#111814]/68 transition hover:text-[#3B5147]"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>
          )}

          <div
            className={`resource-article-grid mx-auto grid max-w-[1180px] items-start gap-8 lg:justify-center ${
              hasToc
                ? "lg:grid-cols-[250px_minmax(0,760px)] lg:gap-12 xl:grid-cols-[260px_minmax(0,780px)] xl:gap-16"
                : "lg:grid-cols-[minmax(0,780px)]"
            }`}
          >
            {hasToc && (
              <aside className="resource-print-hidden hidden lg:block" data-pagefind-ignore>
                <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                    On this page
                  </p>
                  <nav aria-label="Article sections" className="mt-4">
                    <ol className="space-y-1 border-l border-[#3B5147]/15">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className="block border-l-2 border-transparent py-2 pl-4 text-sm leading-5 text-[#111814]/58 transition hover:border-[#D7A92E] hover:text-[#3B5147] focus-visible:border-[#D7A92E] focus-visible:text-[#3B5147]"
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </div>
              </aside>
            )}

            <div className="min-w-0">
              <div className="resource-article-surface rounded-[1.75rem] border border-[#3B5147]/12 bg-white px-6 py-8 shadow-[0_22px_70px_-52px_rgba(17,24,20,0.55)] sm:px-8 md:px-11 md:py-11 lg:px-12 lg:py-12">
                <ResourceMarkdoc content={compiled.content} sources={sources} />
              </div>

              <ResourceSources sources={sources} />

              {resource.faq.length > 0 && (
                <section
                  aria-labelledby="resource-faq-heading"
                  className="mt-8 rounded-[1.75rem] border border-[#3B5147]/12 bg-white px-6 py-8 shadow-[0_18px_55px_-48px_rgba(17,24,20,0.5)] sm:px-8 md:px-10 md:py-10"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                    Common questions
                  </p>
                  <h2 id="resource-faq-heading" className="mt-2 text-2xl font-bold md:text-3xl">
                    Frequently asked questions
                  </h2>

                  <div className="resource-screen-faq mt-6">
                    <Accordion type="single" collapsible className="w-full">
                      {resource.faq.map((faq, index) => (
                        <AccordionItem
                          key={faq.question}
                          value={`faq-${index}`}
                          className="border-[#3B5147]/12"
                        >
                          <AccordionTrigger className="py-5 text-left text-base font-bold leading-6 text-[#111814] hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="pb-5 pr-8 text-base leading-7 text-[#111814]/70">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <div className="resource-print-faq">
                    {resource.faq.map((faq) => (
                      <div key={faq.question} className="resource-print-faq-item mb-6">
                        <h3 className="font-bold">{faq.question}</h3>
                        <p className="mt-2 leading-7">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <section
              aria-labelledby="related-resources-heading"
              className="resource-print-hidden mx-auto mt-12 max-w-[1050px] border-t border-[#3B5147]/15 pt-10"
              data-pagefind-ignore
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                Keep reading
              </p>
              <h2 id="related-resources-heading" className="mt-2 text-2xl font-bold md:text-3xl">
                Related resources
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    to={`/resources/${item.category_slug}/${item.slug}`}
                    className="group flex min-h-52 flex-col justify-between rounded-2xl border border-[#3B5147]/15 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3B5147]">
                        {item.editorial_type}
                      </p>
                      <h3 className="mt-2 text-lg font-bold leading-6 text-[#111814]">
                        {item.title}
                      </h3>
                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#111814]/60">
                        {item.summary}
                      </p>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]">
                      Read resource
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section
            className="resource-print-hidden mx-auto mt-10 max-w-[1050px] rounded-2xl bg-[#111814] px-6 py-7 text-white md:flex md:items-center md:justify-between md:gap-8 md:px-8"
            data-pagefind-ignore
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                Need care?
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Use the guide for orientation. Use care when you need care.
              </h2>
            </div>
            <div className="mt-5 flex shrink-0 flex-wrap gap-3 md:mt-0">
              <Link
                to="/get-care"
                className="inline-flex min-h-11 items-center rounded-md bg-[#F4F1E8] px-5 py-2.5 text-sm font-bold text-[#111814] transition hover:bg-white"
              >
                Find Care
              </Link>
              <Link
                to={categoryPath}
                className="inline-flex min-h-11 items-center rounded-md border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Back to This Topic
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
