"use client";

import { useCallback, useState } from "react";
import { registerMedia } from "@/lib/actions/media";
import { buildStoragePath, validateImageFile } from "@/lib/media";
import { readImageSize, removeUploadedObject, uploadWithProgress } from "@/lib/upload";
import type { MediaRow } from "@/types/database";

export type UploadItem = {
  key: string;
  name: string;
  progress: number;
  status: "uploading" | "saving" | "done" | "error";
  error?: string;
};

/** Validate → upload to storage (with progress) → record in the media table. */
export function useMediaUpload(onUploaded?: (media: MediaRow) => void) {
  const [items, setItems] = useState<UploadItem[]>([]);

  const patch = (key: string, changes: Partial<UploadItem>) =>
    setItems((list) => list.map((item) => (item.key === key ? { ...item, ...changes } : item)));

  const upload = useCallback(
    async (file: File, altText = ""): Promise<MediaRow | null> => {
      const key = crypto.randomUUID();
      const error = validateImageFile(file);
      setItems((list) => [
        { key, name: file.name, progress: 0, status: error ? "error" : "uploading", error: error ?? undefined },
        ...list,
      ]);
      if (error) return null;

      const path = buildStoragePath(file.name, file.type as Parameters<typeof buildStoragePath>[1]);
      try {
        const [size] = await Promise.all([
          readImageSize(file),
          uploadWithProgress(path, file, (progress) => patch(key, { progress })),
        ]);
        patch(key, { status: "saving", progress: 1 });

        const result = await registerMedia({
          file_path: path,
          file_name: file.name.slice(0, 255),
          mime_type: file.type,
          size: file.size,
          width: size.width,
          height: size.height,
          alt_text: altText,
        });
        if (!result.ok) {
          await removeUploadedObject(path).catch(() => undefined);
          patch(key, { status: "error", error: result.error });
          return null;
        }

        patch(key, { status: "done" });
        onUploaded?.(result.data);
        return result.data;
      } catch (e) {
        patch(key, { status: "error", error: e instanceof Error ? e.message : "فشل رفع الملف." });
        return null;
      }
    },
    [onUploaded]
  );

  const clearFinished = useCallback(
    () => setItems((list) => list.filter((item) => item.status === "uploading" || item.status === "saving")),
    []
  );

  return { items, upload, clearFinished };
}
