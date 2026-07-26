import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { Teacher } from "@/lib/queries";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { QrCard } from "@/components/admin/QrCard";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { AccountCredentials } from "@/components/admin/AccountCredentials";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/teachers")({
  component: TeachersAdmin,
});

type TeacherRow = Teacher & {
  qr_token?: string; email?: string | null; phone?: string | null;
  address?: string | null; joined_date?: string | null; user_id?: string | null;
};

type FormValues = Omit<TeacherRow, "id" | "qr_token">;
const empty: FormValues = {
  name: "", designation: "", subject: "", qualification: "", experience: "",
  achievements: "", bio: "", photo_url: "",
  email: "", phone: "", address: "", joined_date: null,
  display_order: 0, is_featured: false, is_visible: true,
};


function TeachersAdmin() {
  const { data = [], isLoading } = useCollection<TeacherRow>("teachers", "display_order", true);
  const { insert, update } = useMutations("teachers");
  const [editing, setEditing] = useState<TeacherRow | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <AdminHeader
        title="Teachers"
        subtitle="Manage faculty, assign class teachers, and generate QR profile passes."
        action={<button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary"><Plus size={16} /> Add teacher</button>}
      />

      {(creating || editing) && (
        <TeacherForm
          initial={editing ? { ...(editing as any) } : empty}
          editingRow={editing}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            const values = { ...v, joined_date: v.joined_date || null };
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
                <th className="p-4">Teacher</th>
                <th className="p-4 hidden md:table-cell">Subject</th>
                <th className="p-4 hidden lg:table-cell">Order</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setEditing(t)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {t.photo_url ? <img src={t.photo_url} className="h-10 w-10 rounded-full object-cover" alt="" />
                        : <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">{t.name.charAt(0)}</div>}
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{t.subject}</td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">{t.display_order}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <RowActions row={t} table="teachers" featuredField="is_featured" />
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={4} className="p-6 text-muted-foreground text-center">No teachers yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TeacherForm({ initial, editingRow, onSubmit, onCancel }: {
  initial: FormValues; editingRow: TeacherRow | null;
  onSubmit: (v: FormValues) => Promise<void>; onCancel: () => void;
}) {
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({ defaultValues: initial });
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = editingRow?.qr_token ? `${origin}/p/teacher/${editingRow.qr_token}` : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Teacher details</h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name *"><input required {...register("name")} className={inputCls} /></Field>
        <Field label="Designation"><input {...register("designation")} className={inputCls} /></Field>
        <Field label="Subject"><input {...register("subject")} className={inputCls} /></Field>
        <Field label="Qualification"><input {...register("qualification")} className={inputCls} /></Field>
        <Field label="Experience"><input {...register("experience")} className={inputCls} /></Field>
        <Field label="Joined date"><input type="date" {...register("joined_date")} className={inputCls} /></Field>
        <Field label="Phone"><input {...register("phone")} className={inputCls} /></Field>
        <Field label="Email"><input type="email" {...register("email")} className={inputCls} /></Field>
        <MediaUploadField name="photo_url" label="Teacher photo" value={watch("photo_url")} register={register} setValue={setValue} />
        <Field label="Display order"><input type="number" {...register("display_order", { valueAsNumber: true })} className={inputCls} /></Field>
        <Field label="Address" full><input {...register("address")} className={inputCls} /></Field>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_featured")} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_visible")} /> Visible</label>
        </div>
        <Field label="Achievements" full><textarea {...register("achievements")} rows={2} className={inputCls} /></Field>
        <Field label="Short bio" full><textarea {...register("bio")} rows={3} className={inputCls} /></Field>
      </div>

      {qrUrl && (
        <div className="mt-6">
          <h3 className="font-display text-lg mb-3">QR profile pass</h3>
          <div className="flex flex-wrap gap-4 items-start">
            <QrCard url={qrUrl} label={`teacher-${editingRow?.name || editingRow?.id}`} />
            <p className="text-sm text-muted-foreground max-w-md">
              Scan to open the teacher's public profile. Print and hand it out — no password needed.
            </p>
          </div>
        </div>
      )}

      {editingRow && <AccountCredentials recordType="teacher" recordId={editingRow.id} userId={editingRow.user_id} email={editingRow.email} />}

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
