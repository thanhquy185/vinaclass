import { useEffect, useMemo, useState } from "react";
import { Button, Icon, Input } from "@/components/atomic/atoms";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import Tabs from "@/components/atomic/molecules/Tabs/Tabs";
import AddQuestionForm from "@/components/atomic/organisms/AddQuestionForm/AddQuestionForm";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import QuestionItem from "@/components/atomic/molecules/QuestionItem/QuestionItem";
import { useDifficulties } from "@/hooks/useDifficulty";
import type {
  QuestionCreate,
  QuestionUpdate,
  Difficulty,
  ErrorResponse,
  Question,
  QuestionStatus,
  RoleDetailItem,
} from "@/types";
import { useSubjectsByTeacher, useSubject } from "@/hooks/useSubject";
import {
  useCopyQuestionToPrivate,
  useCreateQuestion,
  useDeleteQuestion,
  useQuestionsOfUser,
  useQuestionsPublic,
  useUpdateQuestion,
  useUpdateQuestionStatus,
} from "@/hooks/useQuestion";
import { useAuthStore } from "@/stores/auth.store";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";
import { useToastStore } from "@/stores/useToast.store";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useConfirmStore } from "@/stores/useConfirm.store";
import Pagination from "@/components/atomic/molecules/Pagination/Pagination";
import {
  Dropdown,
  DropdownItem,
} from "@/components/atomic/molecules/Dropdown/Dropdown";

