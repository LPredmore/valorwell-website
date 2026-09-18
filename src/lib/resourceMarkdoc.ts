import Markdoc, {
  type Config,
  type Node as MarkdocNode,
  type RenderableTreeNode,
  type Schema,
} from "@markdoc/markdoc";

export type ResourceTocItem = {
  id: string;
  level: 2 | 3;
  text: string;
};

export type ResourceDocumentCompilation = {
  content: RenderableTreeNode | RenderableTreeNode[];
  toc: ResourceTocItem[];
  readingMinutes: number;
  errors: string[];
};

const INTERNAL_SECTION_HEADINGS = [
  "authoritative sources reviewed",
  "sources reviewed",
  "sources",
  "last reviewed",
  "last researched",
];

const INTERNAL_LINE_PREFIXES = [
  "last researched and verified:",
  "last researched:",
  "last reviewed:",
  "sources reviewed:",
  "authoritative sources reviewed:",
  "last updated:",
];

function normalizePlainText(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(value: string): string {
  const slug = normalizePlainText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "section";
}

function renderableText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(renderableText).join(" ");
  if (!value || typeof value !== "object") return "";

  const node = value as { children?: unknown[] };
  return Array.isArray(node.children) ? node.children.map(renderableText).join(" ") : "";
}

function isInternalHeading(text: string): boolean {
  const normalized = normalizePlainText(text).toLowerCase().replace(/[:.]+$/, "");
  return INTERNAL_SECTION_HEADINGS.some(
    (candidate) => normalized === candidate || normalized.startsWith(`${candidate} `),
  );
}

function isInternalLine(text: string): boolean {
  const normalized = text.trim().toLowerCase().replace(/^[*_\s]+/, "");
  return INTERNAL_LINE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

/**
 * Legacy resource rows sometimes carry research bookkeeping inside body_markdown.
 * Structured sources now live in website_resource_sources, so that bookkeeping
 * should never leak into the public document tree.
 */
export function prepareResourceBody(markdown: string): string {
  const output: string[] = [];
  let suppressedHeadingLevel: number | null = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const heading = line.trim().match(/^(#{1,6})\s+(.*)$/);

    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();

      if (isInternalHeading(text)) {
        suppressedHeadingLevel = level;
        continue;
      }

      if (suppressedHeadingLevel !== null) {
        if (level <= suppressedHeadingLevel) {
          suppressedHeadingLevel = null;
        } else {
          continue;
        }
      }
    }

    if (suppressedHeadingLevel !== null || isInternalLine(line)) continue;
    output.push(line);
  }

  return output.join("\n").trim();
}

function createHeadingSchema(counter: Map<string, number>): Schema {
  return {
    ...Markdoc.nodes.heading,
    transform(node, config) {
      const transform = Markdoc.nodes.heading.transform;
      if (!transform) return null;

      const rendered = transform(node, config);
      if (!(rendered instanceof Markdoc.Tag)) return rendered;

      const text = renderableText(rendered.children);
      const base = slugifyHeading(text);
      const count = (counter.get(base) ?? 0) + 1;
      counter.set(base, count);
      rendered.attributes.id = count === 1 ? base : `${base}-${count}`;

      return rendered;
    },
  };
}

const semanticTags: Config["tags"] = {
  answer: {
    render: "ResourceAnswer",
    attributes: {
      title: { type: String, default: "The direct answer" },
    },
  },
  takeaways: {
    render: "ResourceTakeaways",
    attributes: {
      title: { type: String, default: "Key takeaways" },
    },
  },
  steps: {
    render: "ResourceSteps",
    attributes: {
      title: { type: String, default: "What to do" },
    },
  },
  verify: {
    render: "ResourceVerify",
    attributes: {
      program: { type: String },
      title: { type: String, default: "Verify before you act" },
    },
  },
  warning: {
    render: "ResourceCallout",
    attributes: {
      title: { type: String, default: "Important" },
      tone: { type: String, default: "warning", matches: ["warning"] },
    },
  },
  note: {
    render: "ResourceCallout",
    attributes: {
      title: { type: String, default: "Note" },
      tone: { type: String, default: "note", matches: ["note"] },
    },
  },
  definition: {
    render: "ResourceDefinition",
    attributes: {
      term: { type: String },
    },
  },
};

function createConfig(schemaVersion: number): Config {
  const headingCounter = new Map<string, number>();

  return {
    nodes: {
      heading: createHeadingSchema(headingCounter),
      table: {
        ...Markdoc.nodes.table,
        render: "ResourceTable",
      },
    },
    tags: schemaVersion >= 2 ? semanticTags : {},
  };
}

function structuralErrors(ast: MarkdocNode): string[] {
  const errors: string[] = [];
  let previousHeadingLevel = 1;

  for (const node of ast.walk()) {
    if (node.type !== "heading") continue;

    const rawLevel = node.attributes.level;
    const level = typeof rawLevel === "number" ? rawLevel : Number(rawLevel);

    if (!Number.isFinite(level)) continue;

    if (level === 1) {
      errors.push("Article body must not contain an H1. The resource title is the page H1.");
      continue;
    }

    if (level > previousHeadingLevel + 1) {
      errors.push(
        `Heading hierarchy skips from H${previousHeadingLevel} to H${level}. Use sequential heading levels.`,
      );
    }

    previousHeadingLevel = level;
  }

  return errors;
}

function collectToc(value: unknown, items: ResourceTocItem[]) {
  if (Array.isArray(value)) {
    value.forEach((child) => collectToc(child, items));
    return;
  }

  if (!value || typeof value !== "object") return;

  const node = value as {
    name?: string;
    attributes?: Record<string, unknown>;
    children?: unknown[];
  };

  if ((node.name === "h2" || node.name === "h3") && typeof node.attributes?.id === "string") {
    const text = normalizePlainText(renderableText(node.children ?? []));
    if (text) {
      items.push({
        id: node.attributes.id,
        level: node.name === "h2" ? 2 : 3,
        text,
      });
    }
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => collectToc(child, items));
  }
}

function wordCountFromTree(value: unknown): number {
  const text = normalizePlainText(renderableText(value));
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export function compileResourceDocument(
  markdown: string,
  schemaVersion = 1,
): ResourceDocumentCompilation {
  const prepared = prepareResourceBody(markdown);
  const ast = Markdoc.parse(prepared);
  const config = createConfig(schemaVersion);

  const markdocErrors = Markdoc.validate(ast, config).map((item) => {
    const error = item.error?.message ?? "Invalid resource content.";
    const line =
      Array.isArray(item.lines) && typeof item.lines[0] === "number"
        ? ` (line ${item.lines[0] + 1})`
        : "";
    return `${error}${line}`;
  });

  const content = Markdoc.transform(ast, config);
  const toc: ResourceTocItem[] = [];
  collectToc(content, toc);

  return {
    content,
    toc,
    readingMinutes: Math.max(1, Math.ceil(wordCountFromTree(content) / 225)),
    errors: [...structuralErrors(ast), ...markdocErrors],
  };
}

export function validateResourceBody(markdown: string, schemaVersion = 1): string[] {
  return compileResourceDocument(markdown, schemaVersion).errors;
}
