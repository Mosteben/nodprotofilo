"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Image as ImageIcon,
  Mail,
  Palette,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  PenLine,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: typeof LayoutDashboard; badge?: "unread" }[] = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/articles", label: "المقالات", icon: FileText },
  { href: "/admin/projects", label: "المشاريع", icon: Briefcase },
  { href: "/admin/media", label: "مكتبة الوسائط", icon: ImageIcon },
  { href: "/admin/messages", label: "الرسائل", icon: Mail, badge: "unread" },
  { href: "/admin/appearance", label: "الواجهة والمظهر", icon: Palette },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminSidebar({ unread, email, siteName }: { unread: number; email: string; siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="قائمة لوحة التحكم" className="flex flex-col h-full">
      <ul className="space-y-1 flex-1">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href as Route}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 font-ui text-sm transition-colors",
                  active ? "bg-gold text-navy font-semibold" : "text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge === "unread" && unread > 0 && (
                  <span
                    className={cn(
                      "min-w-6 h-6 px-2 rounded-full text-xs flex items-center justify-center",
                      active ? "bg-navy text-white" : "bg-gold text-navy"
                    )}
                    aria-label={`${unread} رسائل غير مقروءة`}
                  >
                    {unread}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-white/10 pt-4 mt-4 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-4 py-3 font-ui text-sm text-white/75 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-5 w-5" />
          عرض الموقع
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 font-ui text-sm text-white/75 hover:bg-red-500/20 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </button>
        </form>
        <p className="px-4 pt-2 font-ui text-xs text-white/40 truncate" dir="ltr" title={email}>
          {email}
        </p>
      </div>
    </nav>
  );

  const brand = (
    <Link href={"/admin" as Route} className="flex items-center gap-2 text-white">
      <PenLine className="h-6 w-6 text-gold" />
      <span className="font-display text-2xl truncate">{siteName}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-navy flex items-center justify-between px-4 h-16">
        {brand}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          className="h-10 w-10 flex items-center justify-center text-white"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-navy-900/60" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <aside
        id="admin-drawer"
        className={cn(
          "bg-navy-fade p-5 flex flex-col w-72 shrink-0",
          "fixed inset-y-0 right-0 z-50 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-8 px-2 pt-2">{brand}</div>
        {nav}
      </aside>
    </>
  );
}
