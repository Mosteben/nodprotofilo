import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-xl bg-section px-4 outline-none border border-navy/10 text-ink placeholder:text-navy/40 focus-visible:border-gold transition-colors disabled:opacity-60 aria-[invalid=true]:border-red-500";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlBase, "h-12", className)} {...props} />;
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(controlBase, "py-3 resize-y leading-relaxed", className)} {...props} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(controlBase, "h-12 cursor-pointer", className)} {...props} />;
  }
);

/** Label + control + hint/error, wired together for screen readers. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block font-ui text-sm font-medium text-navy">
        {label}
        {required && <span className="text-red-600 ms-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="font-ui text-sm text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="font-ui text-xs text-navy/50">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Props that connect a control to its Field's hint/error text. */
export function describedBy(id: string, error?: string, hint?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

export function Checkbox({
  id,
  label,
  description,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; description?: string }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-5 w-5 rounded border-navy/30 accent-[rgb(var(--color-navy))]"
        {...props}
      />
      <span>
        <span className="block font-ui text-sm font-medium text-navy">{label}</span>
        {description && <span className="block font-ui text-xs text-navy/50">{description}</span>}
      </span>
    </label>
  );
}
