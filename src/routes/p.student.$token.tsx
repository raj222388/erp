import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

const sb = supabase as any;

export const Route = createFileRoute("/p/student/$token")({
  ssr: false,
  head: () => ({ meta: [{ title: "Student profile" }, { name: "robots", content: "noindex" }] }),
  loader: async ({ params }) => {
    const { data, error } = await sb.rpc("get_student_qr_profile", { p_token: params.token }).maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data;
  },
  errorComponent: () => <Fallback title="Something went wrong" />,
  notFoundComponent: () => <Fallback title="Invalid or expired pass" />,
  component: StudentProfile,
});

function Fallback({ title }: { title: string }) {
  return <div className="min-h-screen grid place-items-center bg-surface p-6"><div className="card-soft p-8 text-center max-w-md"><div className="font-display text-2xl">{title}</div><p className="text-muted-foreground text-sm mt-2">This QR pass could not be verified.</p><Link to="/" className="btn-primary mt-6 inline-flex">Back to site</Link></div></div>;
}

function StudentProfile() {
  const s = Route.useLoaderData() as any;
  const fullName = `${s.first_name}${s.last_name ? ` ${s.last_name}` : ""}`;
  const className = s.classroom_name || [s.grade, s.section].filter(Boolean).join(" - ") || "—";
  return <div className="min-h-screen bg-surface"><header className="bg-primary text-primary-foreground py-8"><div className="container mx-auto px-6 flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-gold text-gold-foreground grid place-items-center"><GraduationCap size={20} /></div><div><div className="font-display text-lg">Student Profile Pass</div><div className="text-xs opacity-70 uppercase tracking-widest">QR verified · view only</div></div></div></header><main className="container mx-auto px-6 py-10 max-w-3xl"><div className="card-soft p-6 md:p-8"><div className="flex flex-col md:flex-row gap-6 items-start">{s.photo_url ? <img src={s.photo_url} alt={fullName} className="h-32 w-32 rounded-xl object-cover" /> : <div className="h-32 w-32 rounded-xl bg-primary text-primary-foreground grid place-items-center font-display text-4xl">{s.first_name.charAt(0)}</div>}<div className="flex-1"><h1 className="font-display text-3xl">{fullName}</h1><p className="text-muted-foreground mt-1">{className}</p><div className="grid grid-cols-2 gap-3 mt-4 text-sm"><Info label="Admission #" value={s.admission_no} /><Info label="Roll #" value={s.roll_no} /><Info label="Class" value={className} /><Info label="Access" value="Profile pass" /></div></div></div><p className="mt-6 text-sm text-muted-foreground">This pass only displays the student's basic school profile. Contact, address, parent, medical, and internal information are protected.</p><div className="mt-6"><Link to="/portal-login" className="btn-primary inline-flex">Student sign in</Link></div></div></main></div>;
}

function Info({ label, value }: { label: string; value: string | null | undefined }) { return <div><div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div><div className="font-medium">{value || "—"}</div></div>; }
