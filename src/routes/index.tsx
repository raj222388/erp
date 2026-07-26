import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HeroSlider } from "@/components/site/HeroSlider";
import {
  heroSlidesQuery,
  settingsQuery,
  aboutQuery,
  teachersQuery,
  facilitiesQuery,
  newsQuery,
  eventsQuery,
  testimonialsQuery,
  noticesQuery,
} from "@/lib/queries";
import * as Icons from "lucide-react";
import { Star, ArrowRight, Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(heroSlidesQuery),
      context.queryClient.ensureQueryData(aboutQuery),
      context.queryClient.ensureQueryData(teachersQuery),
      context.queryClient.ensureQueryData(facilitiesQuery),
      context.queryClient.ensureQueryData(newsQuery),
      context.queryClient.ensureQueryData(eventsQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
      context.queryClient.ensureQueryData(noticesQuery),
    ]);
    return null;
  },
  component: Home,
});

function LucideIcon({ iconName, size = 20, ...p }: { iconName?: string | null; size?: number } & React.SVGProps<SVGSVGElement>) {
  const Ico = (iconName && (Icons as any)[iconName]) || Icons.Sparkles;
  return <Ico size={size} {...p} />;
}

function Home() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: slides = [] } = useQuery(heroSlidesQuery);
  const { data: about = [] } = useQuery(aboutQuery);
  const { data: teachers = [] } = useQuery(teachersQuery);
  const { data: facilities = [] } = useQuery(facilitiesQuery);
  const { data: news = [] } = useQuery(newsQuery);
  const { data: events = [] } = useQuery(eventsQuery);
  const { data: testimonials = [] } = useQuery(testimonialsQuery);
  const { data: notices = [] } = useQuery(noticesQuery);

  const mission = about.find((a) => a.section_key === "mission");
  const vision = about.find((a) => a.section_key === "vision");
  const history = about.find((a) => a.section_key === "history");
  const whyUs = about.filter((a) => a.section_key === "why_us");
  const featuredTeachers = teachers.filter((t) => t.is_featured).slice(0, 4);
  const featuredNews = news.slice(0, 3);
  const upcoming = events.filter((e) => !e.is_archived).slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSlider slides={slides} welcome={settings?.welcome_message} />

      {notices.length > 0 && (
        <section className="border-b border-border bg-secondary">
          <div className="container-page py-3 flex items-center gap-3 overflow-hidden">
            <span className="btn-gold !py-1 !px-3 text-xs shrink-0">Notices</span>
            <div className="flex gap-8 animate-pulse-none text-sm whitespace-nowrap overflow-x-auto">
              {notices.slice(0, 5).map((n) => (
                <span key={n.id} className="text-foreground/80">• {n.title}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mission / Vision */}
      <section className="container-page py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="eyebrow">About Greenfield</div>
            <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">
              A school for curious minds and kind hearts.
            </h2>
            {history?.body && (
              <p className="mt-6 text-muted-foreground leading-relaxed">{history.body}</p>
            )}
            <Link to="/about" className="btn-primary mt-8">
              Read our story <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-5">
            {[mission, vision].filter(Boolean).map((sec) => (
              <div key={sec!.id} className="card-soft p-7">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/20 text-gold-foreground grid place-items-center">
                    <LucideIcon iconName={sec!.icon} size={18} />
                  </div>
                  <h3 className="font-display text-xl">{sec!.title}</h3>
                </div>
                <p className="mt-3 text-muted-foreground leading-relaxed">{sec!.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      {whyUs.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-20 md:py-24">
            <div className="text-center max-w-2xl mx-auto">
              <div className="eyebrow justify-center">Why choose us</div>
              <h2 className="font-display text-4xl md:text-5xl mt-3">The Greenfield difference</h2>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whyUs.map((w, idx) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="card-soft p-7"
                >
                  <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center">
                    <LucideIcon iconName={w.icon} size={20} />
                  </div>
                  <h3 className="mt-5 font-display text-lg">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{w.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Facilities */}
      {facilities.length > 0 && (
        <section className="container-page py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Facilities</div>
              <h2 className="font-display text-4xl mt-2">A campus built for learning</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facilities.slice(0, 8).map((f) => (
              <div key={f.id} className="card-soft p-6 hover:shadow-elevated transition-shadow">
                <div className="h-11 w-11 rounded-xl bg-gold/20 text-primary grid place-items-center">
                  <LucideIcon iconName={f.icon} size={20} />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Principal + Director */}
      {(settings?.principal_message || settings?.director_message) && (
        <section className="bg-primary text-primary-foreground">
          <div className="container-page py-20 md:py-24 grid md:grid-cols-2 gap-10">
            {settings?.principal_message && (
              <div>
                <div className="eyebrow text-gold">From the Principal</div>
                <blockquote className="font-display text-2xl md:text-3xl mt-4 leading-snug">
                  “{settings.principal_message}”
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  {settings.principal_photo_url && (
                    <img src={settings.principal_photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  )}
                  <div>
                    <div className="font-semibold">{settings.principal_name}</div>
                    <div className="text-sm opacity-70">Principal</div>
                  </div>
                </div>
              </div>
            )}
            {settings?.director_message && (
              <div>
                <div className="eyebrow text-gold">From the Director</div>
                <blockquote className="font-display text-2xl md:text-3xl mt-4 leading-snug">
                  “{settings.director_message}”
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  {settings.director_photo_url && (
                    <img src={settings.director_photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  )}
                  <div>
                    <div className="font-semibold">{settings.director_name}</div>
                    <div className="text-sm opacity-70">Director</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Teachers */}
      {featuredTeachers.length > 0 && (
        <section className="container-page py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Faculty</div>
              <h2 className="font-display text-4xl mt-2">Meet our teachers</h2>
            </div>
            <Link to="/teachers" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTeachers.map((t) => (
              <div key={t.id} className="card-soft overflow-hidden group">
                <div className="aspect-[4/5] bg-secondary overflow-hidden">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="h-full w-full grid place-items-center font-display text-6xl text-primary/40">
                      {t.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="font-display text-lg">{t.name}</div>
                  <div className="text-xs text-gold uppercase tracking-wider mt-1">{t.designation}</div>
                  <div className="text-sm text-muted-foreground mt-2">{t.subject}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* News + Events */}
      <section className="bg-surface">
        <div className="container-page py-20 md:py-24 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="eyebrow">Latest News</div>
                <h2 className="font-display text-3xl md:text-4xl mt-2">What's happening</h2>
              </div>
              <Link to="/news" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                All news <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-8 space-y-5">
              {featuredNews.map((n) => (
                <article key={n.id} className="card-soft p-6 flex gap-5 items-start">
                  {n.cover_image_url && (
                    <img src={n.cover_image_url} alt="" className="h-28 w-28 rounded-lg object-cover shrink-0 hidden sm:block" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      {n.published_at && new Date(n.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    <h3 className="font-display text-lg mt-1">{n.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{n.excerpt}</p>
                  </div>
                </article>
              ))}
              {featuredNews.length === 0 && <p className="text-muted-foreground text-sm">No news yet.</p>}
            </div>
          </div>
          <div>
            <div className="eyebrow">Upcoming</div>
            <h2 className="font-display text-3xl mt-2">Events</h2>
            <div className="mt-8 space-y-4">
              {upcoming.map((e) => (
                <div key={e.id} className="card-soft p-5">
                  <div className="flex items-center gap-2 text-xs text-gold font-semibold">
                    <Calendar size={14} />
                    {e.event_date && new Date(e.event_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <h3 className="mt-2 font-display text-lg">{e.title}</h3>
                  {e.venue && (
                    <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin size={13} /> {e.venue}
                    </div>
                  )}
                </div>
              ))}
              {upcoming.length === 0 && <p className="text-muted-foreground text-sm">No upcoming events.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="container-page py-20 md:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <div className="eyebrow justify-center">Testimonials</div>
            <h2 className="font-display text-4xl md:text-5xl mt-3">What our community says</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <div key={t.id} className="card-soft p-7">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-4 text-foreground/80 leading-relaxed">"{t.message}"</p>
                <div className="mt-5 flex items-center gap-3">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl">Admissions open for 2026–27</h2>
            <p className="mt-4 opacity-80 max-w-xl mx-auto">Visit our campus, meet our teachers, and see what learning looks like at Greenfield.</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/contact" className="btn-gold">Apply now</Link>
              <Link to="/contact" className="btn-outline text-primary-foreground">Book a tour</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
