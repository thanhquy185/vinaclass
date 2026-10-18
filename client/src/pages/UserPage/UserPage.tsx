import { useEffect, useMemo, useState } from "react";
import { Button, Icon, Input } from "@/components/atomic/atoms";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import DynamicTable, {
  type TableColumn,
} from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import type {
  User,
  UserUpdate,
  UserCreate,
  UserResetPass,
  RoleDetailItem,
} from "@/types";
import { cn } from "@/utils/cn";
import { UserForm } from "@/components/atomic/organisms/UserForm/UserForm";
import {
  useCreateUser,
  useDeleteUser,
  useResetUserPassword,
  useUpdateUser,
  useUser,
} from "@/hooks/useUser";
import { formatDateTimeVN, getDefaultAvatar } from "@/utils";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { useToastStore } from "@/stores/useToast.store";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useConfirmStore } from "@/stores/useConfirm.store";
import Pagination from "@/components/atomic/molecules/Pagination/Pagination";

export function UserPage() {
  const { users } = useUser();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { t } = useTranslation();
  const { createUserAsync, isCreating } = useCreateUser();
  const { updateUserAsync, isUpdating } = useUpdateUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<number>(0);
  const { startLoading, stopLoading } = useLoadingStore();

  const { deleteUserAsync, isDeleting } = useDeleteUser();
  const { resetPasswordAsync, isResetting } = useResetUserPassword();

  const pageName = "nguoi_dung";

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

  const filteredUsers = users.filter((user) => {
    const matchesRole = () => {
      if (filterRole === 0) return true; // "All"
      if (filterRole === 3) return user.isStudent; // "Student"
      return user.roleId === filterRole; // Admin or Teacher
    };

    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(searchTermLower) ||
      user.fullName.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower);

    return matchesRole() && matchesSearch;
  });

  const columns: TableColumn<User>[] = [
    {
      title: t("userPage.table.username"),
      key: "username",
    },
    {
      title: t("userPage.table.fullName"),
      key: "fullName",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          {/* Avatar tròn xám */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action-hover text-text-secondary">
            <img
              src={getDefaultAvatar(item?.fullName || "user")}
              alt={t("userPage.avatarAlt")}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-primary-main">{item.fullName}</span>
            <span className="text-caption text-text-disabled">
              {item.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t("userPage.table.gender"),
      key: "isFemale",
      render: (val) => (val ? t("userForm.female") : t("userForm.male")),
    },
    {
      title: t("userPage.table.dateOfBirth"),
      key: "dateOfBirth",
      render: (val) =>
        val ? new Date(val).toISOString().split("T")[0] : "---",
    },
    {
      title: t("userPage.table.role"),
      key: "roleId",
      render: (val) => (
        <span className="text-text-primary">
          {val === 1
            ? t("userPage.roles.admin")
            : val === 2
              ? t("userPage.roles.teacher")
              : t("userPage.roles.student")}
        </span>
      ),
    },
    {
      title: t("userPage.table.joinDate"),
      key: "createdAt",
      render: (val) => formatDateTimeVN(val),
    },
    {
      title: t("userPage.table.status"),
      key: "isLocked",
      render: (val) => (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold leading-none",
            !val
              ? "bg-success-background text-alert-success-content"
              : "bg-error-background text-alert-error-content"
          )}
        >
          {!val ? t("userPage.status.active") : t("userPage.status.locked")}
        </div>
      ),
    },
  ];

  const defaultModalState = {
    open: false,
    mode: "none",
  } as const;

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "create" | "view" | "update" | "none";
  }>(defaultModalState);

  const closeModal = () => {
    setModalState(defaultModalState);
  };

  const openInsertModal = () => {
    setModalState({
      open: true,
      mode: "create",
    });
  };

  const openUpdateModal = (item: User) => {
    setModalState({
      open: true,
      mode: "update",
    });
    setEditingUser(item);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    openInsertModal();
  };

  const showToast = useToastStore((s) => s.showToast);

  const insertUser = async (data: UserCreate) => {
    console.log("create", data);
    // if (!validateCreate(data)) return;
    startLoading();
    try {
      await createUserAsync(data);
      closeModal();
      showToast(t("message.success.create"), "success");
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 422) {
        //lỗi validate backend
        const errors = err.response?.data?.errors;

        const firstError = Object.values(errors)?.[0];

        if (Array.isArray(firstError)) {
          showToast(t(firstError[0]), "error");
        }
      } else {
        showToast(t("message.error.create"), "error");
      }
    } finally {
      stopLoading();
    }
  };

  const updateUser = async (id: number, data: UserUpdate) => {
    console.log("update", data);
    // if (!validateUpdate(data)) {
    //   return;
    // }
    startLoading();
    try {
      await updateUserAsync({ userId: id, data });
      showToast(t("message.success.update"), "success");
      closeModal();
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 422) {
        //lỗi validate backend
        const errors = err.response.data.errors;

        const firstError = Object.values(errors)?.[0];

        if (Array.isArray(firstError)) {
          showToast(firstError[0], "error");
          alert(firstError[0]);
        }
      } else {
        showToast(t("message.error.update"), "error");
      }
    } finally {
      stopLoading();
    }
  };

  const { openConfirm } = useConfirmStore();

  const deleteUser = (id: number) => {
    openConfirm({
      title: t("userPage.confirmDeleteTitle"),
      message: t("userPage.confirmDelete"),
      type: "danger",
      onConfirm: async () => {
        startLoading(); // Bật Global Loading
        try {
          await deleteUserAsync(id);
          showToast(t("message.success.delete"), "success");
          if (typeof closeModal === "function") closeModal();
        } catch (error: unknown) {
          showToast(t("message.error.delete"), "error");
          throw error; // Ngắt loading nội bộ của Modal
        } finally {
          stopLoading(); // Tắt Global Loading
        }
      },
    });
  };

  const resetPassword = async (id: number, password: string) => {
    const data: UserResetPass = {
      newPassword: password,
    };
    const isConfirm = window.confirm(t("userPage.confirmResetPassword"));
    if (!isConfirm) return;
    if (!validateChangePass(password)) return;

    startLoading();
    try {
      console.log("update", id, data);
      await resetPasswordAsync({ userId: id, data });
      closeModal();
      showToast(t("message.success.update"), "success");
    } catch {
      showToast(t("message.error.update"), "error");
    } finally {
      stopLoading();
    }
  };

  const detail = (data: User) => {
    setModalState({
      open: true,
      mode: "view",
    });
    setEditingUser(data);
  };

  const handleAction = (action: "detail" | "edit" | "remove", item: User) => {
    // console.log(`Đang thực hiện ${action} cho nhóm: ${item.tenNhomQuyen}`);

    switch (action) {
      case "detail":
        detail(item);
        break;

      case "edit":
        openUpdateModal(item);
        break;

      case "remove":
        deleteUser(item.id);
        break;

      default:
        break;
    }
  };

  // const validateCreate = (request: UserCreate): boolean => {
  //   if (!request.username || request.username.trim() === "") {
  //     alert(t("userPage.validation.usernameRequired"));
  //     return false;
  //   }

  //   if (!request.email || request.email.trim() === "") {
  //     alert(t("userPage.validation.emailRequired"));
  //     return false;
  //   }

  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(request.email)) {
  //     alert(t("userPage.validation.emailInvalid"));
  //     return false;
  //   }

  //   if (!request.fullName || request.fullName.trim() === "") {
  //     alert(t("userPage.validation.fullNameRequired"));
  //     return false;
  //   }

  //   if (request.fullName.length > 255) {
  //     alert(t("userPage.validation.fullNameMaxLength"));
  //     return false;
  //   }

  //   if (!request.dateOfBirth) {
  //     alert(t("userPage.validation.dobRequired"));
  //     return false;
  //   }

  //   const today = new Date();
  //   const birthDate = new Date(request.dateOfBirth);
  //   if (birthDate >= today) {
  //     alert(t("userPage.validation.dobInvalid"));
  //     return false;
  //   }

  //   if (!request.password || request.password.trim() === "") {
  //     alert(t("userPage.validation.passwordRequired"));
  //     return false;
  //   }

  //   if (request.password.length < 6) {
  //     alert(t("userPage.validation.passwordMinLength"));
  //     return false;
  //   }

  //   if (!/[a-zA-Z]/.test(request.password)) {
  //     alert(t("userPage.validation.passwordLetterRequired"));
  //     return false;
  //   }

  //   if (!/[0-9]/.test(request.password)) {
  //     alert(t("userPage.validation.passwordNumberRequired"));
  //     return false;
  //   }

  //   if (!/[A-Z]/.test(request.password) || !/[a-z]/.test(request.password)) {
  //     alert(t("userPage.validation.passwordCaseRequired"));
  //     return false;
  //   }

  //   if (!request.isStudent && request.roleId === null) {
  //     alert(t("userPage.validation.roleRequired"));
  //     return false;
  //   }

  //   return true;
  // };

  // const validateUpdate = (request: UserUpdate): boolean => {
  //   if (!request.username || request.username.trim() === "") {
  //     alert(t("userPage.validation.usernameRequired"));
  //     return false;
  //   }

  //   if (!request.email || request.email.trim() === "") {
  //     alert(t("userPage.validation.emailRequired"));
  //     return false;
  //   }

  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(request.email)) {
  //     alert(t("userPage.validation.emailInvalid"));
  //     return false;
  //   }

  //   if (!request.fullName || request.fullName.trim() === "") {
  //     alert(t("userPage.validation.fullNameRequired"));
  //     return false;
  //   }

  //   if (request.fullName.length > 255) {
  //     alert(t("userPage.validation.fullNameMaxLength"));
  //     return false;
  //   }

  //   if (!request.dateOfBirth) {
  //     alert(t("userPage.validation.dobRequired"));
  //     return false;
  //   }

  //   const today = new Date();
  //   const birthDate = new Date(request.dateOfBirth);
  //   if (birthDate >= today) {
  //     alert(t("userPage.validation.dobInvalid"));
  //     return false;
  //   }

  //   if (!request.isStudent && request.roleId === null) {
  //     alert(t("userPage.validation.roleRequired"));
  //     return false;
  //   }

  //   return true;
  // };

  const validateChangePass = (password: string): boolean => {
    if (!password || password.trim() === "") {
      alert(t("userPage.validation.passwordRequired"));
      return false;
    }

    if (password.length < 6) {
      alert(t("userPage.validation.passwordMinLength"));
      return false;
    }

    if (!/[a-zA-Z]/.test(password)) {
      alert(t("userPage.validation.passwordLetterRequired"));
      return false;
    }

    if (!/[0-9]/.test(password)) {
      alert(t("userPage.validation.passwordNumberRequired"));
      return false;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      alert(t("userPage.validation.passwordCaseRequired"));
      return false;
    }
    return true;
  };

  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // 2. Reset trang khi tìm kiếm hoặc lọc role
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  // 3. Tính toán dữ liệu phân trang
  const { paginatedUsers, totalPages } = useMemo(() => {
    const total = filteredUsers.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return {
      paginatedUsers: filteredUsers.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
      ),
      totalPages: pages,
    };
  }, [filteredUsers, currentPage]);

  // 4. Logic Scroll to Top khi đổi trang (Sử dụng ID)
  useEffect(() => {
    const tableElement = document.getElementById("user-table-container");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  return (
    <MainContentLayout classname="w-full">
      {/* Xử lý loading ở đây nhen */}
      {isCreating && isUpdating && isDeleting && isResetting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          {t("tableActions.loading")}
        </div>
      )}
      <div
        id="user-table-container"
        className="flex justify-between rounded-md bg-background-body-background px-2 py-2"
      >
        {/* Left */}
        <div className="flex gap-2">
          <SelectField
            placeholder={t("userPage.filter.rolePlaceholder")}
            options={[
              { label: t("userPage.filter.all"), value: 0 },
              { label: t("userPage.roles.student"), value: 3 },
              { label: t("userPage.roles.teacher"), value: 2 },
              { label: t("userPage.roles.admin"), value: 1 },
            ]}
            onSelect={(val) => setFilterRole(Number(val))}
            defaultIndex={0}
          />
          <Input
            hasBoder={true}
            placeholder={t("userPage.searchPlaceholder")}
            icon={<Icon name="search" className="text-text-disabled" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Right */}
        <div className="flex gap-2">
          <Button variant={"outline"}>
            <Icon name="arrowUpDown" />
          </Button>

          {actions.includes("create") && (
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={handleOpenAdd}
            >
              <Icon name="plus" size={20} />
              {t("userPage.addNew")}
            </Button>
          )}

          {/* User Form Modal */}
          {modalState.open && (
            <UserForm
              initialData={editingUser}
              onSaveCreate={insertUser}
              onSaveUpdate={updateUser}
              onResetPassword={resetPassword}
              onCancel={() => closeModal()}
              mode={modalState.mode}
            />
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-2 rounded-md bg-background-body-background px-2 py-2">
        <DynamicTable
          columns={columns}
          data={paginatedUsers}
          rowKey="id"
          hasColumnActions
          onAction={handleAction}
          checkActions={actions}
        />
        {paginatedUsers.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </MainContentLayout>
  );
}
