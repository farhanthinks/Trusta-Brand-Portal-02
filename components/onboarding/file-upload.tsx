"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  helperText?: string;
  accept?: string;
  value: string | null;
  onUpload: (file: File) => Promise<string>;
  onUploaded: (result: string) => void;
}

export function FileUpload({
  label,
  helperText,
  accept = "image/*,application/pdf",
  value,
  onUpload,
  onUploaded,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setUploading(true);
    try {
      const result = await onUpload(file);
      setFileName(file.name);
      onUploaded(result);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const isUploaded = Boolean(value);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          isUploaded
            ? "border-primary/40 bg-red-50/50"
            : "border-border hover:border-primary/40 hover:bg-muted/40"
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-primary" />
        ) : isUploaded ? (
          <CheckCircle2 className="size-6 text-primary" />
        ) : (
          <UploadCloud className="size-6 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">
          {uploading
            ? "Uploading..."
            : isUploaded
            ? fileName ?? "File uploaded"
            : "Click to upload"}
        </span>
        {helperText && !isUploaded && (
          <span className="text-xs text-muted-foreground">{helperText}</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
