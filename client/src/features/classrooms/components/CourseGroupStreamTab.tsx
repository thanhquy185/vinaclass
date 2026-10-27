import { Empty } from "antd";
import { Copy, KeyRound } from "lucide-react";
import { Button, Icon } from "@/shared/components/ui";
import ClassAnnouncementCard from "@/features/classrooms/components/ClassAnnouncementCard";
import ClassAnnouncementForm from "@/features/classrooms/components/ClassAnnouncementForm";
import ExamFeedItem from "@/features/classrooms/components/ExamFeedItem";
import type { CourseFeedItem } from "@/features/classrooms/utils/courseElementFeed";
import type { StudentExam } from "@/shared/types";
import type {
  Notification,
  NotificationCreate,
} from "@/features/classrooms/types/classrooms";
import { useTranslation } from "react-i18next";

interface CourseGroupStreamTabProps {
  courseGroupId: number;
  isTeacher: boolean;
  joinCode?: string;
  nearestUpcomingExam?: StudentExam;
  feedItems: CourseFeedItem[];
  canCreateAnnouncement: boolean;
  isAnnouncementFormOpen: boolean;
  canDeleteAnnouncement: (notification: Notification) => boolean;
  onViewClasswork: () => void;
  onCopyJoinCode: () => void;
  onToggleAnnouncementForm: () => void;
  onDeleteAnnouncement: (notification: Notification) => void;
  onCloseAnnouncementForm: () => void;
  onSaveAnnouncement: (data: NotificationCreate) => void;
}

export default function CourseGroupStreamTab({
  courseGroupId,
  isTeacher,
  joinCode,
  nearestUpcomingExam,
  feedItems,
  canCreateAnnouncement,
  isAnnouncementFormOpen,
  canDeleteAnnouncement,
  onViewClasswork,
  onCopyJoinCode,
  onToggleAnnouncementForm,
  onDeleteAnnouncement,
  onCloseAnnouncementForm,
  onSaveAnnouncement,
}: CourseGroupStreamTabProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  return (
    <div className="mt-6 duration-300 animate-in fade-in">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-1/5">
          <div className="rounded-2xl border border-[#dadce0] bg-white p-4 shadow-sm dark:border-other-outlined-border dark:bg-background-paper">
            {isTeacher ? (
              <>
                <div className="flex items-center gap-2 text-[#5f6368] dark:text-text-secondary">
                  <KeyRound
                    size={17}
                    className="text-[#1a73e8]"
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-medium text-[#3c4043] dark:text-text-primary">
                    {t("courseElement.news.classCodeTitle")}
                  </h2>
                </div>
                <p className="mt-4 break-all text-2xl font-medium tracking-wide text-[#202124] dark:text-text-primary">
                  {joinCode || "—"}
                </p>
                <p className="mt-2 text-sm text-[#5f6368] dark:text-text-secondary">
                  {t("courseElement.news.classCodeHint")}
                </p>
                <Button
                  variant="outline"
                  color="primary"
                  size="medium"
                  onClick={onCopyJoinCode}
                  disabled={!joinCode}
                  className="mt-4 w-full justify-center rounded-full"
                >
                  <Copy size={16} aria-hidden="true" />
                  {t("courseElement.news.copyClassCode")}
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-body-2 mb-2 font-medium text-text-primary">
                  {t("courseElement.news.upcomingTitle")}
                </h2>
                {nearestUpcomingExam ? (
                  <p className="text-caption mb-6 text-text-secondary">
                    {t("courseElement.news.upcomingExam", {
                      examName: nearestUpcomingExam.examName,
                      date: new Date(
                        nearestUpcomingExam.startTime
                      ).toLocaleString(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }),
                    })}
                  </p>
                ) : (
                  <p className="text-caption mb-6 text-text-secondary">
                    {t("courseElement.news.upcomingEmpty")}
                  </p>
                )}
                <div className="flex justify-end">
                  <Button color="infor" size="medium" onClick={onViewClasswork}>
                    {t("courseElement.news.viewAll")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="w-full min-w-0 space-y-4 lg:w-4/5">
          {canCreateAnnouncement && (
            <button
              type="button"
              onClick={onToggleAnnouncementForm}
              className="group flex w-full items-center gap-4 rounded-lg border border-other-outlined-border bg-background-body-background p-4 text-left shadow-sm transition-all hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full group-hover:bg-info-background">
                <Icon name="edit" className="text-alert-info-content" />
              </span>
              <span className="text-body-2 text-text-secondary">
                {t("courseElement.news.createAnnouncement")}
              </span>
            </button>
          )}

          {feedItems.length === 0 ? (
            <Empty
              className="rounded-md border border-dashed border-other-outlined-border bg-background-body-background py-8"
              description={t("courseElement.news.emptyFeed")}
            />
          ) : (
            feedItems.map((item) => (
              <div key={`${item.feedType}-${item.id}`}>
                {item.feedType === "ANNOUNCEMENT" ? (
                  <ClassAnnouncementCard
                    data={item}
                    canDelete={canDeleteAnnouncement(item)}
                    onDelete={onDeleteAnnouncement}
                  />
                ) : (
                  <ExamFeedItem data={item} />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {canCreateAnnouncement && isAnnouncementFormOpen && (
        <ClassAnnouncementForm
          courseGroupId={courseGroupId}
          onClose={onCloseAnnouncementForm}
          onSaveCreate={onSaveAnnouncement}
        />
      )}
    </div>
  );
}
