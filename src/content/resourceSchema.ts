import { z } from "zod";

export const resourceFaqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

export const websiteResourceKindSchema = z.enum(["category", "article"]);
export const websiteResourceStatusSchema = z.literal("published");
export const websiteResourceArticleTypeSchema = z.enum([
  "guide",
  "explainer",
  "checklist",
  "reference",
]);
export const websiteResourceContentFormatSchema = z.enum(["markdoc"]);

export const publicWebsiteResourceSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  primary_question: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  body_markdown: z.string().min(1),
  faq: z.array(resourceFaqSchema).default([]),
  audience_tags: z.array(z.string().trim().min(1)).default([]),
  topic_aliases: z.array(z.string().trim().min(1)).default([]),
  status: websiteResourceStatusSchema,
  live_url: z.string().url().nullable().default(null),
  published_at: z.string().nullable().default(null),
  resource_kind: websiteResourceKindSchema,
  category_slug: z.string().trim().min(1).nullable().default(null),
  seo_title: z.string().trim().min(1).nullable().default(null),
  seo_description: z.string().trim().min(1).nullable().default(null),
  sort_order: z.number().int().default(100),
  is_featured: z.boolean().default(false),
  article_type: websiteResourceArticleTypeSchema.default("guide"),
  content_format: websiteResourceContentFormatSchema.default("markdoc"),
  public_updated_at: z.string().nullable().default(null),
});

export const websiteResourceSourceSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  citation_key: z.string().trim().min(1),
  organization: z.string().trim().min(1),
  title: z.string().trim().min(1),
  url: z.string().url(),
  source_type: z.enum([
    "official",
    "statute",
    "regulation",
    "clinical",
    "research",
    "reference",
  ]),
  published_on: z.string().nullable().default(null),
  verified_on: z.string().nullable().default(null),
  display_order: z.number().int().default(100),
});

export const websiteResourceRelationSchema = z.object({
  source_resource_id: z.string().uuid(),
  target_resource_id: z.string().uuid(),
  relation_type: z.enum(["related", "start_here", "next"]),
  display_order: z.number().int().default(100),
});

export type WebsiteResource = z.infer<typeof publicWebsiteResourceSchema>;
export type WebsiteResourceFaq = z.infer<typeof resourceFaqSchema>;
export type WebsiteResourceSource = z.infer<typeof websiteResourceSourceSchema>;
export type WebsiteResourceRelation = z.infer<typeof websiteResourceRelationSchema>;
export type WebsiteResourceKind = z.infer<typeof websiteResourceKindSchema>;
