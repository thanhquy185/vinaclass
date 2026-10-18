import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@/components/atomic/atoms";
import { TextField } from "@/components/atomic/molecules/TextField/TextField";
import type { ChapterItemRequest, ChapterListRequest, Subject } from "@/types";
import { Overlay } from "../../molecules/Overlay/Overlay";
import { TextArea } from "../../molecules/TextArea/TextArea";

interface SubjectFormProps {
  initialData?: Subject | null;
  onSave: (data: Subject) => void;
  onSaveUpdateChapters: (data: ChapterListRequest, subjectId?: number) => void;
  onCancel: () => void;
  mode: "create" | "view" | "update" | "none";
}

interface ChapterDisplay {
  id: number;
  chapterName: string;
}

export function SubjectForm({
  initialData,
  onSave,
  onSaveUpdateChapters,
  onCancel,
  mode,
}: SubjectFormProps) {
  const isView = mode === "view";
  const { t } = useTranslation("common");
  // KHẮC PHỤC: Khởi tạo state trực tiếp từ initialData.
  // Để state này cập nhật khi initialData thay đổi, hãy truyền key={initialData.id} khi gọi component này.
  const [formData, setFormData] = useState<Subject>(
    initialData ??
      ({
        id: 0,
        subjectCode: "",
        subjectName: "",
        creditCount: 0,
        theoryHours: 0,
        practiceHours: 0,
        isDeleted: 0,
      } as Subject)
  );

  const [errors, setErrors] = useState<Partial<Record<keyof Subject, string>>>(
    {}
  );

  const handleChange = (field: keyof Subject, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isView) {
      updateChapters();
      return;
    }

    const newErrors: Partial<Record<keyof Subject, string>> = {};

    if (!formData.subjectName?.trim()) {
      newErrors.subjectName = t("subjectPage.form.validation.nameRequired");
    }

    if (!formData.subjectCode?.trim()) {
      newErrors.subjectCode = t("subjectPage.form.validation.codeRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      alert(firstError);
      return;
    }

    onSave(formData);
  };

  const updateChapters = () => {
    const chapterItems: ChapterItemRequest[] = chapters.map((item) => ({
      chapterName: item.chapterName,
    }));
    onSaveUpdateChapters({ chapters: chapterItems }, initialData?.id);
  };

  const subjectChapters = initialData ? initialData.chapters : [];
  const mappedChapters = subjectChapters.map((item, index) => ({
    id: index + 1,
    chapterName: item.chapterName,
  }));
  const [chapters, setChapters] = useState(mappedChapters);

  const [editingChapterId, setEditingChapterId] = useState(0);
  const [currentChapterName, setCurrentChapterName] = useState("");

  const onClickEdit = (chapter: ChapterDisplay) => {
    setEditingChapterId(chapter.id);
    setCurrentChapterName(chapter.chapterName);
  };

  const onClickDelete = (chapter: ChapterDisplay) => {
    setChapters(chapters.filter((item) => item.id !== chapter.id));
  };

  const handleSaveChapter = (chapter: ChapterDisplay) => {
    if (editingChapterId) {
      setChapters((prev) =>
        prev.map((item) =>
          item.id === chapter.id
            ? { ...item, chapterName: chapter.chapterName }
            : item
        )
      );
      setEditingChapterId(0);
    } else {
      const newId = chapters.length + 1;
      setChapters([...chapters, { ...chapter, id: newId }]);
    }
    setCurrentChapterName("");
  };

  return (
    <Overlay onClose={onCancel}>
      {/* form chỉnh sửa subject */}
      <div className="flex w-[500px] flex-col overflow-hidden rounded-xl bg-background-paper shadow-2xl duration-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-other-divider px-6 py-2">
          <h6 className="text-body-1 font-bold text-text-primary">
            {initialData
              ? t("subjectPage.form.updateTitle")
              : t("subjectPage.form.addTitle")}
          </h6>
          <Button
            type="button"
            variant="text"
            size="small"
            onClick={onCancel}
            className="min-w-0 p-1.5 text-text-secondary"
          >
            <Icon name="close" size={24} />
          </Button>
        </div>

        {/* Body */}
        {isView ? (
          <div className="space-y-4 px-6 py-6">
            <div className="flex flex-col gap-2 py-2">
              <span className="text-body-1-semibold text-text-secondary">
                {t("subjectPage.editChapter.title")}
              </span>
              <div className="flex flex-col rounded-md border border-other-outlined-border bg-white">
                {chapters.length === 0 ? (
                  <div className="p-8 text-center text-text-disabled">
                    {t("subjectPage.editChapter.empty")}
                  </div>
                ) : (
                  chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="flex items-center gap-4 border-b border-other-outlined-border p-3 last:border-none hover:bg-gray-50"
                    >
                      <strong className="text-primary-main">{index + 1}</strong>
                      <div className="text-body-2 prose-sm max-w-none flex-1">
                        {chapter.chapterName}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex">
                          <Button
                            type="button"
                            variant="text"
                            color="primary"
                            size="small"
                            onClick={() => {
                              onClickEdit({
                                chapterName: chapter.chapterName,
                                id: index + 1,
                              });
                            }}
                          >
                            {t("subjectPage.editChapter.edit")}
                          </Button>
                          <Button
                            type="button"
                            variant="text"
                            color="error"
                            size="small"
                            onClick={() => {
                              onClickDelete({
                                chapterName: chapter.chapterName,
                                id: index + 1,
                              });
                            }}
                          >
                            {t("subjectPage.editChapter.delete")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 py-4">
              <span className="text-body-1-semibold text-text-secondary">
                {editingChapterId
                  ? t("subjectPage.editChapter.editing")
                  : t("subjectPage.editChapter.addNew")}
              </span>
              <div className="border-primary-main/20 bg-primary-main/5 flex flex-col gap-3 rounded-md border p-4">
                {/* <RichTextEditor
                  /> */}
                <TextArea
                  content={currentChapterName}
                  value={currentChapterName}
                  onChange={(e) => setCurrentChapterName(e.target.value)}
                ></TextArea>
                <div className="flex justify-end gap-2">
                  {editingChapterId !== 0 && (
                    <Button
                      type="button"
                      variant="text"
                      color="standard"
                      onClick={() => {
                        setEditingChapterId(0);
                        setCurrentChapterName("");
                      }}
                    >
                      {t("subjectPage.editChapter.cancelEdit")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      handleSaveChapter({
                        chapterName: currentChapterName,
                        id: editingChapterId,
                      })
                    }
                  >
                    {editingChapterId
                      ? t("subjectPage.editChapter.update")
                      : t("subjectPage.editChapter.saveNew")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-6 py-6">
            <TextField
              label={t("subjectPage.form.nameLabel")}
              placeholder={t("subjectPage.form.namePlaceholder")}
              value={formData.subjectName}
              onChange={(e) => handleChange("subjectName", e.target.value)}
              error={errors.subjectName}
            />

            <div className="grid grid-cols-2 gap-2">
              <TextField
                label={t("subjectPage.form.codeLabel")}
                placeholder={t("subjectPage.form.codePlaceholder")}
                value={formData.subjectCode}
                onChange={(e) => handleChange("subjectCode", e.target.value)}
                disabled={!!initialData}
                error={errors.subjectCode}
              />

              <TextField
                label={t("subjectPage.form.creditsLabel")}
                type="number"
                placeholder={t("subjectPage.form.creditsPlaceholder")}
                value={formData.creditCount || ""}
                onChange={(e) =>
                  handleChange("creditCount", Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <TextField
                label={t("subjectPage.form.theoryPeriodsLabel")}
                type="number"
                placeholder={t("subjectPage.form.theoryPeriodsPlaceholder")}
                value={formData.theoryHours || ""}
                onChange={(e) =>
                  handleChange("theoryHours", Number(e.target.value) || 0)
                }
              />

              <TextField
                label={t("subjectPage.form.practicePeriodsLabel")}
                type="number"
                placeholder={t("subjectPage.form.practicePeriodsPlaceholder")}
                value={formData.practiceHours || ""}
                onChange={(e) =>
                  handleChange("practiceHours", Number(e.target.value) || 0)
                }
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end border-t border-other-divider px-5 py-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={"outline"}
              color={"standard"}
              onClick={onCancel}
            >
              {t("subjectPage.form.backButton")}
            </Button>

            <Button
              type="submit"
              variant={"contained"}
              color={"primary"}
              onClick={handleSubmit}
            >
              {initialData
                ? t("subjectPage.form.updateButton")
                : t("subjectPage.form.saveButton")}
            </Button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
