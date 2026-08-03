import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-ui font-medium transition-all duration-300 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none",
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
}

export function Button({ className, variant, size, href, children, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link href={href as Route} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
