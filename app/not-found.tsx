import { SiteShell } from "@/components/layout/SiteShell";
import { NotFoundContent } from "@/components/shared/NotFoundContent";

/** Unmatched URLs anywhere in the app. */
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
