import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "../../atoms";

interface Props {
  editor: Editor | null;
}

export const Toolbar = ({ editor }: Props) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Nhập URL hình ảnh:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const Options = [
    {
      icon: <Bold size={18} />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: "bold",
    },
    {
      icon: <Italic size={18} />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: "italic",
    },
    {
      icon: <List size={18} />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: "bulletList",
    },
    {
      icon: <ListOrdered size={18} />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: "orderedList",
    },
    {
      icon: <Quote size={18} />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      active: "blockquote",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 rounded-t-lg border-b bg-background-body p-2">
      {Options.map((opt, i) => (
        <Button
          key={i}
          onClick={opt.onClick}
          className={`rounded p-2 hover:bg-action-selected ${editor.isActive(opt.active) ? "bg-blue-100 text-blue-600" : ""}`}
        >
          {opt.icon}
        </Button>
      ))}
      <Button
        onClick={addImage}
        className="rounded p-2 hover:bg-action-selected"
      >
        <ImageIcon size={18} />
      </Button>
      <div className="ml-auto flex gap-1">
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 hover:bg-action-selected"
        >
          <Undo size={18} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 hover:bg-action-selected"
        >
          <Redo size={18} />
        </Button>
      </div>
    </div>
  );
};
