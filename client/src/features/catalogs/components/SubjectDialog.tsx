import { useMemo, useState } from "react";
import { Form, InputNumber } from "antd";
import { AlertTriangle, BookOpenText, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToastStore } from "@/shared/stores/useToastStore";
import type {
  Chapter,
  ChapterListRequest,
  Subject,
  SubjectRequest,
  SubjectUpdateRequest,
} from "@/shared/types";
import {
  AdminFormField,
  AdminFormSection,
  AdminReadOnlyField,
  AdminTextField,
} from "@/shared/components/admin";
import { AppDialog, Button } from "@/shared/components/ui";
import { SubjectChapterEditor } from "@/features/catalogs/components/SubjectChapterEditor";
import { maxLengthRule, requiredFieldRule } from "@/shared/utils/validation";

export type SubjectDialogMode = "create" | "view" | "update" | "delete";

type SubjectFormValues = Omit<
  SubjectRequest,
  "theoryHours" | "practiceHours"
> & {
  theoryHours?: number;
  practiceHours?: number;
};

interface SubjectDialogProps {
  mode: SubjectDialogMode;
  subject: Subject | null;
  canUpdateSubject: boolean;
  canCreateChapters: boolean;
  canUpdateChapters: boolean;
  isSaving: boolean;
  isSavingChapters: boolean;
  onClose: () => void;
  onSaveCreate: (data: SubjectRequest) => Promise<boolean>;
  onSaveUpdate: (
    subjectId: number,
    data: SubjectUpdateRequest
  ) => Promise<boolean>;
  onSaveChapters: (
    subjectId: number,
    data: ChapterListRequest
  ) => Promise<Chapter[] | null>;
  onDelete: () => Promise<boolean>;
}

const toChapterRequest = (chapters: Chapter[]): ChapterListRequest => ({
  chapters: chapters.map(({ id, chapterName }) => ({
    chapterName,
    ...(id > 0 ? { id } : {}),
  })),
});

const chaptersSignature = (chapters: Chapter[]) =>
  JSON.stringify(chapters.map(({ id, chapterName }) => ({ id, chapterName })));

