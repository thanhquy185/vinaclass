import type { CourseGroup } from "@/types";
import { Button, Icon } from "../../atoms";
import { getDefaultAvatar, getRandomBackground } from "@/utils";
import { useMemo } from "react";
import { Dropdown, DropdownItem } from "../../molecules/Dropdown/Dropdown";
import { useTranslation } from "react-i18next";

interface CourseItemProps {
  data: CourseGroup;
  className?: string;
  onClick?: () => void;
}

export default function CourseItem({
  data, //
  className = "",
  onClick,
}: CourseItemProps) {
  const { t } = useTranslation();
  const bgImage = useMemo(() => getRandomBackground(), []);
  return (
    <div
      className={`relative flex w-[280px] max-w-[320px] flex-col rounded-xl border border-other-outlined-border bg-background-body-background shadow-sm hover:shadow-lg ${className}`}
    >
      {/* Header Section: Dark Background */}
      <header
        onClick={onClick}
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7)), url(${bgImage})`,
        }}
        className={`relative h-[105px] cursor-pointer rounded-t-xl p-4 pr-10 text-primary-contrast`}
      >
        <h2 className="text-h6 truncate leading-tight decoration-1 hover:underline">
          {data.groupName}
        </h2>
        <p className="text-body-2 mt-1 opacity-90 hover:underline">
          {data.teacher?.fullName}
        </p>

        {/* Floating Avatar */}
        <div className="absolute -bottom-5 right-4 z-10">
          <div className="h-[74px] w-[74px] overflow-hidden rounded-full border border-other-outlined-border bg-action-active shadow-sm">
            <img
              src={getDefaultAvatar(data.teacher?.fullName || "user")}
              alt={t("courseItem.teacherAlt")}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </header>

      {/* Body: Empty area for assignments/deadlines */}
      <div
        onClick={onClick}
        className="min-h-[135px] flex-grow cursor-pointer bg-background-body-background p-4"
      >
        {/* Có thể thêm danh sách bài tập sắp tới ở đây */}
        <div className="flex flex-col">
          <span className="text-body-1 font-bold">
            {data.subject?.subjectName}
          </span>{" "}
          <span className="text-body-2 text-text-secondary">
            {t("courseItem.academicInfo", {
              year: data.academicYear,
              semester: data.semester,
            })}
          </span>
        </div>
      </div>

      {/* Footer: Action Icons */}
      <footer className="flex items-center justify-end gap-0.5 border-t border-other-outlined-border px-2 py-2.5 text-text-secondary">
        <Button size={"small"} isButtonIcon={true}>
          <Icon name="folder" />
        </Button>

        <Dropdown
          align="right"
          trigger={
            <Button size={"small"} isButtonIcon={true}>
              <Icon name="moreVertical" />
            </Button>
          }
        >
          <DropdownItem
            onClick={() => {
              return;
            }}
          >
            {t("courseItem.hide")}
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              return;
            }}
          >
            {t("courseItem.unsubscribe")}
          </DropdownItem>
        </Dropdown>
      </footer>
    </div>
  );
}
