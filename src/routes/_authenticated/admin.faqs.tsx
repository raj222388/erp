import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { Faq } from "@/lib/queries";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/faqs")({ component: FAdmin });
type F = { question: string; answer: string; display_order: number; is_visible: boolean };
const empty: F = { question: "", answer: "", display_order: 0, is_visible: true };

function FAdmin() {
  const { data = [] } = useCollection<Faq>("faqs", "display_order", true);
  const { insert, update } = useMutations("faqs");
  const [editing, setEditing] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <div>
      <AdminHeader title="FAQs" subtitle="Answers to common questions from parents." action={
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary"><Plus size={16} /> Add FAQ</button>
      } />
      {(creating || editing) && (
        <Form initial={editing ?? empty} onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            if (editing) await update.mutateAsync({ id: editing.id, values: v });
            else await insert.mutateAsync(v);
            setCreating(false); setEditing(null);
          }}
        />
      )}
      <div className="mt-6 space-y-3">
        {data.map((f) => (
          <div key={f.id} className="card-soft p-5 cursor-pointer" onClick={() => setEditing(f)}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0"><div className="font-medium">{f.question}</div><div className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.answer}</div></div>
              <div onClick={(e) => e.stopPropagation()}><RowActions row={f} table="faqs" /></div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="text-muted-foreground text-sm">No FAQs yet.</div>}
      </div>
    </div>
  );
}

function Form({ initial, onSubmit, onCancel }: { initial: F; onSubmit: (v: F) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit } = useForm<F>({ defaultValues: initial });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4"><h2 className="font-display text-xl">FAQ</h2><button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button></div>
      <div className="space-y-4">
        <div><label className="text-sm font-medium">Question *</label><input required {...register("question")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Answer *</label><textarea required rows={4} {...register("answer")} className={inputCls} /></div>
        <div className="flex items-end gap-4">
          <div className="flex-1"><label className="text-sm font-medium">Display order</label><input type="number" {...register("display_order", { valueAsNumber: true })} className={inputCls} /></div>
          <label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" {...register("is_visible")} /> Visible</label>
        </div>
      </div>
      <div className="mt-5 flex gap-2 justify-end"><button type="button" onClick={onCancel} className="btn-outline">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
    </form>
  );
}
const inputCls = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
