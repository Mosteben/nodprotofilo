"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SITE } from "@/lib/constants/site";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-paper/90 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      )}
    >
      <nav className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <PenLine className="h-6 w-6 text-gold-dark transition-transform group-hover:-rotate-12" />
          <span className="font-display text-2xl text-navy">{SITE.name}</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8 font-ui text-sm">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "link-underline pb-1 transition-colors",
                  pathname === link.href
                    ? "text-gold-dark font-semibold"
                    : "text-navy/80 hover:text-navy"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <button
            aria-label="بحث"
            className="h-10 w-10 flex items-center justify-center rounded-full text-navy/70 hover:bg-section transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
          <Button href="/contact" size="sm" variant="gold">
            تواصل معي
          </Button>
        </div>

        <button
          className="lg:hidden h-10 w-10 flex items-center justify-center text-navy"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-paper border-t border-navy/10"
          >
            <ul className="container flex flex-col py-4 gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block py-3 font-ui text-base border-b border-navy/5",
                      pathname === link.href ? "text-gold-dark font-semibold" : "text-navy/80"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
