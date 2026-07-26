import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portal-login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Student & Teacher Sign In" }, { name: "robots", content: "noindex" }] }),
  component: PortalLogin,
});

function PortalLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error || !data.user) throw error || new Error("Could not sign in.");
      const { data: student } = await (supabase as any).from("students").select("id").eq("user_id", data.user.id).maybeSingle();
      toast.success("Signed in successfully");
      navigate({ to: student ? "/student-portal" : "/" });
    } catch (error: any) { toast.error(error?.message || "Could not sign in."); } finally { setLoading(false); }
  };
  return <div className="min-h-screen grid place-items-center bg-surface p-6"><div className="w-full max-w-md"><Link to="/" className="mb-8 flex items-center justify-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground"><GraduationCap size={22} /></div><span className="font-display text-xl">School Portal</span></Link><div className="card-soft p-8"><h1 className="font-display text-2xl">Student & teacher sign in</h1><p className="mt-1 text-sm text-muted-foreground">Use the email and password supplied by the school.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5" /></label><label className="block text-sm font-medium">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5" /></label><button disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading && <Loader2 className="animate-spin" size={16} />}{loading ? "Signing in…" : "Sign in"}</button></form></div></div></div>;
}
