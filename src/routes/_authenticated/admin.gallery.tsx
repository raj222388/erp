import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { Album } from "@/lib/queries";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/gallery")({ component: GAdmin });
type F = { title: string; slug: string; description: string; category: string; cover_image_url: string; display_order: number; is_visible: boolean };
const empty: F = { title: "", slug: "", description: "", category: "festival", cover_image_url: "", display_order: 0, is_visible: true };

function GAdmin() {
  const { data = [] } = useCollection<Album>("gallery_albums", "display_order", true);
  const { insert, update } = useMutations("gallery_albums");
  const [editing, setEditing] = useState<Album | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <div>
      <AdminHeader title="Gallery" subtitle="Manage photo albums. Add photos to an album from the album detail view (coming soon)." action={
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary"><Plus size={16} /> New album</button>
      } />
      {(creating || editing) && (
        <Form initial={editing ? { title: editing.title, slug: editing.slug ?? "", description: editing.description ?? "", category: editing.category ?? "festival", cover_image_url: editing.cover_image_url ?? "", display_order: editing.display_order, is_visible: editing.is_visible } : empty}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            if (editing) await update.mutateAsync({ id: editing.id, values: v });
            else await insert.mutateAsync(v);
            setCreating(false); setEditing(null);
          }} />
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((a) => (
          <div key={a.id} className="card-soft overflow-hidden cursor-pointer" onClick={() => setEditing(a)}>
            <div className="aspect-video bg-secondary">{a.cover_image_url && <img src={a.cover_image_url} className="w-full h-full object-cover" alt="" />}</div>
            <div className="p-4">
              <div className="text-xs text-gold uppercase tracking-widest">{a.category}</div>
              <div className="font-medium mt-1">{a.title}</div>
              <div className="mt-3" onClick={(e) => e.stopPropagation()}><RowActions row={a} table="gallery_albums" /></div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="text-muted-foreground text-sm">No albums yet.</div>}
      </div>
    </div>
  );
}

function Form({ initial, onSubmit, onCancel }: { initial: F; onSubmit: (v: F) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit } = useForm<F>({ defaultValues: initial });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4"><h2 className="font-display text-xl">Album</h2><button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="text-sm font-medium">Title *</label><input required {...register("title")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Slug</label><input {...register("slug")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Category</label>
          <select {...register("category")} className={inputCls}>
            {["festival","sports","annual","independence","republic","teachers-day","childrens-day","science","cultural","tour","picnic","farewell","freshers","other"].map(x => <option key={x}>{x}</option>)}
          </select></div>
        <div><label className="text-sm font-medium">Cover image URL</label><input {...register("cover_image_url")} className={inputCls} /></div>
        <div className="md:col-span-2"><label className="text-sm font-medium">Description</label><textarea rows={2} {...register("description")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Display order</label><input type="number" {...register("display_order", { valueAsNumber: true })} className={inputCls} /></div>
        <label className="flex items-end gap-2 text-sm"><input type="checkbox" {...register("is_visible")} /> Visible</label>
      </div>
      <div className="mt-5 flex gap-2 justify-end"><button type="button" onClick={onCancel} className="btn-outline">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
    </form>
  );
}
const inputCls = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
