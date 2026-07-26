import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { aboutQuery, settingsQuery, faqsQuery } from "@/lib/queries";
import * as Icons from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Greenfield Academy" },
      { name: "description", content: "Our history, mission, and vision. Meet the people who lead Greenfield Academy." },
      { property: "og:title", content: "About — Greenfield Academy" },
      { property: "og:description", content: "Our history, mission, and vision at Greenfield Academy." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(aboutQuery),
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(faqsQuery),
    ]);
    return null;
  },
  component: AboutPage,
});

function LucideIcon({ iconName, size = 20, ...p }: { iconName?: string | null; size?: number } & React.SVGProps<SVGSVGElement>) {
  const Ico = (iconName && (Icons as any)[iconName]) || Icons.Sparkles;
  return <Ico size={size} {...p} />;
}

function AboutPage() {
  const { data: about = [] } = useQuery(aboutQuery);
  const { data: settings } = useQuery(settingsQuery);
  const { data: faqs = [] } = useQuery(faqsQuery);
  const history = about.find((a) => a.section_key === "history");
  const mission = about.find((a) => a.section_key === "mission");
  const vision = about.find((a) => a.section_key === "vision");
  const whyUs = about.filter((a) => a.section_key === "why_us");

  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-24">
          <div className="eyebrow text-gold">About us</div>
          <h1 className="font-display text-5xl md:text-6xl mt-3 max-w-3xl leading-tight">
            {history?.title ?? "Our story"}
          </h1>
          {history?.body && <p className="mt-6 max-w-2xl opacity-85 leading-relaxed">{history.body}</p>}
        </div>
      </section>

      <section className="container-page py-20 grid md:grid-cols-2 gap-8">
        {[mission, vision].filter(Boolean).map((s) => (
          <div key={s!.id} className="card-soft p-8">
            <div className="h-12 w-12 rounded-2xl bg-gold/20 text-primary grid place-items-center">
              <LucideIcon iconName={s!.icon} size={22} />
            </div>
            <h2 className="mt-5 font-display text-2xl">{s!.title}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{s!.body}</p>
          </div>
        ))}
      </section>

      {whyUs.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-20">
            <div className="eyebrow">Why choose us</div>
            <h2 className="font-display text-4xl mt-2">Our values in practice</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {whyUs.map((w) => (
                <div key={w.id} className="card-soft p-6">
                  <LucideIcon iconName={w.icon} size={22} className="text-primary" />
                  <h3 className="mt-4 font-semibold">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(settings?.principal_message || settings?.director_message) && (
        <section className="container-page py-20 grid md:grid-cols-2 gap-10">
          {settings?.principal_message && (
            <div className="card-soft p-8">
              {settings.principal_photo_url && (
                <img src={settings.principal_photo_url} alt="" className="h-20 w-20 rounded-full object-cover" />
              )}
              <div className="eyebrow mt-4">From the Principal</div>
              <blockquote className="font-display text-xl mt-3 leading-snug">"{settings.principal_message}"</blockquote>
              <div className="mt-4 font-semibold">{settings.principal_name}</div>
            </div>
          )}
          {settings?.director_message && (
            <div className="card-soft p-8">
              {settings.director_photo_url && (
                <img src={settings.director_photo_url} alt="" className="h-20 w-20 rounded-full object-cover" />
              )}
              <div className="eyebrow mt-4">From the Director</div>
              <blockquote className="font-display text-xl mt-3 leading-snug">"{settings.director_message}"</blockquote>
              <div className="mt-4 font-semibold">{settings.director_name}</div>
            </div>
          )}
        </section>
      )}

      {faqs.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-20">
            <div className="eyebrow">FAQ</div>
            <h2 className="font-display text-4xl mt-2">Frequently asked questions</h2>
            <div className="mt-10 max-w-3xl space-y-3">
              {faqs.map((f) => (
                <details key={f.id} className="card-soft p-5 group">
                  <summary className="cursor-pointer font-semibold flex justify-between items-center">
                    {f.question}
                    <Icons.Plus size={18} className="group-open:rotate-45 transition-transform" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
