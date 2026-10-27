import { Button, Form, Input, Modal } from "antd";
import { AlertTriangle, Gauge } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Difficulty, DifficultyRequest } from "@/shared/types";
import type { DifficultyDialogMode } from "@/features/catalogs/components/DifficultyLevelDialog";
import { maxLengthRule, requiredFieldRule } from "@/shared/utils/validation";

interface TeacherDifficultyDialogProps {
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

export function TeacherDifficultyDialog({
  mode,
  difficulty,
  isSaving,
  onClose,
  onSaveCreate,
  onSaveUpdate,
  onDelete,
}: TeacherDifficultyDialogProps) {
  const { t } = useTranslation("common");
  const [form] = Form.useForm<DifficultyFormValues>();
  const isCreate = mode === "create";
  const isView = mode === "view";
  const isDelete = mode === "delete";
  const canDelete = (difficulty?.questionsCount ?? 0) === 0;
  const title = t(
    isDelete
      ? "difficultyLevelPage.dialog.deleteTitle"
      : isView
        ? "difficultyLevelPage.dialog.viewTitle"
        : isCreate
          ? "difficultyLevelPage.dialog.createTitle"
          : "difficultyLevelPage.dialog.updateTitle"
  );

  const handleSubmit = async ({ difficultyName }: DifficultyFormValues) => {
    const payload = { difficultyName: difficultyName.trim() };
    if (isCreate) {
      await onSaveCreate(payload);
    } else if (mode === "update" && difficulty) {
      await onSaveUpdate(difficulty.id, payload);
    }
  };

  return (
    <Modal
      open
      title={
        <div className="flex items-center gap-3 py-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-background text-primary-main">
            {isDelete ? <AlertTriangle size={20} /> : <Gauge size={20} />}
          </span>
          <span className="text-lg font-semibold text-text-primary">
            {title}
          </span>
        </div>
      }
      onCancel={() => {
        if (!isSaving) onClose();
      }}
      footer={null}
      width="min(560px, calc(100vw - 24px))"
      centered
      destroyOnHidden
      maskClosable={!isSaving}
      closable={!isSaving}
      className="teacher-difficulty-dialog"
    >
      {isDelete ? (
        <div className="space-y-5 pt-3">
          <p className="text-sm leading-6 text-text-secondary">
            {t("difficultyLevelPage.dialog.deleteConfirm", {
              name: difficulty?.difficultyName ?? "",
            })}
          </p>
          <div className="rounded-2xl bg-background-body-background p-4">
            <p className="font-medium text-text-primary">
              {difficulty?.difficultyName}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {t("difficultyLevelPage.teacher.questionCount", {
                count: difficulty?.questionsCount ?? 0,
              })}
            </p>
          </div>
          {!canDelete && (
            <p className="rounded-xl bg-[#fce8e6] px-4 py-3 text-sm text-[#b3261e]">
              {t("difficultyLevelPage.cannotDeleteInUse")}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-other-divider pt-4">
            <Button onClick={onClose} disabled={isSaving}>
              {t("common.back")}
            </Button>
            <Button
              danger
              type="primary"
              loading={isSaving}
              disabled={isSaving || !canDelete}
              onClick={() => void onDelete()}
            >
              {t("difficultyLevelPage.deleteAction")}
            </Button>
          </div>
        </div>
      ) : isView ? (
        <div className="space-y-5 pt-3">
          <div className="rounded-2xl bg-background-body-background p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-disabled">
              {t("difficultyLevelPage.table.name")}
            </p>
            <p className="mt-1 text-lg font-medium text-text-primary">
              {difficulty?.difficultyName}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-other-divider p-4">
              <p className="text-xs text-text-disabled">
                {t("difficultyLevelPage.table.id")}
              </p>
              <p className="mt-1 font-medium text-text-primary">
                #{difficulty?.id}
              </p>
            </div>
            <div className="rounded-2xl border border-other-divider p-4">
              <p className="text-xs text-text-disabled">
                {t("difficultyLevelPage.table.questionCount")}
              </p>
              <p className="mt-1 font-medium text-text-primary">
                {difficulty?.questionsCount ?? 0}
              </p>
            </div>
          </div>
          <div className="flex justify-end border-t border-other-divider pt-4">
            <Button onClick={onClose}>{t("common.back")}</Button>
          </div>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          preserve={false}
          initialValues={{ difficultyName: difficulty?.difficultyName ?? "" }}
          onFinish={handleSubmit}
          className="pt-3"
        >
          <Form.Item
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
              disabled={isSaving}
              placeholder={t("difficultyLevelPage.form.namePlaceholder")}
              className="!h-11 !rounded-xl"
            />
          </Form.Item>
          <div className="mt-6 flex justify-end gap-2 border-t border-other-divider pt-4">
            <Button onClick={onClose} disabled={isSaving}>
              {t("common.back")}
            </Button>
            <Button type="primary" htmlType="submit" loading={isSaving}>
              {t(isCreate ? "difficultyLevelPage.saveAction" : "common.update")}
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}
