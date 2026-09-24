"use client";

import { useRouter } from "next/navigation";
import { MediaUploader } from "./MediaUploader";

/** Uploader for the media library page — refreshes the server-rendered grid after each upload. */
export function MediaUploadPanel() {
  const router = useRouter();
  return <MediaUploader onUploaded={() => router.refresh()} />;
}
