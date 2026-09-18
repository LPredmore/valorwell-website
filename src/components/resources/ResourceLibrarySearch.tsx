import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import type { WebsiteResource } from "@/lib/websiteResources";

type SearchResult = {
  url: string;
  title: string;
  summary: string;
  category: string | null;
  excerpt: string;
};

type PagefindData = {
  url: string;
  excerpt?: string;
  meta?: Record<string, string | undefined>;
};

type PagefindModule = {
  search: (
    query: string,
    options?: { filters?: Record<string, string | string[]> },
  ) => Promise<{
    results: Array<{ data: () => Promise<PagefindData> }>;
  }>;
};

function stripMarkup(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function localSearch(
  articles: WebsiteResource[],
  query: string,
  category: string,
): SearchResult[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) return [];

  return articles
    .filter((article) => category === "all" || article.category_slug === category)
    .map((article) => {
      const title = article.title.toLowerCase();
      const question = article.primary_question.toLowerCase();
      const summary = article.summary.toLowerCase();
      const aliases = article.topic_aliases.join(" ").toLowerCase();
      const body = article.body_markdown.toLowerCase();

      const score = terms.reduce((total, term) => {
        if (title.includes(term)) total += 12;
        if (question.includes(term)) total += 8;
        if (summary.includes(term)) total += 5;
        if (aliases.includes(term)) total += 4;
        if (body.includes(term)) total += 1;
        return total;
      }, 0);

      return { article, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.article.featured) - Number(a.article.featured) ||
        a.article.sort_order - b.article.sort_order,
    )
    .slice(0, 12)
    .map(({ article }) => ({
      url: `/resources/${article.category_slug}/${article.slug}`,
      title: article.title,
      summary: article.summary,
      category: article.category_slug,
      excerpt: article.summary,
    }));
}

export function ResourceLibrarySearch({
  articles,
  categories,
}: {
  articles: WebsiteResource[];
  categories: WebsiteResource[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pagefindAvailable, setPagefindAvailable] = useState(true);

  const categoryLabels = useMemo(
    () =>
      new Map(
        categories.map((item) => [
          item.slug,
          item.title.replace(/\s+Resources$/i, ""),
        ]),
      ),
    [categories],
  );

  useEffect(() => {
    const value = query.trim();

    if (value.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);

      try {
        if (!pagefindAvailable) throw new Error("Pagefind unavailable");

        const pagefind = (await import(
          /* @vite-ignore */ "/pagefind/pagefind.js"
        )) as unknown as PagefindModule;

        const search = await pagefind.search(value, {
          filters: category === "all" ? undefined : { category },
        });

        const data = await Promise.all(
          search.results.slice(0, 12).map((result) => result.data()),
        );

        if (cancelled) return;

        setResults(
          data.map((item) => ({
            url: item.url,
            title: item.meta?.title || "ValorWell resource",
            summary: item.meta?.summary || "",
            category: item.meta?.category || null,
            excerpt: stripMarkup(item.excerpt || item.meta?.summary || ""),
          })),
        );
      } catch {
        if (cancelled) return;
        setPagefindAvailable(false);
        setResults(localSearch(articles, value, category));
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 160);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [articles, category, pagefindAvailable, query]);

  useEffect(() => {
    if (query.trim().length >= 2 && !pagefindAvailable) {
      setResults(localSearch(articles, query, category));
    }
  }, [articles, category, pagefindAvailable, query]);

  const hasQuery = query.trim().length >= 2;

  return (
    <section aria-labelledby="resource-search-heading" className="rounded-[2rem] bg-[#111814] p-6 text-white shadow-sm md:p-9">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
          Search the library
        </p>
        <h2 id="resource-search-heading" className="mt-2 text-2xl font-bold md:text-4xl">
          What are you trying to figure out?
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-white/65">
          Search the actual questions, terminology, aliases, and guidance across ValorWell resources.
        </p>
      </div>

      <div className="relative mt-7">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#111814]/45"
          aria-hidden="true"
        />
        <label htmlFor="resource-library-search" className="sr-only">
          Search ValorWell resources
        </label>
        <input
          id="resource-library-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try “moving during deployment” or “VA provider billed me”"
          className="min-h-14 w-full rounded-xl border-0 bg-[#F4F1E8] py-3 pl-12 pr-12 text-base text-[#111814] outline-none ring-2 ring-transparent transition placeholder:text-[#111814]/40 focus:ring-[#D7A92E]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#111814]/55 hover:bg-[#111814]/5 hover:text-[#111814]"
            aria-label="Clear resource search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter resources by topic">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
            category === "all"
              ? "border-[#D7A92E] bg-[#D7A92E] text-[#111814]"
              : "border-white/15 text-white/70 hover:border-white/35 hover:text-white"
          }`}
        >
          All topics
        </button>
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.slug)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              category === item.slug
                ? "border-[#D7A92E] bg-[#D7A92E] text-[#111814]"
                : "border-white/15 text-white/70 hover:border-white/35 hover:text-white"
            }`}
          >
            {categoryLabels.get(item.slug)}
          </button>
        ))}
      </div>

      {hasQuery && (
        <div className="mt-7 border-t border-white/10 pt-6" aria-live="polite">
          {isSearching ? (
            <p className="text-sm text-white/60">Searching resources…</p>
          ) : results.length === 0 ? (
            <div>
              <p className="font-bold">No close match yet.</p>
              <p className="mt-1 text-sm leading-6 text-white/60">
                Try fewer words, a program name such as CHAMPVA or TRICARE, or browse the topic areas below.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm font-semibold text-white/55">
                {results.length} {results.length === 1 ? "result" : "results"}
              </p>
              <div className="grid gap-3">
                {results.map((result) => {
                  const resultCategory =
                    result.category && categoryLabels.get(result.category)
                      ? categoryLabels.get(result.category)
                      : result.category;

                  return (
                    <Link
                      key={result.url}
                      to={result.url}
                      className="group rounded-xl border border-white/10 bg-white/[0.055] p-5 transition hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
                    >
                      {resultCategory && (
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D7A92E]">
                          {resultCategory}
                        </p>
                      )}
                      <div className="mt-1 flex items-start justify-between gap-5">
                        <div>
                          <h3 className="font-bold leading-6 text-white">{result.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
                            {result.excerpt || result.summary}
                          </p>
                        </div>
                        <ArrowRight
                          className="mt-1 h-4 w-4 shrink-0 text-white/45 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
