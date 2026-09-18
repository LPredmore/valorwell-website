import { describe, expect, it } from "vitest";
import {
  compileResourceDocument,
  prepareResourceBody,
  validateResourceBody,
} from "@/lib/resourceMarkdoc";

describe("resource Markdoc compiler", () => {
  it("preserves heading hierarchy, builds stable TOC ids, and calculates reading time", () => {
    const compiled = compileResourceDocument(
      "## Direct answer\n\nUseful explanation.\n\n### Details\n\nMore details.\n\n## Next steps\n\nDo the next thing.",
      1,
    );

    expect(compiled.errors).toEqual([]);
    expect(compiled.toc).toEqual([
      { id: "direct-answer", level: 2, text: "Direct answer" },
      { id: "details", level: 3, text: "Details" },
      { id: "next-steps", level: 2, text: "Next steps" },
    ]);
    expect(compiled.readingMinutes).toBeGreaterThanOrEqual(1);
  });

  it("removes legacy research bookkeeping from the public document", () => {
    const prepared = prepareResourceBody(
      "## Guidance\n\nPublic content.\n\n## Authoritative sources reviewed\n\n- https://example.com/private-source\n\nLast researched: September 18, 2026",
    );

    expect(prepared).toContain("Public content.");
    expect(prepared).not.toContain("Authoritative sources reviewed");
    expect(prepared).not.toContain("private-source");
    expect(prepared).not.toContain("Last researched");
  });

  it("enables semantic knowledge blocks in schema version 2", () => {
    const compiled = compileResourceDocument(
      '{% answer title="Short answer" %}\nThis is the answer.\n{% /answer %}\n\n## Details\n\nMore information.',
      2,
    );

    expect(compiled.errors).toEqual([]);
    expect(JSON.stringify(compiled.content)).toContain("ResourceAnswer");
    expect(JSON.stringify(compiled.content)).toContain("Short answer");
  });

  it("rejects unsupported semantic tags in schema version 1", () => {
    const errors = validateResourceBody(
      "{% answer %}\nThis should require schema version 2.\n{% /answer %}\n\n## Details\n\nMore.",
      1,
    );

    expect(errors.length).toBeGreaterThan(0);
  });

  it("flags body H1s and skipped heading levels", () => {
    const errors = validateResourceBody(
      "# Duplicate page title\n\n### Skipped level\n\nText.",
      1,
    );

    expect(errors.some((error) => error.includes("must not contain an H1"))).toBe(true);
    expect(errors.some((error) => error.includes("skips from H1 to H3"))).toBe(true);
  });
});
