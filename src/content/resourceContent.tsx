import * as React from "react";
import Markdoc, { type Config } from "@markdoc/markdoc";

export type ResourceTocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type ResourceContentDiagnostic = {
  level: "error" | "warning";
  message: string;
};

const INTERNAL_HEADINGS = new Set([
  "authoritative sources reviewed",
  "sources reviewed",
  "sources",
  "last reviewed",
  "last researched",
]);

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\{%.+?%\}/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function slugifyResourceHeading(value: string): string {
  return stripInlineMarkdown(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

function normalizeHeading(value: string): string {
  return stripInlineMarkdown(value).toLowerCase().replace(/[:.]+$/, "");
}

export function preparePublicResourceMarkup(markdown: string): string {
  const output: string[] = [];
  let suppressedLevel: number | null = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const heading = line.trim().match(/^(#{1,6})\s+(.*)$/);

    if (heading) {
      const level = heading[1].length;
      const normalized = normalizeHeading(heading[2]);

      if (INTERNAL_HEADINGS.has(normalized)) {
        suppressedLevel = level;
        continue;
      }

      if (suppressedLevel !== null && level <= suppressedLevel) {
        suppressedLevel = null;
      }
    }

    if (suppressedLevel !== null) continue;

    const normalizedLine = line
      .trim()
      .replace(/^[*_\s]+/, "")
      .toLowerCase();

    if (
      normalizedLine.startsWith("last researched and verified:") ||
      normalizedLine.startsWith("last researched:") ||
      normalizedLine.startsWith("last reviewed:") ||
      normalizedLine.startsWith("sources reviewed:") ||
      normalizedLine.startsWith("authoritative sources reviewed:") ||
      normalizedLine.startsWith("last updated:")
    ) {
      continue;
    }

    output.push(line);
  }

  return output.join("\n").trim();
}

function nodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return nodeText(node.props.children);
  }
  return "";
}

function ResourceHeading({
  level,
  children,
}: {
  level: number;
  children?: React.ReactNode;
}) {
  const text = nodeText(children);
  const id = slugifyResourceHeading(text);
  const shared = "resource-article-heading scroll-mt-28 text-[#111814]";

  if (level === 2) {
    return (
      <h2
        id={id}
        className={`${shared} mt-16 border-t border-[#3B5147]/12 pt-10 text-[1.85rem] font-bold leading-[1.16] md:text-[2.1rem]`}
      >
        {children}
      </h2>
    );
  }

  if (level === 3) {
    return (
      <h3 id={id} className={`${shared} mt-10 text-[1.45rem] font-bold leading-[1.24] md:text-[1.6rem]`}>
        {children}
      </h3>
    );
  }

  const HeadingTag = level === 4 ? "h4" : level === 5 ? "h5" : "h6";
  return (
    <HeadingTag id={id} className={`${shared} mt-8 text-xl font-bold leading-[1.3]`}>
      {children}
    </HeadingTag>
  );
}

function ResourceAnswer({ children }: { children?: React.ReactNode }) {
  return (
    <section className="resource-content-block resource-answer my-8 rounded-2xl border border-[#3B5147]/18 bg-[#EDF1EC] px-6 py-6 md:px-7">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
        Direct answer
      </p>
      <div className="resource-richtext resource-richtext-compact">{children}</div>
    </section>
  );
}

function ResourceTakeaways({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="resource-content-block my-9 rounded-2xl border border-[#D7A92E]/35 bg-[#FBF7EA] px-6 py-6 md:px-7">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#7A5A00]">
        Key takeaways
      </p>
      <div className="resource-richtext resource-richtext-compact">{children}</div>
    </aside>
  );
}

function ResourceVerify({
  program,
  children,
}: {
  program?: string;
  children?: React.ReactNode;
}) {
  return (
    <aside className="resource-content-block my-9 border-l-4 border-[#3B5147] bg-[#F4F1E8] px-5 py-5 md:px-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
        {program ? `Verify with ${program}` : "Verify current information"}
      </p>
      <div className="resource-richtext resource-richtext-compact">{children}</div>
    </aside>
  );
}

function ResourceCallout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "tip";
  title?: string;
  children?: React.ReactNode;
}) {
  const styles =
    type === "warning"
      ? "border-[#B24A3A]/30 bg-[#FCF1EE]"
      : type === "tip"
        ? "border-[#D7A92E]/35 bg-[#FBF7EA]"
        : "border-[#3B5147]/18 bg-[#F4F1E8]";

  return (
    <aside className={`resource-content-block my-9 rounded-2xl border px-6 py-5 ${styles}`}>
      {title && <h4 className="mb-2 text-lg font-bold text-[#111814]">{title}</h4>}
      <div className="resource-richtext resource-richtext-compact">{children}</div>
    </aside>
  );
}

