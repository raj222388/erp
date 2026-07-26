import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import type { Tables } from "@/integrations/supabase/types";

type Slide = Tables<"hero_slides">;

export function HeroSlider({ slides, welcome }: { slides: Slide[]; welcome?: string | null }) {
  const [i, setI] = useState(0);
  const list = slides.length ? slides : [{
    id: "fallback", title: "Welcome", subtitle: "", image_url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=80",
    cta_label: "Contact us", cta_href: "/contact", display_order: 0, is_visible: true,
    created_at: "", updated_at: "",
  } as Slide];

  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % list.length), 6000);
    return () => clearInterval(t);
  }, [list.length]);

  const s = list[i];

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={s.id}
          src={s.image_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary/85" />

      <div className="container-page relative h-full flex items-end pb-16 md:pb-24">
        <div className="max-w-3xl text-primary-foreground">
          <motion.div
            key={s.id + "text"}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {s.subtitle && <div className="eyebrow text-gold mb-4">{s.subtitle}</div>}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05]">
              {s.title ?? "Welcome"}
            </h1>
            {welcome && (
              <p className="mt-6 max-w-2xl text-base md:text-lg opacity-90 leading-relaxed">
                {welcome}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {s.cta_label && s.cta_href && (
                <Link to={s.cta_href} className="btn-gold">{s.cta_label}</Link>
              )}
              <Link to="/contact" className="btn-outline text-primary-foreground">Contact us</Link>
            </div>
          </motion.div>
        </div>
      </div>

      {list.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-2">
          {list.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-gold" : "w-4 bg-primary-foreground/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
