"use client";

import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv, MEDIA_BUCKET } from "@/lib/supabase/config";

function statusMessage(status: number): string {
  if (status === 401 || status === 403) return "ليس لديك صلاحية الرفع. سجّلي الدخول مرة أخرى.";
  if (status === 409) return "يوجد ملف بنفس الاسم بالفعل.";
  if (status === 413) return "حجم الملف أكبر من المسموح.";
  if (status === 415 || status === 422) return "نوع الملف غير مسموح.";
  return "فشل رفع الملف. حاولي مرة أخرى.";
}

/**
 * Uploads a file straight to Supabase Storage with progress events (supabase-js has no
 * progress callback, so this calls the Storage REST endpoint with the user's session).
 */
export async function uploadWithProgress(
  path: string,
  file: Blob,
  onProgress: (fraction: number) => void
): Promise<void> {
  const env = getSupabaseEnv();
  if (!env) throw new Error("لم يتم إعداد Supabase.");

  const {
    data: { session },
  } = await createClient().auth.getSession();
  if (!session) throw new Error("انتهت الجلسة. سجّلي الدخول مرة أخرى.");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${env.url}/storage/v1/object/${MEDIA_BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", env.anonKey);
    xhr.setRequestHeader("x-upsert", "false");
    // Paths are unique, so the file can be cached for a long time.
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(statusMessage(xhr.status))));
    xhr.onerror = () => reject(new Error("انقطع الاتصال أثناء الرفع. تحققي من الإنترنت وحاولي مرة أخرى."));
    xhr.send(file);
  });
}

/** Best-effort cleanup when a file was uploaded but could not be recorded. */
export async function removeUploadedObject(path: string): Promise<void> {
  await createClient().storage.from(MEDIA_BUCKET).remove([path]);
}

export async function readImageSize(file: Blob): Promise<{ width: number | null; height: number | null }> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return { width: null, height: null };
  }
}
