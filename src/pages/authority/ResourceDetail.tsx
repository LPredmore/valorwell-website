import type { ReactNode } from "react";
import {
  AuthorityPage,
  type AuthoritySection,
} from "@/components/authority/AuthorityPage";
import NotFound from "@/pages/NotFound";
import {
  getPublishedResourceBySlug,
  getPublishedResources,
} from "@/lib/websiteResources";

type ResourceDetailProps = {
  slug: string;
};

type ParsedSection = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
};

function parseResourceMarkdown(markdown: string): AuthoritySection[] {
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  const pushCurrent = () => {
    if (!current) return;
    if (current.heading || current.paragraphs.length > 0 || current.bullets.length > 0) {
      sections.push(current);
    }
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      pushCurrent();
      current = {
        heading: line.slice(3).trim(),
        paragraphs: [],
        bullets: [],
      };
      continue;
    }

    if (!current) {
      current = {
        heading: "Overview",
        paragraphs: [],
        bullets: [],
      };
    }

    if (line.startsWith("- ")) {
      current.bullets.push(line.slice(2).trim());
    } else {
      current.paragraphs.push(line);
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

function formatReviewedDate(value: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function sourceName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function buildSourceNote(urls: string[]): ReactNode | undefined {
  if (urls.length === 0) return undefined;

  return (
    <>
      Sources reviewed:{" "}
      {urls.map((url, index) => (
        <span key={url}>
          {index > 0 && ", "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2"
          >
            {sourceName(url)}
          </a>
        </span>
      ))}
      . Confirm time-sensitive eligibility, authorization, coverage, and administrative details with the responsible program or provider.
    </>
  );
}

export default function ResourceDetail({ slug }: ResourceDetailProps) {
  const resource = getPublishedResourceBySlug(slug);
  if (!resource) return <NotFound />;

  const related = getPublishedResources()
    .filter((candidate) => candidate.slug !== resource.slug)
    .slice(0, 3)
    .map((candidate) => ({
      name: candidate.title,
      href: `/resources/${candidate.slug}`,
      body: candidate.summary,
    }));

  return (
    <AuthorityPage
      title={`${resource.title} | ValorWell`}
      description={resource.summary}
      canonical={`/resources/${resource.slug}`}
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Resources", url: "/resources" },
        { name: resource.title, url: `/resources/${resource.slug}` },
      ]}
      eyebrow="Resource Guide"
      h1={resource.title}
      subhead={resource.summary}
      lastReviewed={formatReviewedDate(resource.last_researched_at)}
      sourceNote={buildSourceNote(resource.source_urls)}
      sections={parseResourceMarkdown(resource.body_markdown)}
      faqs={resource.faq}
      related={related}
      finalCTAs={[
        { label: "Find Care", to: "/get-care" },
        { label: "Explore All Resources", to: "/resources", variant: "secondary" },
      ]}
    />
  );
}
