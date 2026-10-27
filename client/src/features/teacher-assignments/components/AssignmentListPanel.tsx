import { Avatar, Empty, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DataTable, { type TableColumn } from "@/shared/components/DataTable";
import { AdminTablePanel } from "@/shared/components/admin";
import { AssignmentSubjectsCell } from "@/features/teacher-assignments/components/AssignmentSubjectsCell";
import type {
  TeacherAssignmentGroup,
  TeacherAssignmentRemoval,
} from "@/features/teacher-assignments/types/teacherAssignment";

interface AssignmentListPanelProps {
  groups: TeacherAssignmentGroup[];
  canAssign: boolean;
  canDelete: boolean;
  searchTerm: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void | Promise<unknown>;
  onAdd: () => void;
  onRemove: (assignment: TeacherAssignmentRemoval) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export default function AssignmentListPanel({
  groups,
  canAssign,
  canDelete,
  searchTerm,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onAdd,
  onRemove,
  pagination,
}: AssignmentListPanelProps) {
  const { t } = useTranslation("common");
  const columns = useMemo<TableColumn<TeacherAssignmentGroup>[]>(
    () => [
      {
        title: t("assignmentPage.table.teacher"),
        key: "teacher",
        fixed: "left",
        width: 310,
        render: (_value, group) => {
          const name = group.teacher.profile?.fullName?.trim() || group.teacher.username;
          const teacherIdentifier =
            group.teacher.teacherProfile?.teacherCode || group.teacher.username;

          return (
            <div className="flex min-w-0 items-center gap-3 py-1">
              <Avatar className="!shrink-0 !bg-primary-main !font-semibold !text-white">
                {name.slice(0, 1).toLocaleUpperCase()}
              </Avatar>
              <div className="min-w-0">
                <Typography.Text strong className="block truncate !text-text-primary">
                  {name}
                </Typography.Text>
                <Typography.Text type="secondary" className="block truncate text-xs">
                  {teacherIdentifier}
                </Typography.Text>
              </div>
            </div>
          );
        },
      },
      {
        title: t("assignmentPage.table.subjectCount"),
        key: "subjects",
        width: 120,
        render: (_value, group) => (
          <Tag className="!m-0 !rounded-full !border-0 !bg-action-hover !px-3 !py-1 !font-semibold !text-text-primary">
            {t("assignmentPage.subjectCount", { count: group.subjects.length })}
          </Tag>
        ),
      },
      {
        title: t("assignmentPage.table.subjects"),
        key: "subjects",
        id: "assigned-subjects",
        width: 680,
        render: (_value, group) => (
          <AssignmentSubjectsCell
            teacherId={group.teacherId}
            teacherName={group.teacher.profile?.fullName || group.teacher.username}
            subjects={group.subjects}
            canRemove={canDelete}
            moreLabel={(count) => t("assignmentPage.moreSubjects", { count })}
            onRemove={onRemove}
          />
        ),
      },
    ],
    [canDelete, onRemove, t],
  );

  return (
    <AdminTablePanel
      title={t("assignmentPage.tableTitle")}
      description={t("assignmentPage.tableDescription")}
      createAction={
        canAssign
          ? { label: t("assignmentPage.addNew"), onClick: onAdd }
          : undefined
      }
    >
      <DataTable
        columns={columns}
        data={groups}
        rowKey={(group) => group.teacherId}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={t("assignmentPage.loadFailed")}
        onRetry={onRetry}
        pagination={pagination}
        className="user-management-table"
        emptyText={
          <Empty
            description={
              searchTerm.trim()
                ? t("assignmentPage.empty.filtered")
                : t("assignmentPage.empty.list")
            }
          />
        }
      />
    </AdminTablePanel>
  );
}
