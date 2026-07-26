import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { albumsQuery } from "@/lib/queries";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Greenfield Academy" },
      { name: "description", content: "Photo albums from festivals, sports, cultural programs and school life at Greenfield." },
      { property: "og:title", content: "Gallery — Greenfield Academy" },
      { property: "og:description", content: "Photo albums and school life at Greenfield Academy." },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(albumsQuery); return null; },
  component: GalleryPage,
});

function GalleryPage() {
  const { data: albums = [] } = useQuery(albumsQuery);
  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-24">
          <div className="eyebrow text-gold">Gallery</div>
          <h1 className="font-display text-5xl md:text-6xl mt-3">Moments from campus</h1>
        </div>
      </section>
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <div key={a.id} className="card-soft overflow-hidden group cursor-pointer">
              <div className="aspect-[4/3] bg-secondary overflow-hidden">
                {a.cover_image_url ? (
                  <img src={a.cover_image_url} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/10 to-gold/20" />
                )}
              </div>
              <div className="p-5">
                <div className="text-xs uppercase tracking-widest text-gold">{a.category}</div>
                <h3 className="font-display text-lg mt-1">{a.title}</h3>
                {a.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>}
              </div>
            </div>
          ))}
          {albums.length === 0 && <p className="text-muted-foreground">No albums yet.</p>}
        </div>
      </section>
      <Footer />
    </div>
  );
}
