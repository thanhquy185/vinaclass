import type { Editor } from "@tiptap/react";
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
import { Input, Modal } from "antd";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";

export interface RichTextToolbarProps {
  editor: Editor | null;
}

export const RichTextToolbar = ({ editor }: RichTextToolbarProps) => {
  const { t } = useTranslation();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlErrorKey, setImageUrlErrorKey] = useState<string | null>(null);
  const imageUrlInputId = useId();
  const imageUrlErrorId = `${imageUrlInputId}-error`;

  if (!editor) return null;

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setImageUrl("");
    setImageUrlErrorKey(null);
  };

  const addImage = () => {
    const normalizedUrl = imageUrl.trim();
    if (!normalizedUrl) {
      setImageUrlErrorKey("richTextEditor.imageUrlRequired");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      setImageUrlErrorKey("richTextEditor.imageUrlInvalid");
      return;
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      setImageUrlErrorKey("richTextEditor.imageUrlInvalid");
      return;
    }

    editor.chain().focus().setImage({ src: parsedUrl.href }).run();
    closeImageModal();
  };

  const Options = [
    {
      icon: <Bold size={18} />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: "bold",
      label: t("richTextEditor.toolbar.bold"),
    },
    {
      icon: <Italic size={18} />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: "italic",
      label: t("richTextEditor.toolbar.italic"),
    },
    {
      icon: <List size={18} />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: "bulletList",
      label: t("richTextEditor.toolbar.bulletList"),
    },
    {
      icon: <ListOrdered size={18} />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: "orderedList",
      label: t("richTextEditor.toolbar.orderedList"),
    },
    {
      icon: <Quote size={18} />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      active: "blockquote",
      label: t("richTextEditor.toolbar.quote"),
    },
  ];

  return (
    <div
      role="group"
      aria-label={t("richTextEditor.toolbar.label")}
      className="flex flex-wrap gap-2 rounded-t-lg border-b bg-background-body p-2"
    >
      {Options.map((option) => (
        <Button
          key={option.active}
          aria-label={option.label}
          aria-pressed={editor.isActive(option.active)}
          tooltip={option.label}
          onClick={option.onClick}
          className={`rounded p-2 hover:bg-action-selected ${editor.isActive(option.active) ? "bg-primary-background text-primary-main" : ""}`}
        >
          {option.icon}
        </Button>
      ))}
      <Button
        aria-label={t("richTextEditor.toolbar.image")}
        aria-haspopup="dialog"
        tooltip={t("richTextEditor.toolbar.image")}
        onClick={() => setIsImageModalOpen(true)}
        className="rounded p-2 hover:bg-action-selected"
      >
        <ImageIcon size={18} />
      </Button>
      <div className="ml-auto flex gap-1">
        <Button
          aria-label={t("richTextEditor.toolbar.undo")}
          tooltip={t("richTextEditor.toolbar.undo")}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 hover:bg-action-selected"
        >
          <Undo size={18} />
        </Button>
        <Button
          aria-label={t("richTextEditor.toolbar.redo")}
          tooltip={t("richTextEditor.toolbar.redo")}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 hover:bg-action-selected"
        >
          <Redo size={18} />
        </Button>
      </div>
      <Modal
        open={isImageModalOpen}
        title={t("richTextEditor.insertImageTitle")}
        onCancel={closeImageModal}
        onOk={addImage}
        okText={t("richTextEditor.insertImage")}
        cancelText={t("richTextEditor.cancel")}
        destroyOnHidden
      >
        <div className="flex flex-col gap-2">
          <label htmlFor={imageUrlInputId} className="font-medium">
            {t("richTextEditor.imageUrlLabel")}
          </label>
          <Input
            id={imageUrlInputId}
            value={imageUrl}
            aria-label={t("richTextEditor.imageUrlLabel")}
            aria-describedby={imageUrlErrorKey ? imageUrlErrorId : undefined}
            placeholder={t("richTextEditor.imageUrlPlaceholder")}
            status={imageUrlErrorKey ? "error" : undefined}
            onChange={(event) => {
              setImageUrl(event.target.value);
              setImageUrlErrorKey(null);
            }}
            onPressEnter={addImage}
          />
          {imageUrlErrorKey && (
            <p
              id={imageUrlErrorId}
              className="text-sm text-error-main"
              role="alert"
            >
              {t(imageUrlErrorKey)}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
