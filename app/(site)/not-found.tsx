import { NotFoundContent } from "@/components/shared/NotFoundContent";

/** Rendered inside the site layout when a page calls notFound() (e.g. a missing article). */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
