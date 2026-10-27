import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import { AdminHeaderPanel } from "@/shared/components/admin";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { CourseGroupForm } from "@/features/classrooms/components/CourseGroupForm";
import { CourseGroupManagementStats } from "@/features/classrooms/components/CourseGroupManagementStats";
import CourseGroupFiltersPanel from "@/features/classrooms/components/CourseGroupFiltersPanel";
import CourseGroupListPanel from "@/features/classrooms/components/CourseGroupListPanel";
import TeacherCourseGroupWorkspace from "@/features/classrooms/components/TeacherCourseGroupWorkspace";
import { useCourseGroupPageController } from "@/features/classrooms/hooks/useCourseGroupPageController";

export function CourseGroupPage() {
  const {
    t,
    courseGroupDisplay,
    isTeacher,
    isAccessDenied,
    canView,
    canCreateGroup,
    canViewStudentList,
    canUpdateGroup,
    canDeleteGroup,
    isPageLoading,
    isPageError,
    isPageFetching,
    retryLoading,
    statusFilter,
    searchValue,
    searchBy,
    canResetFilters,
    openMenu,
    collapsedSections,
    currentPage,
    totalPages,
    groupedSections,
    visibleGroups,
    hasSections,
    hasGroups,
    isProcessing,
    isFormOpen,
    editFormData,
    handleStatusChange,
    handleSearchChange,
    handleSearchByChange,
    resetFilters,
    handleToggleMenu,
    handleToggleSection,
    setCurrentPage,
    openCreateForm,
    closeForm,
    openEditForm,
    confirmRemoveGroup,
    setGroupVisibility,
    saveForm,
    closeMenu,
  } = useCourseGroupPageController();

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      {isAccessDenied ? (
        <div className="w-full px-4 py-8">
          <PermissionDeniedAlert message={t("courseGroup.noAccess")} />
        </div>
      ) : isPageLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-text-secondary">
            {t("courseGroup.loadingGroups")}
          </div>
        </div>
      ) : isPageError ? (
        <div className="w-full px-4 py-8">
          <QueryErrorAlert
            message={t("courseGroup.loadError")}
            retryLabel={t("courseGroup.retry")}
            onRetry={retryLoading}
            isRetrying={isPageFetching}
          />
        </div>
      ) : !canView ? (
        <div className="w-full px-4 py-8">
          <PermissionDeniedAlert message={t("courseGroup.noViewPermission")} />
        </div>
      ) : (
        <>
          <section className="flex w-full flex-col gap-5 lg:gap-6">
            {isTeacher ? (
              <TeacherCourseGroupWorkspace
                sections={groupedSections}
                visibleGroups={visibleGroups}
                collapsedSections={collapsedSections}
                openMenu={openMenu}
                isProcessing={isProcessing}
                canCreateGroup={canCreateGroup}
                canViewStudentList={canViewStudentList}
                canUpdateGroup={canUpdateGroup}
                canDeleteGroup={canDeleteGroup}
                currentPage={currentPage}
                totalPages={totalPages}
                hasSections={hasSections}
                hasGroups={hasGroups}
                statusFilter={statusFilter}
                searchValue={searchValue}
                searchBy={searchBy}
                onStatusChange={handleStatusChange}
                onSearchChange={handleSearchChange}
                onSearchByChange={handleSearchByChange}
                onCreateGroup={openCreateForm}
                onToggleSection={handleToggleSection}
                onToggleMenu={handleToggleMenu}
                onEditGroup={(group) => {
                  closeMenu();
                  openEditForm(group);
                }}
                onToggleGroupStatus={(group) =>
                  setGroupVisibility(group.id, group.status !== "hidden")
                }
                onDeleteGroup={confirmRemoveGroup}
                onPageChange={setCurrentPage}
              />
            ) : (
              <div className="flex flex-col gap-5 lg:gap-6">
                <AdminHeaderPanel
                  title={t("courseGroup.adminWorkspace.title")}
                  description={t("courseGroup.adminWorkspace.description")}
                >
                  <CourseGroupManagementStats
                    courseGroups={courseGroupDisplay}
                    isLoading={isPageFetching}
                  />
                </AdminHeaderPanel>

                <CourseGroupFiltersPanel
                  isTeacher={false}
                  statusFilter={statusFilter}
                  searchValue={searchValue}
                  searchBy={searchBy}
                  canReset={canResetFilters}
                  onStatusChange={handleStatusChange}
                  onSearchChange={handleSearchChange}
                  onSearchByChange={handleSearchByChange}
                  onReset={resetFilters}
                />

                <CourseGroupListPanel
                  groups={groupedSections.flatMap((section) => section.groups)}
                  openMenu={openMenu}
                  isProcessing={isProcessing}
                  canCreateGroup={canCreateGroup}
                  canViewStudentList={canViewStudentList}
                  canUpdateGroup={canUpdateGroup}
                  canDeleteGroup={canDeleteGroup}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasGroups={hasGroups}
                  totalGroupCount={visibleGroups.length}
                  onToggleMenu={handleToggleMenu}
                  onEditGroup={(group) => {
                    closeMenu();
                    openEditForm(group);
                  }}
                  onToggleGroupStatus={(group) =>
                    setGroupVisibility(group.id, group.status !== "hidden")
                  }
                  onDeleteGroup={confirmRemoveGroup}
                  onCreateGroup={openCreateForm}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </section>

          {isFormOpen && (
            <CourseGroupForm
              initialData={editFormData?.data}
              isSubmitting={isProcessing}
              onCancel={closeForm}
              onSave={saveForm}
            />
          )}
        </>
      )}
    </MainContentLayout>
  );
}
