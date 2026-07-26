import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { newsQuery } from "@/lib/queries";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News — Greenfield Academy" },
      { name: "description", content: "Latest news, updates and announcements from Greenfield Academy." },
      { property: "og:title", content: "News — Greenfield Academy" },
      { property: "og:description", content: "Latest news and announcements." },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(newsQuery); return null; },
  component: NewsPage,
});

function NewsPage() {
  const { data: news = [] } = useQuery(newsQuery);
  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-24">
          <div className="eyebrow text-gold">News</div>
          <h1 className="font-display text-5xl md:text-6xl mt-3">Latest updates</h1>
        </div>
      </section>
      <section className="container-page py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <article key={n.id} className="card-soft overflow-hidden group">
              {n.cover_image_url && (
                <div className="aspect-video overflow-hidden">
                  <img src={n.cover_image_url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="p-6">
                <div className="text-xs text-muted-foreground">
                  {n.published_at && new Date(n.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </div>
                <h3 className="font-display text-xl mt-2">{n.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{n.excerpt}</p>
              </div>
            </article>
          ))}
          {news.length === 0 && <p className="text-muted-foreground">No news posted yet.</p>}
        </div>
      </section>
      <Footer />
    </div>
  );
}
