import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  HeartHandshake,
  PlayCircle,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import heroFamily from "@/assets/hero-family.jpg";
import homepageFixingBothSides from "@/assets/homepage-fixing-from-both-sides.png.asset.json";
import homepageThreeParts from "@/assets/homepage-three-connected-parts.png.asset.json";
import { Layout } from "@/components/layout/Layout";
import { OrganizationSchema, SEO } from "@/components/SEO";
import { billingHubSupabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { trackHomeEvent } from "@/lib/tracking";
import {
  formatExactImpactValue,
  normalizeHomepageImpactRows,
  type HomepageImpactPoint,
  type HomepageImpactRpcRow,
} from "./homePageData";

const CURRENT_BTY_VIDEO_ID = "JHuLEqw2yG8";
const CURRENT_BTY_VIDEO_URL = `https://www.youtube.com/watch?v=${CURRENT_BTY_VIDEO_ID}`;
const CURRENT_BTY_THUMBNAIL = `https://i.ytimg.com/vi/${CURRENT_BTY_VIDEO_ID}/maxresdefault.jpg`;
const CURRENT_BTY_THUMBNAIL_FALLBACK = `https://i.ytimg.com/vi/${CURRENT_BTY_VIDEO_ID}/hqdefault.jpg`;

const involvementRoutes = [
  {
    audience: "Veterans & Families",
    title: "Need Care",
    description: "Find the coverage pathway that applies to you.",
    cta: "Find Care →",
    to: "/get-care",
    event: "homepage_route_care",
    icon: Stethoscope,
  },
  {
    audience: "Donors",
    title: "Fund a Session",
    description: "100% of donations go directly to therapists providing treatment.",
    cta: "Support the Foundation →",
    to: "/foundation",
    event: "homepage_route_foundation",
    icon: HeartHandshake,
  },
  {
    audience: "Organizations & Media",
    title: "Partner or Feature",
    description: "Referral relationships, community collaboration, or a Beyond The Yellow feature.",
    cta: "Partner With ValorWell →",
    to: "/partner",
    event: "homepage_route_partner",
    icon: Building2,
  },
  {
    audience: "Clinicians",
    title: "Join the Network",
    description: "Provide care to veterans and military families through ValorWell.",
    cta: "Clinician Opportunities →",
    to: "/clinicians",
    event: "homepage_route_clinicians",
    icon: Users,
  },
] as const;

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-[#D7A92E]" : "text-[#3B5147]"}`}>
      {children}
    </p>
  );
}

function TrackedLink({
  to,
  event,
  children,
  className = "",
}: {
  to: string;
  event: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} onClick={() => trackHomeEvent(event)} className={className}>
      {children}
    </Link>
  );
}

function formatCompactImpactMonth(month: string) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(month);
  if (!match) return month;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));

  return `${monthName} ’${String(year).slice(-2)}`;
}

function ImpactChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const value = Number(payload[0]?.value);
  if (!Number.isFinite(value)) return null;

  return (
    <div className="rounded-md border border-white/20 bg-[#111814] px-3 py-2 shadow-lg">
      <p className="text-xs text-white/65">{formatCompactImpactMonth(String(label))}</p>
      <p className="mt-0.5 text-sm font-bold text-[#D7A92E]">
        {formatExactImpactValue(value)} <span className="font-normal text-white">displayed total</span>
      </p>
    </div>
  );
}

