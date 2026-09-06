import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO, BreadcrumbSchema, FAQSchema } from "@/components/SEO";
import { Button } from "@/components/ui/button";

export interface AuthoritySection {
  heading: string;
  body?: ReactNode;
  cards?: { title: string; body?: string }[];
  bullets?: string[];
  columns?: { title: string; bullets: string[] }[];
}

export interface AuthorityCTA {
  label: string;
  to: string;
  variant?: "primary" | "secondary";
}

export interface AuthorityPageProps {
  title: string;
  description: string;
  canonical: string;
  breadcrumbs: { name: string; url: string }[];
  eyebrow?: string;
  h1: string;
  subhead: string;
  lastReviewed?: string;
  sourceNote?: ReactNode;
  heroCTAs?: AuthorityCTA[];
  sections: AuthoritySection[];
  faqs?: { question: string; answer: string }[];
  related?: { name: string; href: string; body?: string }[];
  finalCTAs?: AuthorityCTA[];
  finalNote?: ReactNode;
}

function CTAButton({ cta }: { cta: AuthorityCTA }) {
  const primary = cta.variant !== "secondary";
  return (
    <Button
      asChild
      size="lg"
      className={
        primary
          ? "bg-[#3B5147] text-white hover:bg-[#31443B]"
          : "border border-[#3B5147]/30 bg-transparent text-[#3B5147] hover:bg-[#3B5147] hover:text-white"
      }
      variant={primary ? "default" : "outline"}
    >
      <Link to={cta.to}>{cta.label}</Link>
    </Button>
  );
}

export function AuthorityPage(p: AuthorityPageProps) {
  return (
    <Layout>
      <SEO title={p.title} description={p.description} canonical={p.canonical} />
      <BreadcrumbSchema items={p.breadcrumbs} />
      {p.faqs && p.faqs.length > 0 && <FAQSchema faqs={p.faqs} />}

      <div className="bg-[#F4F1E8] text-[#111814]">
        <section className="border-b border-[#3B5147]/15 bg-[#F4F1E8] py-14 md:py-20">
          <div className="container-narrow">
            {p.eyebrow && (
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
                {p.eyebrow}
              </p>
            )}
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-[#111814] md:text-6xl">
              {p.h1}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#111814]/68 md:text-xl">
              {p.subhead}
            </p>

            {(p.lastReviewed || p.sourceNote) && (
              <div className="mt-7 max-w-3xl border-l-4 border-[#D7A92E] pl-4 text-sm leading-6 text-[#111814]/60">
                {p.lastReviewed && <p><strong>Last reviewed:</strong> {p.lastReviewed}</p>}
                {p.sourceNote && <div className={p.lastReviewed ? "mt-1" : ""}>{p.sourceNote}</div>}
              </div>
            )}

            {p.heroCTAs && p.heroCTAs.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {p.heroCTAs.map((c) => (
                  <CTAButton key={c.label} cta={c} />
                ))}
              </div>
            )}
          </div>
        </section>

        {p.sections.map((s, i) => (
          <section
            key={i}
            className={`border-b border-[#3B5147]/12 py-12 md:py-16 ${
              i % 2 === 0 ? "bg-white" : "bg-[#F4F1E8]"
            }`}
          >
            <div className="container-narrow">
              <h2 className="mb-5 text-2xl font-bold text-[#111814] md:text-4xl">{s.heading}</h2>
              {s.body && (
                <div className="max-w-3xl space-y-4 text-base leading-7 text-[#111814]/72 md:text-lg md:leading-8">
                  {typeof s.body === "string" ? <p>{s.body}</p> : s.body}
                </div>
              )}
              {s.bullets && (
                <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-[#111814]/72">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {s.cards && (
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {s.cards.map((c) => (
                    <article key={c.title} className="rounded-2xl border border-[#3B5147]/15 bg-[#F4F1E8] p-6">
                      <h3 className="font-bold text-[#111814]">{c.title}</h3>
                      {c.body && <p className="mt-2 text-sm leading-6 text-[#111814]/62">{c.body}</p>}
                    </article>
                  ))}
                </div>
              )}
              {s.columns && (
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  {s.columns.map((col) => (
                    <article key={col.title} className="rounded-2xl border border-[#3B5147]/15 bg-[#F4F1E8] p-6">
                      <h3 className="font-bold text-[#111814]">{col.title}</h3>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#111814]/68">
                        {col.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}

        {p.faqs && p.faqs.length > 0 && (
          <section className="border-b border-[#3B5147]/12 bg-white py-12 md:py-16">
            <div className="container-narrow">
              <h2 className="mb-7 text-2xl font-bold text-[#111814] md:text-4xl">Frequently asked questions</h2>
              <div className="max-w-3xl space-y-6">
                {p.faqs.map((f) => (
                  <div key={f.question} className="border-b border-[#3B5147]/12 pb-6 last:border-b-0">
                    <h3 className="font-bold text-[#111814]">{f.question}</h3>
                    <p className="mt-2 whitespace-pre-line leading-7 text-[#111814]/68">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {p.related && p.related.length > 0 && (
          <section className="border-b border-[#3B5147]/12 bg-[#F4F1E8] py-12 md:py-16">
            <div className="container-narrow">
              <h2 className="mb-7 text-2xl font-bold text-[#111814] md:text-4xl">Related resources</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {p.related.map((r) => (
                  <Link
                    key={r.href}
                    to={r.href}
                    className="block rounded-2xl border border-[#3B5147]/15 bg-white p-6 transition hover:border-[#3B5147]/35"
                  >
                    <div className="font-bold text-[#3B5147]">{r.name}</div>
                    {r.body && <p className="mt-2 text-sm leading-6 text-[#111814]/62">{r.body}</p>}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {(p.finalCTAs || p.finalNote) && (
          <section className="bg-white py-14 md:py-20">
            <div className="container-narrow">
              {p.finalCTAs && (
                <div className="mb-5 flex flex-wrap gap-3">
                  {p.finalCTAs.map((c) => (
                    <CTAButton key={c.label} cta={c} />
                  ))}
                </div>
              )}
              {p.finalNote && (
                <div className="max-w-3xl text-sm leading-6 text-[#111814]/58">{p.finalNote}</div>
              )}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export const CRISIS_NOTE =
  "If you are in immediate danger or crisis, call 911, go to the nearest emergency room, or contact the Veterans Crisis Line by dialing 988 then pressing 1.";
