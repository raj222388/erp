import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsQuery, type SiteSettings } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";
import { MediaUploadField } from "@/components/admin/MediaUploadField";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

const groups: { title: string; fields: { name: keyof SiteSettings; label: string; type?: string; multiline?: boolean }[] }[] = [
  {
    title: "School identity", fields: [
      { name: "school_name", label: "School name" },
      { name: "motto", label: "Motto" },
      { name: "logo_url", label: "Logo URL" },
      { name: "favicon_url", label: "Favicon URL" },
      { name: "welcome_message", label: "Welcome message", multiline: true },
    ],
  },
  {
    title: "Contact", fields: [
      { name: "address", label: "Address", multiline: true },
      { name: "phone", label: "Phone" },
      { name: "email", label: "Email", type: "email" },
      { name: "office_hours", label: "Office hours" },
      { name: "google_map_url", label: "Google Map URL" },
      { name: "google_map_embed", label: "Google Map embed URL (iframe src)", multiline: true },
    ],
  },
  {
    title: "Principal", fields: [
      { name: "principal_name", label: "Name" },
      { name: "principal_photo_url", label: "Photo URL" },
      { name: "principal_message", label: "Message", multiline: true },
      { name: "principal_signature_url", label: "Signature Image URL" },
    ],
  },
  {
    title: "Director", fields: [
      { name: "director_name", label: "Name" },
      { name: "director_photo_url", label: "Photo URL" },
      { name: "director_message", label: "Message", multiline: true },
    ],
  },
  {
    title: "Social links", fields: [
      { name: "facebook_url", label: "Facebook" },
      { name: "instagram_url", label: "Instagram" },
      { name: "twitter_url", label: "Twitter / X" },
      { name: "youtube_url", label: "YouTube" },
      { name: "linkedin_url", label: "LinkedIn" },
    ],
  },
  {
    title: "Announcement bar", fields: [
      { name: "announcement_bar", label: "Message" },
    ],
  },
  {
    title: "Footer & branding", fields: [
      { name: "footer_text", label: "Footer text", multiline: true },
      { name: "copyright", label: "Copyright" },
    ],
  },
  {
    title: "SEO", fields: [
      { name: "meta_title", label: "Meta title" },
      { name: "meta_description", label: "Meta description", multiline: true },
      { name: "meta_keywords", label: "Keywords" },
      { name: "og_image_url", label: "Open Graph image URL" },
    ],
  },
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery);
  const { register, handleSubmit, reset, setValue, watch } = useForm<SiteSettings>();

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const mutation = useMutation({
    mutationFn: async (values: SiteSettings) => {
      const { id, ...update } = values;
      const { error } = await (supabase as any).from("site_settings").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!data) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">Site settings</h1>
          <p className="text-muted-foreground mt-1">Everything that appears on the public site.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("announcement_active")} />
            Show announcement bar
          </label>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <div key={g.title} className="card-soft p-6">
            <h2 className="font-display text-lg">{g.title}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {g.fields.map((f) => (
                <div key={f.name} className={f.multiline ? "md:col-span-2" : ""}>
                  {["logo_url", "favicon_url", "principal_photo_url", "principal_signature_url", "director_photo_url", "og_image_url"].includes(f.name) ? (
                    <MediaUploadField name={f.name} label={f.label.replace(" URL", "")} value={watch(f.name) as string | null} register={register} setValue={setValue} />
                  ) : f.multiline ? (
                    <textarea {...register(f.name)} rows={3} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  ) : (
                    <><label className="text-sm font-medium">{f.label}</label><input type={f.type ?? "text"} {...register(f.name)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
