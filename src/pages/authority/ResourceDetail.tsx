import { type ReactNode } from "react";
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
import NotFound from "@/pages/NotFound";
import {
  usePublishedArticle,
  usePublishedCategory,
  usePublishedCategoryArticles,
} from "@/lib/websiteResources";

type ResourceDetailProps = {
  categorySlug?: string;
  articleSlug?: string;
};

type MarkdownBlock =
  | { type: "heading"; level: number; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "rule" };

const SUPPRESSED_HEADINGS = [
  "authoritative sources reviewed",
  "sources reviewed",
  "sources",
  "last reviewed",
  "last researched",
];

const SUPPRESSED_LINE_PREFIXES = [
  "last researched and verified:",
  "last researched:",
  "last reviewed:",
  "sources reviewed:",
  "authoritative sources reviewed:",
  "last updated:",
];

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function isSuppressedHeading(heading: string): boolean {
  const normalized = stripInlineMarkdown(heading)
    .toLowerCase()
    .replace(/[:.]+$/, "");
  return SUPPRESSED_HEADINGS.some(
    (candidate) => normalized === candidate || normalized.startsWith(`${candidate} `),
  );
}

function isSuppressedLine(line: string): boolean {
  const normalized = line.trim().toLowerCase().replace(/^[*_\s]+/, "");
  return SUPPRESSED_LINE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function slugifyHeading(value: string): string {
  const slug = stripInlineMarkdown(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "section";
}

function parseResourceMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const headingCounts = new Map<string, number>();
  let paragraph: string[] = [];
  let list: Extract<MarkdownBlock, { type: "list" }> | null = null;
  let quote: string[] = [];
  let suppressing = false;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list && list.items.length > 0) blocks.push(list);
    list = null;
  };

  const flushQuote = () => {
    if (quote.length > 0) {
      blocks.push({ type: "blockquote", text: quote.join(" ").trim() });
      quote = [];
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushAll();
      const heading = headingMatch[2].trim();

      if (isSuppressedHeading(heading)) {
        suppressing = true;
        continue;
      }

      suppressing = false;
      const baseId = slugifyHeading(heading);
      const count = (headingCounts.get(baseId) ?? 0) + 1;
      headingCounts.set(baseId, count);

      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: heading,
        id: count === 1 ? baseId : `${baseId}-${count}`,
      });
      continue;
    }

    if (suppressing || isSuppressedLine(line)) continue;

    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushAll();
      blocks.push({ type: "rule" });
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
    const orderedMatch = line.match(/^\d+[.)]\s+(.*)$/);
    if (unorderedMatch || orderedMatch) {
      flushParagraph();
      flushQuote();

      const ordered = Boolean(orderedMatch);
      const item = (orderedMatch?.[1] ?? unorderedMatch?.[1] ?? "").trim();

      if (!list || list.ordered !== ordered) {
        flushList();
        list = { type: "list", ordered, items: [] };
      }

      list.items.push(item);
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quote.push(quoteMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushAll();
  return blocks;
}

function safeHref(href: string): string | null {
  const value = href.trim();
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(value)) return value;
  return null;
}

function renderInlineMarkdown(value: string, keyPrefix: string): ReactNode[] {
  const pattern =
    /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let tokenIndex = 0;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) nodes.push(value.slice(cursor, match.index));

    const key = `${keyPrefix}-${tokenIndex++}`;

    if (match[2] !== undefined && match[3] !== undefined) {
      const href = safeHref(match[3]);
      if (href) {
        const external = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={key}
            href={href}
            className="font-semibold text-[#3B5147] underline decoration-[#3B5147]/30 underline-offset-4 transition hover:decoration-[#3B5147]"
            {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
          >
            {renderInlineMarkdown(match[2], `${key}-label`)}
          </a>,
        );
      } else {
        nodes.push(match[2]);
      }
    } else if (match[4] !== undefined || match[5] !== undefined) {
      nodes.push(
        <strong key={key} className="font-bold text-[#111814]">
          {match[4] ?? match[5]}
        </strong>,
      );
    } else if (match[6] !== undefined || match[7] !== undefined) {
      nodes.push(<em key={key}>{match[6] ?? match[7]}</em>);
    } else if (match[8] !== undefined) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-[#EAE5D6] px-1.5 py-0.5 font-mono text-[0.9em] text-[#111814]"
        >
          {match[8]}
        </code>,
      );
    }

    cursor = pattern.lastIndex;
  }

  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

function getReadingMinutes(blocks: MarkdownBlock[]): number {
  const words = blocks.reduce((count, block) => {
    if (block.type === "rule") return count;
    const text =
      block.type === "list"
        ? block.items.join(" ")
        : block.type === "heading" || block.type === "paragraph" || block.type === "blockquote"
          ? block.text
          : "";
    return count + stripInlineMarkdown(text).split(/\s+/).filter(Boolean).length;
  }, 0);

  return Math.max(1, Math.ceil(words / 225));
}

