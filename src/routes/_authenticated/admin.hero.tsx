import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { HeroSlide } from "@/lib/queries";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hero")({ component: HeroAdmin });

type F = { title: string; subtitle: string; image_url: string; cta_label: string; cta_href: string; display_order: number; is_visible: boolean };
const empty: F = { title: "", subtitle: "", image_url: "", cta_label: "", cta_href: "/contact", display_order: 0, is_visible: true };

function HeroAdmin() {
  const { data = [] } = useCollection<HeroSlide>("hero_slides", "display_order", true);
  const { insert, update } = useMutations("hero_slides");
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <AdminHeader title="Hero slider" subtitle="Rotating banner images on the homepage." action={
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary"><Plus size={16} /> New slide</button>
      } />
      {(creating || editing) && (
        <SlideForm
          initial={editing ? {
            title: editing.title ?? "", subtitle: editing.subtitle ?? "", image_url: editing.image_url,
            cta_label: editing.cta_label ?? "", cta_href: editing.cta_href ?? "",
            display_order: editing.display_order, is_visible: editing.is_visible,
          } : empty}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            if (editing) await update.mutateAsync({ id: editing.id, values: v });
            else await insert.mutateAsync(v);
            setCreating(false); setEditing(null);
          }}
        />
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((s) => (
          <div key={s.id} className="card-soft overflow-hidden cursor-pointer" onClick={() => setEditing(s)}>
            <div className="aspect-video bg-secondary"><img src={s.image_url} alt="" className="w-full h-full object-cover" /></div>
            <div className="p-4">
              <div className="text-xs text-muted-foreground">#{s.display_order}</div>
              <div className="font-medium mt-1">{s.title ?? "(untitled)"}</div>
              <div className="text-xs text-muted-foreground">{s.subtitle}</div>
              <div className="mt-3" onClick={(e) => e.stopPropagation()}><RowActions row={s} table="hero_slides" /></div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="text-muted-foreground text-sm">No slides yet.</div>}
      </div>
    </div>
  );
}

function SlideForm({ initial, onSubmit, onCancel }: { initial: F; onSubmit: (v: F) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit } = useForm<F>({ defaultValues: initial });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4"><h2 className="font-display text-xl">Slide</h2><button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><label className="text-sm font-medium">Image URL *</label><input required {...register("image_url")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Title</label><input {...register("title")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><input {...register("subtitle")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Button label</label><input {...register("cta_label")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Button URL</label><input {...register("cta_href")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Display order</label><input type="number" {...register("display_order", { valueAsNumber: true })} className={inputCls} /></div>
        <label className="flex items-end gap-2 text-sm"><input type="checkbox" {...register("is_visible")} /> Visible</label>
      </div>
      <div className="mt-5 flex gap-2 justify-end"><button type="button" onClick={onCancel} className="btn-outline">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
    </form>
  );
}
const inputCls = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
