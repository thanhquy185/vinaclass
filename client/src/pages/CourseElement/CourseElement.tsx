import { Button, Icon } from "@/components/atomic/atoms";
import { Overlay } from "@/components/atomic/molecules/Overlay/Overlay";
import Tabs from "@/components/atomic/molecules/Tabs/Tabs";
import DynamicTable, {
  type TableColumn,
} from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import ExamResultOverview from "@/components/atomic/organisms/ExamResultOverview/ExamResultOverview";
import { useExamsByCourseGroupAndStudent } from "@/hooks/useDeThi";
import { useExamActions } from "@/hooks/useExamActions";
import { useCourseGroupStudentDetail } from "@/hooks/useCourseGroup";
import { examService } from "@/services/api/exam.service";
import { useAuthStore } from "@/stores/auth.store";
import { useDeThiStore } from "@/stores/useDeThi.store";
import { useLoadingStore } from "@/stores/useLoading.store";
import type {
  Exam,
  StudentExam,
  ErrorResponse,
  Notification,
  NotificationCreate,
} from "@/types";
import {
  calculateDuration,
  getDefaultAvatar,
  getProgressColor,
  getTestsStatus,
} from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NotiThisCourseForm from "@/components/atomic/organisms/NotiThisCourseForm/NotiThisCourseForm";
import {
  useCreateCourseGroupNotification,
  useDeleteCourseGroupNotification,
} from "@/hooks/useNotification";
import type { AxiosError } from "axios";
import { useToastStore } from "@/stores/useToast.store";
import {
  Dropdown,
  DropdownItem,
} from "@/components/atomic/molecules/Dropdown/Dropdown";
import { useConfirmStore } from "@/stores/useConfirm.store";
import { useExamStore } from "@/stores/useExamStore";

