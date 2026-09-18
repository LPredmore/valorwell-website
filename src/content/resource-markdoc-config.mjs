import Markdoc, { Tag, nodes } from "@markdoc/markdoc";

const INTERNAL_HEADINGS = new Set([
  "authoritative sources reviewed",
  "sources reviewed",
  "sources",
  "last reviewed",
  "last researched",
]);

const INTERNAL_LINE_PREFIXES = [
  "last researched and verified:",
  "last researched:",
  "last reviewed:",
  "sources reviewed:",
  "authoritative sources reviewed:",
  "last updated:",
];

function textFromNode(node) {
  let value = "";
  for (const child of node.walk()) {
    if (child.type === "text" && typeof child.attributes?.content === "string") {
      value += child.attributes.content;
    }
  }
  return value.trim();
}

export function slugifyResourceHeading(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

function normalizeInternalHeading(value) {
  return String(value)
    .toLowerCase()
    .replace(/[*_`]/g, "")
    .replace(/[:.]+$/, "")
    .trim();
}

export function stripInternalResourceMetadata(markdown) {
  const output = [];
  let suppressedLevel = null;

  for (const rawLine of String(markdown ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,6})\s+(.*)$/);

    if (heading) {
      const level = heading[1].length;
      const normalized = normalizeInternalHeading(heading[2]);

      if (INTERNAL_HEADINGS.has(normalized)) {
        suppressedLevel = level;
        continue;
      }

      if (suppressedLevel !== null) {
        if (level <= suppressedLevel) {
          suppressedLevel = null;
        } else {
          continue;
        }
      }
    }

    if (suppressedLevel !== null) continue;

    const normalizedLine = line
      .toLowerCase()
      .replace(/^[*_\s]+/, "");

    if (INTERNAL_LINE_PREFIXES.some((prefix) => normalizedLine.startsWith(prefix))) {
      continue;
    }

    output.push(rawLine);
  }

  return output.join("\n").trim();
}

function assignHeadingIds(ast) {
  const counts = new Map();

  for (const node of ast.walk()) {
    if (node.type !== "heading") continue;

    const text = textFromNode(node);
    const base = slugifyResourceHeading(node.attributes?.id || text);
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);

    node.attributes = {
      ...node.attributes,
      id: count === 1 ? base : `${base}-${count}`,
    };
  }

  return ast;
}

const heading = {
  ...nodes.heading,
  attributes: {
    ...nodes.heading.attributes,
    id: { type: String },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    return new Tag(
      "ResourceHeading",
      {
        id: attributes.id,
        level: node.attributes.level,
      },
      children,
    );
  },
};

const richChildren = [
  "paragraph",
  "heading",
  "list",
  "blockquote",
  "table",
  "fence",
  "tag",
];

export const resourceMarkdocConfig = {
  nodes: {
    heading,
    document: {
      ...nodes.document,
      render: "",
    },
  },
  tags: {
    answer: {
      render: "ResourceAnswer",
      children: richChildren,
      attributes: {
        title: { type: String, default: "The direct answer" },
      },
    },
    "key-takeaways": {
      render: "ResourceKeyTakeaways",
      children: richChildren,
      attributes: {
        title: { type: String, default: "Key takeaways" },
      },
    },
    callout: {
      render: "ResourceCallout",
      children: richChildren,
      attributes: {
        tone: {
          type: String,
          default: "note",
          matches: ["note", "warning", "verify", "tip"],
          errorLevel: "critical",
        },
        title: { type: String },
      },
    },
    steps: {
      render: "ResourceSteps",
      children: richChildren,
      attributes: {
        title: { type: String, default: "What to do" },
      },
    },
    cite: {
      render: "ResourceCitation",
      selfClosing: true,
      attributes: {
        source: { type: String, required: true },
      },
    },
  },
};

function collectHeadings(ast) {
  const headings = [];

  for (const node of ast.walk()) {
    if (node.type !== "heading") continue;
    const level = Number(node.attributes?.level ?? 0);
    if (level < 2 || level > 3) continue;

    headings.push({
      level,
      id: String(node.attributes?.id ?? ""),
      text: textFromNode(node),
    });
  }

  return headings;
}

function countWords(ast) {
  let text = "";
  for (const node of ast.walk()) {
    if (node.type === "text" && typeof node.attributes?.content === "string") {
      text += ` ${node.attributes.content}`;
    }
  }

  return text.trim().split(/\s+/).filter(Boolean).length;
}

function structuralIssues(ast, schemaVersion) {
  const issues = [];
  let previousHeading = null;
  let h2Count = 0;

  for (const node of ast.walk()) {
    if (node.type !== "heading") continue;
    const level = Number(node.attributes?.level ?? 0);
    const text = textFromNode(node);

    if (level === 1) {
      issues.push({
        level: "critical",
        id: "resource-body-h1",
        message: `Resource body must not contain an H1 heading ("${text}"). The page title is the H1.`,
      });
    }

    if (level === 2) h2Count += 1;

    if (previousHeading !== null && level > previousHeading + 1) {
      issues.push({
        level: schemaVersion >= 2 ? "critical" : "warning",
        id: "resource-heading-jump",
        message: `Heading hierarchy jumps from H${previousHeading} to H${level} at "${text}".`,
      });
    }

    previousHeading = level;
  }

  if (schemaVersion >= 2 && h2Count === 0) {
    issues.push({
      level: "critical",
      id: "resource-no-h2",
      message: "Schema v2 articles must contain at least one H2 section.",
    });
  }

  return issues;
}

export function compileResourceMarkdoc(markdown, options = {}) {
  const schemaVersion = Number(options.schemaVersion ?? 1);
  const source = stripInternalResourceMetadata(markdown);
  const ast = assignHeadingIds(Markdoc.parse(source));

  const validation = Markdoc.validate(ast, resourceMarkdocConfig).map((entry) => ({
    level: entry.error?.level ?? "error",
    id: entry.error?.id ?? "markdoc-validation",
    message: entry.error?.message ?? "Invalid Markdoc content.",
    lines: entry.lines,
  }));

  const issues = [...validation, ...structuralIssues(ast, schemaVersion)];
  const content = Markdoc.transform(ast, resourceMarkdocConfig);

  return {
    source,
    ast,
    content,
    toc: collectHeadings(ast),
    readingMinutes: Math.max(1, Math.ceil(countWords(ast) / 225)),
    issues,
  };
}

export function validateResourceMarkdoc(markdown, options = {}) {
  return compileResourceMarkdoc(markdown, options).issues;
}
