import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export function QrCard({ url, label }: { url: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: 220, margin: 1 }, () => {});
    QRCode.toDataURL(url, { width: 512, margin: 2 }).then(setDataUrl);
  }, [url]);

  return (
    <div className="rounded-xl border border-border bg-background p-4 flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-md" />
      <div className="text-xs text-muted-foreground text-center break-all max-w-[220px]">{url}</div>
      <div className="flex gap-2">
        <a href={dataUrl} download={`${label}-qr.png`} className="btn-outline text-xs">
          <Download size={14} /> PNG
        </a>
        <a href={url} target="_blank" rel="noreferrer" className="btn-outline text-xs">
          <ExternalLink size={14} /> Open
        </a>
        <button
          type="button"
          onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied"); }}
          className="btn-outline text-xs"
        >
          <Copy size={14} /> Copy
        </button>
      </div>
    </div>
  );
}
