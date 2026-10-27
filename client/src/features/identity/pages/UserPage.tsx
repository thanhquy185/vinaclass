import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import { AdminHeaderPanel } from "@/shared/components/admin";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { UserDialog } from "@/features/identity/components/UserDialog";
import UserPageStats from "@/features/identity/components/UserPageStats";
import UserFiltersPanel from "@/features/identity/components/UserFiltersPanel";
import UserTablePanel from "@/features/identity/components/UserTablePanel";
import { UserStatusDialog } from "@/features/identity/components/UserStatusDialog";
import { UserPasswordChangeDialog } from "@/features/identity/components/UserPasswordChangeDialog";
import { useUserPageController } from "@/features/identity/hooks/useUserPageController";

export function UserPage() {
  const {
    t,
    actions,
    users,
    roles,
    filteredUsers,
    columns,
    isLoading,
    isError,
    isPermissionLoading,
    isPermissionFetching,
    isPermissionError,
    canViewUsers,
    canViewRoles,
    isRolesLoading,
    isRolesFetching,
    isRolesError,
    hasActiveRoles,
    isRoleCatalogUnavailable,
    hasActiveFilters,
    searchTerm,
    searchBy,
    filterRole,
    sortDirection,
    handleSearchTermChange,
    handleSearchByChange,
    setFilterRole,
    setSortDirection,
    resetFilters,
    modalState,
    editingUser,
    statusUser,
    passwordUser,
    isSaving,
    isUpdating,
    isDeleting,
    isResetting,
    currentUserId,
    pagination,
    handleOpenAdd,
    handleUserAction,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    openPasswordDialog,
    closePasswordDialog,
    openStatusDialog,
    closeStatusDialog,
    confirmStatusUpdate,
    closeModal,
    refetchPermissions,
    refetchRoles,
    refetchUsers,
  } = useUserPageController();

  if (isPermissionLoading) {
    return (
      <MainContentLayout className="w-full">
        <div
          role="status"
          aria-live="polite"
          className="p-6 text-text-secondary"
        >
          {t("userPage.permissionLoading")}
        </div>
      </MainContentLayout>
    );
  }

  if (isPermissionError) {
    return (
      <MainContentLayout className="w-full">
        <QueryErrorAlert
          className="m-6"
          message={t("userPage.permissionLoadFailed")}
          onRetry={refetchPermissions}
          isRetrying={isPermissionFetching}
          retryLabel={t("userPage.retry")}
        />
      </MainContentLayout>
    );
  }

  if (!canViewUsers) {
    return (
      <MainContentLayout className="w-full">
        <PermissionDeniedAlert
          className="m-6"
          message={t("userPage.noViewPermission")}
        />
      </MainContentLayout>
    );
  }

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      <section className="flex flex-col gap-5 lg:gap-6">
        <AdminHeaderPanel
          title={t("userPage.pageTitle")}
          description={t("userPage.pageDescription")}
        >
          <UserPageStats users={users} roles={roles} isLoading={isLoading} />
        </AdminHeaderPanel>
        <UserFiltersPanel
          roles={roles}
          canViewRoles={canViewRoles}
          isRolesLoading={isRolesLoading}
          isRolesFetching={isRolesFetching}
          isRolesError={isRolesError}
          hasActiveRoles={hasActiveRoles}
          canReset={
            hasActiveFilters ||
            searchBy !== "fullName" ||
            sortDirection !== "asc"
          }
          searchTerm={searchTerm}
          searchBy={searchBy}
          filterRole={filterRole}
          sortDirection={sortDirection}
          onSearchTermChange={handleSearchTermChange}
          onSearchByChange={handleSearchByChange}
          onFilterRoleChange={setFilterRole}
          onReset={() => {
            resetFilters();
            setSortDirection("asc");
          }}
          onToggleSort={() =>
            setSortDirection((direction) =>
              direction === "asc" ? "desc" : "asc"
            )
          }
          onRetryRoles={refetchRoles}
        />
        <UserTablePanel
          users={users}
          filteredUsers={filteredUsers}
          columns={columns}
          actions={actions}
          hasActiveFilters={hasActiveFilters}
          canCreate={canViewRoles && actions.includes("create")}
          isCreateDisabled={isRoleCatalogUnavailable}
          currentUserId={currentUserId}
          isUpdating={isUpdating}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetchUsers}
          onAddUser={handleOpenAdd}
          onAction={handleUserAction}
          onChangePassword={openPasswordDialog}
          onToggleLock={openStatusDialog}
          pagination={pagination}
        />
      </section>
      {modalState.open && (
        <UserDialog
          mode={modalState.mode}
          user={editingUser}
          roles={roles}
          canViewRoles={canViewRoles}
          isSaving={isSaving}
          isDeleting={isDeleting}
          onClose={closeModal}
          onDelete={deleteUser}
          onSaveCreate={createUser}
          onSaveUpdate={updateUser}
        />
      )}
      {passwordUser && (
        <UserPasswordChangeDialog
          user={passwordUser}
          roles={roles}
          isSaving={isResetting}
          onClose={closePasswordDialog}
          onSubmit={resetPassword}
        />
      )}
      {statusUser && (
        <UserStatusDialog
          user={statusUser}
          isUpdating={isUpdating}
          onClose={closeStatusDialog}
          onConfirm={confirmStatusUpdate}
        />
      )}
    </MainContentLayout>
  );
}
