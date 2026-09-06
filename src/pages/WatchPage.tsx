import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Play, PlayCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

type VideoCard = {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  label: string;
};

const latestVideos: VideoCard[] = [
  {
    id: "U0DqQiQOKwE",
    title: "The VA Disability Panic Is Completely Out of Control",
    published: "September 4, 2026",
    thumbnail: "https://i.ytimg.com/vi/U0DqQiQOKwE/maxresdefault.jpg",
    label: "Veteran systems",
  },
  {
    id: "2c-NQ74cn9E",
    title: "CHAMPVA Copays and Coinsurance: What You Should Actually Pay",
    published: "September 2, 2026",
    thumbnail: "https://i.ytimg.com/vi/2c-NQ74cn9E/maxresdefault.jpg",
    label: "Practical help",
  },
  {
    id: "9pYfQit4yYQ",
    title: "VA Disability Fraud: When a Broken System Makes Cheating Look Easier",
    published: "September 1, 2026",
    thumbnail: "https://i.ytimg.com/vi/9pYfQit4yYQ/maxresdefault.jpg",
    label: "Veteran systems",
  },
  {
    id: "6b63BAqehBg",
    title: "We Demand Mental Health Care After Tragedy—Why Not Before?",
    published: "September 1, 2026",
    thumbnail: "https://i.ytimg.com/vi/6b63BAqehBg/maxresdefault.jpg",
    label: "Mental well-being",
  },
  {
    id: "0C1bMw_Nd7U",
    title: "CHAMPVA Claims Can Be Filed Online Now—Stop Using the Mail!",
    published: "August 28, 2026",
    thumbnail: "https://i.ytimg.com/vi/0C1bMw_Nd7U/maxresdefault.jpg",
    label: "Practical help",
  },
  {
    id: "dqD-nwvPRF4",
    title: "VA Community Care Denied? The Rule Veterans Need to Know",
    published: "August 27, 2026",
    thumbnail: "https://i.ytimg.com/vi/dqD-nwvPRF4/maxresdefault.jpg",
    label: "Practical help",
  },
];

