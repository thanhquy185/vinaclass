import { useEditor, EditorContent } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { RichTextToolbar } from "./RichTextToolbar";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  editable?: boolean;
  locked?: boolean;
}

export const RichTextEditor = ({
  content,
  onChange,
  editable = true,
  locked = false,
}: RichTextEditorProps) => {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true, // Allow pasted base64 images.
      }),
      Placeholder.configure({
        placeholder: t("richTextEditor.placeholder"),
      }),
    ],
    content: content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[100px] p-4",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  return (
    <div
      aria-disabled={locked}
      className={`overflow-hidden rounded-md border border-other-outlined-border text-text-primary transition-all ${
        locked
          ? "pointer-events-none cursor-not-allowed bg-background-body-background opacity-60"
          : ""
      }`}
    >
      {editable && <RichTextToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};
