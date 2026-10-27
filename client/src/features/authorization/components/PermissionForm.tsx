import { Form, Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  PermissionItem,
  Role,
  RoleCreate,
  RoleUpdate,
} from "@/shared/types";
import LegacyPermissionMatrixTable from "@/features/authorization/components/LegacyPermissionMatrixTable";
import { useFunctionCatalog } from "@/features/authorization/hooks/useFunctionCatalog";
import { useRoleDetail } from "@/features/authorization/hooks/useRoleQueries";
import {
  convertPermissionsToRoleDetails,
  convertRoleDetailsToPermissions,
  mapFunctionCatalogToPermissions,
  permissionSupportsAction,
} from "@/features/authorization/utils/legacyPermissionMatrix";
import {
  AdminFormField,
  AdminFormSection,
  AdminReadOnlyField,
} from "@/shared/components/admin";
import { AppDialog, Button, QueryErrorAlert } from "@/shared/components/ui";
import { maxLengthRule, requiredFieldRule } from "@/shared/utils/validation";
import { getDeclaredSystemRoleCode } from "@/shared/utils/role";

type PermissionFormMode = "create" | "view" | "update";

interface PermissionFormValues {
  groupName: string;
}

interface PermissionFormProps {
  mode: PermissionFormMode;
  id: number | undefined;
  role?: Role;
  isSaving: boolean;
  onSaveCreate: (data: RoleCreate) => void;
  onSaveUpdate: (id: number, data: RoleUpdate) => void;
  onCancel: () => void;
}

