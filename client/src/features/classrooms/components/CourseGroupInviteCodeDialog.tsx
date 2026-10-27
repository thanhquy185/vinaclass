import { KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import CourseGroupInviteCodePanel from "@/features/classrooms/components/CourseGroupInviteCodePanel";
import { useCourseRosterInviteActions } from "@/features/classrooms/hooks/useCourseRosterInviteActions";
import { AppDialog, Button } from "@/shared/components/ui";

interface CourseGroupInviteCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseLabel: string;
  groupId: number;
  inviteCode?: string;
}

export default function CourseGroupInviteCodeDialog({
  isOpen,
  onClose,
  courseLabel,
  groupId,
  inviteCode,
}: CourseGroupInviteCodeDialogProps) {
  const { t } = useTranslation("common");
  const { isResettingInviteCode, handleGenerateCode, handleCopyCode } =
    useCourseRosterInviteActions({
      groupId,
      defaultInviteCode: inviteCode,
    });

  if (!isOpen) return null;

  return (
    <AppDialog
      open={isOpen}
      title={t("courseGroupStudent.inviteDialog.title")}
      description={courseLabel}
      icon={<KeyRound size={20} />}
      tone="primary"
      onClose={onClose}
      busy={isResettingInviteCode}
      width="min(560px, calc(100vw - 32px))"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          {/* <Button
            variant="outline"
            size="medium"
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isResettingInviteCode}
          >
            {t("courseGroupStudent.form.close")}
          </Button> */}
          <Button
            variant="outline"
            size="medium"
            className="w-full sm:w-auto"
            onClick={() => void handleCopyCode()}
            disabled={!inviteCode || isResettingInviteCode}
          >
            {t("courseGroupStudent.form.copy")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            className="w-full sm:w-auto"
            onClick={() => void handleGenerateCode()}
            loading={isResettingInviteCode}
            disabled={isResettingInviteCode}
          >
            {t("courseGroupStudent.form.generateNewCode")}
          </Button>
        </div>
      }
    >
      <div className="px-5 py-5 sm:px-6">
        <CourseGroupInviteCodePanel inviteCode={inviteCode} />
      </div>
    </AppDialog>
  );
}
