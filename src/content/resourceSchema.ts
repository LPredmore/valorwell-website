import { z } from "zod";

export const resourceFaqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

export const websiteResourceKindSchema = z.enum(["category", "article"]);
export const websiteResourceStatusSchema = z.literal("published");
export const websiteResourceEditorialTypeSchema = z.enum([
  "category",
  "guide",
  "explainer",
  "checklist",
  "reference",
]);

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
  content_schema_version: z.number().int().min(1).max(10).default(1),
  editorial_type: websiteResourceEditorialTypeSchema.default("guide"),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(100),
  seo_title: z.string().trim().min(1).nullable().default(null),
  seo_description: z.string().trim().min(1).nullable().default(null),
  public_updated_at: z.string().nullable().default(null),
});

export const websiteResourceSourceSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  citation_key: z.string().trim().min(1),
  organization: z.string().trim().min(1).nullable().default(null),
  title: z.string().trim().min(1).nullable().default(null),
  url: z.string().url(),
  source_type: z.enum([
    "official",
    "statute",
    "regulation",
    "policy",
    "clinical",
    "research",
    "other",
  ]),
  source_published_at: z.string().nullable().default(null),
  verified_at: z.string().nullable().default(null),
  is_public: z.boolean().default(true),
  display_order: z.number().int().default(100),
});

export const websiteResourceRelationSchema = z.object({
  resource_id: z.string().uuid(),
  related_resource_id: z.string().uuid(),
  relation_type: z.enum(["related", "start_here", "next", "previous"]),
  display_order: z.number().int().default(100),
});

export type WebsiteResource = z.infer<typeof publicWebsiteResourceSchema>;
export type WebsiteResourceFaq = z.infer<typeof resourceFaqSchema>;
export type WebsiteResourceSource = z.infer<typeof websiteResourceSourceSchema>;
export type WebsiteResourceRelation = z.infer<typeof websiteResourceRelationSchema>;
export type WebsiteResourceKind = z.infer<typeof websiteResourceKindSchema>;
