import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

const sb = supabase as any;

export const Route = createFileRoute("/p/teacher/$token")({
  ssr: false,
  head: () => ({ meta: [{ title: "Teacher profile" }, { name: "robots", content: "noindex" }] }),
  loader: async ({ params }) => {
    const { data, error } = await sb.rpc("get_teacher_qr_profile", { p_token: params.token }).maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data;
  },
  errorComponent: () => <Fallback title="Something went wrong" />,
  notFoundComponent: () => <Fallback title="Invalid or expired pass" />,
  component: TeacherProfile,
});

function Fallback({ title }: { title: string }) { return <div className="min-h-screen grid place-items-center bg-surface p-6"><div className="card-soft p-8 text-center max-w-md"><div className="font-display text-2xl">{title}</div><p className="text-muted-foreground text-sm mt-2">This QR pass could not be verified.</p><Link to="/" className="btn-primary mt-6 inline-flex">Back to site</Link></div></div>; }

function TeacherProfile() {
  const t = Route.useLoaderData() as any;
  const classes = t.classes ?? [];
  return <div className="min-h-screen bg-surface"><header className="bg-primary text-primary-foreground py-8"><div className="container mx-auto px-6 flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-gold text-gold-foreground grid place-items-center"><GraduationCap size={20} /></div><div><div className="font-display text-lg">Teacher Profile Pass</div><div className="text-xs opacity-70 uppercase tracking-widest">QR verified · view only</div></div></div></header><main className="container mx-auto px-6 py-10 max-w-3xl"><div className="card-soft p-6 md:p-8"><div className="flex flex-col md:flex-row gap-6 items-start">{t.photo_url ? <img src={t.photo_url} alt={t.name} className="h-32 w-32 rounded-xl object-cover" /> : <div className="h-32 w-32 rounded-xl bg-primary text-primary-foreground grid place-items-center font-display text-4xl">{t.name.charAt(0)}</div>}<div className="flex-1"><h1 className="font-display text-3xl">{t.name}</h1><p className="text-muted-foreground mt-1">{t.designation || "Teacher"}</p><div className="grid grid-cols-2 gap-3 mt-4 text-sm"><Info label="Subject" value={t.subject} /><Info label="Qualification" value={t.qualification} /><Info label="Experience" value={t.experience} /><Info label="Access" value="Profile pass" /></div></div></div>{classes.length > 0 && <><div className="my-6 border-t border-border" /><div><div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Class teacher of</div><div className="flex flex-wrap gap-2">{classes.map((c: any, index: number) => <span key={`${c.name}-${index}`} className="rounded-full bg-gold/10 text-primary px-3 py-1 text-sm font-medium">{c.name}{c.grade ? ` (${c.grade}${c.section ? `-${c.section}` : ""})` : ""}</span>)}</div></div></>}{t.bio && <><div className="my-6 border-t border-border" /><p className="text-sm text-muted-foreground whitespace-pre-line">{t.bio}</p></>}{t.achievements && <><div className="my-6 border-t border-border" /><div><div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Achievements</div><p className="text-sm whitespace-pre-line">{t.achievements}</p></div></>}<div className="mt-6"><Link to="/portal-login" className="btn-primary inline-flex">Teacher sign in</Link></div></div></main></div>;
}

function Info({ label, value }: { label: string; value: string | null | undefined }) { return <div><div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div><div className="font-medium">{value || "—"}</div></div>; }
