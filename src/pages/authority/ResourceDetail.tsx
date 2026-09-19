import { useMemo } from "react";
import { ArrowRight, Clock } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useParams } from "react-router-dom";
import { BreadcrumbSchema, FAQSchema, SEO } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
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

type TocItem = {
  id: string;
  label: string;
};

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

function plainText(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~>#]/g, "")
    .trim();
}

function normalizedHeading(value: string): string {
  return plainText(value).toLowerCase().replace(/[:.]+$/, "").trim();
}

function isSuppressedHeading(heading: string): boolean {
  const normalized = normalizedHeading(heading);
  return SUPPRESSED_HEADINGS.some(
    (candidate) => normalized === candidate || normalized.startsWith(`${candidate} `),
  );
}

function isSuppressedLine(line: string): boolean {
  const normalized = line.trim().toLowerCase().replace(/^[*_\s]+/, "");
  return SUPPRESSED_LINE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function sanitizeResourceMarkdown(markdown: string): string {
  const retained: string[] = [];
  let suppressing = false;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const headingMatch = rawLine.trim().match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      if (isSuppressedHeading(headingMatch[2])) {
        suppressing = true;
        continue;
      }

      suppressing = false;
      retained.push(rawLine);
      continue;
    }

    if (suppressing || isSuppressedLine(rawLine)) continue;
    retained.push(rawLine);
  }

  return retained.join("\n").trim();
}

function slugifyHeading(value: string): string {
  return plainText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "section";
}

