import { useParams } from "react-router-dom";
import {
  AuthorityPage,
  type AuthoritySection,
} from "@/components/authority/AuthorityPage";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/NotFound";
import {
  usePublishedArticle,
  usePublishedCategoryArticles,
} from "@/lib/websiteResources";

type ResourceDetailProps = {
  categorySlug?: string;
  articleSlug?: string;
};

type ParsedSection = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
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

function isSuppressedHeading(heading: string): boolean {
  const normalized = heading.trim().toLowerCase().replace(/[:.]+$/, "");
  return SUPPRESSED_HEADINGS.some(
    (candidate) => normalized === candidate || normalized.startsWith(`${candidate} `),
  );
}

function isSuppressedLine(line: string): boolean {
  const normalized = line.trim().toLowerCase().replace(/^[*_\s]+/, "");
  return SUPPRESSED_LINE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .trim();
}

function parseResourceMarkdown(markdown: string): AuthoritySection[] {
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  let suppressing = false;

  const pushCurrent = () => {
    if (!current) return;
    if (current.heading || current.paragraphs.length > 0 || current.bullets.length > 0) {
      sections.push(current);
    }
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const heading = stripInlineMarkdown(headingMatch[2]);

      if (isSuppressedHeading(heading)) {
        pushCurrent();
        current = null;
        suppressing = true;
        continue;
      }

      suppressing = false;
      pushCurrent();
      current = { heading, paragraphs: [], bullets: [] };
      continue;
    }

    if (suppressing) continue;
    if (isSuppressedLine(line)) continue;

    if (!current) {
      current = { heading: "Overview", paragraphs: [], bullets: [] };
    }

    if (/^[-*]\s+/.test(line)) {
      current.bullets.push(stripInlineMarkdown(line.replace(/^[-*]\s+/, "")));
    } else {
      current.paragraphs.push(stripInlineMarkdown(line));
    }
  }

  pushCurrent();

  return sections.map((section) => ({
    heading: section.heading || "Overview",
    body:
      section.paragraphs.length > 0 ? (
        <div className="space-y-4">
          {section.paragraphs.map((paragraph, index) => (
            <p key={`${section.heading}-${index}`}>{paragraph}</p>
          ))}
        </div>
      ) : undefined,
    bullets: section.bullets.length > 0 ? section.bullets : undefined,
  }));
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
  const { data: siblings } = usePublishedCategoryArticles(categorySlug);

  if (!categorySlug || !articleSlug) return <NotFound />;
  if (isPending) return <ResourceStatus message="Loading resource…" />;
  if (isError) {
    return (
      <ResourceStatus message="We could not load this resource right now. Please refresh the page and try again." />
    );
  }
  if (!resource) return <NotFound />;

  const related = (siblings ?? [])
    .filter(
      (candidate) =>
        candidate.resource_kind === "article" && candidate.slug !== resource.slug,
    )
    .slice(0, 3)
    .map((candidate) => ({
      name: candidate.title,
      href: `/resources/${candidate.category_slug}/${candidate.slug}`,
    }));

  const path = `/resources/${categorySlug}/${resource.slug}`;

  return (
    <AuthorityPage
      title={`${resource.title} | ValorWell`}
      description={resource.summary}
      canonical={path}
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Resources", url: "/resources" },
        { name: resource.title, url: path },
      ]}
      eyebrow="Resource Guide"
      h1={resource.title}
      subhead={resource.summary}
      sections={parseResourceMarkdown(resource.body_markdown)}
      faqs={resource.faq}
      related={related}
      finalCTAs={[
        { label: "Find Care", to: "/get-care" },
        {
          label: "Back to This Topic",
          to: `/resources/${categorySlug}`,
          variant: "secondary",
        },
      ]}
    />
  );
}