const formatDate = (value: string, locale: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

export function PermissionForm({
  mode,
  id,
  role,
  isSaving,
  onSaveCreate,
  onSaveUpdate,
  onCancel,
}: PermissionFormProps) {
  const { t, i18n } = useTranslation("common");
  const [form] = Form.useForm<PermissionFormValues>();
  const isView = mode === "view";
  const systemRoleCode = role ? getDeclaredSystemRoleCode(role.code) : null;
  const nameIsReadOnly = isView || Boolean(systemRoleCode);
  const {
    role: roleDetails,
    isLoading: isRoleDetailLoading,
    isFetching: isRoleDetailFetching,
    isError: isRoleDetailError,
    refetch: refetchRoleDetail,
  } = useRoleDetail(mode === "create" ? undefined : id);
  const {
    functions,
    isLoading: isCatalogLoading,
    isFetching: isCatalogFetching,
    isError: isCatalogError,
    refetch: refetchCatalog,
  } = useFunctionCatalog();
  const isEnglish = (i18n.resolvedLanguage ?? i18n.language).startsWith("en");
  const catalogPermissions = useMemo(
    () => mapFunctionCatalogToPermissions(functions, isEnglish),
    [functions, isEnglish]
  );
  const loadedRoleDetails = roleDetails?.id === id ? roleDetails : undefined;
  const permissionTarget =
    mode === "create" ? "create" : `role-${id ?? "none"}`;
  const [permissionDraft, setPermissionDraft] = useState<{
    target: string;
    permissions: PermissionItem[];
  } | null>(null);
  const basePermissions = useMemo(
    () =>
      convertRoleDetailsToPermissions(
        loadedRoleDetails?.roleDetails ?? [],
        catalogPermissions
      ),
    [loadedRoleDetails?.roleDetails, catalogPermissions]
  );
  const permissions =
    permissionDraft?.target === permissionTarget
      ? permissionDraft.permissions
      : basePermissions;
  const isPermissionLoading =
    isCatalogLoading ||
    (mode !== "create" &&
      !loadedRoleDetails &&
      (isRoleDetailLoading || isRoleDetailFetching));
  const hasPermissionLoadError =
    isCatalogError || (mode !== "create" && isRoleDetailError);
  const permissionsAreReadOnly =
    isView || (mode === "update" && Boolean(systemRoleCode));
  const permissionsAreDisabled =
    permissionsAreReadOnly ||
    isSaving ||
    isPermissionLoading ||
    hasPermissionLoadError;

  useEffect(() => {
    form.setFieldsValue({ groupName: role?.roleName ?? "" });
  }, [form, role?.id, role?.roleName]);

  const dialogDescription = t(
    mode === "create"
      ? "permissionGroupPage.dialog.createDescription"
      : mode === "update"
        ? "permissionGroupPage.dialog.updateDescription"
        : "permissionGroupPage.dialog.viewDescription"
  );

  const handleSubmit = ({ groupName }: PermissionFormValues) => {
    if (mode === "create") {
      onSaveCreate({
        roleName: groupName.trim(),
        roleDetails: convertPermissionsToRoleDetails(permissions),
      });
      return;
    }
    if (mode === "update" && id !== undefined) {
      onSaveUpdate(id, {
        roleName: groupName.trim(),
        roleDetails: convertPermissionsToRoleDetails(permissions),
      });
    }
  };

  return (
    <AppDialog
      open
      onClose={onCancel}
      title={t(`permissionForm.title.${mode}`)}
      description={dialogDescription}
      icon={<ShieldCheck size={21} />}
      tone="primary"
      width="min(980px, calc(100vw - 32px))"
      busy={isSaving}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="medium"
            onClick={onCancel}
            disabled={isSaving}
          >
            {t("common.back")}
          </Button>
          {!isView && (
            <Button
              variant="contained"
              color="primary"
              size="medium"
              htmlType="submit"
              form="permission-group-form"
              className="min-w-28"
              loading={isSaving}
              disabled={
                isSaving ||
                hasPermissionLoadError ||
                isPermissionLoading ||
                (mode === "update" && nameIsReadOnly)
              }
            >
              {mode === "update" ? t("common.update") : t("common.save")}
            </Button>
          )}
        </div>
      }
    >
      <Form
        id="permission-group-form"
        form={form}
        layout="vertical"
        initialValues={{ groupName: role?.roleName ?? "" }}
        onFinish={handleSubmit}
      >
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <AdminFormSection
            title={t("permissionGroupPage.formSections.details")}
          >
            <div className="grid grid-cols-1 gap-3">
              {isView ? (
                <AdminReadOnlyField
                  label={t("permissionForm.groupName")}
                  value={role?.roleName}
                />
              ) : (
                <AdminFormField
                  name="groupName"
                  label={t("permissionForm.groupName")}
                  rules={[
                    requiredFieldRule(
                      t("permissionForm.validation.nameRequired"),
                      { whitespace: true }
                    ),
                    maxLengthRule(
                      255,
                      t("permissionForm.validation.nameMaxLength")
                    ),
                  ]}
                >
                  <Input
                    size="large"
                    maxLength={255}
                    autoComplete="off"
                    placeholder={t("permissionForm.groupNamePlaceholder")}
                    disabled={nameIsReadOnly || isSaving}
                    className="!h-10 !rounded-lg !bg-background-paper !text-sm"
                  />
                </AdminFormField>
              )}
              {role && (
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-background-body px-3.5 py-3">
                    <dt className="text-caption text-text-secondary">
                      {t("permissionGroupPage.table.groupCode")}
                    </dt>
                    <dd className="mt-1 font-mono text-sm font-medium text-text-primary">
                      {role.code || `NQ-${String(role.id).padStart(3, "0")}`}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-background-body px-3.5 py-3">
                    <dt className="text-caption text-text-secondary">
                      {t("permissionGroupPage.table.kind")}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">
                      {t(
                        systemRoleCode
                          ? "permissionGroupPage.kind.system"
                          : "permissionGroupPage.kind.custom"
                      )}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-background-body px-3.5 py-3">
                    <dt className="text-caption text-text-secondary">
                      {t("permissionGroupPage.table.userCount")}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">
                      {(role.totalUsers ?? 0).toLocaleString(i18n.language)}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-background-body px-3.5 py-3">
                    <dt className="text-caption text-text-secondary">
                      {t("permissionGroupPage.table.createdAt")}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">
                      {formatDate(
                        role.createdAt,
                        i18n.resolvedLanguage ?? i18n.language
                      )}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </AdminFormSection>

          <AdminFormSection
            title={t("permissionGroupPage.formSections.permissions")}
          >
            {hasPermissionLoadError ? (
              <QueryErrorAlert
                message={t("permissionGroupPage.permissionDataLoadFailed")}
                onRetry={() =>
                  void Promise.all([
                    refetchCatalog(),
                    ...(mode === "create" ? [] : [refetchRoleDetail()]),
                  ])
                }
                isRetrying={isCatalogFetching || isRoleDetailFetching}
                retryLabel={t("permissionGroupPage.retry")}
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-other-outlined-border bg-background-paper">
                <LegacyPermissionMatrixTable
                  permissions={permissions}
                  isDisabled={permissionsAreDisabled}
                  isLoading={isPermissionLoading}
                  scrollY={340}
                  onToggleColumn={(action, checked) =>
                    setPermissionDraft({
                      target: permissionTarget,
                      permissions: permissions.map((item) => ({
                        ...item,
                        actions: permissionSupportsAction(item, action)
                          ? { ...item.actions, [action]: checked }
                          : item.actions,
                      })),
                    })
                  }
                  onTogglePermission={(key, action, checked) =>
                    setPermissionDraft({
                      target: permissionTarget,
                      permissions: permissions.map((item) =>
                        item.key === key && permissionSupportsAction(item, action)
                          ? {
                              ...item,
                              actions: { ...item.actions, [action]: checked },
                            }
                          : item
                      ),
                    })
                  }
                />
              </div>
            )}
          </AdminFormSection>
        </div>
      </Form>
    </AppDialog>
  );
}
