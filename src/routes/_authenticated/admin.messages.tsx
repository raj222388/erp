import { createFileRoute } from "@tanstack/react-router";
import { useCollection, useMutations, AdminHeader } from "@/components/admin/crud";
import { Mail, Trash2, MailOpen } from "lucide-react";

type Msg = { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; is_read: boolean; created_at: string };

export const Route = createFileRoute("/_authenticated/admin/messages")({ component: MAdmin });

function MAdmin() {
  const { data = [] } = useCollection<Msg>("contact_messages", "created_at", false);
  const { update, remove } = useMutations("contact_messages");
  return (
    <div>
      <AdminHeader title="Messages" subtitle="Contact form submissions from the public site." />
      <div className="mt-6 space-y-3">
        {data.map((m) => (
          <div key={m.id} className={`card-soft p-5 ${m.is_read ? "opacity-70" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <div className="font-semibold">{m.name}</div>
                  <span className="text-muted-foreground">·</span>
                  <a href={`mailto:${m.email}`} className="text-primary hover:underline">{m.email}</a>
                  {m.phone && <><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{m.phone}</span></>}
                </div>
                {m.subject && <div className="text-xs uppercase tracking-widest text-gold mt-2">{m.subject}</div>}
                <p className="mt-2 text-sm whitespace-pre-wrap">{m.message}</p>
                <div className="text-xs text-muted-foreground mt-3">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button title={m.is_read ? "Mark unread" : "Mark read"} onClick={() => update.mutate({ id: m.id, values: { is_read: !m.is_read } })} className="p-2 rounded hover:bg-muted">
                  {m.is_read ? <Mail size={14} /> : <MailOpen size={14} />}
                </button>
                <button title="Delete" onClick={() => window.confirm("Delete this message?") && remove.mutate(m.id)} className="p-2 rounded hover:bg-destructive/10 text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="text-muted-foreground text-sm">No messages yet.</div>}
      </div>
    </div>
  );
}
