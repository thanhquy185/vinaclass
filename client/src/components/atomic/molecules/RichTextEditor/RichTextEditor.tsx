import { useEditor, EditorContent } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Toolbar } from "../Toolbar/Toolbar";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export const RichTextEditor = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (val: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true, // Cho phép paste ảnh base64
      }),
      Placeholder.configure({
        placeholder: "Viết gì đó thú vị vào đây...",
      }),
    ],
    content: content,
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

  return (
    <div className="overflow-hidden rounded-md border border-other-outlined-border text-text-primary transition-all">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