export default function CourseElement() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("news");
  const [now, setNow] = useState(new Date());
  const { showToast } = useToastStore();

  // Cập nhật thời gian mỗi phút để cập nhật trạng thái nút "Bắt đầu"
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const navigate = useNavigate();

  const { id } = useParams();
  const { courseGroup } = useCourseGroupStudentDetail(Number(id));
  const thongBaos = courseGroup ? courseGroup.notifications : [];
  const deThis = courseGroup ? courseGroup.exams : [];
  const students = courseGroup ? courseGroup.students : [];
  const giangVien = courseGroup ? courseGroup.teacher : null;

  const { user } = useAuthStore();

  const { exams } = useExamsByCourseGroupAndStudent(courseGroup?.id, user?.id);

  const { startLoading, stopLoading } = useLoadingStore();

  const handleStartExam = async (deThiId: number) => {
    startLoading();
    try {
      // 1. Gọi trực tiếp Service hoặc dùng queryClient để lấy data đề thi
      // Chúng ta lấy chi tiết đề để đổ vào Store
      const res = await examService.getExamById(deThiId);

      if (res.data) {
        // 2. Cập nhật vào DeThiStore để trang Introduction có data hiển thị
        useDeThiStore.getState().updateTestData(res.data);

        // 3. Sau khi Store đã có data, mới chuyển trang
        navigate(`/tests/${deThiId}/take`);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin đề thi:", error);
      // Toast: "Không thể tải thông tin đề thi. Vui lòng thử lại."
    } finally {
      stopLoading();
    }
  };

  const [openResultModal, setOpenResultModal] = useState(false);
  // --- Table Configurations ---
  const classworkColumns: TableColumn<StudentExam>[] = [
    {
      title: t("courseElement.classwork.columns.testName"),
      key: "examName",
      className: "w-[45%]",
      render: (_, item) => {
        // 1. Tính toán trạng thái một lần duy nhất cho mỗi hàng
        const testStatus = getTestsStatus(item.startTime, item.endTime, now);
        const isOpening = testStatus.status === "OPENING";
        const isUpcoming = testStatus.status === "UPCOMING";

        // 2. Xác định nhãn nút dựa trên trạng thái
        const buttonLabel = isUpcoming
          ? t("courseElement.classwork.status.notOpen")
          : isOpening
            ? t("courseElement.classwork.status.start")
            : t("courseElement.classwork.status.expired");

        return (
          <div className="flex items-start gap-4 py-2">
            <div className="mt-1">
              <Icon name="documentDuplicate" />
            </div>
            <div>
              <h3 className="text-body-2 font-bold leading-tight text-text-primary">
                {item.examName}
              </h3>
              <p className="text-caption mt-1 text-text-secondary">
                {t("courseElement.classwork.durationText", {
                  minutes: item.durationMinutes,
                  unit: t("courseElement.common.minuteUnit"),
                })}
              </p>

              {/* Chỉ hiện nút khi chưa làm bài */}
              {!item.examAttempt && (
                <Button
                  className="mt-2"
                  size="medium"
                  color={isOpening ? "primary" : "standard"} // Đổi màu linh hoạt
                  variant="contained"
                  onClick={() => handleStartExam(item.id)}
                  disabled={!isOpening} // Chỉ cho bấm khi đang mở
                >
                  {buttonLabel}
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: t("courseElement.classwork.columns.percentage"),
      key: "examAttempt",
      className: "text-center",
      render: (_, item) => {
        if (!item.examAttempt) {
          return "---";
        }

        const percent = Math.round(
          ((item.examAttempt.totalScore || 0) / 10) * 100
        );

        return (
          <div className="flex items-center justify-center gap-3">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-action-hover">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor(percent)}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="min-w-[40px] text-left font-medium text-text-primary">
              {percent}%
            </span>
          </div>
        );
      },
    },
    {
      title: t("courseElement.classwork.columns.score"),
      key: "examAttempt",
      className: "text-center",
      render: (_, item) => item.examAttempt?.totalScore ?? "---",
    },
    {
      title: t("courseElement.classwork.columns.duration"),
      key: "examAttempt",
      className: "text-center",
      render: (_val, item) => {
        if (!item.examAttempt) {
          return "---";
        }

        const duration = calculateDuration(
          item.examAttempt.startTime,
          item.examAttempt.submissionTime
        );

        const isSubmitted = item.examAttempt.status === "SUBMITTED";

        return (
          <div className="flex items-center justify-between gap-4 pl-4">
            <span className="text-body-2 text-text-primary">{duration}</span>

            {isSubmitted && (
              <Button
                variant="contained"
                color="success"
                size="medium"
                onClick={() => {
                  if (item.examAttempt?.id) {
                    handleViewResult(item.examAttempt.id);
                  }
                }}
              >
                {t("common.result")}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const combinedFeed = useMemo(() => {
    // Lưu ý: Mạnh có thể thay MOCK_THONG_BAOS bằng nhomHocPhan?.thong_baos khi API sẵn sàng
    const rawThongBaos = thongBaos || [];
    const rawDeThis = deThis || [];

    const merged = [
      ...rawThongBaos.map((item) => ({
        ...item,
        feedType: "ANNOUNCEMENT" as const,
      })),
      ...rawDeThis.map((item) => ({ ...item, feedType: "EXAM" as const })),
    ];

    return merged.sort((a, b) => {
      const timeA = a.feedType === "ANNOUNCEMENT" ? a.sentAt : a.createdAt;
      const timeB = b.feedType === "ANNOUNCEMENT" ? b.sentAt : b.createdAt;
      return (
        new Date(timeB as string).getTime() -
        new Date(timeA as string).getTime()
      );
    });
  }, [deThis, thongBaos]);

  const handleClose = () => setOpenResultModal(false);

  const [isOpenNotiForm, setIsOpenNotiForm] = useState(false);
  const { reviewExam } = useExamActions();
  const handleViewResult = async (examAttemptId: number) => {
    useExamStore.getState().mode = "STUDENT";
    startLoading();
    try {
      // Gọi action review bài thi (đã bao gồm logic setFinalResult vào Store)
      await reviewExam(examAttemptId);

      // Sau khi dữ liệu đã vào Store thành công, mở Modal
      setOpenResultModal(true);
    } catch (error) {
      console.error("Lỗi khi tải kết quả:", error);
      // Bạn có thể thêm Toast thông báo lỗi ở đây
    } finally {
      stopLoading();
    }
  };
  const onCloseNotiForm = () => {
    setIsOpenNotiForm(false);
  };
  const { createNotification } = useCreateCourseGroupNotification();

  const handleSaveCreate = async (formData: NotificationCreate) => {
    formData.courseGroupIds = [Number(id)]; // set nhom hiện tại
    startLoading();
    try {
      await createNotification(formData);
      showToast(t("message.success.create"), "success");
      onCloseNotiForm();
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

  const { deleteNotificationAsync } =
    useDeleteCourseGroupNotification(Number(id!));
  const { openConfirm } = useConfirmStore();

  const handleDeleteNotifi = (a: Notification) => {
    openConfirm({
      title: t("notificationPage.confirmDeleteTitle"),
      message: t("notificationPage.confirmDeleteMessage"),
      type: "danger",
      onConfirm: async () => {
        startLoading();
        try {
          await deleteNotificationAsync(a.id);
          showToast(t("message.success.delete"), "success");
          if (typeof onCloseNotiForm === "function") onCloseNotiForm();
        } catch (error: unknown) {
          showToast(t("message.error.delete"), "error");
          throw error;
        } finally {
          stopLoading();
        }
      },
    });
  };

  // Sắp xếp danh sách bài tập cho tab Classwork
  const sortedClasswork = useMemo(() => {
    const rawData = exams?.exams || [];

    // Tạo bản sao để tránh mutate mảng gốc và sắp xếp
    return [...rawData].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.startTime).getTime();
      const dateB = new Date(b.createdAt || b.startTime).getTime();

      return dateB - dateA; // Mới hơn (lớn hơn) đứng trước
    });
  }, [exams]);

  return (
    <div className="flex h-fit min-h-screen flex-1 flex-col items-center bg-background-body-background">
      <div className="flex h-fit w-[1200px] flex-col pb-10">
        {/* Sticky Header Tabs */}
        <div className="sticky top-0 z-40 flex justify-between border-b border-other-outlined-border bg-background-body-background px-4">
          <Tabs
            value={selectedTab}
            onChange={setSelectedTab}
            tabs={[
              { value: "news", label: t("courseElement.tabs.news") },
              {
                value: "classwork",
                label: t("courseElement.tabs.classwork"),
              },
              { value: "everybody", label: t("courseElement.tabs.everybody") },
            ]}
          />
          <div className="flex items-center gap-1">
            <Button size={"small"} isButtonIcon={true}>
              <Icon name="folder" />
            </Button>
            <Button size={"small"} isButtonIcon={true}>
              <Icon name="moreVertical" />
            </Button>
          </div>
        </div>

        {/* --- Content Area --- */}
        <main className="px-4">
          {/* TAB: NEWS */}
          {selectedTab === "news" && (
            <div className="mt-6 duration-300 animate-in fade-in">
              <div className="relative mb-6 flex h-[240px] w-full items-end overflow-hidden rounded-xl bg-background-section p-8 shadow-md">
                <div className="absolute inset-0 bg-[url('https://www.gstatic.com/classroom/themes/img_graduation.jpg')] bg-cover bg-center opacity-25"></div>
                <div className="absolute inset-0 to-transparent"></div>
                <h1 className="text-h4 relative z-10 tracking-tight text-primary-contrast">
                  {courseGroup?.groupName}
                </h1>
              </div>

              <div className="flex gap-6">
                <aside className="w-1/5">
                  <div className="rounded-md border border-other-outlined-border bg-background-body-background p-4 shadow-sm">
                    <h2 className="text-body-2 mb-2 font-medium text-text-primary">
                      {t("courseElement.news.upcomingTitle")}
                    </h2>
                    <p className="text-caption mb-6 text-text-secondary">
                      {t("courseElement.news.upcomingEmpty")}
                    </p>
                    <div className="flex justify-end">
                      <Button color={"infor"} size={"medium"}>
                        {t("courseElement.news.viewAll")}
                      </Button>
                    </div>
                  </div>
                </aside>

                <div className="w-4/5 space-y-4">
                  <div
                    onClick={() => setIsOpenNotiForm(!isOpenNotiForm)}
                    className="group flex cursor-pointer items-center gap-4 rounded-lg border border-other-outlined-border bg-background-body-background p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full group-hover:bg-info-background">
                      <Icon name="edit" className="text-alert-info-content" />
                    </div>
                    <span className="text-body-2 text-text-secondary">
                      {t("courseElement.news.createAnnouncement")}
                    </span>
                  </div>

                  {/* Render Feed */}
                  {combinedFeed.map((item) => (
                    <div key={`${item.feedType}-${item.id}`}>
                      {item.feedType === "ANNOUNCEMENT" ? (
                        <AnnouncementCard
                          data={item as Notification}
                          onDeleteNotifi={handleDeleteNotifi}
                          onCopyNotifi={() => undefined}
                        />
                      ) : (
                        <ExamFeedItem data={item as Exam} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {isOpenNotiForm && (
                <NotiThisCourseForm
                  onClose={() => setIsOpenNotiForm(!isOpenNotiForm)}
                  onSaveCreate={handleSaveCreate}
                  mode="create"
                />
              )}
            </div>
          )}

          {/* TAB: CLASSWORK */}
          {selectedTab === "classwork" && (
            <div className="mt-8 flex justify-center duration-300 animate-in slide-in-from-bottom-2">
              <div className="w-full overflow-hidden rounded-md border border-other-outlined-border bg-background-body-background shadow-sm">
                <DynamicTable
                  columns={classworkColumns}
                  data={sortedClasswork}
                  rowKey="id"
                />
              </div>
            </div>
          )}

          {/* TAB: EVERYBODY */}
          {selectedTab === "everybody" && (
            <div className="mt-10 flex justify-center duration-500 animate-in fade-in">
              <div className="w-full max-w-[800px] space-y-12">
                <section>
                  <div className="mb-6 flex items-center justify-between border-b border-other-outlined-border pb-4">
                    <h2 className="text-h5 font-medium text-text-primary">
                      {t("courseElement.everybody.teacher")}
                    </h2>
                  </div>
                  <div className="flex cursor-pointer items-center gap-4 rounded-md px-4 py-2 transition-colors hover:bg-action-hover">
                    <img
                      src={getDefaultAvatar(giangVien?.fullName || "Teacher")}
                      alt={t("courseElement.everybody.teacher")}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="text-body-2 text-text-primary">
                      {giangVien?.fullName}
                    </span>
                  </div>
                </section>

                <section>
                  <div className="mb-6 flex items-center justify-between border-b border-other-outlined-border pb-4">
                    <h2 className="text-h5 font-medium text-text-primary">
                      {t("courseElement.everybody.classmates")}
                    </h2>
                    <span className="text-body-2 text-text-primary">
                      {t("courseElement.classResult.studentCount", {
                        count: students.length,
                      })}
                    </span>
                  </div>
                  <div className="divide-y divide-other-divider">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="group flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-action-hover"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={getDefaultAvatar(
                              student.fullName || "Teacher"
                            )}
                            alt={student.fullName}
                            className="h-8 w-8 rounded-full"
                          />
                          <span className="text-body-2 text-text-primary">
                            {student.fullName}
                          </span>
                        </div>
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                          <Button size="small" isButtonIcon={true}>
                            <Icon name="mail" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {openResultModal && (
            <Overlay onClose={handleClose}>
              {" "}
              <main className="mb-20 flex max-h-[90vh] w-fit flex-col items-center overflow-y-auto rounded-lg bg-background-body-background px-8 py-8">
                <ExamResultOverview onCancel={handleClose} />
              </main>
            </Overlay>
          )}
        </main>
      </div>
    </div>
  );
}

const AnnouncementCard = ({
  data,
  onDeleteNotifi,
  onCopyNotifi,
}: {
  data: Notification;
  onDeleteNotifi: (thongBao: Notification) => void;
  onCopyNotifi: (thongBao: Notification) => void;
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const authorName =
    data.sender?.fullName || t("courseElement.announcement.defaultAuthor");
  const firstLetter = authorName.trim().split(" ").pop()?.charAt(0) ?? "";
  const { user } = useAuthStore();

  return (
    <div className="overflow-hidden rounded-md border border-other-outlined-border bg-background-body-background shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-primary-contrast">
              {firstLetter}
            </div>
            <div>
              <h3 className="text-body-2 font-bold text-text-primary">
                {authorName}
              </h3>
              <p className="text-caption text-text-secondary">
                {new Date(data.sentAt).toLocaleString(locale, {
                  day: "numeric",
                  month: "short",
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
              </p>
            </div>
          </div>
          {/* <Button size="small" isButtonIcon>
            <Icon name="moreVertical" />
          </Button> */}

          <Dropdown
            align="right"
            trigger={
              <Button size="small" isButtonIcon>
                <Icon name="moreVertical" />
              </Button>
            }
          >
            {user?.id === data.senderId && (
              <DropdownItem onClick={() => onDeleteNotifi(data)}>
                {t("courseElement.announcement.delete")}
              </DropdownItem>
            )}

            <DropdownItem onClick={() => onCopyNotifi(data)}>
              {t("courseElement.announcement.copyLink")}
            </DropdownItem>
          </Dropdown>
        </div>
        <div className="text-body-2 mt-4 px-1 text-text-secondary">
          <p className="mb-1 font-bold text-text-primary">{data.title}</p>
          <p className="whitespace-pre-line">{data.content}</p>
        </div>
      </div>
    </div>
  );
};

const ExamFeedItem = ({ data }: { data: Exam }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  return (
    <div className="flex cursor-pointer items-center justify-between rounded-md border border-other-outlined-border bg-background-body-background p-4 transition-all hover:border-info-background hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-text-secondary text-primary-contrast">
          <Icon name="clipboard" />
        </div>
        <div>
          <p className="text-body-2 text-text-primary">
            {t("courseElement.feed.newExamPosted")}
            <span className="font-bold">{data.examName}</span>
          </p>
          <p className="text-caption text-text-secondary">
            {new Date(data.createdAt || "").toLocaleDateString(locale)} •{" "}
            {data.durationMinutes} {t("courseElement.common.minuteUnit")}
          </p>
        </div>
      </div>
      <Button size="small" isButtonIcon>
        <Icon name="moreVertical" />
      </Button>
    </div>
  );
};
