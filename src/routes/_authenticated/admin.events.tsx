import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { EventItem } from "@/lib/queries";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: EventsAdmin,
});

type FormValues = { title: string; description: string; event_date: string; venue: string; poster_url: string; is_featured: boolean; is_archived: boolean; is_published: boolean };
const empty: FormValues = { title: "", description: "", event_date: "", venue: "", poster_url: "", is_featured: false, is_archived: false, is_published: true };

function EventsAdmin() {
  const { data = [], isLoading } = useCollection<EventItem>("events", "event_date", true);
  const { insert, update } = useMutations("events");
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <AdminHeader title="Events" subtitle="Upcoming and past events." action={
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary"><Plus size={16} /> New event</button>
      } />
      {(creating || editing) && (
        <EventForm
          initial={editing ? {
            title: editing.title, description: editing.description ?? "",
            event_date: editing.event_date ? editing.event_date.slice(0, 16) : "",
            venue: editing.venue ?? "", poster_url: editing.poster_url ?? "",
            is_featured: editing.is_featured, is_archived: editing.is_archived, is_published: editing.is_published,
          } : empty}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            const payload = { ...v, event_date: v.event_date ? new Date(v.event_date).toISOString() : null };
            if (editing) await update.mutateAsync({ id: editing.id, values: payload });
            else await insert.mutateAsync(payload);
            setCreating(false); setEditing(null);
          }}
        />
      )}
      <div className="mt-6 card-soft overflow-hidden">
        {isLoading ? <div className="p-6 text-muted-foreground">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="p-4">Event</th><th className="p-4 hidden md:table-cell">Date</th><th className="p-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setEditing(e)}>
                  <td className="p-4"><div className="font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{e.venue}</div></td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">{e.event_date && new Date(e.event_date).toLocaleString()}</td>
                  <td className="p-4" onClick={(ev) => ev.stopPropagation()}>
                    <RowActions row={e} table="events" visibilityField="is_published" featuredField="is_featured" />
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={3} className="p-6 text-muted-foreground text-center">No events yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function EventForm({ initial, onSubmit, onCancel }: { initial: FormValues; onSubmit: (v: FormValues) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit } = useForm<FormValues>({ defaultValues: initial });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Event</h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><label className="text-sm font-medium">Title *</label><input required {...register("title")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Date & time</label><input type="datetime-local" {...register("event_date")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Venue</label><input {...register("venue")} className={inputCls} /></div>
        <div className="md:col-span-2"><label className="text-sm font-medium">Poster image URL</label><input {...register("poster_url")} className={inputCls} /></div>
        <div className="md:col-span-2"><label className="text-sm font-medium">Description</label><textarea {...register("description")} rows={4} className={inputCls} /></div>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_featured")} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_published")} /> Published</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_archived")} /> Archived</label>
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
