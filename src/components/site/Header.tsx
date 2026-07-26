import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/queries";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/teachers", label: "Teachers" },
  { to: "/gallery", label: "Gallery" },
  { to: "/news", label: "News" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: s } = useQuery(settingsQuery);
  const name = s?.school_name ?? "Greenfield Academy";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      {s?.announcement_active && s.announcement_bar && (
        <div className="bg-primary text-primary-foreground text-center text-xs md:text-sm py-2 px-4">
          {s.announcement_bar}
        </div>
      )}
      <div className="container-page flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          {s?.logo_url ? (
            <img src={s.logo_url} alt={name} className="h-10 w-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-display font-bold shrink-0">
              {name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold text-ink truncate">{name}</div>
            {s?.motto && <div className="text-xs text-muted-foreground truncate hidden sm:block">{s.motto}</div>}
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground rounded-md transition-colors"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <Link to="/contact" className="btn-gold ml-3">Apply Now</Link>
        </nav>

        <button
          className="lg:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-page py-3 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted"
                activeProps={{ className: "text-primary bg-muted" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="btn-gold mt-2">Apply Now</Link>
          </div>
        </div>
      )}
    </header>
  );
}
