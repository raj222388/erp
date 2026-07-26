import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  name: string;
  label?: string;
  value?: string | null;
  register: any;
  setValue: any;
  required?: boolean;
};

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxBytes = 5 * 1024 * 1024;

export function MediaUploadField({ name, label = "Photo", value, register, setValue, required }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Use a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > maxBytes) {
      toast.error("Images must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `uploads/${crypto.randomUUID()}.${extension}`;
    const { error } = await (supabase as any).storage.from("media").upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });
    setUploading(false);

    if (error) {
      toast.error(error.message || "Photo upload failed.");
      return;
    }

    const { data } = (supabase as any).storage.from("media").getPublicUrl(path);
    setValue(name, data.publicUrl, { shouldDirty: true, shouldValidate: true });
    toast.success("Photo uploaded");
  };

  return (
    <div>
      <label className="text-sm font-medium">{label}{required ? " *" : ""}</label>
      <div className="mt-1 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
          className="btn-outline text-sm"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {uploading ? "Uploading..." : "Upload photo"}
        </button>
        {value && (
          <button
            type="button"
            className="btn-outline text-sm text-destructive"
            onClick={() => setValue(name, "", { shouldDirty: true, shouldValidate: true })}
          >
            <X size={15} /> Remove
          </button>
        )}
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      <input {...register(name, { required })} placeholder="Or paste an image URL" className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      {value && <img src={value} alt="Selected upload" className="mt-2 h-20 w-20 rounded-lg object-cover border border-border" />}
    </div>
  );
}
