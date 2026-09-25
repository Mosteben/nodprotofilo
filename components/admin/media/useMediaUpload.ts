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

export type UploadResult = { ok: true; media: MediaRow } | { ok: false; error: string };

/**
 * Validate → upload to the media bucket (with progress) → record in the media library.
 * `onProgress` receives 0..1 during the upload and 1 once the file is being recorded.
 */
export async function uploadImageToLibrary(
  file: File,
  altText = "",
  onProgress?: (fraction: number) => void
): Promise<UploadResult> {
  const invalid = validateImageFile(file);
  if (invalid) return { ok: false, error: invalid };

  const path = buildStoragePath(file.name, file.type as Parameters<typeof buildStoragePath>[1]);
  try {
    const [size] = await Promise.all([readImageSize(file), uploadWithProgress(path, file, (p) => onProgress?.(p))]);
    onProgress?.(1);

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
      return { ok: false, error: result.error };
    }
    return { ok: true, media: result.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "فشل رفع الملف." };
  }
}

/** Upload queue with per-file progress, used by the media-library uploader. */
export function useMediaUpload(onUploaded?: (media: MediaRow) => void) {
  const [items, setItems] = useState<UploadItem[]>([]);

  const patch = (key: string, changes: Partial<UploadItem>) =>
    setItems((list) => list.map((item) => (item.key === key ? { ...item, ...changes } : item)));

  const upload = useCallback(
    async (file: File, altText = ""): Promise<MediaRow | null> => {
      const key = crypto.randomUUID();
      setItems((list) => [{ key, name: file.name, progress: 0, status: "uploading" }, ...list]);

      const result = await uploadImageToLibrary(file, altText, (progress) =>
        patch(key, progress >= 1 ? { status: "saving", progress: 1 } : { progress })
      );
      if (!result.ok) {
        patch(key, { status: "error", error: result.error });
        return null;
      }
      patch(key, { status: "done" });
      onUploaded?.(result.media);
      return result.media;
    },
    [onUploaded]
  );

  const clearFinished = useCallback(
    () => setItems((list) => list.filter((item) => item.status === "uploading" || item.status === "saving")),
    []
  );

  return { items, upload, clearFinished };
}
