import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import {
  AuthorityPage,
  type AuthoritySection,
} from "@/components/authority/AuthorityPage";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/NotFound";
import {
  usePublishedResource,
  usePublishedResources,
} from "@/lib/websiteResources";

type ResourceDetailProps = {
  slug?: string;
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

export default function ResourceDetail({ slug: slugProp }: ResourceDetailProps) {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params.slug;

  const { data: resource, isPending, isError } = usePublishedResource(slug);
  const { data: allResources } = usePublishedResources();

  if (!slug) return <NotFound />;
  if (isPending) return <ResourceStatus message="Loading resource…" />;
  if (isError) {
    return (
      <ResourceStatus message="We could not load this resource right now. Please refresh the page and try again." />
    );
  }
  if (!resource) return <NotFound />;

  const related = (allResources ?? [])
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
