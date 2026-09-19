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
      { name: "Support the Foundation", href: "/foundation" },
      { name: "Partner With ValorWell", href: "/partner" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-[hsl(var(--section-alt))]">
      <div className="container-wide py-14">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-5">
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
              ValorWell is a nationwide mental-health care platform for veterans and military families. The ValorWell Foundation is a separate organization that funds therapy for veterans who cannot reach care through the appropriate VA channels.
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
        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-start md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p>© {new Date().getFullYear()} ValorWell. All rights reserved.</p>
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
          <div className="max-w-3xl space-y-2">
            <p>
              ValorWell and the ValorWell Foundation are separate organizations. 100% of donations to the ValorWell Foundation go directly to qualified mental-health therapists providing treatment to veterans; none of those donations go to ValorWell.
            </p>
            <p>
              Care and coverage pathways are subject to eligibility or authorization, clinician licensure, availability, capacity, and clinical fit. ValorWell does not control VA authorization or disability outcomes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
