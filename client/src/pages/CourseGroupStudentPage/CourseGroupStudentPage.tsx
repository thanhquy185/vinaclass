import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Icon, Input } from "@/components/atomic/atoms";
import DynamicTable, {
  type TableColumn,
} from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import CourseGroupStudentForm from "@/components/atomic/organisms/CourseGroupStudentForm/CourseGroupStudentForm";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import { useTranslation } from "react-i18next";
import {
  useCourseGroupDetail,
  useCourseGroupStudents,
} from "@/hooks/useCourseGroup";
import {
  useRemoveStudentFromCourseGroup,
  useExportCourseGroupStudents,
} from "@/hooks/useCourseGroup";
import type { StudentRecord, User } from "@/types";
import { getDefaultAvatar } from "@/utils";

const mapTaiKhoanToStudentRecord = (
  taiKhoan: User,
  index: number,
  t: ReturnType<typeof useTranslation>["t"]
): StudentRecord => ({
  id: taiKhoan.id,
  stt: index + 1,
  fullName: taiKhoan.fullName,
  email: taiKhoan.email,
  studentCode: taiKhoan.username,
  gender: taiKhoan.isFemale
    ? t("courseGroupStudent.gender.female")
    : t("courseGroupStudent.gender.male"),
  dateOfBirth: taiKhoan.dateOfBirth,
  avatarUrl: taiKhoan.avatarUrl || "",
});

const getTableColumns = (
  t: ReturnType<typeof useTranslation>["t"]
): TableColumn<StudentRecord>[] => [
  {
    title: t("courseGroupStudent.table.stt"),
    key: "stt",
    className: "w-1/12",
  },
  {
    title: t("courseGroupStudent.table.fullName"),
    key: "fullName",
    render: (_, item) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action-hover text-text-secondary">
          <img
            src={getDefaultAvatar(item.fullName)}
            alt={item.fullName}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-primary-main">{item.fullName}</span>
          <span className="text-caption text-text-disabled">{item.email}</span>
        </div>
      </div>
    ),
  },
  {
    title: t("courseGroupStudent.table.studentCode"),
    key: "studentCode",
  },
  {
    title: t("courseGroupStudent.table.gender"),
    key: "gender",
  },
  {
    title: t("courseGroupStudent.table.dateOfBirth"),
    key: "dateOfBirth",
  },
];

export function CourseGroupStudentPage() {
  const { courseId, groupId } = useParams();
  const { courseGroup } = useCourseGroupDetail(Number(groupId));
  const { students, message, success } = useCourseGroupStudents(
    Number(groupId)
  );
  const removeMutation = useRemoveStudentFromCourseGroup();
  const exportMutation = useExportCourseGroupStudents();
  const { t } = useTranslation();

  const handleExportStudentList = async () => {
    try {
      await exportMutation.mutateAsync({ groupId: Number(groupId) });
    } catch (error) {
      console.error("Failed to export student list:", error);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm(t("courseGroupStudent.confirmRemoveStudent"))) return;
    try {
      await removeMutation.mutateAsync({
        groupId: Number(groupId),
        studentId,
      });
    } catch (error) {
      console.error("Failed to remove student:", error);
    }
  };

  const renderActions = (student: StudentRecord) => (
    <Button
      variant="text"
      size="small"
      color="error"
      onClick={() => handleRemoveStudent(student.id)}
      disabled={removeMutation.isPending}
    >
      {t("courseGroupStudent.delete")}
    </Button>
  );
  const [searchValue, setSearchValue] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    const mappedStudents = students.map((tk, idx) =>
      mapTaiKhoanToStudentRecord(tk, idx, t)
    );
    if (!keyword) return mappedStudents;
    return mappedStudents.filter(
      (student) =>
        student.fullName.toLowerCase().includes(keyword) ||
        student.studentCode.toLowerCase().includes(keyword)
    );
  }, [students, searchValue, t]);

  const courseGroupLabel = courseGroup
    ? `NH${courseGroup.academicYear} - HK${courseGroup.semester} - ${courseGroup.groupName}`
    : `${courseId ?? "841059"} - Object-Oriented Programming - NH2022 - HK2${groupId ? ` - Group ${groupId}` : " - Group 1"}`;

  return (
    <MainContentLayout classname="w-full">
      <div className="flex flex-col gap-3 px-10 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-background-body-background px-3 py-2">
          <div className="flex w-full flex-1 items-center gap-2 md:w-auto">
            <Input
              hasBoder={true}
              placeholder={t("courseGroupStudent.searchStudents")}
              icon={<Icon name="search" className="text-text-disabled" />}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-10 w-full flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={handleExportStudentList}
              disabled={exportMutation.isPending}
            >
              <Icon name="document" size={18} />
              {t("courseGroupStudent.exportList")}
            </Button>
            {/* <Button variant="contained" color="primary" size="medium">
              <Icon name="document" size={18} />
              Xuất bảng điểm
              <Icon
                name="arrowDown"
                size={16}
                className="text-primary-contrast"
              />
            </Button> */}
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={() => setIsAddStudentOpen(true)}
            >
              <Icon name="plus" size={18} />
              {t("courseGroupStudent.addStudent")}
            </Button>
            <Button variant="outline" size="medium" isButtonIcon>
              <Icon name="settings" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md bg-background-body-background px-3 py-2">
          <div className="flex items-center justify-between border-b border-other-outlined-border px-2 py-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <div className="text-body-2 font-semibold text-text-primary">
                {courseGroupLabel}
              </div>
            </div>
            <div className="text-caption text-text-secondary">
              {t("courseGroupStudent.classSize")}: {courseGroup?.studentCount}
            </div>
          </div>

          <DynamicTable
            columns={getTableColumns(t)}
            data={filteredStudents}
            rowKey="id"
            hasColumnActions={true}
            renderActions={renderActions}
          />
          {!success && message && (
            <div className="bg-error-container rounded-md border border-error-main px-4 py-3 text-center text-error-main">
              {message}
            </div>
          )}
        </div>
      </div>

      <CourseGroupStudentForm
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        courseLabel={courseGroupLabel}
        groupId={Number(groupId)}
        defaultInviteCode={courseGroup?.joinCode}
      />
    </MainContentLayout>
  );
}
