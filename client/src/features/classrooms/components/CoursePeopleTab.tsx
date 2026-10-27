import { Avatar } from "antd";
import type { User } from "@/shared/types";
import { getFirstCharOfLastName } from "@/shared/utils/avatar";
import { useTranslation } from "react-i18next";

interface CoursePeopleTabProps {
  teacher: User | null;
  students: User[];
}

export default function CoursePeopleTab({
  teacher,
  students,
}: CoursePeopleTabProps) {
  const { t } = useTranslation();
  const teacherName =
    teacher?.profile.fullName || t("courseElement.people.unknownTeacher");

  return (
    <div className="mt-8 w-full space-y-12 duration-500 animate-in fade-in">
      <div className="w-full space-y-12">
        <section>
          <div className="mb-6 flex items-center justify-between border-b border-other-outlined-border pb-4">
            <h2 className="text-h5 font-medium text-text-primary">
              {t("courseElement.everybody.teacher")}
            </h2>
          </div>
          <div className="flex items-center gap-4 rounded-md px-4 py-2">
            <Avatar
              src={teacher?.profile.avatarUrl || undefined}
              alt={teacherName}
              size={32}
            >
              {getFirstCharOfLastName(teacherName)}
            </Avatar>
            <span className="text-body-2 text-text-primary">{teacherName}</span>
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
            {students.map((student) => {
              const studentName =
                student.profile.fullName ||
                t("courseElement.people.unknownStudent");

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={student.profile.avatarUrl || undefined}
                      alt={studentName}
                      size={32}
                    >
                      {getFirstCharOfLastName(studentName)}
                    </Avatar>
                    <span className="text-body-2 text-text-primary">
                      {studentName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