export function SubjectDialog({
  mode,
  subject,
  canUpdateSubject,
  canCreateChapters,
  canUpdateChapters,
  isSaving,
  isSavingChapters,
  onClose,
  onSaveCreate,
  onSaveUpdate,
  onSaveChapters,
  onDelete,
}: SubjectDialogProps) {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const [form] = Form.useForm<SubjectFormValues>();
  const [chapters, setChapters] = useState<Chapter[]>(subject?.chapters ?? []);
  const [savedChapters, setSavedChapters] = useState<Chapter[]>(
    subject?.chapters ?? []
  );
  const [hasPendingChapterDraft, setHasPendingChapterDraft] = useState(false);

  const isCreate = mode === "create";
  const isView = mode === "view";
  const isDelete = mode === "delete";
  const isUpdate = mode === "update";
  const canEditDetails = isCreate || (isUpdate && canUpdateSubject);
  const isBusy = isSaving || isSavingChapters;
  const chaptersDirty = useMemo(
    () => chaptersSignature(chapters) !== chaptersSignature(savedChapters),
    [chapters, savedChapters]
  );

  const initialValues: SubjectFormValues = {
    subjectCode: subject?.subjectCode ?? "",
    subjectName: subject?.subjectName ?? "",
    creditCount: subject?.creditCount ?? 0,
    theoryHours: subject?.theoryHours ?? undefined,
    practiceHours: subject?.practiceHours ?? undefined,
  };

  const persistChapters = async () => {
    if (!subject || !canUpdateChapters || !chaptersDirty) return true;
    const updatedChapters = await onSaveChapters(
      subject.id,
      toChapterRequest(chapters)
    );
    if (updatedChapters === null) return false;
    setChapters(updatedChapters);
    setSavedChapters(updatedChapters);
    return true;
  };

  const handleSubmit = async (values: SubjectFormValues) => {
    if (isBusy) return;
    if (hasPendingChapterDraft) {
      showToast(t("subjectPage.chapters.pendingDraft"), "warning");
      return;
    }
    if (values.theoryHours == null || values.practiceHours == null) return;

    const cleanValues = {
      subjectCode: values.subjectCode.trim(),
      subjectName: values.subjectName.trim(),
      creditCount: values.creditCount,
      theoryHours: values.theoryHours,
      practiceHours: values.practiceHours,
    };

    if (isCreate) {
      const createData: SubjectRequest = {
        ...cleanValues,
        ...(canCreateChapters && chapters.length > 0
          ? {
              chapters: chapters.map(({ chapterName }) => ({ chapterName })),
            }
          : {}),
      };
      if (await onSaveCreate(createData)) onClose();
      return;
    }

    if (!isUpdate || !subject || !canUpdateSubject) return;

    const updated = await onSaveUpdate(subject.id, {
      subjectName: cleanValues.subjectName,
      creditCount: cleanValues.creditCount,
      theoryHours: cleanValues.theoryHours,
      practiceHours: cleanValues.practiceHours,
    });
    if (!updated) return;

    if (!(await persistChapters())) return;
    onClose();
  };

  const handleDelete = async () => {
    if (await onDelete()) onClose();
  };

  const titleKey = isDelete
    ? "subjectPage.dialog.deleteTitle"
    : isView
      ? "subjectPage.dialog.viewTitle"
      : isUpdate
        ? "subjectPage.dialog.updateTitle"
        : "subjectPage.dialog.createTitle";
  const descriptionKey = isDelete
    ? "subjectPage.dialog.deleteDescription"
    : isView
      ? "subjectPage.dialog.viewDescription"
      : isUpdate
        ? "subjectPage.dialog.updateDescription"
        : "subjectPage.dialog.createDescription";

  const footer = isDelete ? (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="medium" onClick={onClose}>
        {t("common.back")}
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="medium"
        onClick={() => void handleDelete()}
        loading={isSaving}
        disabled={isSaving}
      >
        {t("subjectPage.deleteAction")}
      </Button>
    </div>
  ) : isView ? (
    <div className="flex justify-end">
      <Button variant="outline" size="medium" onClick={onClose}>
        {t("common.back")}
      </Button>
    </div>
  ) : (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="medium"
        onClick={onClose}
        disabled={isBusy}
      >
        {t("common.back")}
      </Button>
      {canEditDetails && (
        <Button
          variant="contained"
          color="primary"
          size="medium"
          htmlType="submit"
          form="subject-form"
          loading={isBusy}
          disabled={isBusy || hasPendingChapterDraft}
        >
          {t(isCreate ? "subjectPage.saveAction" : "subjectPage.updateAction")}
        </Button>
      )}
    </div>
  );

  return (
    <AppDialog
      open
      onClose={onClose}
      title={t(titleKey)}
      description={t(descriptionKey)}
      icon={
        isDelete ? (
          <AlertTriangle size={20} />
        ) : isView ? (
          <BookOpenText size={20} />
        ) : (
          <GraduationCap size={20} />
        )
      }
      tone={isDelete ? "danger" : "primary"}
      width="min(900px, calc(100vw - 32px))"
      busy={isSaving || isSavingChapters}
      footer={footer}
    >
      {isDelete ? (
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <AdminFormSection title={t("subjectPage.sections.details")}>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminReadOnlyField
                label={t("subjectPage.table.name")}
                value={subject?.subjectName}
              />
              <AdminReadOnlyField
                label={t("subjectPage.table.code")}
                value={subject?.subjectCode}
              />
              <AdminReadOnlyField
                label={t("subjectPage.table.chapters")}
                value={subject?.chaptersCount ?? subject?.chapters?.length ?? 0}
              />
              <AdminReadOnlyField
                label={t("subjectPage.table.courseGroups")}
                value={subject?.courseGroupsCount ?? 0}
              />
            </dl>
          </AdminFormSection>
          <p className="text-sm leading-5 text-text-secondary">
            {t("subjectPage.dialog.deleteConfirm", {
              name: subject?.subjectName ?? "",
            })}
          </p>
        </div>
      ) : (
        <Form
          id="subject-form"
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
        >
          <div className="space-y-6 px-5 py-5 sm:px-6">
            <AdminFormSection title={t("subjectPage.sections.details")}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {canEditDetails ? (
                  <>
                    <AdminTextField
                      fieldClassName="sm:col-span-2"
                      name="subjectName"
                      label={t("subjectPage.form.nameLabel")}
                      rules={[
                        requiredFieldRule(
                          t("subjectPage.form.validation.nameRequired"),
                          { whitespace: true }
                        ),
                        maxLengthRule(
                          150,
                          t("subjectPage.form.validation.nameMaxLength")
                        ),
                      ]}
                      autoComplete="off"
                      autoFocus
                      maxLength={150}
                      placeholder={t("subjectPage.form.namePlaceholder")}
                      disabled={isBusy}
                    />
                    <AdminTextField
                      name="subjectCode"
                      label={t("subjectPage.form.codeLabel")}
                      rules={
                        isCreate
                          ? [
                              requiredFieldRule(
                                t("subjectPage.form.validation.codeRequired"),
                                { whitespace: true }
                              ),
                              maxLengthRule(
                                50,
                                t("subjectPage.form.validation.codeMaxLength")
                              ),
                            ]
                          : undefined
                      }
                      autoComplete="off"
                      maxLength={50}
                      placeholder={t("subjectPage.form.codePlaceholder")}
                      disabled={!isCreate || isBusy}
                    />
                    <AdminFormField
                      name="creditCount"
                      label={t("subjectPage.form.creditsLabel")}
                      rules={[
                        requiredFieldRule(
                          t("subjectPage.form.validation.creditsRequired")
                        ),
                        {
                          type: "number",
                          min: 1,
                          message: t(
                            "subjectPage.form.validation.creditsMinimum"
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        className="!h-10 !w-full !rounded-lg !bg-background-paper [&_.ant-input-number-input]:!text-text-primary"
                        min={1}
                        precision={0}
                        placeholder={t("subjectPage.form.creditsPlaceholder")}
                        disabled={isBusy}
                      />
                    </AdminFormField>
                    <AdminFormField
                      name="theoryHours"
                      label={t("subjectPage.form.theoryPeriodsLabel")}
                      rules={[
                        requiredFieldRule(
                          t("subjectPage.form.validation.periodsRequired")
                        ),
                        {
                          type: "number",
                          min: 0,
                          message: t(
                            "subjectPage.form.validation.periodsMinimum"
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        className="!h-10 !w-full !rounded-lg !bg-background-paper [&_.ant-input-number-input]:!text-text-primary"
                        min={0}
                        precision={0}
                        placeholder={t(
                          "subjectPage.form.theoryPeriodsPlaceholder"
                        )}
                        disabled={isBusy}
                      />
                    </AdminFormField>
                    <AdminFormField
                      name="practiceHours"
                      label={t("subjectPage.form.practicePeriodsLabel")}
                      rules={[
                        requiredFieldRule(
                          t("subjectPage.form.validation.periodsRequired")
                        ),
                        {
                          type: "number",
                          min: 0,
                          message: t(
                            "subjectPage.form.validation.periodsMinimum"
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        className="!h-10 !w-full !rounded-lg !bg-background-paper [&_.ant-input-number-input]:!text-text-primary"
                        min={0}
                        precision={0}
                        placeholder={t(
                          "subjectPage.form.practicePeriodsPlaceholder"
                        )}
                        disabled={isBusy}
                      />
                    </AdminFormField>
                  </>
                ) : (
                  <>
                    <AdminReadOnlyField
                      className="sm:col-span-2"
                      label={t("subjectPage.table.name")}
                      value={subject?.subjectName}
                    />
                    <AdminReadOnlyField
                      label={t("subjectPage.table.code")}
                      value={subject?.subjectCode}
                    />
                    <AdminReadOnlyField
                      label={t("subjectPage.table.credits")}
                      value={subject?.creditCount}
                    />
                    <AdminReadOnlyField
                      label={t("subjectPage.table.theoryPeriods")}
                      value={subject?.theoryHours}
                    />
                    <AdminReadOnlyField
                      label={t("subjectPage.table.practicePeriods")}
                      value={subject?.practiceHours}
                    />
                  </>
                )}
              </div>
              {subject && (
                <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AdminReadOnlyField
                    label={t("subjectPage.table.chapters")}
                    value={chapters.length}
                  />
                  <AdminReadOnlyField
                    label={t("subjectPage.table.courseGroups")}
                    value={subject.courseGroupsCount ?? 0}
                  />
                </dl>
              )}
            </AdminFormSection>

            {(subject || (isCreate && canCreateChapters)) && (
              <AdminFormSection
                title={t("subjectPage.sections.chapters")}
                description={
                  mode === "update" && canUpdateChapters
                    ? t("subjectPage.chapters.editHint")
                    : undefined
                }
              >
                <SubjectChapterEditor
                  chapters={chapters}
                  canEdit={
                    (isCreate && canCreateChapters) ||
                    (isUpdate && canUpdateChapters)
                  }
                  hasChanges={chaptersDirty}
                  showSaveButton={!isCreate}
                  isSaving={isBusy}
                  onChange={setChapters}
                  onPendingChange={setHasPendingChapterDraft}
                  onSave={() => void persistChapters()}
                />
              </AdminFormSection>
            )}

            {isCreate && !canCreateChapters && (
              <p className="rounded-lg bg-action-hover px-3.5 py-3 text-sm text-text-secondary">
                {t("subjectPage.chapters.addAfterSubject")}
              </p>
            )}
          </div>
        </Form>
      )}
    </AppDialog>
  );
}
