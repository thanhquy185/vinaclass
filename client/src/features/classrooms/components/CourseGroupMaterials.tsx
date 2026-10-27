import { Button } from "antd";
import { useTranslation } from "react-i18next";
import CourseGroupMaterialFormModal from "@/features/classrooms/components/CourseGroupMaterialFormModal";
import CourseGroupMaterialList from "@/features/classrooms/components/CourseGroupMaterialList";
import { useCourseGroupMaterialsController } from "@/features/classrooms/hooks/useCourseGroupMaterialsController";

interface CourseGroupMaterialsProps {
  courseGroupId: number;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export default function CourseGroupMaterials({
  courseGroupId,
  canCreate,
  canUpdate,
  canDelete,
}: CourseGroupMaterialsProps) {
  const { t } = useTranslation("common");
  const controller = useCourseGroupMaterialsController({ courseGroupId });

  return (
    <section className="mt-8 w-full space-y-5 duration-300 animate-in fade-in">
      <header className="flex flex-col justify-between gap-3 border-b border-other-outlined-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-h5 font-semibold text-text-primary">
            {t("courseMaterials.title")}
          </h2>
          <p className="text-caption mt-1 text-text-secondary">
            {t("courseMaterials.description")}
          </p>
        </div>
        {canCreate && (
          <Button type="primary" onClick={controller.openCreateForm}>
            {t("courseMaterials.add")}
          </Button>
        )}
      </header>

      <CourseGroupMaterialList
        materials={controller.materials}
        isLoading={controller.isLoading}
        isFetching={controller.isFetching}
        isError={controller.isError}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onRetry={controller.refetch}
        onDownload={controller.handleDownload}
        onEdit={controller.openUpdateForm}
        onDelete={controller.handleDelete}
      />

      {controller.isFormOpen && (
        <CourseGroupMaterialFormModal
          key={controller.editingMaterial?.id ?? "new"}
          initialMaterial={controller.editingMaterial}
          isBusy={controller.isMutating}
          onCancel={controller.closeForm}
          onSave={controller.handleSave}
        />
      )}
    </section>
  );
}
