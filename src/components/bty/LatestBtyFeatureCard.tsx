import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useLatestPublishedFeature } from "@/hooks/useLatestPublishedFeature";
import type { PublishedFeature } from "@/lib/btyPublishedFeatures";

type Props = {
  /** Called with an event name and params for analytics. */
  onTrack: (event: string, params: Record<string, unknown>) => void;
  eventPrefix: string;
};

function Thumbnail({ feature }: { feature: PublishedFeature }) {
  const [src, setSrc] = useState(feature.imageUrl ?? feature.fallbackImageUrl);
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#3B5147]" aria-hidden="true">
        <PlayCircle className="h-12 w-12 text-white/70" />
      </div>
    );
  }
  return (
    <img
      src={src}
      onError={() => {
        if (feature.fallbackImageUrl && src !== feature.fallbackImageUrl) setSrc(feature.fallbackImageUrl);
        else setSrc(null);
      }}
      alt={`${feature.name} on Beyond The Yellow`}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  );
}

/** Latest published BTY feature card, driven entirely by bty_published_features. */
export function LatestBtyFeatureCard({ onTrack, eventPrefix }: Props) {
  const { data, isLoading, isError } = useLatestPublishedFeature();

  if (isLoading) {
    return (
      <div className="aspect-video w-full animate-pulse rounded-3xl bg-[#3B5147]/10" role="status" aria-label="Loading the latest Beyond The Yellow feature" />
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-[#3B5147]/20 bg-white p-8 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">Beyond The Yellow</p>
        <p className="mt-3 text-lg leading-7 text-[#111814]/75">
          Browse every published Beyond The Yellow feature in the archive.
        </p>
        <Link
          to="/network"
          onClick={() => onTrack(`${eventPrefix}_archive_fallback`, {})}
          className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
        >
          See featured organizations <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const params = { organization: data.name, video_id: data.videoUrl ? data.videoUrl.split("v=")[1] : null };
  const featureHref = data.internalPath ?? data.featureUrl;

  return (
    <article className="overflow-hidden rounded-3xl border border-[#D7A92E]/30 bg-white text-left shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-[#111814]">
        <Thumbnail key={data.id} feature={data} />
      </div>
      <div className="p-6 md:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">Latest featured organization</p>
        <h3 className="mt-2 text-2xl font-bold text-[#111814]">{data.name}</h3>
        <p className="mt-3 line-clamp-3 text-base leading-7 text-[#111814]/70">{data.summary}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
          {data.internalPath ? (
            <Link
              to={data.internalPath}
              onClick={() => onTrack(`${eventPrefix}_latest_feature`, params)}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
            >
              Read about {data.name} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <a
              href={featureHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrack(`${eventPrefix}_latest_feature`, params)}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147] underline underline-offset-4"
            >
              Read about {data.name} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          {data.videoUrl && (
            <a
              href={data.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrack(`${eventPrefix}_latest_feature_video`, params)}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" /> Watch video
              <span className="sr-only"> featuring {data.name} on YouTube</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
