import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { Notice } from "@/lib/queries";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/notices")({ component: NAdmin });
type F = { title: string; content: string; file_url: string; image_url: string; priority: number; expires_at: string; is_published: boolean };
const empty: F = { title: "", content: "", file_url: "", image_url: "", priority: 0, expires_at: "", is_published: true };

function NAdmin() {
  const { data = [] } = useCollection<Notice>("notices", "priority", false);
  const { insert, update } = useMutations("notices");
  const [editing, setEditing] = useState<Notice | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <div>
      <AdminHeader title="Notices" subtitle="Announcements shown in the notice ticker." action={
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary"><Plus size={16} /> New notice</button>
      } />
      {(creating || editing) && (
        <Form initial={editing ? {
          title: editing.title, content: editing.content ?? "", file_url: editing.file_url ?? "",
          image_url: editing.image_url ?? "", priority: editing.priority,
          expires_at: editing.expires_at ? editing.expires_at.slice(0, 16) : "",
          is_published: editing.is_published,
        } : empty}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            const payload = { ...v, expires_at: v.expires_at ? new Date(v.expires_at).toISOString() : null };
            if (editing) await update.mutateAsync({ id: editing.id, values: payload });
            else await insert.mutateAsync(payload);
            setCreating(false); setEditing(null);
          }}
        />
      )}
      <div className="mt-6 space-y-3">
        {data.map((n) => (
          <div key={n.id} className="card-soft p-5 cursor-pointer" onClick={() => setEditing(n)}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs"><span className="rounded bg-gold/20 text-gold-foreground px-2 py-0.5">P{n.priority}</span>
                  {n.expires_at && <span className="text-muted-foreground">until {new Date(n.expires_at).toLocaleDateString()}</span>}</div>
                <div className="font-medium mt-2">{n.title}</div>
                {n.content && <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.content}</div>}
              </div>
              <div onClick={(e) => e.stopPropagation()}><RowActions row={n} table="notices" visibilityField="is_published" /></div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="text-muted-foreground text-sm">No notices yet.</div>}
      </div>
    </div>
  );
}

function Form({ initial, onSubmit, onCancel }: { initial: F; onSubmit: (v: F) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit } = useForm<F>({ defaultValues: initial });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4"><h2 className="font-display text-xl">Notice</h2><button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><label className="text-sm font-medium">Title *</label><input required {...register("title")} className={inputCls} /></div>
        <div className="md:col-span-2"><label className="text-sm font-medium">Content</label><textarea rows={3} {...register("content")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">PDF / file URL</label><input {...register("file_url")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Image URL</label><input {...register("image_url")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Priority (higher = more urgent)</label><input type="number" {...register("priority", { valueAsNumber: true })} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Expires at</label><input type="datetime-local" {...register("expires_at")} className={inputCls} /></div>
        <label className="flex items-end gap-2 text-sm"><input type="checkbox" {...register("is_published")} /> Published</label>
      </div>
      <div className="mt-5 flex gap-2 justify-end"><button type="button" onClick={onCancel} className="btn-outline">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
    </form>
  );
}
const inputCls = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
