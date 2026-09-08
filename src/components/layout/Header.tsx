import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const primary = [
  { name: "About", href: "/about" },
  { name: "Impact", href: "/impact" },
  { name: "Beyond The Yellow", href: "/beyond-the-yellow" },
  { name: "Resources", href: "/resources" },
];

const getInvolved = [
  { name: "Clinicians", href: "/clinicians" },
  { name: "Partner With ValorWell", href: "/partner" },
  { name: "Watch", href: "/watch" },
  { name: "Contact", href: "/contact" },
];

const loginLinks = [
  { name: "Client", href: "https://client.valorwell.org" },
  { name: "Clinician", href: "https://emr.valorwell.org" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileGI, setMobileGI] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileLogin, setMobileLogin] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
    setLoginOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
        setLoginOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setLoginOpen(false);
      }
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isActive = (href: string) =>
    location.pathname === href ||
    (href === "/resources" && location.pathname.startsWith("/resources/"));

  const focusClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav
        className="container-wide flex h-16 items-center justify-between gap-4"
        aria-label="Primary"
      >
        <Link
          to="/"
          className={cn(
            "inline-flex min-h-11 items-center gap-2 text-lg font-bold tracking-tight text-foreground",
            focusClass,
          )}
          aria-label="ValorWell home"
        >
          <img
            src="/brand/valorwell-logo.png"
            alt="ValorWell"
            className="h-8 w-auto"
          />
          <span>VALORWELL</span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-4">
          {primary.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "inline-flex min-h-11 items-center whitespace-nowrap px-1 text-sm font-medium transition-colors hover:text-foreground",
                isActive(item.href) ? "text-foreground" : "text-muted-foreground",
                focusClass,
              )}
            >
              {item.name}
            </Link>
          ))}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={cn(
                "inline-flex min-h-11 items-center gap-1 px-1 text-sm font-medium text-muted-foreground hover:text-foreground",
                focusClass,
              )}
            >
              Get Involved <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-64 rounded-md border border-border bg-popover p-1 shadow-lg"
              >
                {getInvolved.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    role="menuitem"
                    className="flex min-h-11 items-center rounded px-3 py-2 text-sm text-foreground hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <Link
            to="/get-care"
            className="ml-1 inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Find Care
          </Link>

          <div className="relative" ref={loginRef}>
            <button
              type="button"
              onClick={() => setLoginOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={loginOpen}
              className={cn(
                "inline-flex min-h-11 items-center gap-1 px-2 text-sm font-medium text-muted-foreground hover:text-foreground",
                focusClass,
              )}
            >
              Login <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
            {loginOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-popover p-1 shadow-lg"
              >
                {loginLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    role="menuitem"
                    className="flex min-h-11 items-center rounded px-3 py-2 text-sm text-foreground hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="-mr-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open ? (
        <div id="mobile-menu" className="border-t border-border bg-background lg:hidden">
          <div className="container-wide space-y-1 py-4">
            {primary.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex min-h-11 items-center rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted",
                  focusClass,
                )}
              >
                {item.name}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setMobileGI((value) => !value)}
              aria-expanded={mobileGI}
              className={cn(
                "flex min-h-11 w-full items-center justify-between rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted",
                focusClass,
              )}
            >
              Get Involved
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  mobileGI && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            {mobileGI ? (
              <div className="pl-3">
                {getInvolved.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex min-h-11 items-center rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                      focusClass,
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ) : null}

            <Link
              to="/get-care"
              className="mt-3 flex min-h-11 items-center justify-center rounded-md bg-primary px-3 py-3 text-center text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Find Care
            </Link>

            <button
              type="button"
              onClick={() => setMobileLogin((value) => !value)}
              aria-expanded={mobileLogin}
              className={cn(
                "mt-1 flex min-h-11 w-full items-center justify-between rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                focusClass,
              )}
            >
              Login
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  mobileLogin && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            {mobileLogin ? (
              <div className="pl-3">
                {loginLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex min-h-11 items-center rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                      focusClass,
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
