import { useTranslation } from "react-i18next";
import { useResetInviteCode } from "@/features/classrooms/hooks/useCourseGroupMutations";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface UseCourseRosterInviteActionsOptions {
  groupId: number;
  defaultInviteCode?: string;
}

export function useCourseRosterInviteActions({
  groupId,
  defaultInviteCode,
}: UseCourseRosterInviteActionsOptions) {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const resetMutation = useResetInviteCode();

  async function handleGenerateCode() {
    try {
      await resetMutation.mutateAsync({ groupId });
      showToast(t("message.success.update"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.update"),
        "error"
      );
    }
  }

  async function handleCopyCode() {
    if (!defaultInviteCode) return;

    try {
      await navigator.clipboard.writeText(defaultInviteCode);
      showToast(t("courseGroupStudent.form.copySuccess"), "success");
    } catch {
      showToast(t("courseGroupStudent.form.copyError"), "error");
    }
  }

  return {
    isResettingInviteCode: resetMutation.isPending,
    handleGenerateCode,
    handleCopyCode,
  };
}