export const QuestionPage = () => {
  const [selectedTab, setSelectedTab] = useState<QuestionStatus>("public");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [filterDifficulty] = useState<Difficulty>();
  const [filterSubjectId, setFilterSubjectId] = useState<number>(-1);
  const [filterChapterId, setFilterChapterId] = useState<number>(-1);
  const [filterDifficultyId, setFilterDifficultyId] = useState<number>(-1);
  const { user } = useAuthStore();
  const { createQuestion, isCreating } = useCreateQuestion();
  const { updateQuestion, isUpdating } = useUpdateQuestion();
  const { deleteQuestion, isDeleting } = useDeleteQuestion();
  const { copyQuestion } = useCopyQuestionToPrivate();
  const { publicQuestionAsync, archiveQuestionAsync, restoreQuestionAsync } =
    useUpdateQuestionStatus();

  const { t } = useTranslation();
  const { startLoading, stopLoading } = useLoadingStore();

  const pageName = "cau_hoi";

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

  const defaultModalState = {
    open: false,
    mode: "none",
    id: undefined,
    selectedItem: null,
  } as const;

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "create" | "update" | "none";
    id: number | undefined;
    selectedItem: Question | null;
  }>(defaultModalState);

  const closeModal = () => {
    setModalState(defaultModalState);
  };

  const openInsertModal = () => {
    setModalState({
      open: true,
      mode: "create",
      id: undefined,
      selectedItem: null,
    });
  };

  const openUpdateModal = (id: number, data: Question) => {
    setModalState({
      open: true,
      mode: "update",
      id: id,
      selectedItem: data,
    });
  };

  const { difficulties } = useDifficulties();
  const { subjects: teacherSubjects } = useSubjectsByTeacher(user?.id);
  const { subjects: allSubject } = useSubject();

  const subjects = useMemo(() => {
    if (role) {
      if (role.roleName === "teacher") {
        return teacherSubjects;
      }
      if (role.roleName === "admin") {
        return allSubject;
      }
    }
    return [];
  }, [teacherSubjects, allSubject, role]);

  const { publicQuestions } = useQuestionsPublic();
  const { personalQuestions } = useQuestionsOfUser(user?.id); // tất cả câu hỏi của user (3 status public, private, archive)

  const selectedChuongs = useMemo(() => {
    return subjects.find((item) => item.id === filterSubjectId)?.chapters;
  }, [filterSubjectId, subjects]);

  const optionChuongs = selectedChuongs
    ? selectedChuongs?.map((item) => ({
        label: item.chapterName,
        value: item.id,
      }))
    : [];

  //tách theo tab riêng
  const displayQuestions = useMemo(() => {
    if (selectedTab === "public") return publicQuestions;
    if (selectedTab === "private")
      return personalQuestions.filter((item) => item.status !== "archive");
    return personalQuestions.filter((item) => item.status === "archive"); // archive
  }, [publicQuestions, personalQuestions, selectedTab]);

  const filteredQuestions = useMemo(() => {
    // 1. Lọc dữ liệu trước
    const result = displayQuestions.filter((q: Question) => {
      const matchSearch = q.questionContent
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchSubject =
        filterSubjectId !== -1 ? q.subjectId === filterSubjectId : true;

      const matchChapter =
        filterChapterId !== -1 ? q.chapterId === filterChapterId : true;

      const matchDifficulty =
        filterDifficultyId !== -1
          ? q.difficultyId === filterDifficultyId
          : true;

      return matchSearch && matchSubject && matchChapter && matchDifficulty;
    });

    // 2. Sắp xếp dữ liệu sau khi lọc
    if (sortOrder === "none") return result;

    return [...result].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.usageCount - b.usageCount; // Thấp đến Cao
      } else {
        return b.usageCount - a.usageCount; // Cao đến Thấp
      }
    });
  }, [
    displayQuestions,
    searchQuery,
    filterSubjectId,
    filterChapterId,
    filterDifficultyId,
    sortOrder,
  ]);

  const handleTabSelect = (status: QuestionStatus) => {
    setSelectedTab(status);
  };

  const handleAction = (type: string, data: Question) => {
    switch (type) {
      case "edit":
        openUpdateModal(data.id, data);
        break;
      case "delete":
        deleteQ(data.id);
        break;
      case "add-to-bank":
        addToBank(data.id);
        break;
      case "public-question":
        publicQuestion(data.id);
        break;
      case "archive-question":
        archiveQuestion(data.id);
        break;
      case "restore-question":
        restoreQuestion(data.id);
        break;

      default:
        break;
    }
  };

  const { openConfirm } = useConfirmStore();

  const deleteQ = (id: number) => {
    openConfirm({
      title: t("questionPage.deleteConfirm.title"),
      message: t("questionPage.deleteConfirm.message"),
      type: "danger",
      confirmLabel: t("questionPage.deleteConfirm.confirm"),
      cancelLabel: t("questionPage.deleteConfirm.cancel"),
      onConfirm: async () => {
        startLoading();
        try {
          await deleteQuestion(id);
          showToast(t("message.success.delete"), "success");
          if (typeof closeModal === "function") {
            closeModal();
          }
        } catch (error: unknown) {
          console.error("Delete question error:", error);
          showToast(t("message.error.delete"), "error");
          throw error;
        } finally {
          stopLoading();
        }
      },
    });
  };

  const addToBank = async (id: number) => {
    console.log("add to bank cau hoi id ", id);
    if (!user) {
      console.log("Tạo không thành công, lỗi chưa fetch user");
      return;
    }

    startLoading();
    try {
      await copyQuestion({
        questionId: id,
        data: { creatorId: user.id },
      });
      showToast(t("questionPage.toast.addToBank"), "success");
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

  const publicQuestion = async (questionId: number) => {
    startLoading();
    try {
      await publicQuestionAsync(questionId);
      showToast(t("message.success.update"), "success");
    } catch (error) {
      console.log(error);
      showToast(t("message.error.update"), "error");
    } finally {
      stopLoading();
    }
  };

  const archiveQuestion = async (questionId: number) => {
    startLoading();
    try {
      await archiveQuestionAsync(questionId);
      showToast(t("message.success.update"), "success");
    } catch (error) {
      console.log(error);
      showToast(t("message.error.update"), "error");
    } finally {
      stopLoading();
    }
  };

  const restoreQuestion = async (questionId: number) => {
    startLoading();
    try {
      await restoreQuestionAsync(questionId);
      showToast(t("message.success.update"), "success");
    } catch (error) {
      console.log(error);
      showToast(t("message.error.update"), "error");
    } finally {
      stopLoading();
    }
  };

  const showToast = useToastStore((s) => s.showToast);

  const insertQ = async (data: QuestionCreate) => {
    console.log("create", data);
    if (!validateQuestionCreate(data)) return;

    startLoading();
    try {
      await createQuestion(data);
      closeModal();
      showToast(t("message.success.create"), "success");
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
    } finally {
      stopLoading();
    }
  };

  const updateQ = async (id: number, data: QuestionUpdate) => {
    if (!validateQuestionUpdate(data)) {
      return;
    }

    startLoading();
    try {
      await updateQuestion({ questionId: id, data });
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

  const validateQuestionCreate = (request: QuestionCreate): boolean => {
    if (!request.questionContent || request.questionContent.trim() === "") {
      alert(t("questionPage.validation.questionRequired"));
      return false;
    }

    if (!request.subjectId) {
      alert(t("questionPage.validation.subjectRequired"));
      return false;
    }

    if (!request.chapterId) {
      alert(t("questionPage.validation.chapterRequired"));
      return false;
    }

    if (!request.difficultyId) {
      alert(t("questionPage.validation.difficultyRequired"));
      return false;
    }

    return true;
  };

  const validateQuestionUpdate = (request: QuestionUpdate): boolean => {
    if (!request.questionContent || request.questionContent.trim() === "") {
      alert(t("questionPage.validation.questionRequired"));
      return false;
    }
    //
    if (!request.subjectId) {
      alert(t("questionPage.validation.subjectRequired"));
      return false;
    }
    if (!request.chapterId) {
      alert(t("questionPage.validation.chapterRequired"));
      return false;
    }

    if (!request.difficultyId) {
      alert(t("questionPage.validation.difficultyRequired"));
      return false;
    }

    return true;
  };

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchQuery, filterDifficulty]);

  const { paginatedQuestions, totalPages } = useMemo(() => {
    const total = filteredQuestions.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);

    // Tính chỉ số bắt đầu và kết thúc
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const slicedData = filteredQuestions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

    return {
      paginatedQuestions: slicedData,
      totalPages: pages,
    };
  }, [filteredQuestions, currentPage]);

  useEffect(() => {
    const topElement = document.getElementById("question-list-top");
    if (topElement) {
      topElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage]);

  return (
    <MainContentLayout>
      {/* Xử lý loading ở đây nhen */}
      {isCreating && isUpdating && isDeleting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          {t("tableActions.loading")}
        </div>
      )}
      <div
        id="question-list-top"
        className="flex flex-col gap-3 rounded-md bg-background-body-background"
      >
        <div className="border-b-1 flex items-center justify-between border-other-outlined-border pr-3">
          <Tabs
            value={selectedTab}
            onChange={(val) => handleTabSelect(val as QuestionStatus)}
            tabs={[
              { value: "public", label: t("questionPage.tabs.public") },
              { value: "private", label: t("questionPage.tabs.private") },
              { value: "archive", label: t("questionPage.tabs.archive") },
            ]}
          />
          {selectedTab === "private" && actions.includes("create") && (
            <Button
              onClick={() => openInsertModal()}
              variant="contained"
              color="primary"
            >
              {t("questionPage.actions.addQuestion")} <Icon name="arrowDown" />
            </Button>
          )}
        </div>

        <div className="flex gap-5 px-3">
          <SelectField
            label={t("questionPage.filters.subject.label")}
            placeholder={t("questionPage.filters.subject.placeholder")}
            value={filterSubjectId} // Truyền value để component biết đang chọn gì
            options={[
              {
                label: t("questionPage.filters.subject.all", "Tất cả môn học"),
                value: -1,
              }, // Option mặc định
              ...subjects.map((item) => ({
                label: item.subjectName,
                value: item.id,
              })),
            ]}
            onSelect={(val) => setFilterSubjectId(val as number)}
          />
          <SelectField
            label={t("questionPage.filters.chapter.label")}
            placeholder={t("questionPage.filters.chapter.placeholder")}
            value={filterChapterId}
            options={[
              {
                label: t("questionPage.filters.subject.all", "Tất cả chương"),
                value: -1,
              }, // Option mặc định
              ...optionChuongs.map((item) => ({
                label: item.label,
                value: item.value,
              })),
            ]}
            onSelect={(val) => setFilterChapterId(val as number)}
          />
          <SelectField
            label={t("questionPage.filters.difficulty.label")}
            placeholder={t("questionPage.filters.difficulty.placeholder")}
            value={filterDifficultyId}
            options={[
              {
                label: t(
                  "questionPage.filters.difficulty.all",
                  "Tất cả độ khó"
                ),
                value: -1,
              }, // Option mặc định
              ...difficulties.map((item) => ({
                label: item.difficultyName,
                value: item.id,
              })),
            ]}
            onSelect={(val) => setFilterDifficultyId(val as number)}
          />
        </div>
        <div className="flex gap-5 px-3 pb-3">
          <Input
            className="flex-1"
            placeholder={t("questionPage.search.placeholder", {
              count: filteredQuestions.length,
            })}
            hasBoder={true}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Icon name="search" className="text-text-secondary" />}
          />

          <Dropdown
            align="right"
            trigger={
              <Button
                variant={sortOrder === "none" ? "outline" : "contained"}
                color={sortOrder === "none" ? "standard" : "primary"}
                className="shrink-0"
                onClick={() => {
                  setSearchQuery("");
                  setSortOrder("none"); // Reset sắp xếp khi nhấn nút clear
                  setCurrentPage(1);
                }}
              >
                <Icon name="arrowUpDown" />
              </Button>
            }
          >
            <DropdownItem
              onClick={() => {
                setSortOrder("asc");
                setCurrentPage(1);
              }}
              variant={sortOrder === "asc" ? "error" : "default"} // Highlight nếu đang chọn
            >
              {t("questionPage.sort.usageAsc", "Lượt sử dụng: Thấp - Cao")}
            </DropdownItem>

            <DropdownItem
              onClick={() => {
                setSortOrder("desc");
                setCurrentPage(1);
              }}
              variant={sortOrder === "desc" ? "error" : "default"} // Highlight nếu đang chọn
            >
              {t("questionPage.sort.usageDesc", "Lượt sử dụng: Cao - Thấp")}
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* List Section */}
      <section className="mt-4">
        <div className="flex flex-col gap-4">
          {paginatedQuestions.length > 0 ? (
            paginatedQuestions.map((q) => (
              <QuestionItem
                key={q.id}
                data={q}
                onEdit={(question) => handleAction("edit", question)}
                onDelete={(question) => handleAction("delete", question)}
                onAddToBank={(question) => handleAction("add-to-bank", question)}
                onPublicQuestion={(question) =>
                  handleAction("public-question", question)
                }
                onArchiveQuestion={(question) =>
                  handleAction("archive-question", question)
                }
                onRestoreQuestion={(question) =>
                  handleAction("restore-question", question)
                }
                tab={selectedTab} //cho hiển thị hành động ứng với mỗi tab với quyền cao nhất
                actions={actions}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-other-outlined-border bg-background-body-background py-20">
              <span className="italic text-text-secondary">
                {t("questionPage.empty")}
              </span>
            </div>
          )}
        </div>
        {/* Chỉ hiển thị Pagination khi có dữ liệu và tổng số trang > 1 */}
        {paginatedQuestions.length > 0 && totalPages > 1 && (
          <div className="mt-4 rounded-md bg-background-body-background">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </section>

      {modalState.open && (
        <AddQuestionForm
          // isOpen={modalState.open} //0 ngắt mount
          onClose={() => closeModal()}
          selectedItem={modalState.selectedItem}
          onSaveCreate={(data) => {
            insertQ(data);
          }}
          onSaveUpdate={(id, data) => {
            updateQ(id, data);
          }}
          mode={modalState.mode}
        />
      )}
    </MainContentLayout>
  );
};
