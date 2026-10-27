import { Form, Input } from "antd";
import { AlertTriangle, Gauge } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Difficulty, DifficultyRequest } from "@/shared/types";
import {
  AdminFormField,
  AdminFormSection,
  AdminReadOnlyField,
} from "@/shared/components/admin";
import { AppDialog, Button } from "@/shared/components/ui";
import { maxLengthRule, requiredFieldRule } from "@/shared/utils/validation";

export type DifficultyDialogMode = "create" | "view" | "update" | "delete";

interface DifficultyLevelDialogProps {
  mode: DifficultyDialogMode;
  difficulty: Difficulty | null;
  isSaving: boolean;
  onClose: () => void;
  onSaveCreate: (data: DifficultyRequest) => Promise<boolean>;
  onSaveUpdate: (id: number, data: DifficultyRequest) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}

interface DifficultyFormValues {
  difficultyName: string;
}

function formatDate(value: string | undefined, locale: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function DifficultyLevelDialog({
  mode,
  difficulty,
  isSaving,
  onClose,
  onSaveCreate,
  onSaveUpdate,
  onDelete,
}: DifficultyLevelDialogProps) {
  const { t, i18n } = useTranslation("common");
  const isView = mode === "view";
  const isDelete = mode === "delete";
  const isCreate = mode === "create";
  const canDelete = (difficulty?.questionsCount ?? 0) === 0;

  const handleSubmit = async ({ difficultyName }: DifficultyFormValues) => {
    const data = { difficultyName: difficultyName.trim() };
    if (isCreate) {
      await onSaveCreate(data);
      return;
    }
    if (mode === "update" && difficulty) {
      await onSaveUpdate(difficulty.id, data);
    }
  };

  const titleKey = isDelete
    ? "difficultyLevelPage.dialog.deleteTitle"
    : mode === "view"
      ? "difficultyLevelPage.dialog.viewTitle"
      : mode === "update"
        ? "difficultyLevelPage.dialog.updateTitle"
        : "difficultyLevelPage.dialog.createTitle";
  const descriptionKey = isDelete
    ? "difficultyLevelPage.dialog.deleteDescription"
    : mode === "view"
      ? "difficultyLevelPage.dialog.viewDescription"
      : mode === "update"
        ? "difficultyLevelPage.dialog.updateDescription"
        : "difficultyLevelPage.dialog.createDescription";

  const footer = isDelete ? (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="medium"
        onClick={onClose}
        disabled={isSaving}
      >
        {t("common.back")}
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="medium"
        onClick={() => void onDelete()}
        loading={isSaving}
        disabled={isSaving || !canDelete}
      >
        {t("difficultyLevelPage.deleteAction")}
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
        disabled={isSaving}
      >
        {t("common.back")}
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="medium"
        htmlType="submit"
        form="difficulty-level-form"
        loading={isSaving}
        disabled={isSaving}
      >
        {t(isCreate ? "difficultyLevelPage.saveAction" : "common.update")}
      </Button>
    </div>
  );

  return (
    <AppDialog
      open
      onClose={onClose}
      title={t(titleKey)}
      description={t(descriptionKey)}
      icon={isDelete ? <AlertTriangle size={20} /> : <Gauge size={20} />}
      tone={isDelete ? "danger" : "primary"}
      width="min(720px, calc(100vw - 32px))"
      busy={isSaving}
      footer={footer}
    >
      {isDelete ? (
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <AdminFormSection
            title={t("difficultyLevelPage.formSections.details")}
          >
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminReadOnlyField
                className="sm:col-span-2"
                label={t("difficultyLevelPage.table.name")}
                value={difficulty?.difficultyName}
              />
              <AdminReadOnlyField
                label={t("difficultyLevelPage.table.id")}
                value={difficulty ? `#${difficulty.id}` : "—"}
              />
              <AdminReadOnlyField
                label={t("difficultyLevelPage.table.questionCount")}
                value={(difficulty?.questionsCount ?? 0).toLocaleString(
                  i18n.language
                )}
              />
            </dl>
          </AdminFormSection>
          <p className="text-sm leading-5 text-text-secondary">
            {t("difficultyLevelPage.dialog.deleteConfirm", {
              name: difficulty?.difficultyName ?? "",
            })}
          </p>
          {!canDelete && (
            <p className="bg-custom-background-warning-background rounded-lg px-3.5 py-3 text-sm text-warning-main">
              {t("difficultyLevelPage.cannotDeleteInUse")}
            </p>
          )}
        </div>
      ) : (
        <Form
          id="difficulty-level-form"
          layout="vertical"
          initialValues={{ difficultyName: difficulty?.difficultyName ?? "" }}
          onFinish={handleSubmit}
        >
          <div className="space-y-5 px-5 py-5 sm:px-6">
            <AdminFormSection
              title={t("difficultyLevelPage.formSections.details")}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {isView ? (
                  <AdminReadOnlyField
                    className="sm:col-span-2"
                    label={t("difficultyLevelPage.table.name")}
                    value={difficulty?.difficultyName}
                  />
                ) : (
                  <AdminFormField
                    className="sm:col-span-2"
                    name="difficultyName"
                    label={t("difficultyLevelPage.form.nameLabel")}
                    rules={[
                      requiredFieldRule(
                        t("difficultyLevelPage.form.validation.nameRequired"),
                        { whitespace: true }
                      ),
                      maxLengthRule(
                        100,
                        t("difficultyLevelPage.form.validation.nameMaxLength")
                      ),
                    ]}
                  >
                    <Input
                      autoComplete="off"
                      autoFocus
                      maxLength={100}
                      placeholder={t(
                        "difficultyLevelPage.form.namePlaceholder"
                      )}
                      disabled={isSaving}
                      className="!h-10 !rounded-lg !bg-background-paper !text-sm"
                    />
                  </AdminFormField>
                )}
                {difficulty && (
                  <>
                    <AdminReadOnlyField
                      label={t("difficultyLevelPage.table.id")}
                      value={`#${difficulty.id}`}
                    />
                    <AdminReadOnlyField
                      label={t("difficultyLevelPage.table.questionCount")}
                      value={(difficulty.questionsCount ?? 0).toLocaleString(
                        i18n.language
                      )}
                    />
                    <AdminReadOnlyField
                      label={t("difficultyLevelPage.table.createdAt")}
                      value={formatDate(
                        difficulty.createdAt,
                        i18n.resolvedLanguage ?? i18n.language
                      )}
                    />
                    <AdminReadOnlyField
                      label={t("difficultyLevelPage.table.updatedAt")}
                      value={formatDate(
                        difficulty.updatedAt,
                        i18n.resolvedLanguage ?? i18n.language
                      )}
                    />
                  </>
                )}
              </div>
            </AdminFormSection>
          </div>
        </Form>
      )}
    </AppDialog>
  );
}
