import { useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Props = { recordType: "student" | "teacher"; recordId: string; userId?: string | null; email?: string | null };

export function AccountCredentials({ recordType, recordId, userId, email }: Props) {
  const [hasAccount, setHasAccount] = useState(Boolean(userId));
  const [accountEmail, setAccountEmail] = useState(email || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const person = recordType === "student" ? "student" : "teacher";
  const invoke = async (action: "create" | "update" | "delete") => {
    if (action !== "delete" && (!accountEmail.trim() || (!hasAccount && password.length < 8))) { toast.error("Enter an email and a password of at least 8 characters."); return; }
    if (action === "delete" && !window.confirm(`Delete this ${person}'s login account? Their school profile will remain.`)) return;
    setSaving(true);
    try {
      const { data, error } = await (supabase as any).functions.invoke("manage-portal-account", { body: { action, recordType, recordId, email: accountEmail, password } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (action === "delete") { setHasAccount(false); setPassword(""); toast.success("Login account deleted"); }
      else { setHasAccount(true); setPassword(""); toast.success(action === "create" ? "Login account created" : "Login credentials updated"); }
    } catch (error: any) { toast.error(error?.message || "Could not update login credentials."); } finally { setSaving(false); }
  };
  return <section className="mt-6 border-t border-border pt-6"><div className="flex items-center gap-2"><KeyRound size={18} /><h3 className="font-display text-lg">{hasAccount ? "Login credentials" : "Create login credentials"}</h3></div><p className="mt-1 text-sm text-muted-foreground">Passwords are never shown after saving. Set a new password here to reset it.</p><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Login email<input required value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} type="email" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label><label className="text-sm font-medium">{hasAccount ? "New password (optional)" : "Password *"}<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} placeholder="At least 8 characters" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={saving} onClick={() => void invoke(hasAccount ? "update" : "create")} className="btn-primary disabled:opacity-50">{saving ? "Saving…" : hasAccount ? "Update credentials" : "Create login"}</button>{hasAccount && <button type="button" disabled={saving} onClick={() => void invoke("delete")} className="btn-outline text-destructive disabled:opacity-50"><Trash2 size={16} /> Delete login</button>}</div></section>;
}
