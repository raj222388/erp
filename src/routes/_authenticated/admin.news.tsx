import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { NewsItem } from "@/lib/queries";
import { useCollection, useMutations, RowActions, AdminHeader } from "@/components/admin/crud";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/news")({
  component: NewsAdmin,
});

type FormValues = {
  title: string; slug: string; excerpt: string; content: string; cover_image_url: string;
  is_featured: boolean; is_published: boolean;
};
const empty: FormValues = { title: "", slug: "", excerpt: "", content: "", cover_image_url: "", is_featured: false, is_published: true };

function NewsAdmin() {
  const { data = [], isLoading } = useCollection<NewsItem>("news", "published_at", false);
  const { insert, update } = useMutations("news");
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <AdminHeader
        title="News"
        subtitle="Publish articles and announcements."
        action={<button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary"><Plus size={16} /> New article</button>}
      />

      {(creating || editing) && (
        <NewsForm
          initial={editing ? {
            title: editing.title, slug: editing.slug ?? "", excerpt: editing.excerpt ?? "",
            content: editing.content ?? "", cover_image_url: editing.cover_image_url ?? "",
            is_featured: editing.is_featured, is_published: editing.is_published,
          } : empty}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (v) => {
            if (editing) await update.mutateAsync({ id: editing.id, values: v });
            else await insert.mutateAsync({ ...v, published_at: new Date().toISOString() });
            setCreating(false); setEditing(null);
          }}
        />
      )}

      <div className="mt-6 card-soft overflow-hidden">
        {isLoading ? <div className="p-6 text-muted-foreground">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4 hidden md:table-cell">Published</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((n) => (
                <tr key={n.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setEditing(n)}>
                  <td className="p-4">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{n.excerpt}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">
                    {n.published_at && new Date(n.published_at).toLocaleDateString()}
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <RowActions row={n} table="news" visibilityField="is_published" featuredField="is_featured" />
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={3} className="p-6 text-muted-foreground text-center">No articles yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function NewsForm({ initial, onSubmit, onCancel }: { initial: FormValues; onSubmit: (v: FormValues) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit } = useForm<FormValues>({ defaultValues: initial });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card-soft p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Article</h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-muted rounded"><X size={16} /></button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><label className="text-sm font-medium">Title *</label><input required {...register("title")} className={inputCls} /></div>
        <div><label className="text-sm font-medium">Slug</label><input {...register("slug")} className={inputCls} placeholder="auto-generated if empty" /></div>
        <div><label className="text-sm font-medium">Cover image URL</label><input {...register("cover_image_url")} className={inputCls} /></div>
        <div className="md:col-span-2"><label className="text-sm font-medium">Excerpt</label><textarea {...register("excerpt")} rows={2} className={inputCls} /></div>
        <div className="md:col-span-2"><label className="text-sm font-medium">Content</label><textarea {...register("content")} rows={8} className={inputCls} /></div>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_featured")} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_published")} /> Published</label>
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
