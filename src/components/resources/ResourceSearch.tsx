import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";

type PagefindResultData = {
  url: string;
  meta?: Record<string, string>;
  excerpt?: string;
  plain_excerpt?: string;
};

type PagefindResult = {
  id: string;
  score: number;
  data: () => Promise<PagefindResultData>;
};

type PagefindResponse = {
  results: PagefindResult[];
};

type PagefindApi = {
  init?: () => Promise<void>;
  debouncedSearch: (
    query: string,
    options?: {
      filters?: Record<string, string | string[]>;
    },
    debounceTimeoutMs?: number,
  ) => Promise<PagefindResponse | null>;
};

type SearchResult = {
  id: string;
  url: string;
  title: string;
  summary: string;
  category: string | null;
  type: string | null;
};

type ResourceSearchProps = {
  category?: string;
  compact?: boolean;
};

const PAGEFIND_MODULE = "/pagefind/pagefind.js";

function cleanResultUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname;
  } catch {
    return url;
  }
}

export function ResourceSearch({ category, compact = false }: ResourceSearchProps) {
  const apiRef = useRef<PagefindApi | null>(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);

  const loadApi = useCallback(async () => {
    if (apiRef.current) return apiRef.current;

    try {
      const module = (await import(/* @vite-ignore */ PAGEFIND_MODULE)) as PagefindApi;
      await module.init?.();
      apiRef.current = module;
      return module;
    } catch {
      setIsUnavailable(true);
      return null;
    }
  }, []);

  const runSearch = useCallback(
    async (value: string) => {
      const normalized = value.trim();
      const requestId = ++requestIdRef.current;

      if (normalized.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const api = await loadApi();

      if (!api) {
        if (requestId === requestIdRef.current) setIsSearching(false);
        return;
      }

      try {
        const response = await api.debouncedSearch(
          normalized,
          category ? { filters: { category } } : undefined,
          180,
        );

        if (requestId !== requestIdRef.current) return;

        const hydrated = await Promise.all(
          (response?.results ?? []).slice(0, 8).map(async (result) => {
            const data = await result.data();
            return {
              id: result.id,
              url: cleanResultUrl(data.url),
              title: data.meta?.title || "ValorWell resource",
              summary:
                data.meta?.summary ||
                data.plain_excerpt ||
                data.excerpt?.replace(/<[^>]+>/g, "") ||
                "",
              category: data.meta?.category ?? null,
              type: data.meta?.type ?? null,
            };
          }),
        );

        if (requestId === requestIdRef.current) {
          setResults(hydrated);
        }
      } finally {
        if (requestId === requestIdRef.current) setIsSearching(false);
      }
    },
    [category, loadApi],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void runSearch(query);
    }, 60);

    return () => window.clearTimeout(timeout);
  }, [query, runSearch]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void runSearch(query);
  }

  const hasQuery = query.trim().length >= 2;

  return (
    <div className={compact ? "" : "rounded-3xl border border-[#3B5147]/15 bg-white p-5 shadow-sm md:p-7"}>
      {!compact && (
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
            Search the library
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-[#111814] md:text-3xl">
            What are you trying to figure out?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#111814]/60 md:text-base">
            Search by question, benefit, situation, program, or topic. You do not need to know the official terminology.
          </p>
        </div>
      )}

      <form onSubmit={submit} role="search" className="relative">
        <label htmlFor={compact ? "category-resource-search" : "resource-search"} className="sr-only">
          Search ValorWell resources
        </label>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3B5147]"
          aria-hidden="true"
        />
        <input
          id={compact ? "category-resource-search" : "resource-search"}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => void loadApi()}
          placeholder={
            category
              ? "Search this topic…"
              : "Try “Community Care billing”, “deployment communication”, or “CHAMPVA therapy”…"
          }
          autoComplete="off"
          className="min-h-14 w-full rounded-xl border border-[#3B5147]/25 bg-[#FCFBF7] py-3 pl-12 pr-12 text-base text-[#111814] outline-none transition placeholder:text-[#111814]/40 focus:border-[#3B5147] focus:ring-4 focus:ring-[#3B5147]/10"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#111814]/50 transition hover:bg-[#3B5147]/8 hover:text-[#111814]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </form>

      {isUnavailable && hasQuery && (
        <p className="mt-4 text-sm leading-6 text-[#111814]/58">
          Resource search is temporarily unavailable. You can still browse the topic areas below.
        </p>
      )}

      {!isUnavailable && hasQuery && (
        <div className="mt-5" aria-live="polite">
          {isSearching && results.length === 0 ? (
            <p className="text-sm text-[#111814]/55">Searching resources…</p>
          ) : results.length === 0 && !isSearching ? (
            <div className="rounded-xl bg-[#F4F1E8] px-4 py-4">
              <p className="font-bold text-[#111814]">No exact match yet.</p>
              <p className="mt-1 text-sm leading-6 text-[#111814]/60">
                Try fewer words or a broader term. The category pages below can also help narrow the question.
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#111814]/48">
                {results.length} {results.length === 1 ? "result" : "results"}
              </p>
              <ul className="divide-y divide-[#3B5147]/10 overflow-hidden rounded-2xl border border-[#3B5147]/12 bg-white">
                {results.map((result) => (
                  <li key={result.id}>
                    <Link
                      to={result.url}
                      className="group block px-5 py-5 transition hover:bg-[#F8F6EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B5147]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          {(result.category || result.type) && (
                            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#3B5147]">
                              {[result.category, result.type].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          <h3 className="text-lg font-bold leading-6 text-[#111814]">
                            {result.title}
                          </h3>
                          {result.summary && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#111814]/62">
                              {result.summary}
                            </p>
                          )}
                        </div>
                        <ArrowRight
                          className="mt-1 h-5 w-5 shrink-0 text-[#3B5147] transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
