import { Checkbox, Empty, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import type { Subject } from "@/shared/types";

interface AssignmentSubjectTableProps {
  subjects: Subject[];
  selectedSubjectIds: number[];
  isTeacherSelected: boolean;
  isLoading: boolean;
  isSaving: boolean;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  onToggleVisibleSubjects: (checked: boolean) => void;
  onToggleSubject: (subjectId: number, checked: boolean) => void;
}

export default function AssignmentSubjectTable({
  subjects,
  selectedSubjectIds,
  isTeacherSelected,
  isLoading,
  isSaving,
  allVisibleSelected,
  someVisibleSelected,
  onToggleVisibleSubjects,
  onToggleSubject,
}: AssignmentSubjectTableProps) {
  const { t } = useTranslation();

  const columns: TableColumnsType<Subject> = [
    {
      title: (
        <Checkbox
          checked={allVisibleSelected}
          indeterminate={someVisibleSelected && !allVisibleSelected}
          disabled={!isTeacherSelected || subjects.length === 0 || isSaving}
          onChange={(event) => onToggleVisibleSubjects(event.target.checked)}
          aria-label={t("addAssignmentForm.selectVisibleSubjects")}
        />
      ),
      key: "selection",
      width: 56,
      align: "center",
      render: (_value, subject) => (
        <Checkbox
          checked={selectedSubjectIds.includes(subject.id)}
          disabled={!isTeacherSelected || isSaving}
          onChange={(event) =>
            onToggleSubject(subject.id, event.target.checked)
          }
          aria-label={`${subject.subjectCode} ${subject.subjectName}`}
        />
      ),
    },
    {
      title: t("addAssignmentForm.subjectCode"),
      dataIndex: "subjectCode",
      key: "subjectCode",
      width: 140,
    },
    {
      title: t("addAssignmentForm.subjectName"),
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: t("addAssignmentForm.credits"),
      dataIndex: "creditCount",
      key: "creditCount",
      width: 100,
      align: "center",
    },
    {
      title: t("addAssignmentForm.theoryPeriods"),
      dataIndex: "theoryHours",
      key: "theoryHours",
      width: 130,
      align: "center",
    },
    {
      title: t("addAssignmentForm.practicePeriods"),
      dataIndex: "practiceHours",
      key: "practiceHours",
      width: 140,
      align: "center",
    },
  ];

  return (
    <Table<Subject>
      rowKey="id"
      size="middle"
      pagination={false}
      loading={isLoading}
      columns={columns}
      dataSource={subjects}
      rowClassName={(subject) =>
        selectedSubjectIds.includes(subject.id)
          ? "bg-custom-background-primary-background"
          : ""
      }
      locale={{
        emptyText: <Empty description={t("addAssignmentForm.noSubjects")} />,
      }}
      className="[&_.ant-table-thead>tr>th]:!bg-background-body [&_.ant-table-thead>tr>th]:!text-text-secondary [&_.ant-table-cell]:!py-3"
      scroll={{ x: 800, y: 320 }}
    />
  );
}
