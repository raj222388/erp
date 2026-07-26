import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/admin/classrooms")({
  component: ClassroomsAdmin,
});

type Classroom = {
  id: string; name: string; grade: string | null; section: string | null;
  capacity: number | null; description: string | null; facilities: string | null;
  class_teacher_id: string | null; display_order: number; is_visible: boolean;
};
type FormValues = Omit<Classroom, "id">;
const empty: FormValues = {
  name: "", grade: "", section: "", capacity: null, description: "", facilities: "",
  class_teacher_id: null, display_order: 0, is_visible: true,
};

const sb = supabase as any;

function ClassroomsAdmin() {
  const { data = [], isLoading } = useCollection<Classroom>("classrooms", "display_order", true);
  const { insert, update } = useMutations("classrooms");
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: teachers = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["admin", "teachers-lite"],
    queryFn: async () => {
      const { data, error } = await sb.from("teachers").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <AdminHeader
        title="Classrooms"
        subtitle="Create classes, assign a class teacher, and organise students."
        action={<button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary"><Plus size={16} /> Add classroom</button>}
      />

      {(creating || editing) && (
        <ClassroomForm
          initial={editing ?? empty}
          teachers={teachers}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            const values = { ...v, class_teacher_id: v.class_teacher_id || null, capacity: v.capacity ? Number(v.capacity) : null };
            if (editing) await update.mutateAsync({ id: editing.id, values });
            else await insert.mutateAsync(values);
            setCreating(false); setEditing(null);
          }}
        />
      )}

      <div className="mt-6 card-soft overflow-hidden">
        {isLoading ? <div className="p-6 text-muted-foreground">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-4">Classroom</th>
                <th className="p-4 hidden md:table-cell">Class teacher</th>
                <th className="p-4 hidden lg:table-cell">Capacity</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((c) => {
                const teacher = teachers.find((t) => t.id === c.class_teacher_id);
                return (
                  <tr key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setEditing(c)}>
                    <td className="p-4">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{[c.grade, c.section].filter(Boolean).join(" · ")}</div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{teacher?.name || "—"}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{c.capacity ?? "—"}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <RowActions row={c} table="classrooms" />
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && <tr><td colSpan={4} className="p-6 text-muted-foreground text-center">No classrooms yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ClassroomForm({
  initial, teachers, onSubmit, onCancel,
}: {
  initial: FormValues;
  teachers: { id: string; name: string }[];
  onSubmit: (v: FormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const { register, handleSubmit } = useForm<FormValues>({ defaultValues: initial });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Classroom details</h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name *"><input required {...register("name")} className={inputCls} placeholder="Grade 5 - A" /></Field>
        <Field label="Class teacher">
          <select {...register("class_teacher_id")} className={inputCls}>
            <option value="">— none —</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Grade"><input {...register("grade")} className={inputCls} /></Field>
        <Field label="Section"><input {...register("section")} className={inputCls} /></Field>
        <Field label="Capacity"><input type="number" {...register("capacity", { valueAsNumber: true })} className={inputCls} /></Field>
        <Field label="Display order"><input type="number" {...register("display_order", { valueAsNumber: true })} className={inputCls} /></Field>
        <Field label="Description" full><textarea {...register("description")} rows={2} className={inputCls} /></Field>
        <Field label="Facilities" full><textarea {...register("facilities")} rows={2} className={inputCls} /></Field>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_visible")} /> Visible on site</label>
        </div>
      </div>
      <div className="mt-5 flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}

const inputCls = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={full ? "md:col-span-2" : ""}><label className="text-sm font-medium">{label}</label>{children}</div>;
}
