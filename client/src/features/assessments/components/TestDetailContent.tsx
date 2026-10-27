import {
  CalendarClock,
  ClipboardList,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Info,
  Trash,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@/shared/components/ui";
import { AssessmentSummaryMetric } from "@/features/assessments/components/AssessmentSummaryMetric";
import {
  Dropdown,
  DropdownItem,
} from "@/shared/components/ui/Dropdown/Dropdown";
import { AdminPanel } from "@/shared/components/admin";
import { ClassResultItem } from "@/features/assessments/components/ClassResultItem";
import { formatFullDateTimeVN } from "@/shared/utils/date-time";
import type { CourseGroup } from "@/shared/types";
import { AssessmentPageHeader } from "@/features/assessments/components/AssessmentPageHeader";
import { getTestsStatus } from "@/features/assessments/utils/exam";
import { StatusLabel } from "@/shared/components/ui/StatusLabel/StatusLabel";

interface TestDetailContentProps {
  examName?: string;
  subjectName?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  questionCount: number;
  courseGroups?: CourseGroup[];
  examId: number;
  onPreview: () => void;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}

export default function TestDetailContent({
  examName,
  subjectName,
  startTime,
  endTime,
  durationMinutes,
  questionCount,
  courseGroups,
  examId,
  onPreview,
  onEdit,
  onView,
  onDelete,
}: TestDetailContentProps) {
  const { t } = useTranslation();
  const assignedGroups = courseGroups ?? [];
  const examStatus = getTestsStatus(startTime, endTime, new Date());
  const statusLabel = t(
    examStatus.status === "UPCOMING"
      ? "testPage.filter.notOpened"
      : examStatus.status === "OPENING"
        ? "testPage.filter.opening"
        : "testPage.filter.closed",
  );
  const statusVariant =
    examStatus.status === "UPCOMING"
      ? "success"
      : examStatus.status === "OPENING"
        ? "warning"
        : "error";

  return (
    <section className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <div className="flex min-w-0 flex-col gap-4">
        <AssessmentPageHeader
          title={examName}
          description={`${t("testItem.examCode", { id: examId })} · ${subjectName ?? t("testItem.unknownSubject")}`}
          icon={<ClipboardCheck size={21} aria-hidden="true" />}
          badge={
            <StatusLabel variant={statusVariant}>{statusLabel}</StatusLabel>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Button
                variant="contained"
                color="primary"
                size="medium"
                disabled={questionCount === 0}
                onClick={onPreview}
              >
                <Icon name="play" /> {t("testDetailPage.actions.preview")}
              </Button>
              <Button variant="outline" size="medium" onClick={onEdit}>
                <Icon name="edit" /> {t("testDetailPage.actions.edit")}
              </Button>

              <Dropdown
                trigger={
                  <Button variant="outline" size="medium">
                    <Icon name="detail" /> {t("testDetailPage.actions.menu")}
                  </Button>
                }
              >
                <div className="text-table-header px-4 py-2 uppercase text-text-disabled">
                  {t("testDetailPage.actions.menuTitle")}
                </div>
                <DropdownItem icon={<Info size={16} />} onClick={onView}>
                  {t("testDetailPage.actions.viewDetail")}
                </DropdownItem>
                <div className="my-1 border-t border-other-divider" />
                <DropdownItem
                  variant="error"
                  icon={<Trash size={16} />}
                  onClick={onDelete}
                >
                  {t("testDetailPage.actions.delete")}
                </DropdownItem>
              </Dropdown>
            </div>
          }
        />
        <AdminPanel className="grid min-w-0 grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
          <AssessmentSummaryMetric
            icon={<GraduationCap size={18} />}
            label={t("testDetailPage.overview.assignTo")}
            value={subjectName ?? t("testItem.unknownSubject")}
          />
          <AssessmentSummaryMetric
            icon={<CalendarClock size={18} />}
            label={t("testDetailPage.overview.schedule")}
            value={
              <span className="block">
                <span className="block">{formatFullDateTimeVN(startTime)}</span>
                <span className="mt-1 block text-text-secondary">
                  {formatFullDateTimeVN(endTime)}
                </span>
              </span>
            }
          />
          <AssessmentSummaryMetric
            icon={<Clock3 size={18} />}
            label={t("testDetailPage.overview.durationLabel")}
            value={t("testItem.durationMinutes", {
              count: Number(durationMinutes ?? 0),
            })}
          />
          <AssessmentSummaryMetric
            icon={<ClipboardList size={18} />}
            label={t("testDetailPage.overview.questionCount")}
            value={t("testItem.questionCount", {
              count: questionCount,
            })}
          />
        </AdminPanel>
      </div>

      <AdminPanel className="flex min-w-0 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-other-outlined-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-body-1 font-semibold text-text-primary">
              {t("testDetailPage.assignedToSection")}
            </h2>
            <p className="text-caption mt-1 text-text-secondary">
              {t("testItem.classCount", { count: assignedGroups.length })}
            </p>
          </div>
        </header>
        {assignedGroups.length > 0 ? (
          assignedGroups.map((courseGroup) => (
            <ClassResultItem
              key={courseGroup.id}
              data={courseGroup}
              testId={examId}
            />
          ))
        ) : (
          <p className="text-body-2 px-4 py-6 text-text-secondary sm:px-5">
            {t("testItem.noClasses")}
          </p>
        )}
      </AdminPanel>
    </section>
  );
}
