import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { Download, Plus, ReceiptText, X, IdCard } from "lucide-react";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { QrCard } from "@/components/admin/QrCard";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { AccountCredentials } from "@/components/admin/AccountCredentials";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/students")({
  component: StudentsAdmin,
});

type Student = {
  id: string;
  qr_token: string;
  admission_no: string | null;
  roll_no: string | null;
  first_name: string;
  last_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  classroom_id: string | null;
  grade: string | null;
  section: string | null;
  admission_date: string | null;
  previous_school: string | null;
  father_name: string | null;
  father_occupation: string | null;
  father_phone: string | null;
  father_email: string | null;
  father_photo_url: string | null;
  mother_name: string | null;
  mother_occupation: string | null;
  mother_phone: string | null;
  mother_email: string | null;
  mother_photo_url: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  notes: string | null;
  user_id: string | null;
  is_active: boolean;
};

type FormValues = Omit<Student, "id" | "qr_token">;

const empty: FormValues = {
  admission_no: "", roll_no: "", first_name: "", last_name: "", gender: "",
  date_of_birth: null, blood_group: "", address: "", phone: "", email: "",
  photo_url: "", classroom_id: null, grade: "", section: "",
  admission_date: null, previous_school: "",
  father_name: "", father_occupation: "", father_phone: "", father_email: "", father_photo_url: "",
  mother_name: "", mother_occupation: "", mother_phone: "", mother_email: "", mother_photo_url: "",
  guardian_name: "", guardian_phone: "", notes: "", user_id: null, is_active: true,
};

const sb = supabase as any;

