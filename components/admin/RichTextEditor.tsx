"use client";

import { useState } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import {
  Heading2,
  Heading3,
  Pilcrow,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImagePlus,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { ImagePickerDialog } from "@/components/admin/media/ImagePickerDialog";

type ToolbarState = {
  h2: boolean;
  h3: boolean;
  paragraph: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  link: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

const IDLE: ToolbarState = {
  h2: false,
  h3: false,
  paragraph: true,
  bold: false,
  italic: false,
  underline: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  link: false,
  canUndo: false,
  canRedo: false,
};

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the caret in the text: a mousedown on the button would otherwise blur the editor.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30",
        active ? "bg-navy text-white" : "text-navy/70 hover:bg-navy/10 hover:text-navy"
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="w-px h-6 bg-navy/10 mx-1 shrink-0" aria-hidden="true" />;

function LinkPanel({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [url, setUrl] = useState<string>(editor.getAttributes("link").href ?? "");
  const [error, setError] = useState("");

  function close() {
    onClose();
    editor.commands.focus();
  }

  function apply() {
    const value = url.trim();
    if (!value) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onClose();
      return;
    }
    if (!/^(https?:\/\/|mailto:)/i.test(value)) {
      setError("يجب أن يبدأ الرابط بـ https:// أو mailto:");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
    onClose();
  }

  return (
    <div className="flex flex-wrap items-start gap-2 border-b border-navy/10 bg-section/60 px-3 py-2.5">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="editor-link" className="sr-only">
          الرابط
        </label>
        <Input
          id="editor-link"
          dir="ltr"
          value={url}
          autoFocus
          placeholder="https://example.com"
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
            if (e.key === "Escape") close();
          }}
          className="h-10 bg-paper"
          aria-invalid={error ? true : undefined}
        />
        {error && <p className="font-ui text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <Button type="button" size="sm" onClick={apply}>
        تطبيق
      </Button>
      {editor.isActive("link") && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            onClose();
          }}
        >
          إزالة الرابط
        </Button>
      )}
      <Button type="button" size="sm" variant="ghost" onClick={close}>
        إلغاء
      </Button>
    </div>
  );
}

/**
 * Tiptap editor for CMS rich text (stored as HTML, sanitised on the server).
 *
 * `value` is only read when the editor is created; afterwards the editor owns the content
 * and reports changes through `onChange` (it never calls setContent while typing, so the
 * caret and focus are never reset). Remount with a `key` to load a different document.
 */
export function RichTextEditor({
  id,
  value,
  onChange,
  invalid,
  placeholder = "ابدأ/ي الكتابة…",
  minHeight = "min-h-[420px]",
  allowImages = true,
}: {
  id: string;
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
  placeholder?: string;
  minHeight?: string;
  allowImages?: boolean;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const editor = useEditor({
    // Created after mount, so server and client render the same markup (no hydration mismatch).
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto"],
        },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        dir: "rtl",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "المحتوى",
        class: cn("rich-content px-5 py-5 sm:px-7 outline-none", minHeight),
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  // Toolbar highlights; `editor` may still be null right after mount, so fall back to IDLE
  // instead of blocking the render on it.
  const state =
    useEditorState({
      editor,
      selector: ({ editor: e }): ToolbarState | null =>
        e
          ? {
              h2: e.isActive("heading", { level: 2 }),
              h3: e.isActive("heading", { level: 3 }),
              paragraph: e.isActive("paragraph"),
              bold: e.isActive("bold"),
              italic: e.isActive("italic"),
              underline: e.isActive("underline"),
              bulletList: e.isActive("bulletList"),
              orderedList: e.isActive("orderedList"),
              blockquote: e.isActive("blockquote"),
              link: e.isActive("link"),
              canUndo: e.can().undo(),
              canRedo: e.can().redo(),
            }
          : null,
    }) ?? IDLE;

  if (!editor) {
    return (
      <div className={cn("rounded-2xl border border-navy/10 bg-paper animate-pulse", minHeight)} aria-hidden="true" />
    );
  }

  const chain = () => editor.chain().focus();

  function insertImage(src: string, alt: string) {
    // Insert the image followed by an empty paragraph and put the caret there, so the next
    // keystroke continues the text instead of replacing the (selected) image.
    editor!
      .chain()
      .focus()
      .insertContent([
        { type: "image", attrs: { src, alt } },
        { type: "paragraph" },
      ])
      .run();
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-paper overflow-hidden transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20",
        invalid ? "border-red-500" : "border-navy/10"
      )}
    >
      <div
        role="toolbar"
        aria-label="أدوات التنسيق"
        aria-controls={id}
        className="flex items-center gap-0.5 overflow-x-auto border-b border-navy/10 bg-section/50 px-2 py-1.5 sticky top-16 lg:top-0 z-10"
      >
        <ToolbarButton label="فقرة" active={state.paragraph} onClick={() => chain().setParagraph().run()}>
          <Pilcrow className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="عنوان رئيسي" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="عنوان فرعي" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="عريض" active={state.bold} onClick={() => chain().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="مائل" active={state.italic} onClick={() => chain().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="تسطير" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="قائمة نقطية" active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="قائمة مرقّمة" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="اقتباس" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="رابط" active={state.link || linkOpen} onClick={() => setLinkOpen((v) => !v)}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        {allowImages && (
          <ToolbarButton label="إدراج صورة" onClick={() => setImageOpen(true)}>
            <ImagePlus className="h-4 w-4" />
          </ToolbarButton>
        )}
        <span className="flex-1 min-w-2" />
        <ToolbarButton label="تراجع" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="إعادة" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {linkOpen && <LinkPanel editor={editor} onClose={() => setLinkOpen(false)} />}

      <EditorContent editor={editor} />

      {allowImages && (
        <ImagePickerDialog
          open={imageOpen}
          onOpenChange={setImageOpen}
          onSelect={({ url, alt }) => insertImage(url, alt)}
          onClosed={() => editor.commands.focus()}
        />
      )}
    </div>
  );
}
