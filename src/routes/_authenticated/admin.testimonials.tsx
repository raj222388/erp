import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { Testimonial } from "@/lib/queries";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { MediaUploadField } from "@/components/admin/MediaUploadField";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({ component: TAdmin });
type F = { name: string; role: string; message: string; photo_url: string; rating: number; display_order: number; is_visible: boolean };
const empty: F = { name: "", role: "Parent", message: "", photo_url: "", rating: 5, display_order: 0, is_visible: true };

function TAdmin() {
  const { data = [] } = useCollection<Testimonial>("testimonials", "display_order", true);
  const { insert, update } = useMutations("testimonials");
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <div>
      <AdminHeader title="Testimonials" subtitle="Reviews from students, parents, and teachers." action={
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary"><Plus size={16} /> Add</button>
      } />
      {(creating || editing) && (
        <Form initial={editing ? { ...empty, ...editing, role: editing.role ?? "", photo_url: editing.photo_url ?? "", rating: editing.rating ?? 5 } : empty}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            if (editing) await update.mutateAsync({ id: editing.id, values: v });
            else await insert.mutateAsync(v);
            setCreating(false); setEditing(null);
          }}
        />
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {data.map((t) => (
          <div key={t.id} className="card-soft p-5 cursor-pointer" onClick={() => setEditing(t)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {t.photo_url ? <img src={t.photo_url} className="h-10 w-10 rounded-full object-cover" alt="" /> :
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">{t.name.charAt(0)}</div>}
                <div><div className="font-medium">{t.name}</div><div className="text-xs text-muted-foreground">{t.role}</div></div>
              </div>
              <div onClick={(e) => e.stopPropagation()}><RowActions row={t} table="testimonials" /></div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground line-clamp-3">"{t.message}"</p>
          </div>
        ))}
        {data.length === 0 && <div className="text-muted-foreground text-sm">No testimonials yet.</div>}
      </div>
    </div>
  );
}

function Form({ initial, onSubmit, onCancel }: { initial: F; onSubmit: (v: F) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit, setValue, watch } = useForm<F>({ defaultValues: initial });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4"><h2 className="font-display text-xl">Testimonial</h2><button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="text-sm font-medium">Name *</label><input required {...register("name")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Role</label>
          <select {...register("role")} className={inputCls}><option>Student</option><option>Parent</option><option>Teacher</option><option>Alumni</option></select>
        </div>
        <MediaUploadField name="photo_url" label="Photo" value={watch("photo_url")} register={register} setValue={setValue} />
        <div><label className="text-sm font-medium">Rating (1-5)</label><input type="number" min={1} max={5} {...register("rating", { valueAsNumber: true })} className={inputCls} /></div>
        <div className="md:col-span-2"><label className="text-sm font-medium">Message *</label><textarea required rows={4} {...register("message")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Display order</label><input type="number" {...register("display_order", { valueAsNumber: true })} className={inputCls} /></div>
        <label className="flex items-end gap-2 text-sm"><input type="checkbox" {...register("is_visible")} /> Visible</label>
      </div>
      <div className="mt-5 flex gap-2 justify-end"><button type="button" onClick={onCancel} className="btn-outline">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
    </form>
  );
}
const inputCls = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
