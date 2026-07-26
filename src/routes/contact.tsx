import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { settingsQuery } from "@/lib/queries";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Greenfield Academy" },
      { name: "description", content: "Visit our campus, call, email, or send us a message." },
      { property: "og:title", content: "Contact — Greenfield Academy" },
      { property: "og:description", content: "Get in touch with Greenfield Academy." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(settingsQuery); return null; },
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Please enter a message").max(5000),
});
type FormData = z.infer<typeof schema>;

function ContactPage() {
  const { data: s } = useQuery(settingsQuery);
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    });
    setSending(false);
    if (error) {
      toast.error("Could not send message. Please try again.");
      return;
    }
    toast.success("Message sent. We'll be in touch soon.");
    reset();
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-24">
          <div className="eyebrow text-gold">Contact</div>
          <h1 className="font-display text-5xl md:text-6xl mt-3">Get in touch</h1>
        </div>
      </section>
      <section className="container-page py-16 grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-3xl">We'd love to hear from you</h2>
          <p className="mt-3 text-muted-foreground">Reach out with any questions about admissions, tours, or life at Greenfield.</p>
          <div className="mt-8 space-y-5">
            {s?.address && <div className="flex gap-4"><MapPin className="text-gold mt-1 shrink-0" /><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Address</div><div className="mt-1">{s.address}</div></div></div>}
            {s?.phone && <div className="flex gap-4"><Phone className="text-gold mt-1 shrink-0" /><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Phone</div><div className="mt-1">{s.phone}</div></div></div>}
            {s?.email && <div className="flex gap-4"><Mail className="text-gold mt-1 shrink-0" /><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Email</div><div className="mt-1">{s.email}</div></div></div>}
            {s?.office_hours && <div className="flex gap-4"><Clock className="text-gold mt-1 shrink-0" /><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Hours</div><div className="mt-1">{s.office_hours}</div></div></div>}
          </div>
          {s?.google_map_embed && (
            <div className="mt-8 rounded-2xl overflow-hidden border border-border aspect-video">
              <iframe src={s.google_map_embed} className="w-full h-full" loading="lazy" title="Map" />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card-soft p-8 space-y-4 h-fit">
          <h3 className="font-display text-2xl">Send a message</h3>
          <div>
            <label className="text-sm font-medium">Name *</label>
            <input {...register("name")} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email *</label>
              <input {...register("email")} type="email" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input {...register("phone")} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Subject</label>
            <input {...register("subject")} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5" />
          </div>
          <div>
            <label className="text-sm font-medium">Message *</label>
            <textarea {...register("message")} rows={5} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5" />
            {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-50">
            {sending ? "Sending..." : "Send message"}
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}