function categoryLabel(title: string | undefined, slug: string): string {
  if (title) return title.replace(/\s+Resources$/i, "");
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ArticleBlock({ block, index }: { block: MarkdownBlock; index: number }) {
  if (block.type === "heading") {
    const inline = renderInlineMarkdown(block.text, `heading-${index}`);
    const shared = "resource-article-heading scroll-mt-28 text-[#111814]";

    if (block.level <= 2) {
      return (
        <h2
          id={block.id}
          className={`${shared} mt-14 border-t border-[#3B5147]/12 pt-10 text-[1.8rem] font-bold leading-[1.18] md:text-[2rem]`}
        >
          {inline}
        </h2>
      );
    }

    if (block.level === 3) {
      return (
        <h3 id={block.id} className={`${shared} mt-10 text-2xl font-bold leading-[1.25]`}>
          {inline}
        </h3>
      );
    }

    return (
      <h4 id={block.id} className={`${shared} mt-8 text-xl font-bold leading-[1.3]`}>
        {inline}
      </h4>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p className="mt-5 text-[1.0625rem] leading-[1.78] text-[#111814]/78 md:text-[1.1rem]">
        {renderInlineMarkdown(block.text, `paragraph-${index}`)}
      </p>
    );
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag
        className={`mt-5 space-y-2.5 pl-6 text-[1.0625rem] leading-[1.72] text-[#111814]/78 md:text-[1.1rem] ${
          block.ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {block.items.map((item, itemIndex) => (
          <li key={`${index}-${itemIndex}`} className="pl-1.5 marker:text-[#3B5147]">
            {renderInlineMarkdown(item, `list-${index}-${itemIndex}`)}
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "blockquote") {
    return (
      <blockquote className="mt-7 border-l-4 border-[#D7A92E] bg-[#F4F1E8] px-5 py-4 text-[1.05rem] leading-7 text-[#111814]/75">
        {renderInlineMarkdown(block.text, `quote-${index}`)}
      </blockquote>
    );
  }

  return <hr className="my-10 border-[#3B5147]/15" />;
}

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

  if (!categorySlug || !articleSlug) return <NotFound />;
  if (isPending) return <ResourceStatus message="Loading resource…" />;
  if (isError) {
    return (
      <ResourceStatus message="We could not load this resource right now. Please refresh the page and try again." />
    );
  }
  if (!resource) return <NotFound />;

  const blocks = parseResourceMarkdown(resource.body_markdown);
  const toc = blocks.filter(
    (block): block is Extract<MarkdownBlock, { type: "heading" }> =>
      block.type === "heading" && block.level === 2,
  );
  const hasToc = toc.length > 1;
  const readingMinutes = getReadingMinutes(blocks);
  const topicLabel = categoryLabel(category?.title, categorySlug);

  const related = (siblings ?? [])
    .filter(
      (candidate) =>
        candidate.resource_kind === "article" && candidate.slug !== resource.slug,
    )
    .slice(0, 3)
    .map((candidate) => ({
      name: candidate.title,
      body: candidate.summary,
      href: `/resources/${candidate.category_slug}/${candidate.slug}`,
    }));

  const path = `/resources/${categorySlug}/${resource.slug}`;
  const categoryPath = `/resources/${categorySlug}`;

  return (
    <Layout>
      <SEO
        title={`${resource.title} | ValorWell`}
        description={resource.summary}
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

      <article className="resource-article-page bg-[#F4F1E8] text-[#111814]">
        <header className="resource-article-hero border-b border-[#3B5147]/12 bg-[#F4F1E8]">
          <div className="container-wide py-10 md:py-14 lg:py-16">
            <nav
              aria-label="Breadcrumb"
              className="resource-print-hidden mb-7 flex flex-wrap items-center gap-2 text-sm text-[#111814]/55"
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

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
              Resource Guide
            </p>
            <h1 className="mt-4 max-w-5xl text-4xl font-bold leading-[1.06] tracking-[-0.035em] md:text-5xl lg:text-[3.65rem]">
              {resource.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
              {resource.summary}
            </p>

            <div className="resource-print-hidden mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-[#3B5147]">
              <Link
                to={categoryPath}
                className="underline decoration-[#3B5147]/25 underline-offset-4"
              >
                {topicLabel}
              </Link>
              <span className="inline-flex items-center gap-2 text-[#111814]/55">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {readingMinutes} min read
              </span>
            </div>
          </div>
        </header>

        <div className="resource-article-shell container-wide py-8 md:py-12 lg:py-14">
          {hasToc && (
            <details className="resource-print-hidden mb-6 rounded-2xl border border-[#3B5147]/15 bg-white p-5 shadow-sm lg:hidden">
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
                        {stripInlineMarkdown(item.text)}
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
              <aside className="resource-print-hidden hidden lg:block">
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
                            {stripInlineMarkdown(item.text)}
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
                <div className="resource-article-body max-w-[72ch]">
                  {blocks.map((block, index) => (
                    <ArticleBlock
                      key={
                        block.type === "heading"
                          ? `${block.id}-${index}`
                          : `${block.type}-${index}`
                      }
                      block={block}
                      index={index}
                    />
                  ))}
                </div>
              </div>

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
                    key={item.href}
                    to={item.href}
                    className="group flex min-h-52 flex-col justify-between rounded-2xl border border-[#3B5147]/15 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none"
                  >
                    <div>
                      <h3 className="text-lg font-bold leading-6 text-[#111814]">{item.name}</h3>
                      {item.body && (
                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#111814]/60">
                          {item.body}
                        </p>
                      )}
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

          <section className="resource-print-hidden mx-auto mt-10 max-w-[1050px] rounded-2xl bg-[#111814] px-6 py-7 text-white md:flex md:items-center md:justify-between md:gap-8 md:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
                Need care?
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Use the resource for orientation. Use care when you need care.
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
