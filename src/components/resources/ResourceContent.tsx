import * as React from "react";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Info,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

export type PublicResourceSource = {
  id: string;
  citation_key: string;
  organization: string | null;
  title: string | null;
  url: string;
  source_type: string;
  source_published_at: string | null;
  verified_at: string | null;
  display_order: number;
};

type CitationEntry = {
  index: number;
  source: PublicResourceSource;
};

const CitationContext = React.createContext<Map<string, CitationEntry>>(new Map());

function ResourceHeading({
  level,
  id,
  children,
}: {
  level: number;
  id?: string;
  children: React.ReactNode;
}) {
  const shared = "resource-markdoc-heading scroll-mt-28 text-[#111814]";

  if (level <= 2) {
    return (
      <h2
        id={id}
        className={`${shared} mt-14 border-t border-[#3B5147]/12 pt-10 text-[1.8rem] font-bold leading-[1.18] md:text-[2rem]`}
      >
        {children}
      </h2>
    );
  }

  if (level === 3) {
    return (
      <h3 id={id} className={`${shared} mt-10 text-2xl font-bold leading-[1.25]`}>
        {children}
      </h3>
    );
  }

  return (
    <h4 id={id} className={`${shared} mt-8 text-xl font-bold leading-[1.3]`}>
      {children}
    </h4>
  );
}

function ResourceAnswer({
  title = "The direct answer",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="resource-semantic-block resource-answer my-8 rounded-2xl border border-[#3B5147]/18 bg-[#EDF1EC] px-6 py-6 md:px-7">
      <div className="flex items-center gap-2 text-[#3B5147]">
        <BadgeCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-[0.16em]">{title}</p>
      </div>
      <div className="resource-semantic-content mt-3">{children}</div>
    </section>
  );
}

function ResourceKeyTakeaways({
  title = "Key takeaways",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="resource-semantic-block my-8 rounded-2xl border border-[#D7A92E]/45 bg-[#FBF7E8] px-6 py-6 md:px-7">
      <div className="flex items-center gap-2 text-[#755915]">
        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-[0.16em]">{title}</p>
      </div>
      <div className="resource-semantic-content mt-3">{children}</div>
    </section>
  );
}

const calloutIcon = {
  note: Info,
  warning: AlertTriangle,
  verify: ShieldCheck,
  tip: Lightbulb,
} as const;

function ResourceCallout({
  tone = "note",
  title,
  children,
}: {
  tone?: keyof typeof calloutIcon;
  title?: string;
  children: React.ReactNode;
}) {
  const Icon = calloutIcon[tone] ?? Info;
  const labels = {
    note: "Note",
    warning: "Important",
    verify: "Verify",
    tip: "Practical tip",
  };

  return (
    <aside className={`resource-semantic-block resource-callout resource-callout-${tone} my-8 rounded-xl border-l-4 px-5 py-5 md:px-6`}>
      <div className="flex items-center gap-2 font-bold text-[#111814]">
        <Icon className="h-5 w-5 shrink-0 text-[#3B5147]" aria-hidden="true" />
        <span>{title || labels[tone]}</span>
      </div>
      <div className="resource-semantic-content mt-2">{children}</div>
    </aside>
  );
}

function ResourceSteps({
  title = "What to do",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="resource-semantic-block resource-steps my-9">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">{title}</p>
      <div className="mt-4 rounded-2xl border border-[#3B5147]/15 bg-[#FAF9F5] px-6 py-2 md:px-7">
        {children}
      </div>
    </section>
  );
}

function ResourceCitation({ source }: { source: string }) {
  const citations = React.useContext(CitationContext);
  const entry = citations.get(source);

  if (!entry) {
    return (
      <sup className="ml-0.5 text-xs font-bold text-[#111814]/45" title="Source unavailable">
        [?]
      </sup>
    );
  }

  return (
    <sup className="ml-0.5">
      <a
        href={`#source-${entry.source.citation_key}`}
        className="font-bold text-[#3B5147] no-underline hover:underline"
        aria-label={`Source ${entry.index}`}
      >
        [{entry.index}]
      </a>
    </sup>
  );
}

const components = {
  ResourceHeading,
  ResourceAnswer,
  ResourceKeyTakeaways,
  ResourceCallout,
  ResourceSteps,
  ResourceCitation,
};

export function ResourceMarkdoc({
  content,
  sources,
}: {
  content: RenderableTreeNode;
  sources: PublicResourceSource[];
}) {
  const citationMap = React.useMemo(() => {
    const map = new Map<string, CitationEntry>();
    sources.forEach((source, index) => {
      map.set(source.citation_key, { source, index: index + 1 });
    });
    return map;
  }, [sources]);

  return (
    <CitationContext.Provider value={citationMap}>
      <div className="resource-markdoc">
        {Markdoc.renderers.react(content, React, { components })}
      </div>
    </CitationContext.Provider>
  );
}

function sourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ResourceSources({ sources }: { sources: PublicResourceSource[] }) {
  if (sources.length === 0) return null;

  return (
    <section
      aria-labelledby="resource-sources-heading"
      className="resource-sources mt-8 rounded-2xl border border-[#3B5147]/12 bg-white px-6 py-7 sm:px-8 md:px-10"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
        Sources
      </p>
      <h2 id="resource-sources-heading" className="mt-2 text-2xl font-bold text-[#111814]">
        Official and authoritative references
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#111814]/60">
        These references support the factual and program-specific information in this guide.
      </p>
      <ol className="mt-6 space-y-4">
        {sources.map((source, index) => (
          <li
            key={source.id}
            id={`source-${source.citation_key}`}
            className="scroll-mt-28 border-t border-[#3B5147]/10 pt-4 first:border-t-0 first:pt-0"
          >
            <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
              <span className="font-bold text-[#3B5147]">[{index + 1}]</span>
              <div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-bold leading-6 text-[#111814] underline decoration-[#3B5147]/25 underline-offset-4 hover:text-[#3B5147]"
                >
                  {source.title || source.organization || sourceHost(source.url)}
                </a>
                {(source.organization || source.title) && (
                  <p className="mt-1 text-sm text-[#111814]/55">
                    {source.title
                      ? [source.organization, sourceHost(source.url)]
                          .filter(Boolean)
                          .join(" · ")
                      : sourceHost(source.url)}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
