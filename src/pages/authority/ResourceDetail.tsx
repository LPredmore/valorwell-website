import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  ExternalLink,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema, FAQSchema } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ResourceDocument } from "@/components/resources/ResourceDocument";
import NotFound from "@/pages/NotFound";
import { compileResourceDocument } from "@/lib/resourceMarkdoc";
import {
  usePublishedArticle,
  usePublishedCategory,
  usePublicResourceSources,
  useRelatedResources,
  type WebsiteResourceSource,
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

function categoryLabel(title: string | undefined, slug: string): string {
  if (title) return title.replace(/\s+Resources$/i, "");
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function editorialLabel(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPublicDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function sourceLabel(source: WebsiteResourceSource): string {
  if (source.title?.trim()) return source.title.trim();

  try {
    const url = new URL(source.url);
    const path = url.pathname.replace(/\/$/, "");
    const finalSegment = path.split("/").filter(Boolean).at(-1);

    if (finalSegment) {
      const cleaned = decodeURIComponent(finalSegment)
        .replace(/[-_]+/g, " ")
        .replace(/\.(pdf|html?)$/i, "")
        .trim();

      if (cleaned.length >= 4) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
    }

    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Official source";
  }
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
  const { data: sources = [] } = usePublicResourceSources(resource?.id);
  const { data: related = [] } = useRelatedResources(resource?.id, categorySlug);

  if (!categorySlug || !articleSlug) return <NotFound />;
  if (isPending) return <ResourceStatus message="Loading resource…" />;
  if (isError) {
    return (
      <ResourceStatus message="We could not load this resource right now. Please refresh the page and try again." />
    );
  }
  if (!resource) return <NotFound />;

  const document = compileResourceDocument(
    resource.body_markdown,
    resource.content_schema_version,
  );
  const toc = document.toc.filter((item) => item.level === 2);
  const hasToc = toc.length > 1;
  const topicLabel = categoryLabel(category?.title, categorySlug);
  const path = `/resources/${categorySlug}/${resource.slug}`;
  const categoryPath = `/resources/${categorySlug}`;
  const updatedLabel = formatPublicDate(resource.public_updated_at);
  const seoTitle = resource.seo_title || resource.title;
  const seoDescription = resource.seo_description || resource.summary;

  return (
    <Layout>
      <SEO
        title={`${seoTitle} | ValorWell`}
        description={seoDescription}
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
      {resource.faq.length > 0 && (
        <FAQSchema
          faqs={resource.faq.map((faq) => ({
            question: faq.question ?? "",
            answer: faq.answer ?? "",
          }))}
        />
      )}

      <article
        className="resource-article-page bg-[#F4F1E8] text-[#111814]"
        data-pagefind-body
        data-pagefind-meta={`category:${topicLabel}`}
      >
        <header className="resource-article-hero border-b border-[#3B5147]/12 bg-[#F4F1E8]">
          <div className="container-wide py-9 md:py-14 lg:py-16">
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

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
              <span data-pagefind-meta="category">{topicLabel}</span>
              <span aria-hidden="true" className="text-[#111814]/25">/</span>
              <span data-pagefind-meta="type">{editorialLabel(resource.editorial_type)}</span>
            </div>

            {resource.audience_tags.map((tag) => (
              <span
                key={tag}
                className="hidden"
                data-pagefind-filter={`audience:${tag}`}
                aria-hidden="true"
              >
                {tag}
              </span>
            ))}
            <span
              className="hidden"
              data-pagefind-filter={`category:${topicLabel}`}
              aria-hidden="true"
            >
              {topicLabel}
            </span>

            <h1
              className="mt-4 max-w-5xl text-4xl font-bold leading-[1.06] tracking-[-0.035em] md:text-5xl lg:text-[3.6rem]"
              data-pagefind-meta="title"
            >
              {resource.title}
            </h1>
            <p
              className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl"
              data-pagefind-meta="summary"
            >
              {resource.summary}
            </p>

            <div
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#111814]/55"
              data-pagefind-ignore
            >
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#3B5147]" aria-hidden="true" />
                {document.readingMinutes} min read
              </span>
              {updatedLabel && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#3B5147]" aria-hidden="true" />
                  Updated {updatedLabel}
                </span>
              )}
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
                : "lg:grid-cols-[minmax(0,800px)]"
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
              <div className="resource-article-surface rounded-[1.75rem] border border-[#3B5147]/12 bg-white px-6 py-8 shadow-[0_22px_70px_-52px_rgba(17,24,20,0.55)] sm:px-8 md:px-10 md:py-11 lg:px-12 lg:py-12">
                <ResourceDocument content={document.content} />
              </div>

              {resource.faq.length > 0 && (
                <section
                  aria-labelledby="resource-faq-heading"
                  className="mt-8 rounded-[1.75rem] border border-[#3B5147]/12 bg-white px-6 py-8 shadow-[0_18px_55px_-48px_rgba(17,24,20,0.5)] sm:px-8 md:px-10 md:py-10"
                  data-pagefind-ignore
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

              {sources.length > 0 && (
                <section
                  aria-labelledby="resource-sources-heading"
                  className="resource-source-list mt-8 rounded-[1.75rem] border border-[#3B5147]/12 bg-white px-6 py-8 sm:px-8 md:px-10 md:py-10"
                  data-pagefind-ignore
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-1 h-5 w-5 shrink-0 text-[#3B5147]" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                        Primary references
                      </p>
                      <h2 id="resource-sources-heading" className="mt-2 text-2xl font-bold md:text-3xl">
                        Sources
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#111814]/58">
                        These references support the program, policy, or factual guidance in this resource. Program rules can change; use the source itself when a current decision depends on it.
                      </p>
                    </div>
                  </div>

                  <ol className="mt-6 space-y-3">
                    {sources.map((source, index) => (
                      <li
                        key={source.id}
                        className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-t border-[#3B5147]/10 pt-4 first:border-t-0 first:pt-0"
                      >
                        <span className="pt-0.5 text-sm font-bold tabular-nums text-[#3B5147]/70">
                          {index + 1}.
                        </span>
                        <div>
                          {source.organization && (
                            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#111814]/48">
                              {source.organization}
                            </p>
                          )}
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-1 inline-flex items-start gap-1.5 font-bold leading-6 text-[#3B5147] underline decoration-[#3B5147]/25 underline-offset-4 transition hover:decoration-[#3B5147]"
                          >
                            <span>{sourceLabel(source)}</span>
                            <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          </a>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#111814]/38">
                            {editorialLabel(source.source_type)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
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
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#3B5147]">
                        {editorialLabel(item.editorial_type)}
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
                Information can clarify the next step. Care is available when you need more than information.
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
