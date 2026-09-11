import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  HeartHandshake,
  Mail,
  Network,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO, BreadcrumbSchema } from "@/components/SEO";
import { trackHomeEvent } from "@/lib/tracking";

type RouteCard = {
  title: string;
  copy: string;
  to: string;
  event: string;
  Icon: LucideIcon;
};

const routes: RouteCard[] = [
  {
    title: "I need mental health care",
    copy: "See the care pathways ValorWell currently supports.",
    to: "/get-care",
    event: "contact_route_care",
    Icon: Stethoscope,
  },
  {
    title: "I'm a clinician",
    copy: "Review the clinician contract model, requirements, pay, scheduling, and application path.",
    to: "/clinicians",
    event: "contact_route_clinician",
    Icon: Users,
  },
  {
    title: "I represent an organization or want to collaborate",
    copy: "Start with the organizational partnership path for introductions, referrals, shared resources, storytelling, or infrastructure collaboration.",
    to: "/partner",
    event: "contact_route_partner",
    Icon: Building2,
  },
  {
    title: "I want to share or nominate a Beyond The Yellow story",
    copy: "Tell ValorWell about a person or organization whose work may fit a Beyond The Yellow conversation or feature.",
    to: "/beyond-the-yellow",
    event: "contact_route_bty",
    Icon: HeartHandshake,
  },
  {
    title: "I'm looking for organizations or resources",
    copy: "Browse organizations with published Beyond The Yellow feature pages.",
    to: "/network",
    event: "contact_route_network",
    Icon: Network,
  },
  {
    title: "I want to support ValorWell financially",
    copy: "See how the ValorWell Foundation's donor-funded therapy program works and review the current impact snapshot.",
    to: "/impact",
    event: "contact_route_support",
    Icon: HeartHandshake,
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
      {children}
    </p>
  );
}

export default function Contact() {
  useEffect(() => {
    trackHomeEvent("contact_page_view", { page: "contact" });
  }, []);

  return (
    <Layout>
      <SEO
        title="Contact ValorWell | Find the Right Place to Start"
        description="Find the right ValorWell path for mental health care, clinicians, organizational partnerships, Beyond The Yellow stories, community resources, financial support, or general questions."
        canonical="/contact"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />

      <div className="contact-theme bg-[#F4F1E8] text-[#111814]">
        <style>{`
          .contact-theme {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          }
          .contact-theme h1,
          .contact-theme h2,
          .contact-theme h3 {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            letter-spacing: -0.025em;
          }
        `}</style>

        <section className="relative overflow-hidden border-b border-[#3B5147]/15">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-[#D7A92E]/[0.08] blur-3xl" />
            <div className="absolute -bottom-36 -left-28 h-80 w-80 rounded-full bg-[#3B5147]/[0.07] blur-3xl" />
          </div>

          <div className="container-wide relative py-16 text-center md:py-24 lg:py-28">
            <Eyebrow>Contact ValorWell</Eyebrow>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.04] sm:text-5xl md:text-6xl">
              Start with why you are here.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#111814]/68 md:text-xl">
              Most questions have a better destination than a generic inbox. Pick the closest path and we will get you to the part of ValorWell built for it.
            </p>
          </div>
        </section>

        <section className="border-b border-[#3B5147]/15 bg-white">
          <div className="container-wide py-16 md:py-24">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {routes.map(({ title, copy, to, event, Icon }) => (
                <Link
                  key={title}
                  to={to}
                  onClick={() => trackHomeEvent(event, { page: "contact" })}
                  className="group rounded-2xl border border-[#3B5147]/15 bg-[#F4F1E8] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3B5147]/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <Icon className="h-6 w-6 text-[#3B5147]" aria-hidden="true" />
                  <h2 className="mt-5 text-xl font-bold leading-snug">{title}</h2>
                  <p className="mt-3 leading-7 text-[#111814]/62">{copy}</p>
                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B5147]">
                    Go to the right place
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#111814] text-white">
          <div className="container-wide py-16 text-center md:py-20">
            <Mail className="mx-auto h-8 w-8 text-[#D7A92E]" aria-hidden="true" />
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
              None of those fit?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/65">
              For a general question, media inquiry, introduction, or something that does not clearly belong in one of the routes above, email ValorWell directly.
            </p>
            <a
              href="mailto:info@valorwell.org"
              onClick={() => trackHomeEvent("contact_general_email", { page: "contact" })}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#111814]"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              info@valorwell.org
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