function ResourceSteps({ children }: { children?: React.ReactNode }) {
  return (
    <section className="resource-content-block resource-steps my-9 rounded-2xl border border-[#3B5147]/15 bg-white px-6 py-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
        Step by step
      </p>
      <div className="resource-richtext resource-richtext-compact">{children}</div>
    </section>
  );
}

const markdocConfig: Config = {
  tags: {
    answer: {
      render: "ResourceAnswer",
    },
    "key-takeaways": {
      render: "ResourceTakeaways",
    },
    verify: {
      render: "ResourceVerify",
      attributes: {
        program: { type: String },
      },
    },
    callout: {
      render: "ResourceCallout",
      attributes: {
        type: {
          type: String,
          matches: ["info", "warning", "tip"],
          default: "info",
        },
        title: { type: String },
      },
    },
    steps: {
      render: "ResourceSteps",
    },
  },
  nodes: {
    heading: {
      render: "ResourceHeading",
      attributes: {
        level: { type: Number, required: true },
      },
    },
  },
};

const components = {
  ResourceHeading,
  ResourceAnswer,
  ResourceTakeaways,
  ResourceVerify,
  ResourceCallout,
  ResourceSteps,
};

function collectToc(markup: string): ResourceTocItem[] {
  return markup
    .split(/\r?\n/)
    .flatMap((line): ResourceTocItem[] => {
      const match = line.trim().match(/^(##|###)\s+(.*)$/);
      if (!match) return [];
      const level = match[1].length as 2 | 3;
      const text = stripInlineMarkdown(match[2]);
      return [{ id: slugifyResourceHeading(text), text, level }];
    });
}

function countWords(markup: string): number {
  const plain = markup
    .replace(/\{%[\s\S]*?%\}/g, " ")
    .replaceAll("[", " ")
    .replaceAll("]", " ")
    .replaceAll("/", " ")\n    .replace(/[#>*_~`(){}|+-]/g, " ")
    .replace(/https?:\/\/\S+/g, " ");
  return plain.split(/\s+/).filter(Boolean).length;
}

export function validateResourceMarkup(markdown: string): ResourceContentDiagnostic[] {
  const markup = preparePublicResourceMarkup(markdown);
  const diagnostics: ResourceContentDiagnostic[] = [];

  if (/^#\s+/m.test(markup)) {
    diagnostics.push({
      level: "error",
      message: "Article body must not contain an H1; the page title is the H1.",
    });
  }

  if (/<[a-z][\s\S]*?>/i.test(markup)) {
    diagnostics.push({
      level: "error",
      message: "Raw HTML is not allowed in resource content.",
    });
  }

  const toc = collectToc(markup);
  const seen = new Set<string>();
  for (const item of toc) {
    if (seen.has(item.id)) {
      diagnostics.push({
        level: "error",
        message: `Duplicate section heading slug: ${item.id}`,
      });
    }
    seen.add(item.id);
  }

  let previousLevel = 1;
  for (const line of markup.split(/\r?\n/)) {
    const match = line.match(/^(#{2,6})\s+/);
    if (!match) continue;
    const level = match[1].length;
    if (level > previousLevel + 1) {
      diagnostics.push({
        level: "error",
        message: `Heading level jumps from H${previousLevel} to H${level}.`,
      });
    }
    previousLevel = level;
  }

  try {
    const ast = Markdoc.parse(markup);
    for (const issue of Markdoc.validate(ast, markdocConfig)) {
      diagnostics.push({
        level: issue.error?.level === "critical" ? "error" : "warning",
        message: issue.error?.message ?? "Invalid Markdoc content.",
      });
    }
  } catch (error) {
    diagnostics.push({
      level: "error",
      message: error instanceof Error ? error.message : "Markdoc parsing failed.",
    });
  }

  return diagnostics;
}

export function compileResourceMarkup(markdown: string) {
  const markup = preparePublicResourceMarkup(markdown);
  const diagnostics = validateResourceMarkup(markup);
  const ast = Markdoc.parse(markup);
  const content = Markdoc.transform(ast, markdocConfig);

  return {
    rendered: Markdoc.renderers.react(content, React, { components }),
    toc: collectToc(markup),
    readingMinutes: Math.max(1, Math.ceil(countWords(markup) / 225)),
    diagnostics,
    publicMarkup: markup,
  };
}
