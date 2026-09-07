import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowUpRight, Building2, PlayCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const organizations = [
  {
    organization: "Veterans Breakfast Club",
    title: "Some veterans carry a story for decades. Sometimes the right room is what finally lets it out.",
    videoId: "A4CUe3c8rJE",
    videoUrl: "https://www.youtube.com/watch?v=A4CUe3c8rJE",
    featureUrl: "/veteransbreakfastclub",
    description:
      "Shaun Hall on active listening, the stories veterans sometimes never tell their own families, and how Veterans Breakfast Club creates low-pressure spaces where those stories can be heard.",
  },
  {
    organization: "GallantFew",
    title: "The mission ends. The need for direction doesn’t.",
    videoId: "zsaTKjNVeew",
    videoUrl: "https://www.youtube.com/watch?v=zsaTKjNVeew",
    featureUrl: "/gallantfew",
    description:
      "Karl Monger on what happens when military structure, identity, accountability, and mission disappear—and how veterans can deliberately build what comes next.",
  },
  {
    organization: "VETS2INDUSTRY",
    title: "The resources exist. The problem is knowing where to find them.",
    videoId: "iVDPZL_PEWo",
    videoUrl: "https://www.youtube.com/watch?v=iVDPZL_PEWo",
    featureUrl: "/vets2industry",
    description:
      "Matthew Philip Wee on why veterans need more than a list of resources—they need context, trusted connections, and a path toward what is useful.",
  },
  {
    organization: "Military Missions in Action",
    title: "Practical help should change what a veteran can do tomorrow.",
    videoId: "19JpCgF-d9Q",
    videoUrl: "https://www.youtube.com/watch?v=19JpCgF-d9Q",
    featureUrl: "/mmia",
    description:
      "Zak Keisler on veteran support ranging from accessibility projects and furnished homes to transportation and essential supplies.",
  },
  {
    organization: "Veterans Outreach of Wisconsin",
    title: "A tiny home is the beginning. The work continues from there.",
    videoId: "hLvZfGcycOQ",
    videoUrl: "https://www.youtube.com/watch?v=hLvZfGcycOQ",
    featureUrl: "/VOW",
    description:
      "John Shaw on housing, food access, community, peer support, and helping veterans rebuild stability after the immediate crisis.",
  },
  {
    organization: "American Corporate Partners",
    title: "A year of career mentorship. Built around the person, not a template.",
    videoId: "JHuLEqw2yG8",
    videoUrl: "https://www.youtube.com/watch?v=JHuLEqw2yG8",
    featureUrl: "/americancorporatepartners",
    description:
      "A Beyond The Yellow conversation about ACP's yearlong one-on-one mentorship model for transitioning service members, veterans, and active-duty military spouses.",
  },
];

function OrganizationCard({
  organization,
  title,
  videoId,
  videoUrl,
  featureUrl,
  description,
}: (typeof organizations)[number]) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#3B5147]/15 bg-white shadow-sm">
      <Link
        to={featureUrl}
        className="group block overflow-hidden bg-black"
        aria-label={`Explore ${organization}`}
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt={`${organization} Beyond The Yellow feature`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/20" aria-hidden="true" />
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6814]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Beyond The Yellow
        </div>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-[#111814]">
          {organization}
        </h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#111814]/78">
          {title}
        </p>
        <p className="mt-4 text-sm leading-7 text-[#111814]/62">{description}</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to={featureUrl}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#3B5147]"
          >
            Read feature
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#111814]/55 transition hover:text-[#111814]"
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            Watch conversation
          </a>
        </div>
      </div>
    </article>
  );
}

export default function NetworkPage() {
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
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D7A92E]">
              Beyond The Yellow
            </p>
            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
              Featured organizations.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/72">
              Explore the organizations already featured through Beyond The Yellow, read their stories, and watch the conversations about how their work operates.
            </p>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
                Current Features
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111814] md:text-4xl">
                Published Beyond The Yellow feature pages.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#111814]/62">
                This page is a collection of published Beyond The Yellow features, not a comprehensive directory of veteran-service organizations.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {organizations.map((organization) => (
                <OrganizationCard key={organization.organization} {...organization} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F4F1E8] py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3B5147]">
              Submit a Story
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[#111814] md:text-5xl">
              Know an organization or person that may be a fit for Beyond The Yellow?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#111814]/62">
              Use the Beyond The Yellow page to share your work or nominate someone else for editorial consideration.
            </p>
            <Link
              to="/beyond-the-yellow"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#3B5147] px-5 py-3 text-sm font-bold text-white"
            >
              Explore Beyond The Yellow
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
