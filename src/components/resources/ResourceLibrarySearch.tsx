import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";

type SearchCategory = {
  slug: string;
  label: string;
};

type PagefindResultData = {
  url: string;
  excerpt?: string;
  meta?: Record<string, string>;
};

type PagefindResult = {
  data: () => Promise<PagefindResultData>;
};

type PagefindSearchResponse = {
  results: PagefindResult[];
};

type PagefindModule = {
  init?: () => Promise<void> | void;
  options?: (options: {
    ranking?: {
      metaWeights?: Record<string, number>;
    };
  }) => Promise<void> | void;
  search: (
    query: string,
    options?: { filters?: Record<string, string | string[]> },
  ) => Promise<PagefindSearchResponse>;
};

let pagefindPromise: Promise<PagefindModule> | null = null;

function loadPagefind() {
  if (!pagefindPromise) {
    const modulePath = "/pagefind/pagefind.js";
    pagefindPromise = import(/* @vite-ignore */ modulePath).then(
      (module) => module as PagefindModule,
    );
  }
  return pagefindPromise;
}

function excerptToText(value: string | undefined) {
  if (!value) return "";
  return value
    .replace(/<mark>/gi, "")
    .replace(/<\/mark>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function ResourceLibrarySearch({
  categories,
}: {
  categories: SearchCategory[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<PagefindResultData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const sequence = useRef(0);

  const initialize = () => {
    void loadPagefind()
      .then(async (pagefind) => {
        await pagefind.options?.({
          ranking: {
            metaWeights: {
              title: 6,
              summary: 2.5,
              aliases: 2,
            },
          },
        });
        await pagefind.init?.();
      })
      .catch(() => {
        // Pagefind is generated only for production/static builds. Search remains
        // progressively enhanced and the category library still works without it.
      });
  };

  useEffect(() => {
    const trimmed = query.trim();
    const currentSequence = ++sequence.current;

    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      setSearchError(false);
      return;
    }

    setIsSearching(true);
    setSearchError(false);

    const timer = window.setTimeout(async () => {
      try {
        const pagefind = await loadPagefind();
        const response = await pagefind.search(
          trimmed,
          category === "all"
            ? undefined
            : {
                filters: {
                  category,
                },
              },
        );

        const hydrated = await Promise.all(
          response.results.slice(0, 10).map((result) => result.data()),
        );

        if (sequence.current === currentSequence) {
          setResults(hydrated);
          setIsSearching(false);
        }
      } catch {
        if (sequence.current === currentSequence) {
          setResults([]);
          setIsSearching(false);
          setSearchError(true);
        }
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [query, category]);

  const showPanel = query.trim().length >= 2;

  return (
    <section
      aria-labelledby="resource-search-heading"
      className="rounded-[1.75rem] border border-[#3B5147]/15 bg-white p-5 shadow-[0_24px_70px_-54px_rgba(17,24,20,0.55)] sm:p-7 md:p-8"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
          Search the library
        </p>
        <h2 id="resource-search-heading" className="mt-2 text-2xl font-bold md:text-3xl">
          What are you trying to figure out?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#111814]/60 md:text-base">
          Search by a question, program, benefit, family issue, or term you were given.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem]">
        <label className="relative block">
          <span className="sr-only">Search ValorWell resources</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3B5147]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={initialize}
            placeholder="Try “community care referral” or “moving during deployment”"
            className="min-h-13 w-full rounded-xl border border-[#3B5147]/20 bg-[#FAF9F5] py-3.5 pl-12 pr-4 text-base text-[#111814] outline-none transition placeholder:text-[#111814]/40 focus:border-[#3B5147]/55 focus:ring-2 focus:ring-[#3B5147]/12"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Filter by resource category</span>
          <SlidersHorizontal
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3B5147]"
            aria-hidden="true"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-13 w-full appearance-none rounded-xl border border-[#3B5147]/20 bg-[#FAF9F5] py-3.5 pl-11 pr-10 text-sm font-bold text-[#111814] outline-none transition focus:border-[#3B5147]/55 focus:ring-2 focus:ring-[#3B5147]/12"
          >
            <option value="all">All topics</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showPanel && (
        <div className="mt-6 border-t border-[#3B5147]/10 pt-5" aria-live="polite">
          {isSearching ? (
            <p className="text-sm text-[#111814]/55">Searching resources…</p>
          ) : searchError ? (
            <p className="text-sm text-[#111814]/55">
              Search is temporarily unavailable. You can still browse the topics below.
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-[#111814]/55">
              No close matches found. Try a shorter phrase or browse by topic.
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((result) => {
                const title = result.meta?.title || "ValorWell resource";
                const categoryLabel = result.meta?.category_label;
                const summary =
                  result.meta?.summary || excerptToText(result.excerpt);

                return (
                  <Link
                    key={result.url}
                    to={result.url}
                    className="group block rounded-xl border border-transparent px-4 py-4 transition hover:border-[#3B5147]/12 hover:bg-[#F4F1E8]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
                  >
                    {categoryLabel && (
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3B5147]">
                        {categoryLabel}
                      </p>
                    )}
                    <h3 className="mt-1 text-lg font-bold leading-6 text-[#111814] group-hover:text-[#3B5147]">
                      {title}
                    </h3>
                    {summary && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#111814]/60">
                        {summary}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