function StudentsAdmin() {
  const [view, setView] = useState<"students" | "fees">("students");
  const { data = [], isLoading } = useCollection<Student>("students", "created_at", false);
  const { insert, update } = useMutations("students");
  const [editing, setEditing] = useState<Student | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: classrooms = [] } = useQuery<{ id: string; name: string; grade: string | null; section: string | null }[]>({
    queryKey: ["admin", "classrooms-lite"],
    queryFn: async () => {
      const { data, error } = await sb.from("classrooms").select("id, name, grade, section").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <AdminHeader
        title="Students"
        subtitle={view === "students" ? "Manage student records, parents info, and generate QR profile passes." : "Record student payments, view class-wise balances, and download receipts."}
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setView("students")} className={view === "students" ? "btn-primary" : "btn-outline"}>
              Students
            </button>
            <button onClick={() => { setView("fees"); setCreating(false); setEditing(null); }} className={view === "fees" ? "btn-primary" : "btn-outline"}>
              <ReceiptText size={16} /> Fees
            </button>
            <Link to="/admin/id-cards" className="btn-outline flex items-center gap-1.5">
              <IdCard size={16} /> ID Cards
            </Link>
            {view === "students" && (
              <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary">
                <Plus size={16} /> Add student
              </button>
            )}
          </div>
        }
      />

      {view === "fees" ? <StudentFees /> : <>

      {(creating || editing) && (
        <StudentForm
          initial={editing ? { ...(editing as any) } : empty}
          editingRow={editing}
          classrooms={classrooms}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            let grade = (v.grade || "").trim();
            let section = (v.section || "").trim();
            if (v.classroom_id) {
              const cls = classrooms.find((c) => c.id === v.classroom_id);
              if (cls) {
                if (!grade) grade = cls.grade || cls.name || "";
                if (!section) section = cls.section || "";
              }
            }
            const values = {
              ...v,
              classroom_id: v.classroom_id || null,
              grade: grade || null,
              section: section || null,
              address: (v.address || "").trim() || null,
              date_of_birth: v.date_of_birth || null,
              admission_date: v.admission_date || null,
            };
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
                <th className="p-4">Student</th>
                <th className="p-4 hidden md:table-cell">Class</th>
                <th className="p-4 hidden lg:table-cell">Admission #</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setEditing(s)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {s.photo_url ? <img src={s.photo_url} className="h-10 w-10 rounded-full object-cover" alt="" />
                        : <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">{s.first_name.charAt(0)}</div>}
                      <div>
                        <div className="font-medium">{s.first_name} {s.last_name}</div>
                        <div className="text-xs text-muted-foreground">Roll {s.roll_no || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{[s.grade, s.section].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">{s.admission_no || "—"}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <RowActions row={s} table="students" visibilityField="is_active" />
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={4} className="p-6 text-muted-foreground text-center">No students yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      </>}
    </div>
  );
}

type FeeRow = { id: string; student_id: string; label: string; amount: number | string; due_date: string | null; students: Student | null; fee_payments: { id: string; amount: number | string; receipt_number: string; paid_on: string; notes: string | null }[] | null };

function StudentFees() {
  const [classroomId, setClassroomId] = useState("all");
  const [paymentFor, setPaymentFor] = useState<FeeRow | null>(null);
  const { data: classrooms = [] } = useQuery<{ id: string; name: string; grade: string | null; section: string | null }[]>({
    queryKey: ["admin", "fee-classrooms"],
    queryFn: async () => { const { data, error } = await sb.from("classrooms").select("id, name, grade, section").order("name"); if (error) throw error; return data ?? []; },
  });
  const { data: fees = [], isLoading, refetch } = useQuery<FeeRow[]>({
    queryKey: ["admin", "student-fees-with-payments"],
    queryFn: async () => { const { data, error } = await sb.from("student_fees").select("id, student_id, label, amount, due_date, students (*), fee_payments (id, amount, receipt_number, paid_on, notes)").order("created_at", { ascending: false }); if (error) throw error; return data ?? []; },
  });
  const filteredFees = useMemo(() => fees.filter((fee) => classroomId === "all" || fee.students?.classroom_id === classroomId), [fees, classroomId]);
  const totalDue = filteredFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  const totalPaid = filteredFees.reduce((sum, fee) => sum + (fee.fee_payments ?? []).reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0), 0);

  return <section className="mt-6">
    <div className="card-soft p-5 flex flex-wrap items-end gap-4">
      <div><label className="text-sm font-medium">Class</label><select value={classroomId} onChange={(event) => setClassroomId(event.target.value)} className={inputCls}><option value="all">All classes</option>{classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}{classroom.grade ? ` (${classroom.grade}${classroom.section ? `-${classroom.section}` : ""})` : ""}</option>)}</select></div>
      <div className="text-sm"><div className="text-muted-foreground">Total assigned</div><div className="font-semibold">₹{totalDue.toLocaleString()}</div></div>
      <div className="text-sm"><div className="text-muted-foreground">Collected</div><div className="font-semibold text-emerald-700">₹{totalPaid.toLocaleString()}</div></div>
      <div className="text-sm"><div className="text-muted-foreground">Remaining</div><div className="font-semibold text-amber-700">₹{Math.max(0, totalDue - totalPaid).toLocaleString()}</div></div>
    </div>
    <div className="mt-5 card-soft overflow-hidden">
      {isLoading ? <div className="p-6 text-muted-foreground">Loading fees...</div> : <table className="w-full text-sm"><thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground"><tr><th className="p-4">Student</th><th className="p-4">Fee</th><th className="p-4">Assigned</th><th className="p-4">Paid</th><th className="p-4">Remaining</th><th className="p-4" /></tr></thead><tbody className="divide-y divide-border">{filteredFees.map((fee) => { const paid = (fee.fee_payments ?? []).reduce((sum, payment) => sum + Number(payment.amount), 0); const balance = Math.max(0, Number(fee.amount) - paid); return <tr key={fee.id}><td className="p-4"><div className="font-medium">{fee.students?.first_name} {fee.students?.last_name}</div><div className="text-xs text-muted-foreground">{[fee.students?.grade, fee.students?.section, fee.students?.roll_no ? `Roll ${fee.students.roll_no}` : ""].filter(Boolean).join(" · ")}</div></td><td className="p-4">{fee.label}</td><td className="p-4">₹{Number(fee.amount).toLocaleString()}</td><td className="p-4 text-emerald-700">₹{paid.toLocaleString()}</td><td className="p-4 font-medium text-amber-700">₹{balance.toLocaleString()}</td><td className="p-4 text-right"><div className="flex justify-end gap-2">{(fee.fee_payments ?? []).map((payment) => <button key={payment.id} type="button" onClick={() => downloadReceipt(fee, payment)} title="Download receipt" className="p-2 rounded hover:bg-muted"><Download size={16} /></button>)}{balance > 0 && <button type="button" onClick={() => setPaymentFor(fee)} className="btn-primary">Pay</button>}</div></td></tr>; })}{filteredFees.length === 0 && <tr><td className="p-6 text-center text-muted-foreground" colSpan={6}>No fee records for this class.</td></tr>}</tbody></table>}
    </div>
    {paymentFor && <PaymentDialog fee={paymentFor} onClose={() => setPaymentFor(null)} onDone={async () => { setPaymentFor(null); await refetch(); }} />}
  </section>;
}

function PaymentDialog({ fee, onClose, onDone }: { fee: FeeRow; onClose: () => void; onDone: () => Promise<void> }) {
  const paid = (fee.fee_payments ?? []).reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remaining = Math.max(0, Number(fee.amount) - paid);
  const [amount, setAmount] = useState(remaining.toString());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); const value = Number(amount); if (!Number.isFinite(value) || value <= 0 || value > remaining) { toast.error(`Enter an amount between ₹1 and ₹${remaining.toLocaleString()}.`); return; } setSaving(true); try { const { data: userData } = await sb.auth.getUser(); const { data: payment, error } = await sb.from("fee_payments").insert({ student_fee_id: fee.id, amount: value, notes: notes || null, recorded_by: userData.user?.id ?? null }).select("id, amount, receipt_number, paid_on, notes").single(); if (error) throw error; const left = remaining - value; const student = fee.students; const { error: notificationError } = await sb.from("notifications").insert({ student_id: fee.student_id, recipient_user_id: student?.user_id ?? null, title: "Fee payment received", message: `Payment of ₹${value.toLocaleString()} was received for ${fee.label}. Remaining balance: ₹${left.toLocaleString()}. Receipt: ${payment.receipt_number}.`, kind: "fee_payment" }); if (notificationError) throw notificationError; downloadReceipt(fee, payment); toast.success("Payment recorded and student notified."); await onDone(); } catch (error: any) { toast.error(error?.message || "Could not record the payment."); } finally { setSaving(false); } };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><form onSubmit={submit} className="card-soft w-full max-w-md p-6"><div className="flex items-center justify-between"><h2 className="font-display text-xl">Record fee payment</h2><button type="button" onClick={onClose} className="p-2 rounded hover:bg-muted"><X size={16} /></button></div><p className="mt-2 text-sm text-muted-foreground">{fee.students?.first_name} {fee.students?.last_name} · {fee.label}</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg bg-muted p-3"><div className="text-muted-foreground">Total</div><div className="font-semibold">₹{Number(fee.amount).toLocaleString()}</div></div><div className="rounded-lg bg-muted p-3"><div className="text-muted-foreground">Remaining</div><div className="font-semibold text-amber-700">₹{remaining.toLocaleString()}</div></div></div><label className="mt-4 block text-sm font-medium">Amount received<input autoFocus required type="number" min="1" max={remaining} value={amount} onChange={(event) => setAmount(event.target.value)} className={inputCls} /></label><label className="mt-4 block text-sm font-medium">Note (optional)<input value={notes} onChange={(event) => setNotes(event.target.value)} className={inputCls} placeholder="Cash, UPI, cheque…" /></label><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="btn-outline">Cancel</button><button disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving…" : "Record payment"}</button></div></form></div>;
}

