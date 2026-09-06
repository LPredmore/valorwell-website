import { Link } from "react-router-dom";

const groups: { title: string; links: { name: string; href: string }[] }[] = [
  {
    title: "ValorWell",
    links: [
      { name: "About", href: "/about" },
      { name: "Mission", href: "/mission" },
      { name: "Impact", href: "/impact" },
      { name: "Resources", href: "/resources" },
    ],
  },
  {
    title: "Care",
    links: [
      { name: "Find Care", href: "/get-care" },
      { name: "Clinicians", href: "/clinicians" },
      { name: "CHAMPVA Resources", href: "/resources/champva" },
      { name: "VA Community Care Resources", href: "/resources/va-community-care" },
    ],
  },
  {
    title: "Beyond The Yellow",
    links: [
      { name: "Beyond The Yellow", href: "/beyond-the-yellow" },
      { name: "Featured Organizations", href: "/network" },
      { name: "Watch", href: "/watch" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { name: "Partner With ValorWell", href: "/partner" },
      { name: "Support ValorWell", href: "/support" },
      { name: "Share a Story", href: "/beyond-the-yellow" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [{ name: "Privacy", href: "/privacy" }],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-[hsl(var(--section-alt))]">
      <div className="container-wide py-14">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-6">
          <div className="md:col-span-3 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 text-lg font-bold tracking-tight text-foreground"
              aria-label="ValorWell home"
            >
              <img
                src="/brand/valorwell-logo.png"
                alt="ValorWell"
                className="h-9 w-auto"
              />
              <span className="sr-only">ValorWell</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              Mental health care and support for veterans and military families, donor-funded therapy, and Beyond The Yellow.
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {group.title}
              </h3>
              <ul className="mt-3">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.name}`}>
                    <Link
                      to={link.href}
                      className="inline-flex min-h-11 items-center py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} ValorWell. All rights reserved.</p>
          <p className="max-w-3xl">
            Care and coverage pathways are subject to eligibility or authorization, clinician licensure, availability, capacity, and clinical fit. ValorWell does not control VA authorization or disability outcomes.
          </p>
        </div>
      </div>
    </footer>
  );
}
