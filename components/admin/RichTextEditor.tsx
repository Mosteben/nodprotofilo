"use client";

import { useState } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Heading2,
  Heading3,
  Pilcrow,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  ImagePlus,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { ImagePickerDialog } from "@/components/admin/media/ImagePickerDialog";

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
      onClick={onClick}
      className={cn(
        "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30",
        active ? "bg-navy text-white" : "text-navy/70 hover:bg-navy/10"
      )}
    >
      {children}
    </button>
  );
}

function LinkPanel({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [url, setUrl] = useState<string>(editor.getAttributes("link").href ?? "");
  const [error, setError] = useState("");

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
    <div className="flex flex-wrap items-start gap-2 border-b border-navy/10 bg-section/60 p-3">
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
            if (e.key === "Escape") onClose();
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
      <Button type="button" size="sm" variant="ghost" onClick={onClose}>
        إلغاء
      </Button>
    </div>
  );
}

export function RichTextEditor({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const editor = useEditor({
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
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        dir: "rtl",
        role: "textbox",
        "aria-multiline": "true",
        class: "rich-content min-h-[360px] px-5 py-4 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            paragraph: e.isActive("paragraph"),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            bulletList: e.isActive("bulletList"),
            orderedList: e.isActive("orderedList"),
            blockquote: e.isActive("blockquote"),
            codeBlock: e.isActive("codeBlock"),
            link: e.isActive("link"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  if (!editor || !state) {
    return <div className="min-h-[420px] rounded-xl border border-navy/10 bg-paper animate-pulse" aria-hidden="true" />;
  }

  const chain = () => editor.chain().focus();

  return (
    <div
      className={cn(
        "rounded-xl border bg-paper overflow-hidden focus-within:border-gold transition-colors",
        invalid ? "border-red-500" : "border-navy/10"
      )}
    >
      <div role="toolbar" aria-label="أدوات التنسيق" className="flex flex-wrap items-center gap-1 border-b border-navy/10 bg-section/60 p-2 sticky top-16 lg:top-0 z-10">
        <ToolbarButton label="عنوان رئيسي" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="عنوان فرعي" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="فقرة" active={state.paragraph} onClick={() => chain().setParagraph().run()}>
          <Pilcrow className="h-4 w-4" />
        </ToolbarButton>
        <span className="w-px h-6 bg-navy/10 mx-1" aria-hidden="true" />
        <ToolbarButton label="عريض" active={state.bold} onClick={() => chain().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="مائل" active={state.italic} onClick={() => chain().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="تسطير" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="يتوسطه خط" active={state.strike} onClick={() => chain().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <span className="w-px h-6 bg-navy/10 mx-1" aria-hidden="true" />
        <ToolbarButton label="قائمة نقطية" active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="قائمة مرقّمة" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="اقتباس" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="كتلة برمجية" active={state.codeBlock} onClick={() => chain().toggleCodeBlock().run()}>
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="فاصل" onClick={() => chain().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <span className="w-px h-6 bg-navy/10 mx-1" aria-hidden="true" />
        <ToolbarButton label="رابط" active={state.link || linkOpen} onClick={() => setLinkOpen((v) => !v)}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="إدراج صورة" onClick={() => setImageOpen(true)}>
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>
        <span className="flex-1" />
        <ToolbarButton label="تراجع" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="إعادة" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {linkOpen && <LinkPanel editor={editor} onClose={() => setLinkOpen(false)} />}

      <EditorContent editor={editor} />

      <ImagePickerDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        onSelect={({ url, alt }) => chain().setImage({ src: url, alt }).run()}
      />
    </div>
  );
}
