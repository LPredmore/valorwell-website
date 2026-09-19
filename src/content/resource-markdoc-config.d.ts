import type { RenderableTreeNode } from "@markdoc/markdoc";

export type ResourceTocItem = {
  level: number;
  id: string;
  text: string;
};

export type ResourceContentIssue = {
  level: string;
  id: string;
  message: string;
  lines?: number[];
};

export type CompiledResourceMarkdoc = {
  source: string;
  ast: unknown;
  content: RenderableTreeNode;
  toc: ResourceTocItem[];
  readingMinutes: number;
  issues: ResourceContentIssue[];
};

export const resourceMarkdocConfig: Record<string, unknown>;
export function slugifyResourceHeading(value: string): string;
export function normalizeResourceMarkdown(markdown: string): string;
export function stripInternalResourceMetadata(markdown: string): string;
export function compileResourceMarkdoc(
  markdown: string,
  options?: { schemaVersion?: number },
): CompiledResourceMarkdoc;
export function validateResourceMarkdoc(
  markdown: string,
  options?: { schemaVersion?: number },
): ResourceContentIssue[];
