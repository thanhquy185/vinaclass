import { useState } from "react";
import { Button as AntButton, Empty, Input, List, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";
import type { Chapter } from "@/shared/types";

interface SubjectChapterEditorProps {
  chapters: Chapter[];
  canEdit: boolean;
  hasChanges: boolean;
  showSaveButton?: boolean;
  isSaving: boolean;
  onChange: (chapters: Chapter[]) => void;
  onPendingChange: (hasPendingDraft: boolean) => void;
  onSave: () => void;
}

export function SubjectChapterEditor({
  chapters,
  canEdit,
  hasChanges,
  showSaveButton = true,
  isSaving,
  onChange,
  onPendingChange,
  onSave,
}: SubjectChapterEditorProps) {
  const { t } = useTranslation("common");
  const [chapterName, setChapterName] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [validationError, setValidationError] = useState("");

  const resetDraft = () => {
    setChapterName("");
    setEditingChapterId(null);
    setValidationError("");
    onPendingChange(false);
  };

  const saveDraft = () => {
    const name = chapterName.trim();
    if (!name) {
      setValidationError(t("subjectPage.chapters.validation.nameRequired"));
      return;
    }

    if (name.length > 100) {
      setValidationError(t("subjectPage.chapters.validation.nameMaxLength"));
      return;
    }

    if (editingChapterId !== null) {
      onChange(
        chapters.map((chapter) =>
          chapter.id === editingChapterId
            ? { ...chapter, chapterName: name }
            : chapter,
        ),
      );
    } else {
      const newId = Math.min(0, ...chapters.map((chapter) => chapter.id)) - 1;
      onChange([
        ...chapters,
        {
          id: newId,
          chapterName: name,
          subjectId: chapters[0]?.subjectId ?? 0,
          isDeleted: 0,
        },
      ]);
    }

    resetDraft();
  };

  const startEdit = (chapter: Chapter) => {
    setChapterName(chapter.chapterName);
    setEditingChapterId(chapter.id);
    setValidationError("");
    onPendingChange(true);
  };

  const removeChapter = (chapterId: number) => {
    onChange(chapters.filter((chapter) => chapter.id !== chapterId));
    if (editingChapterId === chapterId) resetDraft();
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-other-divider bg-background-paper">
        <List
          dataSource={chapters}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("subjectPage.chapters.empty")}
              />
            ),
          }}
          renderItem={(chapter, index) => (
            <List.Item
              className="!px-4 sm:!px-5"
              actions={
                canEdit
                  ? [
                      <AntButton
                        key="edit"
                        type="link"
                        disabled={isSaving}
                        onClick={() => startEdit(chapter)}
                      >
                        {t("subjectPage.chapters.edit")}
                      </AntButton>,
                      <Popconfirm
                        key="delete"
                        title={t("subjectPage.chapters.removeTitle")}
                        description={t("subjectPage.chapters.removeConfirm", {
                          name: chapter.chapterName,
                        })}
                        okText={t("common.delete")}
                        cancelText={t("common.cancel")}
                        onConfirm={() => removeChapter(chapter.id)}
                        disabled={isSaving}
                      >
                        <AntButton type="link" danger disabled={isSaving}>
                          {t("subjectPage.chapters.remove")}
                        </AntButton>
                      </Popconfirm>,
                    ]
                  : undefined
              }
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-action-hover px-2 text-xs font-semibold text-text-secondary">
                  {index + 1}
                </span>
                <span className="min-w-0 break-words pt-1 text-sm font-medium text-text-primary">
                  {chapter.chapterName}
                </span>
              </div>
            </List.Item>
          )}
        />
      </div>

      {canEdit && (
        <div className="space-y-3 rounded-xl bg-background-body px-3.5 py-3.5 sm:px-4">
          <div className="text-sm font-medium text-text-primary">
            {editingChapterId !== null
              ? t("subjectPage.chapters.editing")
              : t("subjectPage.chapters.addNew")}
          </div>
          <Input
            value={chapterName}
            maxLength={100}
            disabled={isSaving}
            status={validationError ? "error" : undefined}
            placeholder={t("subjectPage.chapters.namePlaceholder")}
            aria-label={t("subjectPage.chapters.nameLabel")}
            onChange={(event) => {
              setChapterName(event.target.value);
              setValidationError("");
              onPendingChange(
                event.target.value.trim().length > 0 ||
                  editingChapterId !== null,
              );
            }}
            onPressEnter={(event) => {
              event.preventDefault();
              saveDraft();
            }}
          />
          {validationError && (
            <p className="text-xs text-error-main">{validationError}</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {editingChapterId !== null && (
                <AntButton disabled={isSaving} onClick={resetDraft}>
                  {t("subjectPage.chapters.cancelEdit")}
                </AntButton>
              )}
              <AntButton
                type="primary"
                disabled={isSaving}
                onClick={saveDraft}
              >
                {editingChapterId !== null
                  ? t("subjectPage.chapters.update")
                  : t("subjectPage.chapters.add")}
              </AntButton>
            </div>
            {showSaveButton && hasChanges && (
              <AntButton
                type="primary"
                ghost
                loading={isSaving}
                disabled={
                  isSaving ||
                  chapterName.trim().length > 0 ||
                  editingChapterId !== null
                }
                onClick={onSave}
              >
                {t("subjectPage.chapters.saveChanges")}
              </AntButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
