import { sanitizeRichText } from "@/lib/sanitize";
import { isRichHtml } from "@/lib/text";
import { cn } from "@/lib/utils";

/**
 * Renders a CMS text field that may hold editor HTML (sanitised here, server-side) or
 * legacy plain text (rendered as paragraphs, with line breaks kept).
 */
export function RichText({ value, className }: { value: string; className?: string }) {
  if (isRichHtml(value)) {
    return <div className={cn("rich-content", className)} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }} />;
  }
  const paragraphs = value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={cn("rich-content", className)}>
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}
