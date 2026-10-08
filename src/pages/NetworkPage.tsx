import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowUpRight, Building2, PlayCircle, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { fetchPublishedFeatures, type PublishedFeature } from "@/lib/btyPublishedFeatures";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@ValorWell";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; features: PublishedFeature[] };

function FeatureLink({
  feature,
  className,
  children,
  ariaLabel,
}: {
  feature: PublishedFeature;
  className: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  if (feature.internalPath) {
    return (
      <Link to={feature.internalPath} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <a href={feature.featureUrl} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}

function FeatureCard({ feature }: { feature: PublishedFeature }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#3B5147]/15 bg-white shadow-sm">
      <FeatureLink
        feature={feature}
        ariaLabel={`Explore ${feature.name}`}
        className="group block overflow-hidden bg-[#111814] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D7A92E]"
      >
        <div className="relative aspect-video overflow-hidden">
          {feature.imageUrl ? (
            <img
              src={feature.imageUrl}
              alt={`${feature.name} Beyond The Yellow feature`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
              loading="lazy"
              onError={(event) => {
                if (feature.fallbackImageUrl && event.currentTarget.src !== feature.fallbackImageUrl) {
                  event.currentTarget.src = feature.fallbackImageUrl;
                }
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#D7A92E]">
              <Building2 className="h-10 w-10" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/20" aria-hidden="true" />
        </div>
      </FeatureLink>
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6814]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Beyond The Yellow
        </div>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-[#111814]">{feature.name}</h2>
        <p className="mt-4 text-sm leading-7 text-[#111814]/62">{feature.summary}</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <FeatureLink
            feature={feature}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
          >
            Read feature
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </FeatureLink>
          {feature.videoUrl ? (
            <a
              href={feature.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#111814]/55 transition hover:text-[#111814] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              Watch conversation
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function FeatureGrid({ state, onRetry }: { state: LoadState; onRetry: () => void }) {
  if (state.status === "loading") {
    return (
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading featured organizations">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-[26rem] animate-pulse rounded-3xl border border-[#3B5147]/10 bg-[#F4F1E8]" />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="mt-10 rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8 text-center">
        <p className="text-lg font-bold text-[#111814]">We couldn&apos;t load the featured organizations right now.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#3B5147] px-5 py-2 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  if (state.features.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-[#3B5147]/15 bg-[#F4F1E8] p-8 text-center">
        <p className="text-lg font-bold text-[#111814]">New features are on the way.</p>
        <p className="mt-2 text-sm text-[#111814]/62">Check back soon for published Beyond The Yellow conversations.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {state.features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}

export default function NetworkPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchPublishedFeatures()
      .then((features) => {
        if (!cancelled) setState({ status: "ready", features });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  return (
    <>
      <Helmet>
        <title>Beyond The Yellow Featured Organizations | ValorWell</title>
        <meta
          name="description"
          content="Explore organizations featured through Beyond The Yellow, read their feature pages, and watch the conversations behind their work."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://www.valorwell.org/network" />
      </Helmet>

      <Header />
      <main className="min-h-screen bg-[#F4F1E8] text-[#111814]">
        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D7A92E]">Beyond The Yellow</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
              Featured organizations.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/72">
              Explore organizations featured through Beyond The Yellow, read their stories, and watch conversations about how their work operates.
            </p>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">Published Conversations</p>
              <h2 className="mt-3 text-3xl font-bold text-[#111814] md:text-4xl">
                Go deeper on the work behind each conversation.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#111814]/62">
                Read the feature or watch the full conversation. This is an archive of published Beyond The Yellow features, not a comprehensive directory of veteran-service organizations.
              </p>
            </div>
            <FeatureGrid state={state} onRetry={load} />
          </div>
        </section>

        <section className="bg-[#F4F1E8] py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">Who Are We Missing?</p>
            <h2 className="mt-4 text-3xl font-bold text-[#111814] md:text-5xl">
              Know somebody whose work would leave a hole if it disappeared?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#111814]/62">
              Send us back to Beyond The Yellow and tell us who is doing the work.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/beyond-the-yellow?form=nomination"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-5 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
              >
                Nominate a Doer
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#3B5147]/30 px-5 py-3 text-sm font-bold text-[#3B5147] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
              >
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                More ValorWell videos on YouTube
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