function FoundationImpactChart() {
  const [impactData, setImpactData] = useState<HomepageImpactPoint[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const isMobile = useIsMobile();

  useEffect(() => {
    let active = true;

    const loadImpactData = async () => {
      try {
        const { data, error } = await billingHubSupabase.rpc(
          "get_homepage_documented_monthly_impact",
        );
        if (!active) return;
        if (error) {
          setStatus("error");
          return;
        }

        const normalized = normalizeHomepageImpactRows(
          data as HomepageImpactRpcRow[] | null,
        );
        if (normalized.length === 0) {
          setStatus("error");
          return;
        }

        setImpactData(normalized);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    };

    void loadImpactData();
    return () => {
      active = false;
    };
  }, []);

  const yMax = Math.max(
    10,
    ...impactData.map((point) => point.displayedValue),
  ) + 8;

  return (
    <figure className="min-w-0 max-w-full overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-4 sm:p-6 md:p-8">
      <figcaption>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7A92E]">
          Care impact
        </p>
        <p className="mt-2 text-lg font-bold text-white">Monthly documented-care total</p>
        <p className="mt-2 text-xs leading-5 text-white/50">
          Each month&apos;s impact is calculated from the actual live numbers in our database. The chart refreshes at the beginning of each month.
        </p>
      </figcaption>

      {status === "loading" && (
        <div className="mt-6 flex h-72 items-center justify-center rounded-xl border border-white/10 bg-black/10 text-sm text-white/60" role="status">
          Loading monthly data…
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 flex h-72 items-center justify-center rounded-xl border border-white/10 bg-black/10 px-6 text-center text-sm text-white/60" role="status">
          Monthly chart data is temporarily unavailable.
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="mt-5 min-w-0 max-w-full overflow-hidden" aria-hidden="true">
            <div className="h-[280px] w-full min-w-0 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={impactData}
                  margin={{ top: isMobile ? 12 : 30, right: 4, left: isMobile ? -18 : -10, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    interval="preserveStartEnd"
                    minTickGap={isMobile ? 22 : 14}
                    tickFormatter={formatCompactImpactMonth}
                    height={36}
                    tick={{ fill: "rgba(255,255,255,0.68)", fontSize: isMobile ? 10 : 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, yMax]}
                    allowDecimals={false}
                    tickFormatter={(value: number) => formatExactImpactValue(value)}
                    width={42}
                    tickCount={5}
                    tick={{ fill: "rgba(255,255,255,0.55)", fontSize: isMobile ? 10 : 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    content={<ImpactChartTooltip />}
                  />
                  <Bar
                    dataKey="displayedValue"
                    name="Displayed total"
                    fill="#D7A92E"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={48}
                  >
                    {!isMobile && (
                      <LabelList
                        dataKey="displayedValue"
                        position="top"
                        fill="rgba(255,255,255,0.88)"
                        fontSize={11}
                        formatter={(value: number) => formatExactImpactValue(value)}
                      />
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <ul className="sr-only">
            {impactData.map((point) => (
              <li key={point.month}>
                {point.monthLabel}: {formatExactImpactValue(point.displayedValue)}.
              </li>
            ))}
          </ul>
        </>
      )}
    </figure>
  );
}

export default function HomePage() {
  const [thumbnailFallbackUsed, setThumbnailFallbackUsed] = useState(false);

  useEffect(() => {
    trackHomeEvent("homepage_view");
  }, []);

  return (
    <Layout>
      <SEO
        title="ValorWell | Turning VA Coverage Into Mental Health Care"
        description="Born from one military family's struggle to use CHAMPVA, ValorWell builds care pathways and Foundation support when coverage still does not produce treatment."
        canonical="/"
      />
      <OrganizationSchema />

      <div className="home-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .home-theme,
          .home-theme h1,
          .home-theme h2,
          .home-theme h3 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
        `}</style>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <Eyebrow>Founded by a military family who couldn&apos;t get their own kids seen</Eyebrow>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.04] sm:text-5xl md:text-6xl">
                The VA said our kids were covered. No one would take the coverage.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/72">
                We had CHAMPVA coverage through the VA and still couldn&apos;t find a therapist who would take it. So we built ValorWell to fix that. Then we found veterans facing the same wall in VA Community Care. When coverage still doesn&apos;t produce care, the ValorWell Foundation pays therapists directly.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <TrackedLink
                  to="/about"
                  event="homepage_hero_story"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#31443B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
                >
                  Read the Full Story <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  to="/get-care"
                  event="homepage_hero_care"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147] underline decoration-[#3B5147]/35 underline-offset-4 hover:decoration-[#3B5147] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
                >
                  Find Care <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedLink>
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-[#3B5147]/15 bg-white shadow-lg">
                <img
                  src={heroFamily}
                  alt="The ValorWell founding family together outdoors"
                  className="h-full w-full object-cover"
                  width="1536"
                  height="1024"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-12 text-center md:py-18 lg:py-20">
            <img
              src={homepageFixingBothSides.url}
              alt="ValorWell's three-part system: working inside VA coverage programs, funding therapy when coverage fails, and changing the system so the backup is needed less over time"
              className="mx-auto h-auto w-full max-w-7xl"
              width="1536"
              height="864"
              loading="eager"
              decoding="async"
            />
            <h2 className="mx-auto mt-8 max-w-5xl text-3xl font-bold leading-tight text-[#111814] md:text-5xl">
              No one else is fixing this from both sides — inside the VA&apos;s own coverage programs, and outside them when the system still fails.
            </h2>
            <TrackedLink
              to="/about"
              event="homepage_system_about"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#31443B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
            >
              Learn more about ValorWell&apos;s system <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TrackedLink>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-12 text-center md:py-20 lg:py-24">
            <img
              src={homepageThreeParts.url}
              alt="ValorWell model: VA coverage is made usable, the Foundation bridges structural gaps, and lessons from those gaps feed back into system change"
              className="mx-auto h-auto w-full max-w-[900px]"
              width="1198"
              height="1313"
              loading="lazy"
              decoding="async"
            />
            <div className="mt-8 text-center">
              <TrackedLink
                to="/how-it-works"
                event="homepage_model_how_it_works"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
              >
                Learn more about our model <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center">
            <div className="min-w-0 max-w-full lg:col-span-6">
              <Eyebrow light>Foundation Impact</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                The Foundation isn&apos;t a fund sitting in an account. It&apos;s therapy happening right now.
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/72">
                540+ hours of therapy funded. 100% of donations to the ValorWell Foundation go directly to therapists providing treatment; none of those donations go to ValorWell.
              </p>
              <p className="mt-4 text-sm font-bold text-[#D7A92E]">Snapshot through September 5, 2026.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <TrackedLink
                  to="/impact"
                  event="homepage_impact_detail"
                  className="inline-flex min-h-12 items-center rounded-md border border-white/35 px-5 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
                >
                  See Full Foundation Impact →
                </TrackedLink>
                <TrackedLink
                  to="/donate"
                  event="homepage_impact_donate"
                  className="inline-flex min-h-12 items-center rounded-md bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] hover:bg-[#e2b943] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
                >
                  Fund Veteran Therapy
                </TrackedLink>
              </div>
            </div>
            <div className="lg:col-span-6">
              <FoundationImpactChart />
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide grid items-center gap-12 py-16 md:py-24 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <a
                href={CURRENT_BTY_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackHomeEvent("homepage_bty_current_episode", { organization: "American Corporate Partners", video_id: CURRENT_BTY_VIDEO_ID })}
                className="group block overflow-hidden rounded-3xl border border-[#D7A92E]/30 bg-[#111814] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={thumbnailFallbackUsed ? CURRENT_BTY_THUMBNAIL_FALLBACK : CURRENT_BTY_THUMBNAIL}
                    onError={() => setThumbnailFallbackUsed(true)}
                    alt="American Corporate Partners Beyond The Yellow conversation"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" aria-hidden="true" />
                  <PlayCircle className="absolute left-5 top-5 h-11 w-11 text-white drop-shadow" aria-hidden="true" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D7A92E]">Current episode</p>
                    <p className="mt-2 text-2xl font-bold">American Corporate Partners</p>
                  </div>
                </div>
              </a>
            </div>
            <div className="lg:col-span-6">
              <Eyebrow>Beyond The Yellow</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Conversations with the people and organizations doing this work.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#111814]/70">
                Beyond The Yellow features real conversations with founders, veterans, and organizations worth knowing about — not polished PR, just people explaining what they actually do.
              </p>
              <TrackedLink
                to="/beyond-the-yellow"
                event="homepage_bty_explore"
                className="mt-8 inline-flex min-h-12 items-center rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
              >
                Explore Beyond The Yellow →
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container-wide py-16 md:py-24">
            <div className="max-w-4xl">
              <Eyebrow>Get Involved</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                However you can help, there&apos;s a specific way to start.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {involvementRoutes.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.to}
                    onClick={() => trackHomeEvent(item.event)}
                    className="group flex min-h-64 flex-col rounded-2xl border border-[#3B5147]/15 bg-[#F4F1E8] p-7 transition hover:-translate-y-1 hover:border-[#3B5147]/35 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
                    aria-label={`${item.title}: ${item.cta.replace(" →", "")}`}
                  >
                    <Icon className="h-8 w-8 text-[#3B5147]" aria-hidden="true" />
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">{item.audience}</p>
                    <h3 className="mt-2 text-2xl font-bold">{item.title}</h3>
                    <p className="mt-4 flex-1 leading-7 text-[#111814]/68">{item.description}</p>
                    <span className="mt-6 text-sm font-bold text-[#3B5147] underline decoration-transparent underline-offset-4 group-hover:decoration-[#3B5147]">
                      {item.cta}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}