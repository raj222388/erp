import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, Star } from "lucide-react";

const sb = supabase as any;

export function useCollection<T extends { id: string }>(table: string, orderBy = "created_at", asc = false) {
  return useQuery<T[]>({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await sb.from(table).select("*").order(orderBy, { ascending: asc });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMutations(table: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", table] });
    qc.invalidateQueries();
  };
  const insert = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await sb.from(table).insert(values);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Added"); },
    onError: (e: any) => {
      const msg = e?.message || "Operation failed";
      if (msg.includes("students_admission_no_key")) {
        toast.error("Admission number is already in use by another student.");
      } else {
        toast.error(msg);
      }
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { error } = await sb.from(table).update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Saved"); },
    onError: (e: any) => {
      const msg = e?.message || "Operation failed";
      if (msg.includes("students_admission_no_key")) {
        toast.error("Admission number is already in use by another student.");
      } else {
        toast.error(msg);
      }
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  });
  return { insert, update, remove };
}

export function RowActions({
  row, table, visibilityField = "is_visible", featuredField,
}: { row: any; table: string; visibilityField?: string; featuredField?: string }) {
  const { update, remove } = useMutations(table);
  const confirmDelete = () => {
    if (window.confirm("Delete this item?")) remove.mutate(row.id);
  };
  return (
    <div className="flex items-center gap-1">
      {featuredField && (
        <button
          title="Toggle featured"
          onClick={() => update.mutate({ id: row.id, values: { [featuredField]: !row[featuredField] } })}
          className={`p-2 rounded hover:bg-muted ${row[featuredField] ? "text-gold" : "text-muted-foreground"}`}
        >
          <Star size={14} fill={row[featuredField] ? "currentColor" : "none"} />
        </button>
      )}
      <button
        title="Toggle visibility"
        onClick={() => update.mutate({ id: row.id, values: { [visibilityField]: !row[visibilityField] } })}
        className="p-2 rounded hover:bg-muted text-muted-foreground"
      >
        {row[visibilityField] ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      <button
        title="Delete"
        onClick={confirmDelete}
        className="p-2 rounded hover:bg-destructive/10 text-destructive"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="font-display text-4xl">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
