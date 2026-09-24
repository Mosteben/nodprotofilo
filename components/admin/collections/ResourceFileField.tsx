"use client";

import { useRef, useState } from "react";
import { FileUp, FileText, Loader2, Trash2 } from "lucide-react";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { RESOURCES_BUCKET, RESOURCE_ACCEPT, buildResourcePath, validateResourceFile, resourceTypeLabel } from "@/lib/resource-files";
import { removeUploadedObject, uploadWithProgress } from "@/lib/upload";
import { formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export type UploadedResource = { file_path: string; file_url: string; file_name: string; mime_type: string; file_size: string };

function publicUrl(path: string) {
  const env = getSupabaseEnv();
  return env ? `${env.url}/storage/v1/object/public/${RESOURCES_BUCKET}/${path}` : "";
}

/**
 * Uploads a document to the `resources` bucket (with progress) and reports the stored file.
 * Replacing a file only takes effect when the form is saved; the server then removes the
 * old object. A file uploaded but never saved is removed if it is replaced again here.
 */
export function ResourceFileField({
  id,
  label,
  hint,
  error,
  current,
  onUploaded,
  onClear,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  current: { name: string; url: string; mime?: string; size?: number } | null;
  onUploaded: (file: UploadedResource) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [unsavedPath, setUnsavedPath] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    const problem = validateResourceFile(file);
    if (problem) return setUploadError(problem);

    const path = buildResourcePath(file.type);
    setProgress(0);
    try {
      await uploadWithProgress(path, file, setProgress, RESOURCES_BUCKET);
      if (unsavedPath) await removeUploadedObject(unsavedPath, RESOURCES_BUCKET).catch(() => undefined);
      setUnsavedPath(path);
      onUploaded({ file_path: path, file_url: publicUrl(path), file_name: file.name.slice(0, 255), mime_type: file.type, file_size: String(file.size) });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "فشل رفع الملف.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const message = uploadError || error;

  return (
    <div className="space-y-2">
      <p id={`${id}-label`} className="font-ui text-sm font-medium text-navy">
        {label}
      </p>
      {current ? (
        <div className="flex items-center gap-3 rounded-xl border border-navy/10 bg-section p-3">
          <FileText className="h-8 w-8 text-gold-dark shrink-0" />
          <div className="min-w-0 flex-1 font-ui">
            <a href={current.url} target="_blank" rel="noreferrer" className="block text-sm text-navy truncate hover:text-gold-dark" dir="auto">
              {current.name}
            </a>
            <span className="text-xs text-navy/50">
              {resourceTypeLabel(current.mime ?? null)}
              {current.size ? ` · ${formatFileSize(current.size)}` : ""}
            </span>
          </div>
          <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={onClear} aria-label="إزالة الملف">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="outline" disabled={progress !== null} onClick={() => inputRef.current?.click()} aria-describedby={`${id}-label`}>
          {progress !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          {current ? "استبدال الملف" : "رفع ملف"}
        </Button>
        {progress !== null && (
          <span className="font-ui text-xs text-navy/60" role="status">
            جارٍ الرفع… {Math.round(progress * 100)}٪
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={RESOURCE_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => void handle(e.target.files?.[0])}
        />
      </div>
      {message ? (
        <p role="alert" className="font-ui text-sm text-red-600">
          {message}
        </p>
      ) : (
        hint && <p className="font-ui text-xs text-navy/50">{hint}</p>
      )}
    </div>
  );
}
