import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon, Input } from "@/components/atomic/atoms";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import DynamicTable, {
  type TableColumn,
} from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import { SubjectForm } from "@/components/atomic/organisms/SubjectForm/SubjectForm";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import type {
  ChapterListRequest,
  ErrorResponse,
  RoleDetailItem,
  Subject,
} from "@/types";
import { useSubject } from "@/hooks/useSubject";
import { useAuthStore } from "@/stores/auth.store";
import { useToastStore } from "@/stores/useToast.store";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useConfirmStore } from "@/stores/useConfirm.store";
import Pagination from "@/components/atomic/molecules/Pagination/Pagination";
import { useUpdateSubjectChapters } from "@/hooks/useChapter";
import type { AxiosError } from "axios";

export const SubjectPage = () => {
  const { t } = useTranslation("common");
  const { startLoading, stopLoading } = useLoadingStore();

  const pageName = "mon_hoc";

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
  const { subjects, isLoading, createSubject, updateSubject, deleteSubject } =
    useSubject();

  const columns: TableColumn<Subject>[] = [
    { title: t("subjectPage.table.code"), key: "subjectCode" },
    {
      title: t("subjectPage.table.name"),
      key: "subjectName",
    },
    {
      title: t("subjectPage.table.credits"),
      key: "creditCount",
      className: "text-center",
    },
    {
      title: t("subjectPage.table.theoryPeriods"),
      key: "theoryHours",
      className: "text-center",
    },
    {
      title: t("subjectPage.table.practicePeriods"),
      key: "practiceHours",
      className: "text-center",
    },
  ];

  // const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
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

  const openUpdateModal = () => {
    setModalState({
      open: true,
      mode: "update",
    });
  };

  const openDetailModal = () => {
    setModalState({
      open: true,
      mode: "view",
    });
  };

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState("subjectName");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Or any other number you prefer

  const filteredData = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return subjects.filter((item) => {
      if (filterCriteria === "subjectName") {
        return item.subjectName.toLowerCase().includes(lowercasedFilter);
      }
      if (filterCriteria === "subjectCode") {
        return item.subjectCode.toLowerCase().includes(lowercasedFilter);
      }
      return true;
    });
  }, [searchTerm, subjects, filterCriteria]);

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleOpenAdd = () => {
    setEditingSubject(null); // Reset về null để form hiểu là thêm mới
    openInsertModal();
  };

  const { openConfirm } = useConfirmStore();

  const handleAction = (action: string, item: Subject) => {
    if (action === "detail") {
      setEditingSubject(item);
      openDetailModal();
    }
    if (action === "edit") {
      setEditingSubject(item);
      openUpdateModal();
    } else if (action === "remove") {
      openConfirm({
        title: t("subjectPage.confirmDeleteTitle"),
        message: t("subjectPage.confirmDelete", {
          subjectName: item.subjectName,
        }),
        type: "danger",
        onConfirm: async () => {
          startLoading(); // Bật Global Loading
          try {
            await deleteSubject(item.id);
            showToast(t("message.success.delete"), "success");
          } catch (error) {
            showToast(t("message.error.delete"), "error");
            throw error; // Ngắt loading nội bộ của Modal
          } finally {
            stopLoading(); // Tắt Global Loading
          }
        },
      });
    }
  };

  const showToast = useToastStore((s) => s.showToast);
  const handleSave = async (data: Subject) => {
    startLoading();
    try {
      if (editingSubject) {
        // Trường hợp Sửa
        updateSubject(data, {
          onSuccess: () => showToast(t("message.success.update"), "success"),
          onSettled: () => stopLoading(),
        });
      } else {
        // Trường hợp Thêm mới (loại bỏ id: 0 để backend tự sinh nếu cần)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...payload } = data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createSubject(payload as any, {
          onSuccess: () => showToast(t("message.success.create"), "success"),
          onSettled: () => stopLoading(),
        });
      }
      closeModal();
      setEditingSubject(null);
    } catch (error) {
      console.log(error);
      showToast(t("message.error.create"), "error");
    }
  };

  // 1. Tính tổng số trang thực tế dựa trên dữ liệu đã lọc
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / itemsPerPage);
  }, [filteredData, itemsPerPage]);

  // 2. Hiệu ứng tự động cuộn lên đầu bảng mỗi khi đổi trang
  useEffect(() => {
    const tableElement = document.getElementById("subject-table-top");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  const { updateSubjectChapters } = useUpdateSubjectChapters();
  const handleSaveUpdateChapters = async (
    data: ChapterListRequest,
    subjectId?: number
  ) => {
    startLoading();
    try {
      await updateSubjectChapters({ subjectId, data });
      closeModal();
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
    } finally {
      stopLoading();
    }
  };

  return (
    <MainContentLayout>
      {/* Toolbar */}
      <div
        id="subject-table-top"
        className="flex flex-col gap-10 rounded-md bg-background-body-background px-2 py-2"
      >
        <div className="flex justify-between">
          {/* Left: Filter & Search */}
          <div className="flex w-1/2 gap-2">
            <SelectField
              placeholder={t("subjectPage.filter.placeholder")}
              defaultIndex={0}
              options={[
                { label: t("subjectPage.filter.byName"), value: "subjectName" },
                { label: t("subjectPage.filter.byCode"), value: "subjectCode" },
              ]}
              onSelect={(value) => {
                if (value) {
                  setFilterCriteria(value as string);
                  setCurrentPage(1);
                }
              }}
              classname="min-w-max"
            />
            <Input
              hasBoder={true}
              placeholder={t("courseGroup.search")}
              icon={<Icon name="search" className="text-text-disabled" />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
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
                {t("subjectPage.addNew")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-2 rounded-md bg-background-body-background px-2 py-2">
        <DynamicTable
          columns={columns}
          data={currentData}
          rowKey="subjectCode"
          hasColumnActions
          onAction={handleAction}
          isLoading={isLoading}
          checkActions={actions}
        />
        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
        {modalState.open && (
          <SubjectForm
            key={editingSubject?.id}
            initialData={editingSubject}
            onSave={handleSave}
            onSaveUpdateChapters={handleSaveUpdateChapters}
            onCancel={() => {
              closeModal();
              setEditingSubject(null);
            }}
            mode={modalState.mode}
          />
        )}
      </div>
    </MainContentLayout>
  );
};