function buildToc(markdown: string): TocItem[] {
  const occurrences = new Map<string, number>();

  return markdown.split(/\r?\n/).flatMap((line) => {
    const match = line.trim().match(/^##\s+(.*)$/);
    if (!match) return [];

    const label = plainText(match[1]);
    const base = slugifyHeading(label);
    const count = occurrences.get(base) ?? 0;
    occurrences.set(base, count + 1);

    return [{ id: count === 0 ? base : `${base}-${count + 1}`, label }];
  });
}

function calculateReadingTime(markdown: string): number {
  const words = plainText(markdown).match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
  return Math.max(1, Math.ceil(words.length / 225));
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function ResourceStatus({ message }: { message: string }) {
  return (
    <Layout>
      <div className="bg-background text-foreground">
        <div className="container-narrow py-24 md:py-32">
          <p className="text-lg text-muted-foreground" role="status" aria-live="polite">
            {message}
          </p>
        </div>
      </div>
    </Layout>
  );
}

function TableOfContents({ items, mobile = false }: { items: TocItem[]; mobile?: boolean }) {
  if (items.length === 0) return null;

  const links = (
    <ol className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="block rounded-sm border-l-2 border-transparent py-1.5 pl-3 text-sm leading-5 text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:border-primary focus-visible:text-foreground"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );

  if (mobile) {
    return (
      <div className="resource-article-toc-mobile mb-6 lg:hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="contents" className="rounded-md border bg-card px-4">
            <AccordionTrigger className="min-h-11 py-3 text-left font-bold text-foreground hover:no-underline">
              On this page
            </AccordionTrigger>
            <AccordionContent className="border-t pt-3">{links}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return (
    <aside className="resource-article-toc hidden lg:block" aria-label="On this page">
      <div className="sticky top-24 border-l border-border pl-5">
        <h2 className="mb-3 text-sm font-bold uppercase text-foreground">On this page</h2>
        {links}
      </div>
    </aside>
  );
}

function ResourceMarkdown({ markdown, toc }: { markdown: string; toc: TocItem[] }) {
  const headingIds = new Map<string, string[]>();
  toc.forEach((item) => {
    const key = normalizedHeading(item.label);
    headingIds.set(key, [...(headingIds.get(key) ?? []), item.id]);
  });

  const components: Components = {
    h1: ({ children }) => <h2>{children}</h2>,
    h2: ({ children }) => {
      const key = normalizedHeading(String(children));
      const ids = headingIds.get(key) ?? [];
      const id = ids.shift() ?? slugifyHeading(String(children));
      headingIds.set(key, ids);
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    h5: ({ children }) => <h5>{children}</h5>,
    h6: ({ children }) => <h6>{children}</h6>,
    a: ({ href, children }) => {
      const external = Boolean(href?.startsWith("http"));
      return (
        <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {children}
        </a>
      );
    },
  };

  return (
    <div className="resource-article-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export default function ResourceDetail({
  categorySlug: categorySlugProp,
  articleSlug: articleSlugProp,
}: ResourceDetailProps) {
  const params = useParams<{ categorySlug: string; articleSlug: string }>();
  const categorySlug = categorySlugProp ?? params.categorySlug;
  const articleSlug = articleSlugProp ?? params.articleSlug;

  const { data: resource, isPending, isError } = usePublishedArticle(categorySlug, articleSlug);
  const { data: category } = usePublishedCategory(categorySlug);
  const { data: siblings } = usePublishedCategoryArticles(categorySlug);

  const markdown = useMemo(
    () => sanitizeResourceMarkdown(resource?.body_markdown ?? ""),
    [resource?.body_markdown],
  );
  const toc = useMemo(() => buildToc(markdown), [markdown]);
  const readingTime = useMemo(() => calculateReadingTime(markdown), [markdown]);

  if (!categorySlug || !articleSlug) return <NotFound />;
  if (isPending) return <ResourceStatus message="Loading resource…" />;
  if (isError) {
    return (
      <ResourceStatus message="We could not load this resource right now. Please refresh the page and try again." />
    );
  }
  if (!resource) return <NotFound />;

  const categoryName = category?.title ?? titleFromSlug(categorySlug);
  const related = (siblings ?? [])
    .filter(
      (candidate) =>
        candidate.resource_kind === "article" && candidate.slug !== resource.slug,
    )
    .slice(0, 3);
  const path = `/resources/${categorySlug}/${resource.slug}`;

  return (
    <Layout>
      <SEO title={`${resource.title} | ValorWell`} description={resource.summary} canonical={path} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
          { name: categoryName, url: `/resources/${categorySlug}` },
          { name: resource.title, url: path },
        ]}
      />
      {resource.faq.length > 0 ? <FAQSchema faqs={resource.faq} /> : null}

      <div className="resource-article-page bg-background text-foreground">
        <header className="resource-article-hero border-b border-border bg-background">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
            <nav className="resource-article-breadcrumb mb-6" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <li><Link className="hover:text-foreground" to="/resources">Resources</Link></li>
                <li aria-hidden>/</li>
                <li><Link className="hover:text-foreground" to={`/resources/${categorySlug}`}>{categoryName}</Link></li>
                <li aria-hidden>/</li>
                <li className="max-w-full text-foreground" aria-current="page">{resource.title}</li>
              </ol>
            </nav>

            <p className="mb-4 text-xs font-bold uppercase text-primary">Resource Guide</p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              {resource.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              {resource.summary}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <Link className="font-bold text-primary hover:underline" to={`/resources/${categorySlug}`}>
                {categoryName}
              </Link>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden />
                {readingTime} min read
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <TableOfContents items={toc} mobile />
          <div className="grid min-w-0 gap-8 lg:grid-cols-[260px_minmax(0,760px)] lg:justify-center lg:gap-12">
            <TableOfContents items={toc} />
            <article className="resource-article-surface min-w-0 rounded-md border border-border bg-card px-5 py-8 shadow-sm sm:px-8 md:px-12 md:py-12">
              <ResourceMarkdown markdown={markdown} toc={toc} />

              {resource.faq.length > 0 ? (
                <section className="resource-article-faq mt-14 border-t border-border pt-10" aria-labelledby="resource-faq-heading">
                  <h2 id="resource-faq-heading" className="text-3xl font-bold text-foreground">Frequently asked questions</h2>
                  <Accordion type="single" collapsible className="mt-5">
                    {resource.faq.map((faq, index) => (
                      <AccordionItem key={faq.question} value={`faq-${index}`}>
                        <AccordionTrigger className="min-h-11 text-left text-base font-bold text-foreground hover:text-primary hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="whitespace-pre-line pb-5 text-base leading-7 text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ) : null}
            </article>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="resource-article-related border-t border-border bg-secondary/40 py-10" aria-labelledby="related-resources-heading">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 id="related-resources-heading" className="text-2xl font-bold text-foreground">Continue reading</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {related.map((candidate) => (
                  <Link
                    key={candidate.slug}
                    to={`/resources/${candidate.category_slug}/${candidate.slug}`}
                    className="group flex min-h-28 items-start justify-between gap-4 rounded-md border border-border bg-card p-5 text-foreground shadow-sm transition hover:border-primary focus-visible:border-primary"
                  >
                    <span className="font-bold leading-6 group-hover:text-primary">{candidate.title}</span>
                    <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="resource-article-cta border-t border-border bg-primary py-8 text-primary-foreground">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <h2 className="text-2xl font-bold">Need care?</h2>
              <p className="mt-1 text-sm text-primary-foreground/80">Find the care path that fits your situation.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/get-care">Find Care</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to={`/resources/${categorySlug}`}>Back to This Topic</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}