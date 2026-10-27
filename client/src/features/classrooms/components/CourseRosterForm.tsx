import { Tabs } from "antd";
import { UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import ManualStudentEnrollmentForm from "@/features/classrooms/components/ManualStudentEnrollmentForm";
import StudentRosterImportForm from "@/features/classrooms/components/StudentRosterImportForm";
import { useCourseRosterFormController } from "@/features/classrooms/hooks/useCourseRosterFormController";
import { AppDialog, Button } from "@/shared/components/ui";

const SAMPLE_STUDENT_FILE_URL = new URL(
  "../../../assets/files/danhsachSVmau.xlsx",
  import.meta.url
).href;

interface CourseGroupStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  courseLabel: string;
  groupId: number;
}

export default function CourseGroupStudentForm({
  isOpen,
  onClose,
  courseLabel,
  groupId,
}: CourseGroupStudentFormProps) {
  const { t } = useTranslation("common");
  const {
    studentForm,
    importForm,
    selectedTab,
    setSelectedTab,
    selectedFile,
    isBusy,
    isAdding,
    isImporting,
    handleBeforeUpload,
    handleRemoveFile,
    handleImportStudents,
    handleAddStudent,
    handleClose,
  } = useCourseRosterFormController({
    groupId,
    onClose,
  });

  const tabs = [
    {
      key: "manual",
      label: t("courseGroupStudent.form.manualAdd"),
      children: (
        <ManualStudentEnrollmentForm
          form={studentForm}
          isBusy={isBusy}
          onFinish={handleAddStudent}
        />
      ),
    },
    {
      key: "import",
      label: t("courseGroupStudent.form.importExcel"),
      children: (
        <StudentRosterImportForm
          form={importForm}
          selectedFile={selectedFile}
          isBusy={isBusy}
          sampleFileUrl={SAMPLE_STUDENT_FILE_URL}
          onBeforeUpload={handleBeforeUpload}
          onRemoveFile={handleRemoveFile}
          onFinish={handleImportStudents}
        />
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <AppDialog
      open={isOpen}
      title={t("courseGroupStudent.form.addDialogTitle")}
      description={courseLabel}
      icon={<UsersRound size={20} />}
      tone="primary"
      onClose={handleClose}
      busy={isBusy}
      width="min(760px, calc(100vw - 32px))"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="medium"
            onClick={handleClose}
            disabled={isBusy}
          >
            {t("courseGroupStudent.form.close")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            htmlType="submit"
            form={
              selectedTab === "import"
                ? "student-roster-import-form"
                : "manual-student-enrollment-form"
            }
            loading={selectedTab === "import" ? isImporting : isAdding}
            disabled={isBusy}
          >
            {t(
              selectedTab === "import"
                ? "courseGroupStudent.form.addToSystem"
                : "courseGroupStudent.form.addStudent"
            )}
          </Button>
        </div>
      }
    >
      <div className="px-5 py-5 sm:px-6">
        <Tabs
          activeKey={selectedTab}
          onChange={setSelectedTab}
          items={tabs}
          destroyOnHidden
        />
      </div>
    </AppDialog>
  );
}
