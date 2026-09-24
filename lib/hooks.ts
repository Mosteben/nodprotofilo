"use client";

import { useEffect } from "react";

/** Warns before closing/reloading the tab while a form has unsaved changes. */
export function useUnsavedChangesWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

/** ISO timestamp → value for <input type="datetime-local"> in the browser's timezone. */
export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value → ISO string (or "" when empty). */
export function fromDateTimeLocal(value: string): string {
  return value ? new Date(value).toISOString() : "";
}
