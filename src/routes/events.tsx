import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { eventsQuery } from "@/lib/queries";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Greenfield Academy" },
      { name: "description", content: "Upcoming events, ceremonies and activities at Greenfield Academy." },
      { property: "og:title", content: "Events — Greenfield Academy" },
      { property: "og:description", content: "Upcoming and past events at Greenfield." },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(eventsQuery); return null; },
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [] } = useQuery(eventsQuery);
  const upcoming = events.filter((e) => !e.is_archived);
  const past = events.filter((e) => e.is_archived);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-24">
          <div className="eyebrow text-gold">Events</div>
          <h1 className="font-display text-5xl md:text-6xl mt-3">What's coming up</h1>
        </div>
      </section>
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e) => (
            <div key={e.id} className="card-soft overflow-hidden">
              {e.poster_url && <img src={e.poster_url} alt="" className="w-full aspect-video object-cover" />}
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gold font-semibold">
                  <Calendar size={14} />
                  {e.event_date && new Date(e.event_date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </div>
                <h3 className="mt-2 font-display text-xl">{e.title}</h3>
                {e.venue && <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1"><MapPin size={13} /> {e.venue}</div>}
                {e.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{e.description}</p>}
              </div>
            </div>
          ))}
          {upcoming.length === 0 && <p className="text-muted-foreground">No upcoming events.</p>}
        </div>

        {past.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl">Past events</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <div key={e.id} className="card-soft p-5 opacity-70">
                  <div className="text-xs text-muted-foreground">
                    {e.event_date && new Date(e.event_date).toLocaleDateString()}
                  </div>
                  <h3 className="mt-1 font-semibold">{e.title}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
