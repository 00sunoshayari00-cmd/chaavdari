// components/admin/RichTextEditor.tsx
"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
} from "lucide-react";
import { LIMITS, htmlToText, wordCount } from "@/lib/productRules";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
  invalid?: boolean;
  label: string;
}

const { min, max, suggestedWords } = LIMITS.description;

export default function RichTextEditor({
  value,
  onChange,
  required,
  invalid,
  label,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // the admin page is server rendered
    extensions: [
      // Only what the public page renders: paragraphs, H2/H3, lists, bold, italic, links
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        "aria-label": label,
        class:
          "prose-admin min-h-48 px-3 py-2 text-sm focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            p: editor.isActive("paragraph"),
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            link: editor.isActive("link"),
          }
        : null,
  });

  const text = htmlToText(value);
  const chars = text.length;
  const words = wordCount(text);

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (leave empty to remove)", previous ?? "https://");
    if (url === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url.trim() === "" || url.trim() === "https://") chain.unsetLink().run();
    else chain.setLink({ href: url.trim() }).run();
  }

  const buttons = editor
    ? [
        { icon: Pilcrow, title: "Paragraph", on: active?.p, run: () => editor.chain().focus().setParagraph().run() },
        { icon: Heading2, title: "Heading 2", on: active?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { icon: Heading3, title: "Heading 3", on: active?.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        { icon: Bold, title: "Bold", on: active?.bold, run: () => editor.chain().focus().toggleBold().run() },
        { icon: Italic, title: "Italic", on: active?.italic, run: () => editor.chain().focus().toggleItalic().run() },
        { icon: List, title: "Bullet list", on: active?.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
        { icon: ListOrdered, title: "Numbered list", on: active?.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
        { icon: Link2, title: "Link", on: active?.link, run: setLink },
      ]
    : [];

  const countColor =
    chars > max
      ? "text-red-600"
      : chars > 0 && chars < min
        ? "text-amber-600"
        : "text-neutral-500";

  return (
    <div>
      <div
        className={`mt-1 overflow-hidden rounded-md border bg-white focus-within:border-[#F26A0F] ${
          invalid ? "border-red-400" : "border-neutral-300"
        }`}
      >
        <div className="flex flex-wrap gap-1 border-b border-neutral-200 bg-neutral-50 p-1">
          {buttons.map(({ icon: Icon, title, on, run }) => (
            <button
              key={title}
              type="button"
              title={title}
              aria-label={title}
              aria-pressed={Boolean(on)}
              onClick={run}
              className={`rounded p-1.5 ${
                on ? "bg-[#F26A0F] text-white" : "text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
      <p className={`mt-1 text-xs ${countColor}`}>
        {chars}/{max} characters · {words} words
        {required && chars < min && ` · at least ${min} characters`}
        {chars > 0 && words < suggestedWords && ` · ${suggestedWords}+ words is better for Google`}
      </p>
    </div>
  );
}
