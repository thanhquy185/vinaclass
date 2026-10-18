import { Link } from "react-router-dom";
import { Button, Icon } from "../../atoms"; // Điều chỉnh đường dẫn theo dự án của bạn
import type { CourseGroup } from "@/types";
import { useTranslation } from "react-i18next";

interface ClassResultItemProps {
  data: CourseGroup;
  testId: number; // Thêm testId để linh hoạt tạo Link
}

export const ClassResultItem = ({ data, testId }: ClassResultItemProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex-bet-center border-t border-other-outlined-border px-10 py-3">
      {/* Left Section: Group Name */}
      <div className="flex items-center gap-2">
        <Icon name="groupUser" size={24} className="text-text-secondary" />
        <span className="text-body-1-semibold text-text-secondary">
          {data.groupName}
        </span>
      </div>

      {/* Right Section: Actions & Info */}
      <div className="flex items-center gap-5">
        <Button
          size={"medium"}
          className="text-text-secondary underline transition-colors hover:text-primary-main"
        >
          {t("courseElement.classResult.studentCount", {
            count: data.studentCount ?? 0,
          })}
        </Button>

        <span className="text-body-2 h-fit rounded-md bg-success-background px-2 py-1 font-medium text-alert-success-content">
          {data.academicYear}
        </span>

        <Link to={`/tests/${testId}/result/${data.id}`}>
          <Button variant={"contained"} color={"success"}>
            {t("common.result")}
          </Button>
        </Link>
      </div>
    </div>
  );
};
