import { Button, Empty, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { Icon, QueryErrorAlert } from "@/shared/components/ui";
import type { CourseGroupMaterial } from "@/features/classrooms/types/classrooms";

interface CourseGroupMaterialListProps {
  materials: CourseGroupMaterial[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onRetry: () => Promise<unknown>;
  onDownload: (material: CourseGroupMaterial) => void;
  onEdit: (material: CourseGroupMaterial) => void;
  onDelete: (material: CourseGroupMaterial) => void;
}

export default function CourseGroupMaterialList({
  materials,
  isLoading,
  isFetching,
  isError,
  canUpdate,
  canDelete,
  onRetry,
  onDownload,
  onEdit,
  onDelete,
}: CourseGroupMaterialListProps) {
  const { t, i18n } = useTranslation("common");

  return (
    <>
      {isError && (
        <QueryErrorAlert
          message={t("courseMaterials.loadError")}
          retryLabel={t("courseElement.retry")}
          onRetry={onRetry}
          isRetrying={isFetching}
        />
      )}

      {isLoading && (
        <div className="flex min-h-40 items-center justify-center">
          <Spin />
        </div>
      )}
      {!isLoading && !isError && materials.length === 0 && (
        <Empty
          className="rounded-lg border border-dashed border-other-outlined-border bg-background-body-background py-10"
          description={t("courseMaterials.empty")}
        />
      )}
      {!isLoading && materials.length > 0 && (
        <div className="space-y-3">
          {materials.map((material) => (
            <article
              key={material.id}
              className="rounded-lg border border-other-outlined-border bg-background-body-background p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info-background text-alert-info-content">
                    <Icon name="documentDuplicate" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-text-primary">
                      {material.title}
                    </h3>
                    {material.description && (
                      <p className="mt-1 whitespace-pre-line text-sm text-text-secondary">
                        {material.description}
                      </p>
                    )}
                    <p className="mt-2 break-all text-sm text-text-secondary">
                      {material.fileName} · {formatFileSize(material.fileSize)}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {material.creatorName ||
                        t("courseMaterials.unknownAuthor")}{" "}
                      ·{" "}
                      {new Date(material.createdAt).toLocaleString(
                        i18n.language.startsWith("vi") ? "vi-VN" : "en-US",
                        { dateStyle: "medium", timeStyle: "short" }
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                  <Button onClick={() => onDownload(material)}>
                    {t("courseMaterials.download")}
                  </Button>
                  {canUpdate && (
                    <Button onClick={() => onEdit(material)}>
                      {t("common.edit")}
                    </Button>
                  )}
                  {canDelete && (
                    <Button danger onClick={() => onDelete(material)}>
                      {t("common.delete")}
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
