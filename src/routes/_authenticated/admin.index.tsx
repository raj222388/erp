import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Newspaper, Calendar, Images, Building2, MessageSquare, Star, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

async function count(table: string) {
  const { count } = await (supabase as any).from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const [teachers, news, events, images, facilities, testimonials, messages] = await Promise.all([
        count("teachers"), count("news"), count("events"),
        count("gallery_images"), count("facilities"), count("testimonials"),
        count("contact_messages"),
      ]);
      return { teachers, news, events, images, facilities, testimonials, messages };
    },
  });

  const cards = [
    { label: "Teachers", value: stats?.teachers, icon: Users, to: "/admin/teachers", color: "bg-primary text-primary-foreground" },
    { label: "News articles", value: stats?.news, icon: Newspaper, to: "/admin/news", color: "bg-gold text-gold-foreground" },
    { label: "Events", value: stats?.events, icon: Calendar, to: "/admin/events", color: "bg-primary text-primary-foreground" },
    { label: "Gallery images", value: stats?.images, icon: Images, to: "/admin/gallery", color: "bg-gold text-gold-foreground" },
    { label: "Facilities", value: stats?.facilities, icon: Building2, to: "/admin/settings", color: "bg-primary text-primary-foreground" },
    { label: "Testimonials", value: stats?.testimonials, icon: Star, to: "/admin/testimonials", color: "bg-gold text-gold-foreground" },
    { label: "Messages", value: stats?.messages, icon: MessageSquare, to: "/admin/messages", color: "bg-primary text-primary-foreground" },
  ] as const;

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="text-muted-foreground mt-1">Welcome back. Here's your site at a glance.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card-soft p-6 hover:shadow-elevated transition">
            <div className={`h-10 w-10 rounded-xl grid place-items-center ${c.color}`}><c.icon size={18} /></div>
            <div className="mt-4 font-display text-3xl">{c.value ?? "—"}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 card-soft p-6">
        <h2 className="font-display text-xl">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/admin/news" className="btn-primary text-sm !py-2 !px-4"><Plus size={14} /> New article</Link>
          <Link to="/admin/events" className="btn-primary text-sm !py-2 !px-4"><Plus size={14} /> New event</Link>
          <Link to="/admin/teachers" className="btn-primary text-sm !py-2 !px-4"><Plus size={14} /> Add teacher</Link>
          <Link to="/admin/hero" className="btn-primary text-sm !py-2 !px-4"><Plus size={14} /> Add hero slide</Link>
          <Link to="/admin/settings" className="btn-outline text-sm !py-2 !px-4">Edit site settings</Link>
        </div>
      </div>
    </div>
  );
}
