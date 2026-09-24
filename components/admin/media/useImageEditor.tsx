"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import type { EditorSource } from "./ImageEditorDialog";

// Loaded on first use: the cropper is only needed once an image is being edited.
const ImageEditorDialog = dynamic(() => import("./ImageEditorDialog").then((m) => m.ImageEditorDialog), { ssr: false });

type Request = EditorSource & { original?: File; resolve: (file: File | null) => void; revoke: boolean };

/**
 * Promise-based access to the image editor:
 *   const file = await edit(original) // → edited File, the original, or null if cancelled
 * Render `editor` somewhere in the component.
 */
export function useImageEditor() {
  const [request, setRequest] = useState<Request | null>(null);

  const edit = useCallback(
    (file: File) =>
      new Promise<File | null>((resolve) =>
        setRequest({ src: URL.createObjectURL(file), name: file.name, type: file.type, size: file.size, original: file, resolve, revoke: true })
      ),
    []
  );

  /** Edit an already-uploaded image (fetched as a blob so the canvas is not tainted). */
  const editUrl = useCallback(async (url: string, name: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("تعذّر تحميل الصورة.");
    const blob = await response.blob();
    return new Promise<File | null>((resolve) =>
      setRequest({ src: URL.createObjectURL(blob), name, type: blob.type, size: blob.size, resolve, revoke: true })
    );
  }, []);

  function finish(file: File | null) {
    if (!request) return;
    if (request.revoke) URL.revokeObjectURL(request.src);
    request.resolve(file);
    setRequest(null);
  }

  const editor = request ? (
    <ImageEditorDialog source={request} original={request.original} onCancel={() => finish(null)} onDone={finish} />
  ) : null;

  return { edit, editUrl, editor };
}
