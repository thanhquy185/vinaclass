import { Button, Icon, Input } from "@/components/atomic/atoms";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import type { TableColumn } from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import DynamicTable from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import { PermissionForm } from "@/components/atomic/organisms/PermissionForm/PermissionForm";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import {
  useCreateRole,
  useDeleteRole,
  useRole,
  useUpdateRole,
} from "@/hooks/useRole";
import { useAuthStore } from "@/stores/auth.store";
import { useConfirmStore } from "@/stores/useConfirm.store";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useToastStore } from "@/stores/useToast.store";
import type {
  ErrorResponse,
  Role,
  RoleCreate,
  RoleDetailItem,
  RoleUpdate,
} from "@/types";
import type { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const pageName = "nhom_quyen";

export const PermissionGroupPage = () => {
  const { t } = useTranslation();

  const columns: TableColumn<Role>[] = [
    {
      title: t("permissionGroupPage.table.groupCode"),
      key: "id",
    },
    {
      title: t("permissionGroupPage.table.groupName"),
      key: "roleName",
      render: (value) => (
        <span className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              value === "admin"
                ? "bg-alert-error-content"
                : value === "teacher"
                  ? "bg-alert-success-content"
                  : "bg-alert-info-content"
            }`}
          />
          {value}
        </span>
      ),
    },
    {
      title: t("permissionGroupPage.table.userCount"),
      key: "totalUsers",
      className: "text-center",
      render: (value) => (
        <span className="text- text-helper-text rounded-md bg-action-focus px-2.5 py-1">
          {value?.toLocaleString() || 0} {t("permissionGroupPage.memberUnit")}
        </span>
      ),
    },
  ];

  const { role } = useAuthStore();
  const roleDetails = !role ? [] : role.roleDetails;
  const actions = roleDetails
    .filter((item: RoleDetailItem) => item.functionName === pageName)
    .flatMap((item) => {
      const result: string[] = [];

      if (item.canView) result.push("view");
      if (item.canCreate) result.push("create");
      if (item.canUpdate) result.push("update");
      if (item.canDelete) result.push("delete");

      return result;
    });
  //m
  const defaultModalState = {
    open: false,
    mode: "none",
    id: undefined,
  } as const;

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "create" | "view" | "update" | "none";
    id: number | undefined;
  }>(defaultModalState);

  const { roles } = useRole();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return roles;

    return roles.filter((item) => {
      const groupName = item.roleName?.toLowerCase() ?? "";
      const groupId = String(item.id ?? "").toLowerCase();
      return groupName.includes(term) || groupId.includes(term);
    });
  }, [roles, searchTerm]);

  const { createRoleAsync, isCreating } = useCreateRole();
  const { updateRoleAsync, isUpdating } = useUpdateRole();

  const { deleteRoleAsync, isDeleting } = useDeleteRole();

  const handleAction = (action: "detail" | "edit" | "remove", item: Role) => {
    // console.log(`Đang thực hiện ${action} cho nhóm: ${item.roleName}`);

    switch (action) {
      case "detail":
        detailRole(item.id);
        break;

      case "edit":
        openUpdateModal(item.id);
        break;

      case "remove":
        deleteRole(item);
        break;

      default:
        break;
    }
  };

  const closeModal = () => {
    setModalState(defaultModalState);
  };

  const openInsertModal = () => {
    setModalState({
      open: true,
      mode: "create",
      id: undefined,
    });
  };

  const openUpdateModal = (id: number) => {
    setModalState({
      open: true,
      mode: "update",
      id: id,
    });
  };
  const showToast = useToastStore((s) => s.showToast);
  const { startLoading, stopLoading } = useLoadingStore();

  const insertRole = async (data: RoleCreate) => {
    // if (!validateCreate(data)) return;
    startLoading();
    try {
      await createRoleAsync(data);
      closeModal();
      showToast(t("message.success.create"), "success");
      stopLoading();
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 422) {
        //lỗi validate backend
        const errors = err.response?.data?.errors;

        const firstError = Object.values(errors)?.[0];

        if (Array.isArray(firstError)) {
          showToast(firstError[0], "error");
        }
      } else {
        showToast(t("message.error.create"), "error");
      }
    }
  };

  const updateRole = async (id: number, data: RoleUpdate) => {
    if (!validateUpdate(data)) {
      return;
    }
    startLoading();
    try {
      await updateRoleAsync({ id, data });
      closeModal();
      stopLoading();
      showToast(t("message.success.update"), "success");
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 422) {
        //lỗi validate backend
        const errors = err.response.data.errors;

        const firstError = Object.values(errors)?.[0];

        if (Array.isArray(firstError)) {
          showToast(firstError[0], "error");
        }
      } else {
        showToast(t("message.error.update"), "error");
      }
    }
  };

  const { openConfirm } = useConfirmStore();

  const deleteRole = (data: Role) => {
    openConfirm({
      title: t("permissionGroupPage.confirmDeleteTitle"),
      message: t("permissionGroupPage.confirmDeleteMessage"),
      type: "danger",
      onConfirm: async () => {
        startLoading();
        try {
          await deleteRoleAsync(data.id);
          showToast(t("message.success.delete"), "success");
          if (typeof closeModal === "function") closeModal();
        } catch (error: unknown) {
          showToast(t("message.error.delete"), "error");
          throw error;
        } finally {
          stopLoading();
        }
      },
    });
  };

  const detailRole = (id: number) => {
    setModalState({
      open: true,
      mode: "view",
      id: id,
    });
  };

  // const validateCreate = (request: RoleCreate): boolean => {
  //   if (request.role_details.length === 0) {
  //     alert(t("message.validation.role.empty"));
  //     return false;
  //   }
  //   return true;
  // };

  const validateUpdate = (request: RoleUpdate): boolean => {
    if (request.roleDetails?.length === 0) {
      alert(t("message.validation.role.empty"));
      return false;
    }
    return true;
  };

  return (
    <MainContentLayout>
      {/* Xử lý loading ở đây nhen */}
      {isCreating && isUpdating && isDeleting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          {t("tableActions.loading")}
        </div>
      )}
      <div className="flex flex-col gap-10 rounded-md bg-background-body-background px-2 py-2">
        <div className="flex justify-between">
          {/* Left: Filter & Search */}
          <div className="flex gap-2">
            <SelectField
              placeholder={t("permissionGroupPage.filter.placeholder")}
              defaultIndex={0}
              options={[
                { label: t("permissionGroupPage.filter.byName"), value: 1 },
                { label: t("permissionGroupPage.filter.byID"), value: 2 },
              ]}
              onSelect={() => {}}
            />
            <Input
              hasBoder={true}
              placeholder={t("header.search")}
              icon={<Icon name="search" className="text-text-disabled" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Right: Actions */}
          <div className="flex gap-2">
            {actions.includes("create") && (
              <Button
                variant={"contained"}
                color={"primary"}
                onClick={openInsertModal}
              >
                <Icon name="plus" size={20} />
                {t("permissionGroupPage.addNew")}
              </Button>
            )}
            {modalState.open && (
              <PermissionForm
                key={modalState.id}
                mode={modalState.mode}
                id={modalState.id}
                onSaveCreate={insertRole}
                onSaveUpdate={updateRole}
                onCancel={closeModal}
                //className="w-[900px] h-[80vh] rounded-xl" // Tuỳ chỉnh kích thước modal ở đây
              ></PermissionForm>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-md bg-background-body-background px-2 py-2">
        <DynamicTable
          columns={columns}
          data={filteredRoles}
          rowKey="id" // <--- Chỉ định key định danh ở đây
          hasColumnActions={true}
          onAction={handleAction}
          checkActions={actions}
        />
      </div>
    </MainContentLayout>
  );
};