const btyVideos: VideoCard[] = [
  {
    id: "A4CUe3c8rJE",
    title: "Why ‘Thank You for Your Service’ Doesn't Heal Veteran Isolation",
    published: "August 31, 2026",
    thumbnail: "https://i.ytimg.com/vi/A4CUe3c8rJE/maxresdefault.jpg",
    label: "Beyond The Yellow",
  },
  {
    id: "iVDPZL_PEWo",
    title: "Skills For Service. No Map For Life",
    published: "August 17, 2026",
    thumbnail: "https://i.ytimg.com/vi/iVDPZL_PEWo/maxresdefault.jpg",
    label: "Beyond The Yellow",
  },
  {
    id: "19JpCgF-d9Q",
    title: "Everyone Says They Support Veterans—Who Actually Does the Work?",
    published: "August 9, 2026",
    thumbnail: "https://i.ytimg.com/vi/19JpCgF-d9Q/maxresdefault.jpg",
    label: "Beyond The Yellow",
  },
  {
    id: "hLvZfGcycOQ",
    title: "The Military Trains You to Follow Orders—Then Leaves You to Figure Life Out",
    published: "August 4, 2026",
    thumbnail: "https://i.ytimg.com/vi/hLvZfGcycOQ/maxresdefault.jpg",
    label: "Beyond The Yellow",
  },
];

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.2em] ${
        light ? "text-[#D7A92E]" : "text-[#3B5147]"
      }`}
    >
      {children}
    </p>
  );
}

function youtubeUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

function VideoTile({ video, event }: { video: VideoCard; event: string }) {
  return (
    <a
      href={youtubeUrl(video.id)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackHomeEvent(event, { video_id: video.id, page: "watch" })}
      className="group overflow-hidden rounded-2xl border border-[#3B5147]/15 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#3B5147]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative aspect-video overflow-hidden bg-[#111814]">
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/20" aria-hidden="true" />
        <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#111814] shadow-lg">
          <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#3B5147]/70">
          {video.label}
        </p>
        <h3 className="mt-3 text-xl font-bold leading-snug text-[#111814]">{video.title}</h3>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#111814]/50">
          <span>{video.published}</span>
          <span className="inline-flex items-center gap-1 font-bold text-[#3B5147]">
            YouTube <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default function WatchPage() {
  useEffect(() => {
    trackHomeEvent("watch_page_view", { page: "watch" });
  }, []);

  const featured = latestVideos[0];

  return (
    <Layout>
      <SEO
        title="Watch ValorWell | Veteran, Family & Beyond The Yellow Videos"
        description="Watch ValorWell videos about veteran systems, CHAMPVA, VA Community Care, mental health, military families, and Beyond The Yellow conversations."
        canonical="/watch"
      />

      <div className="watch-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .watch-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .watch-theme h1,
          .watch-theme h2,
          .watch-theme h3 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden border-b border-white/10 bg-[#111814] text-white">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-36 -top-44 h-[30rem] w-[30rem] rounded-full bg-[#D7A92E]/10 blur-3xl" />
            <div className="absolute -bottom-52 -left-40 h-[32rem] w-[32rem] rounded-full bg-[#3B5147]/30 blur-3xl" />
          </div>

          <div className="container-wide relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center lg:py-28">
            <div className="lg:col-span-6">
              <Eyebrow light>Watch ValorWell</Eyebrow>
              <h1 className="mt-6 text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                Videos for veterans, families, and people following the work.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
                Recent videos cover care access, CHAMPVA, VA Community Care, mental health, disability-system issues, and Beyond The Yellow conversations with featured organizations.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="https://www.youtube.com/@ValorWell"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackHomeEvent("watch_hero_youtube", { page: "watch" })}
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#111814] transition hover:bg-[#F4F1E8]"
                >
                  <PlayCircle className="h-5 w-5" aria-hidden="true" />
                  Open ValorWell on YouTube
                </a>
                <Link
                  to="/beyond-the-yellow"
                  onClick={() => trackHomeEvent("watch_hero_bty", { page: "watch" })}
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Beyond The Yellow
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <a
                href={youtubeUrl(featured.id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackHomeEvent("watch_featured_play", { video_id: featured.id, page: "watch" })}
                className="group block overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={featured.thumbnail}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#111814] shadow-lg">
                      <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#D7A92E]">Latest video</p>
                    <h2 className="mt-2 text-2xl font-bold leading-snug text-white md:text-3xl">{featured.title}</h2>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <Eyebrow>Latest Videos</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  Recent videos from ValorWell.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <a
                  href="https://www.youtube.com/@ValorWell/videos"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackHomeEvent("watch_latest_all", { page: "watch" })}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]"
                >
                  See all videos <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {latestVideos.map((video) => (
                <VideoTile key={video.id} video={video} event="watch_latest_video" />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <Eyebrow>Beyond The Yellow</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                  Conversations with featured organizations and community leaders.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <Link
                  to="/beyond-the-yellow"
                  className="inline-flex min-h-11 items-center text-sm font-bold text-[#3B5147]"
                >
                  Explore Beyond The Yellow
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {btyVideos.map((video) => (
                <VideoTile key={video.id} video={video} event="watch_bty_video" />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#3B5147] text-white">
          <div className="container-wide grid gap-8 py-16 md:py-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <Eyebrow light>Looking for Written Guidance?</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                Use the resource library for care, coverage, documentation, and family-system topics.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link
                to="/resources"
                className="inline-flex min-h-12 items-center rounded-md bg-white px-6 py-3 text-sm font-bold text-[#3B5147]"
              >
                Browse Resources
              </Link>
              <Link
                to="/get-care"
                className="inline-flex min-h-12 items-center rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white"
              >
                Find Care
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
