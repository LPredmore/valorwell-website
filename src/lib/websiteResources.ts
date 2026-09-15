import {
  generatedWebsiteResources,
  type GeneratedWebsiteResource,
} from "@/generated/websiteResources";

export type WebsiteResourceFaq = {
  question: string;
  answer: string;
};

export type WebsiteResource = Omit<GeneratedWebsiteResource, "faq"> & {
  faq: WebsiteResourceFaq[];
};

function normalizeFaq(value: unknown[]): WebsiteResourceFaq[] {
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    if (
      typeof candidate.question !== "string" ||
      !candidate.question.trim() ||
      typeof candidate.answer !== "string" ||
      !candidate.answer.trim()
    ) {
      return [];
    }

    return [
      {
        question: candidate.question.trim(),
        answer: candidate.answer.trim(),
      },
    ];
  });
}

const resources: WebsiteResource[] = generatedWebsiteResources.map((resource) => ({
  ...resource,
  faq: normalizeFaq(resource.faq),
}));

export function getPublishedResources(): WebsiteResource[] {
  return resources;
}

export function getPublishedResourceBySlug(slug: string): WebsiteResource | undefined {
  return resources.find((resource) => resource.slug === slug);
}

export function getPublishedResourceByPath(path: string): WebsiteResource | undefined {
  const match = path.match(/^\/resources\/([^/]+)$/);
  return match ? getPublishedResourceBySlug(match[1]) : undefined;
}
