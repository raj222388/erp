import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  // Authentication uses browser session storage, so this check must run in the browser.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — Greenfield Academy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { data: role } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (role) {
        throw redirect({ to: "/admin" });
      } else {
        throw redirect({ to: "/" });
      }
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin@123");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error, data } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

      if (error || !data.user) {
        toast.error(error?.message || "Login failed. Please check your email and password.");
        return;
      }

      const { data: role, error: roleError } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) {
        throw roleError;
      }

      if (role) {
        toast.success("Signed in as Admin");
        navigate({ to: "/admin" });
      } else {
        toast.error("This account does not have administrator access.");
        await supabase.auth.signOut();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "The authentication service is unavailable. Please try again later.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-surface">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground grid place-items-center">
            <GraduationCap size={22} />
          </div>
          <div className="font-display text-xl">Greenfield Academy</div>
        </Link>
        <div className="card-soft p-8">
          <h1 className="font-display text-2xl">Admin sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">This area is for site administrators only.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              Sign in
            </button>
          </form>
          <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border/50 text-center">
            <p className="text-xs font-medium text-foreground">Admin Credentials (for testing):</p>
            <p className="text-xs text-muted-foreground mt-1">Email: <span className="font-mono text-foreground select-all">admin@gmail.com</span></p>
            <p className="text-xs text-muted-foreground">Password: <span className="font-mono text-foreground select-all">admin@123</span></p>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            No account? Ask an existing admin to create one for you.
          </p>
        </div>
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to site</Link>
        </div>
      </div>
    </div>
  );
}
