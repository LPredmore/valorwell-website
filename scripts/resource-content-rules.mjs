import Markdoc from "@markdoc/markdoc";

const INTERNAL_HEADINGS = new Set([
  "authoritative sources reviewed",
  "sources reviewed",
  "sources",
  "last reviewed",
  "last researched",
]);

const markdocConfig = {
  tags: {
    answer: { render: "ResourceAnswer" },
    "key-takeaways": { render: "ResourceTakeaways" },
    verify: {
      render: "ResourceVerify",
      attributes: { program: { type: String } },
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
    steps: { render: "ResourceSteps" },
  },
  nodes: {
    heading: {
      render: "ResourceHeading",
      attributes: { level: { type: Number, required: true } },
    },
  },
};

function plainHeading(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function headingSlug(value) {
  return plainHeading(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

export function preparePublicResourceMarkup(markdown) {
  const output = [];
  let suppressedLevel = null;

  for (const rawLine of String(markdown ?? "").split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const heading = line.trim().match(/^(#{1,6})\s+(.*)$/);

    if (heading) {
      const level = heading[1].length;
      const normalized = plainHeading(heading[2])
        .toLowerCase()
        .replace(/[:.]+$/, "");

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

export function validateResourceMarkup(markdown) {
  const markup = preparePublicResourceMarkup(markdown);
  const errors = [];
  const warnings = [];

  if (!markup) errors.push("body is empty after removing internal research metadata");
  if (/^#\s+/m.test(markup)) {
    errors.push("body must not contain an H1; the page title is the H1");
  }
  if (/<[a-z][\s\S]*?>/i.test(markup)) {
    errors.push("raw HTML is not allowed in public resource content");
  }

  const seen = new Set();
  let previousLevel = 1;

  for (const line of markup.split(/\r?\n/)) {
    const heading = line.match(/^(#{2,6})\s+(.*)$/);
    if (!heading) continue;

    const level = heading[1].length;
    const slug = headingSlug(heading[2]);

    if (seen.has(slug)) errors.push(`duplicate heading slug "${slug}"`);
    seen.add(slug);

    if (level > previousLevel + 1) {
      errors.push(`heading level jumps from H${previousLevel} to H${level}`);
    }
    previousLevel = level;
  }

  try {
    const ast = Markdoc.parse(markup);
    for (const issue of Markdoc.validate(ast, markdocConfig)) {
      const message = issue.error?.message ?? "invalid Markdoc content";
      if (issue.error?.level === "critical") errors.push(message);
      else warnings.push(message);
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Markdoc parsing failed");
  }

  return { markup, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}