function downloadReceipt(fee: FeeRow, payment: { amount: number | string; receipt_number: string; paid_on: string; notes: string | null }) {
  const student = fee.students; const totalPaid = (fee.fee_payments ?? []).reduce((sum, row) => sum + Number(row.amount), 0) + (fee.fee_payments?.some((row) => row.id === (payment as any).id) ? 0 : Number(payment.amount)); const remaining = Math.max(0, Number(fee.amount) - totalPaid); const text = `FEE PAYMENT RECEIPT\n\nReceipt: ${payment.receipt_number}\nDate: ${payment.paid_on}\n\nStudent: ${student?.first_name ?? ""} ${student?.last_name ?? ""}\nClass: ${[student?.grade, student?.section].filter(Boolean).join("-") || "—"}\nRoll no.: ${student?.roll_no || "—"}\n\nFee: ${fee.label}\nFee amount: ₹${Number(fee.amount).toLocaleString()}\nPayment received: ₹${Number(payment.amount).toLocaleString()}\nRemaining balance: ₹${remaining.toLocaleString()}\n${payment.notes ? `\nNote: ${payment.notes}\n` : ""}\nThis is a computer-generated fee receipt.`; const blob = new Blob([text], { type: "text/plain;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${payment.receipt_number}.txt`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
}

function StudentForm({
  initial, editingRow, classrooms, onSubmit, onCancel,
}: {
  initial: FormValues;
  editingRow: Student | null;
  classrooms: { id: string; name: string; grade: string | null; section: string | null }[];
  onSubmit: (v: FormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({ defaultValues: initial });
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = editingRow ? `${origin}/p/student/${editingRow.qr_token}` : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Student details</h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button>
      </div>

      <Section title="Basic info">
        <Field label="First name *"><input required {...register("first_name")} className={inputCls} /></Field>
        <Field label="Last name"><input {...register("last_name")} className={inputCls} /></Field>
        <Field label="Gender">
          <select {...register("gender")} className={inputCls}>
            <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
        </Field>
        <Field label="Date of birth"><input type="date" {...register("date_of_birth")} className={inputCls} /></Field>
        <Field label="Blood group"><input {...register("blood_group")} className={inputCls} /></Field>
        <MediaUploadField name="photo_url" label="Student photo" value={watch("photo_url")} register={register} setValue={setValue} />
      </Section>

      <Section title="Academic">
        <Field label="Admission #"><input {...register("admission_no")} className={inputCls} /></Field>
        <Field label="Roll #"><input {...register("roll_no")} className={inputCls} /></Field>
        <Field label="Classroom">
          <select
            {...register("classroom_id")}
            onChange={(e) => {
              const val = e.target.value;
              setValue("classroom_id", val);
              if (val) {
                const cls = classrooms.find((c) => c.id === val);
                if (cls) {
                  setValue("grade", cls.grade || cls.name || "");
                  setValue("section", cls.section || "");
                }
              }
            }}
            className={inputCls}
          >
            <option value="">— none —</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.grade ? ` (${c.grade}${c.section ? "-" + c.section : ""})` : ""}</option>
            ))}
          </select>
        </Field>
        <Field label="Grade"><input {...register("grade")} className={inputCls} /></Field>
        <Field label="Section"><input {...register("section")} className={inputCls} /></Field>
        <Field label="Admission date"><input type="date" {...register("admission_date")} className={inputCls} /></Field>
        <Field label="Previous school" full><input {...register("previous_school")} className={inputCls} /></Field>
      </Section>

      <Section title="Contact">
        <Field label="Phone"><input {...register("phone")} className={inputCls} /></Field>
        <Field label="Email"><input type="email" {...register("email")} className={inputCls} /></Field>
        <Field label="Address" full><textarea {...register("address")} rows={2} className={inputCls} /></Field>
      </Section>

      <Section title="Father">
        <Field label="Name"><input {...register("father_name")} className={inputCls} /></Field>
        <Field label="Occupation"><input {...register("father_occupation")} className={inputCls} /></Field>
        <Field label="Phone"><input {...register("father_phone")} className={inputCls} /></Field>
        <Field label="Email"><input type="email" {...register("father_email")} className={inputCls} /></Field>
        <div className="md:col-span-2"><MediaUploadField name="father_photo_url" label="Father photo" value={watch("father_photo_url")} register={register} setValue={setValue} /></div>
      </Section>

      <Section title="Mother">
        <Field label="Name"><input {...register("mother_name")} className={inputCls} /></Field>
        <Field label="Occupation"><input {...register("mother_occupation")} className={inputCls} /></Field>
        <Field label="Phone"><input {...register("mother_phone")} className={inputCls} /></Field>
        <Field label="Email"><input type="email" {...register("mother_email")} className={inputCls} /></Field>
        <div className="md:col-span-2"><MediaUploadField name="mother_photo_url" label="Mother photo" value={watch("mother_photo_url")} register={register} setValue={setValue} /></div>
      </Section>

      <Section title="Guardian & notes">
        <Field label="Guardian name"><input {...register("guardian_name")} className={inputCls} /></Field>
        <Field label="Guardian phone"><input {...register("guardian_phone")} className={inputCls} /></Field>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_active")} /> Active</label>
        </div>
        <Field label="Internal notes" full><textarea {...register("notes")} rows={2} className={inputCls} /></Field>
      </Section>

      {qrUrl && (
        <div className="mt-6">
          <h3 className="font-display text-lg mb-3">QR profile pass</h3>
          <div className="flex flex-wrap gap-4 items-start">
            <QrCard url={qrUrl} label={`student-${editingRow?.admission_no || editingRow?.id}`} />
            <p className="text-sm text-muted-foreground max-w-md">
              Scanning this QR opens the student's public profile — no password required. Print and hand it to the student or guardian.
            </p>
          </div>
        </div>
      )}

      {editingRow && <AccountCredentials recordType="student" recordId={editingRow.id} userId={editingRow.user_id} email={editingRow.email} />}

      <div className="mt-6 flex gap-2 justify-end">
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
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">{title}</div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}
