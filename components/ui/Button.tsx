import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-btn font-ui font-medium transition-all duration-300 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-navy text-white hover:bg-navy-600 shadow-soft hover:shadow-gold hover:-translate-y-0.5",
        gold:
          "bg-gold text-navy hover:bg-gold-dark hover:-translate-y-0.5 shadow-gold",
        outline:
          "border border-navy/20 text-navy hover:border-gold hover:text-gold-dark",
        ghost: "text-navy hover:text-gold-dark",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-12 px-7 text-base",
        lg: "h-14 px-9 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: Route | string;
  /** Shows a spinner and disables the button while an async action runs. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  href,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    // External links open in a new tab; internal ones use client-side navigation.
    if (/^https?:\/\//i.test(href)) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href as Route} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
