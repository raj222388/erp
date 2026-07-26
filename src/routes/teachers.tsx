import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { teachersQuery } from "@/lib/queries";

export const Route = createFileRoute("/teachers")({
  head: () => ({
    meta: [
      { title: "Our Teachers — Greenfield Academy" },
      { name: "description", content: "Meet the passionate teachers and mentors of Greenfield Academy." },
      { property: "og:title", content: "Our Teachers — Greenfield Academy" },
      { property: "og:description", content: "Meet the passionate teachers of Greenfield Academy." },
      { property: "og:url", content: "/teachers" },
    ],
    links: [{ rel: "canonical", href: "/teachers" }],
  }),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(teachersQuery); return null; },
  component: TeachersPage,
});

function TeachersPage() {
  const { data: teachers = [] } = useQuery(teachersQuery);
  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-24">
          <div className="eyebrow text-gold">Faculty</div>
          <h1 className="font-display text-5xl md:text-6xl mt-3">Our teachers</h1>
          <p className="mt-4 max-w-2xl opacity-85">Passionate educators who see, hear, and challenge every student.</p>
        </div>
      </section>
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <div key={t.id} className="card-soft overflow-hidden group">
              <div className="aspect-[4/5] bg-secondary overflow-hidden">
                {t.photo_url ? (
                  <img src={t.photo_url} alt={t.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="h-full w-full grid place-items-center font-display text-7xl text-primary/40">{t.name.charAt(0)}</div>
                )}
              </div>
              <div className="p-6">
                <div className="font-display text-xl">{t.name}</div>
                <div className="text-xs text-gold uppercase tracking-wider mt-1">{t.designation}</div>
                <div className="text-sm text-muted-foreground mt-1">{t.subject}</div>
                {t.qualification && <div className="text-xs text-muted-foreground mt-3">{t.qualification} · {t.experience}</div>}
                {t.bio && <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{t.bio}</p>}
              </div>
            </div>
          ))}
          {teachers.length === 0 && <p className="text-muted-foreground">No teachers added yet.</p>}
        </div>
      </section>
      <Footer />
    </div>
  );
}
