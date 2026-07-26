import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/queries";
import { Facebook, Instagram, Twitter, Youtube, Linkedin, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  const { data: s } = useQuery(settingsQuery);
  const socials = [
    { url: s?.facebook_url, Icon: Facebook, label: "Facebook" },
    { url: s?.instagram_url, Icon: Instagram, label: "Instagram" },
    { url: s?.twitter_url, Icon: Twitter, label: "Twitter" },
    { url: s?.youtube_url, Icon: Youtube, label: "YouTube" },
    { url: s?.linkedin_url, Icon: Linkedin, label: "LinkedIn" },
  ].filter((x) => x.url);

  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container-page py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-2xl font-semibold">{s?.school_name ?? "Greenfield Academy"}</div>
          {s?.motto && <div className="opacity-80 mt-2 text-sm">{s.motto}</div>}
          {s?.footer_text && <p className="opacity-70 mt-4 text-sm leading-relaxed">{s.footer_text}</p>}
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-widest opacity-70 mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/teachers" className="hover:text-gold">Teachers</Link></li>
            <li><Link to="/gallery" className="hover:text-gold">Gallery</Link></li>
            <li><Link to="/news" className="hover:text-gold">News</Link></li>
            <li><Link to="/events" className="hover:text-gold">Events</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-widest opacity-70 mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            {s?.address && <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 opacity-70" />{s.address}</li>}
            {s?.phone && <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 opacity-70" />{s.phone}</li>}
            {s?.email && <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 opacity-70" />{s.email}</li>}
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-widest opacity-70 mb-4">Follow</h4>
          <div className="flex gap-2">
            {socials.map(({ url, Icon, label }) => (
              <a
                key={label}
                href={url!}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="h-9 w-9 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-gold-foreground hover:border-gold transition"
              >
                <Icon size={16} />
              </a>
            ))}
            {socials.length === 0 && <span className="text-xs opacity-60">Add social links in admin</span>}
          </div>
          <div className="mt-6 text-xs opacity-60">
            <Link to="/auth" className="hover:text-gold">Admin</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-page py-5 text-xs opacity-70 text-center">
          {s?.copyright ?? `© ${new Date().getFullYear()} Greenfield Academy. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
