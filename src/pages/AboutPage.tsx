import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { BreadcrumbSchema, SEO } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

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
    <Link
      to={to}
      onClick={() => trackHomeEvent(event, { page: "about" })}
      className={className}
    >
      {children}
    </Link>
  );
}

const timeline = [
  {
    year: "2023",
    title: "We couldn't get CHAMPVA-covered care for our own family.",
    body: "The coverage existed, but provider after provider would not take it.",
  },
  {
    year: "2023",
    title: "ValorWell started by making that coverage usable.",
    body: "We built the therapist network and the operational and billing infrastructure around CHAMPVA.",
  },
  {
    year: "2024",
    title: "We started trying to integrate with VA Community Care.",
    body: "The difficulty exposed gaps that better paperwork and better navigation alone could not solve.",
  },
  {
    year: "Now",
    title: "We work inside the system and bridge the gaps it still leaves.",
    body: "ValorWell works to make VA-related coverage usable, while the Foundation pays for therapy when the existing pathway still fails.",
  },
] as const;

export default function AboutPage() {
  useEffect(() => {
    trackHomeEvent("about_page_view", { page: "about" });
  }, []);

  return (
    <Layout>
      <SEO
        title="Our Story | About ValorWell"
        description="ValorWell began after one military family could not turn CHAMPVA coverage into actual mental-health care. This is how that experience became a care platform and the ValorWell Foundation."
        canonical="/about"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Our Story", url: "/about" },
        ]}
      />

      <div className="about-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .about-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .about-theme h1,
          .about-theme h2,
          .about-theme h3 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8]">
          <div className="container-wide py-20 md:py-28 lg:py-32">
            <div className="max-w-5xl">
              <Eyebrow>Our Story</Eyebrow>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl">
                We built this because we couldn&apos;t get our own kids seen.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
                This is the short version. It&apos;s still true in every detail.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-16 md:py-24">
            <article className="mx-auto max-w-3xl space-y-7 text-[1.05rem] leading-8 text-[#111814]/76 md:text-lg md:leading-9">
              <p>
                In 2023, my family had CHAMPVA coverage through the VA and needed mental-health care for our kids. We learned very quickly that having coverage did not mean we could actually use it.
              </p>

              <p>
                Provider after provider told us they did not take CHAMPVA. The reasons were real and repetitive: too much paperwork, reimbursement rates that were too low, credentialing that moved too slowly. Every explanation made sense from the provider&apos;s side. None of it changed the fact that our kids still needed care.
              </p>

              <p className="border-l-4 border-[#D7A92E] pl-6 text-xl font-bold leading-8 text-[#111814] md:text-2xl md:leading-9">
                The VA had done its part on paper. The coverage existed. But coverage that no one will accept isn&apos;t coverage. It&apos;s a document.
              </p>

              <p>
                So I started building what we could not find. In 2023, ValorWell began with a straightforward goal: find therapists willing to take CHAMPVA and build the operational and billing infrastructure that made it workable for both the family and the provider.
              </p>

              <p>
                At first, this was a solution to the problem sitting directly in front of us. Then we found out it was not just our family.
              </p>

              <p>
                Other CHAMPVA families were hitting the same wall. The problem was not that the benefit did not exist. The problem was that the systems around the benefit made it difficult for providers to participate and difficult for families to turn coverage into an appointment.
              </p>

              <p>
                By that point, the story had stopped being only mine. ValorWell had become a team, and the work had become bigger than one family. We had learned how to make one VA-related coverage pathway more usable, so we started asking whether the same approach could help veterans using VA Community Care.
              </p>

              <p>
                In 2024, we started trying to integrate with VA Community Care, or VACCN. Veterans could be authorized for outside care and still struggle to get an appointment. Therapists were dealing with many of the same kinds of friction we had already seen: credentialing, reimbursement, paperwork, and operational complexity on the provider side of the system.
              </p>

              <p>
                We kept working on it. But VACCN proved much harder to integrate with than CHAMPVA. That taught us something important: some gaps can be fixed by building better infrastructure around the coverage. Some gaps are in the design of the system itself.
              </p>

              <p>
                That distinction changed the model. If the gap was operational, ValorWell could work inside the existing coverage system and make it easier to use. But if a veteran was still unable to reach treatment because the existing system had not produced care, we needed a way to keep that person from simply waiting while the larger problem remained unresolved.
              </p>

              <p>
                That is why we started the ValorWell Foundation. It is not meant to replace VA coverage or build a parallel system for everyone. It exists to bridge the gap when a veteran who should have access to care still cannot get seen. The Foundation pays qualified therapists directly so treatment can happen while the harder problem is still being worked on.
              </p>

              <p>
                Today, the model works from both directions. ValorWell works inside VA-related coverage systems to make the care the VA says is available actually usable. The Foundation covers therapy when those systems still leave a veteran without treatment. And what we learn from both sides helps us understand where the system itself still needs to change.
              </p>

              <p className="text-xl font-bold leading-8 text-[#3B5147] md:text-2xl md:leading-9">
                We started by trying to make VA coverage work. We ended up building a system for what happens when it does — and when it doesn&apos;t.
              </p>
            </article>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#111814] text-white">
          <div className="container-wide py-16 md:py-24">
            <div className="max-w-3xl">
              <Eyebrow light>The Story, at a Glance</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                One problem kept revealing the next one.
              </h2>
            </div>

            <ol className="relative mt-12 grid gap-6 md:grid-cols-4 md:gap-4">
              <div
                className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-white/20 md:block"
                aria-hidden="true"
              />
              {timeline.map((item) => (
                <li key={`${item.year}-${item.title}`} className="relative">
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#D7A92E] bg-[#111814] text-xs font-bold text-[#D7A92E]">
                    {item.year === "Now" ? "•" : item.year.slice(-2)}
                  </div>
                  <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-[#D7A92E]">
                    {item.year}
                  </p>
                  <h3 className="mt-3 text-xl font-bold leading-7 text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-[#F4F1E8]">
          <div className="container-wide py-16 text-center md:py-24">
            <div className="mx-auto max-w-4xl">
              <Eyebrow>The Model</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                We started by trying to make VA coverage usable. Here&apos;s how the full model fits together.
              </h2>
              <TrackedLink
                to="/how-it-works"
                event="about_how_it_works"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#3B5147] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#31443B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2"
              >
                See How It Works <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
