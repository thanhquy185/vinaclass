import { useEffect, useMemo, useState } from "react";
import { Button, Icon, Input } from "@/components/atomic/atoms";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import DynamicTable, {
  type TableColumn,
} from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import AddAssignmentForm from "@/components/atomic/organisms/AddAssignmentForm/AddAssignmentForm";
import {
  useAssignments,
  useDeleteAssignment,
  useSyncAssignments,
} from "@/hooks/useAssign";
import type {
  TeacherSubject,
  AssignmentRequest,
  ErrorResponse,
  RoleDetailItem,
} from "@/types";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { useToastStore } from "@/stores/useToast.store";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useConfirmStore } from "@/stores/useConfirm.store";
import Pagination from "@/components/atomic/molecules/Pagination/Pagination";

export const AssignmentPage = () => {
  const { assignments } = useAssignments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const { syncAssignmentsAsync } = useSyncAssignments();
  const { deleteAssignmentAsync } = useDeleteAssignment();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState(1); // 1 for subject, 2 for teacher
  const { startLoading, stopLoading } = useLoadingStore();

  const pageName = "phan_cong";

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

  const filteredAssignments = assignments.filter((assignment) => {
    const searchTermLower = searchTerm.trim().toLowerCase();
    if (!searchTermLower) return true;

    const subjectName = assignment.subject?.subjectName?.toLowerCase() ?? "";
    const subjectCode = assignment.subject?.subjectCode?.toLowerCase() ?? "";
    const teacherName = assignment.teacher?.fullName?.toLowerCase() ?? "";
    const teacherCode = assignment.teacher?.username?.toLowerCase() ?? "";

    if (filterCriteria === 1) {
      // bySubject
      return (
        subjectName.includes(searchTermLower) ||
        subjectCode.includes(searchTermLower)
      );
    }

    // byTeacher
    return (
      teacherName.includes(searchTermLower) ||
      teacherCode.includes(searchTermLower)
    );
  });

  const columns: TableColumn<TeacherSubject>[] = [
    {
      title: t("assignmentPage.table.subjectCode"),
      key: "subjectId",
      render: (_, item) => {
        return item.subject?.subjectCode || "---";
      },
    },
    {
      title: t("assignmentPage.table.subjectName"),
      key: "subject",
      render: (_, item) => item.subject?.subjectName || "---",
    },
    {
      title: t("assignmentPage.table.teacherCode"),
      key: "teacherId",
      render: (_, item) => item.teacher?.username || "---",
    },
    {
      title: t("assignmentPage.table.teacherName"),
      key: "teacher",
      render: (_, item) => item.teacher?.fullName || "---",
    },
  ];

  const handleOpenAdd = () => {
    setIsModalOpen(true);
  };

  const { showToast } = useToastStore();
  const onSave = async (data: AssignmentRequest) => {
    startLoading();
    try {
      await syncAssignmentsAsync(data);
      setIsModalOpen(false);
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

  const { openConfirm } = useConfirmStore();
  const handleAction = (action: string, item: TeacherSubject) => {
    if (action === "remove") {
      openConfirm({
        title: t("assignmentPage.confirmDeleteTitle"),
        message: t("assignmentPage.confirmDelete", {
          teacherName: item.teacher?.fullName,
        }),
        type: "danger",
        onConfirm: async () => {
          startLoading();
          try {
            await deleteAssignmentAsync({
              teacherId: item.teacherId,
              subjectId: item.subjectId,
            });
            showToast(t("message.success.delete"), "success");
            if (typeof setIsModalOpen === "function") setIsModalOpen(false);
          } catch (error: unknown) {
            showToast(t("message.error.delete"), "error");
            throw error;
          } finally {
            stopLoading();
          }
        },
      });
    }
  };

  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCriteria]);

  const { currentData, totalPages } = useMemo(() => {
    const total = filteredAssignments.length;
    const pages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    return {
      currentData: filteredAssignments.slice(startIndex, startIndex + itemsPerPage),
      totalPages: pages,
    };
  }, [filteredAssignments, currentPage]);

  useEffect(() => {
    const tableTop = document.getElementById("assignment-table-container");
    if (tableTop) {
      tableTop.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  return (
    <MainContentLayout>
      {/* Toolbar */}
      <div
        id="assignment-table-container"
        className="flex flex-col gap-10 rounded-md bg-background-body-background px-2 py-2"
      >
        <div className="flex justify-between">
          {/* Left: Filter & Search */}
          <div className="flex gap-2">
            <SelectField
              placeholder={t("assignmentPage.filter.placeholder")}
              defaultIndex={0}
              options={[
                {
                  label: t("assignmentPage.filter.bySubject"),
                  value: 1,
                },
                {
                  label: t("assignmentPage.filter.byTeacher"),
                  value: 2,
                },
              ]}
              onSelect={(value) => setFilterCriteria(Number(value))}
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
                onClick={handleOpenAdd}
              >
                <Icon name="plus" size={20} />
                {t("assignmentPage.addNew")}
              </Button>
            )}

            {isModalOpen && (
              <AddAssignmentForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSave}
                assignments={assignments}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-2 rounded-md bg-background-body-background px-2 py-2">
        <DynamicTable
          columns={columns}
          data={currentData}
          rowKey={(item) => `${item.teacherId}-${item.subjectId}`}
          hasColumnActions
          hasView={false}
          onAction={handleAction}
          checkActions={actions.includes("delete") ? ["delete"] : []}
        />
        {currentData.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </MainContentLayout>
  );
};
