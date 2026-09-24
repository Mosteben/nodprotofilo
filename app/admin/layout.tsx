import type { Metadata } from "next";

// Every admin page depends on the visitor's session — never prerender or cache it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "لوحة التحكم", template: "%s | لوحة التحكم" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
