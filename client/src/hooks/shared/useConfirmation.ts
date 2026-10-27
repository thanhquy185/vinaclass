import { App } from "antd";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  openConfirmation,
  type ConfirmationOptions,
} from "@/utils/showConfirmationUtil";

type UseConfirmationOptions = Omit<
  ConfirmationOptions,
  "title" | "confirmLabel" | "cancelLabel"
> &
  Partial<Pick<ConfirmationOptions, "title" | "confirmLabel" | "cancelLabel">>;

export function useConfirmation() {
  const { modal } = App.useApp();
  const { t } = useTranslation();

  return useCallback(
    (options: UseConfirmationOptions) =>
      openConfirmation(modal, {
        title: t("confirm.title"),
        confirmLabel: t("confirm.confirm"),
        cancelLabel: t("confirm.cancel"),
        ...options,
      }),
    [modal, t]
  );
}
