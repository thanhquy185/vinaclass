import type { ChangeEventHandler } from "react";
import { useRef, useState } from "react";
import { Button, Icon, Input } from "@/components/atomic/atoms";
import { Overlay } from "@/components/atomic/molecules/Overlay/Overlay";
import Tabs from "@/components/atomic/molecules/Tabs/Tabs";
import {
  useAddStudentToCourseGroup,
  useImportCourseGroupStudents,
  useResetInviteCode,
} from "@/hooks/useCourseGroup";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/types";

const SAMPLE_STUDENT_FILE_URL = new URL(
  "../../../../assets/files/danhsachSVmau.xlsx",
  import.meta.url
).href;

interface CourseGroupStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  courseLabel: string;
  groupId: number;
  defaultInviteCode?: string;
}

export default function CourseGroupStudentForm({
  isOpen,
  onClose,
  courseLabel,
  groupId,
  defaultInviteCode,
}: CourseGroupStudentFormProps) {
  const [selectedTab, setSelectedTab] = useState("manual");
  const [studentCode, setStudentCode] = useState("");
  const { t } = useTranslation();
  const noFileSelectedText = t("courseGroupStudent.form.noFileSelected");
  const [fileName, setFileName] = useState(noFileSelectedText);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addMutation = useAddStudentToCourseGroup();
  const resetMutation = useResetInviteCode();
  const importMutation = useImportCourseGroupStudents();

  const TAB_OPTIONS = [
    { value: "manual", label: t("courseGroupStudent.form.manualAdd") },
    { value: "invite", label: t("courseGroupStudent.form.joinByInvite") },
    { value: "import", label: t("courseGroupStudent.form.importExcel") },
  ];
  //
  if (!isOpen) return null;

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : noFileSelectedText);
  };

  const handleGenerateCode = async () => {
    await resetMutation.mutateAsync({ groupId });
  };

  const handleCopyCode = async () => {
    if (defaultInviteCode) {
      try {
        await navigator.clipboard.writeText(defaultInviteCode);
      } catch (error) {
        console.error("Failed to copy invite code:", error);
      }
    }
  };

  const handleImportStudents = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    try {
      await importMutation.mutateAsync({ groupId, file });
      setFileName(noFileSelectedText);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose(); // Close the form on success
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 404) {
        //lỗi validate backend
        const errors = err.response?.data?.errors;
        const firstError = Object.values(errors)?.[0];
        console.log(firstError);
        if (firstError && "username" in firstError) {
          alert(`sinh viên ${firstError.username} không có trong hệ thống`);
        }
      } else {
        alert(t("message.success.update"));
      }
    }
  };

  // const handleAddStudent = async () => {
  //   if (!studentCode.trim()) return;
  //   // Assume studentCode is the ID for now
  //   const studentId = parseInt(studentCode);
  //   if (isNaN(studentId)) return;
  //   try {
  //     await addMutation.mutateAsync({ id: groupId, data: { studentId } });
  //     setStudentCode("");
  //     onClose(); // Close the form on success
  //   } catch (error) {
  //     console.error("Failed to add student:", error);
  //   }
  // };

  const handleAddStudent = async () => {
    const username = studentCode.trim();

    if (!username) return;

    try {
      await addMutation.mutateAsync({
        id: groupId,
        data: { username },
      });

      setStudentCode("");
      onClose();
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex w-[720px] max-w-[95vw] flex-col overflow-hidden rounded-lg bg-background-body-background">
        <div className="flex items-center justify-between border-b border-other-outlined-border pr-4">
          <Tabs
            value={selectedTab}
            onChange={setSelectedTab}
            tabs={TAB_OPTIONS}
            className="flex-1"
            childClassName="px-4 py-3"
            small
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-primary-main p-1 text-primary-main transition-colors hover:bg-action-hover"
            aria-label={t("courseGroup.form.close")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {selectedTab === "manual" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-text-primary">
                <div className="text-input-text font-semibold text-text-secondary">
                  {t("courseGroupStudent.form.studentCode")}
                </div>
                <Input
                  hasBoder={true}
                  placeholder={t(
                    "courseGroupStudent.form.studentCodePlaceholder"
                  )}
                  value={studentCode}
                  onChange={(event) => setStudentCode(event.target.value)}
                  className="h-10 w-full"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={handleAddStudent}
                  disabled={addMutation.isPending}
                >
                  {t("courseGroupStudent.form.addStudent")}
                </Button>
              </div>
            </div>
          )}

          {selectedTab === "invite" && (
            <div className="flex flex-col gap-4">
              <div className="text-body-2 text-text-secondary">
                {courseLabel}
              </div>
              <div className="text-center text-[48px] font-semibold text-text-primary">
                {defaultInviteCode}
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  color="standard"
                  size="medium"
                  onClick={handleCopyCode}
                >
                  {t("courseGroupStudent.form.copy")}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={handleGenerateCode}
                >
                  {t("courseGroupStudent.form.generateNewCode")}
                </Button>
              </div>
            </div>
          )}

          {selectedTab === "import" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 text-text-primary">
                <div className="text-input-text font-semibold">
                  {t("courseGroupStudent.form.content")}
                </div>
                <div className="flex items-center gap-3 rounded-md border border-other-outlined-border bg-background-body-background px-3 py-2">
                  <Button
                    variant="outline"
                    color="standard"
                    size="small"
                    onClick={handleChooseFile}
                  >
                    {t("courseGroupStudent.form.chooseFile")}
                  </Button>
                  <span className="text-body-2 text-text-disabled">
                    {fileName}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="text-body-2 flex flex-wrap items-center gap-1 text-text-secondary">
                <span>{t("courseGroupStudent.form.formatInstruction")}</span>
                <a
                  href={SAMPLE_STUDENT_FILE_URL}
                  download="danhsachSVmau.xlsx"
                  className="font-semibold text-alert-error-content transition-opacity hover:opacity-80"
                >
                  {t("courseGroupStudent.form.downloadSampleFile")}
                </a>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={handleImportStudents}
                  disabled={importMutation.isPending}
                >
                  <Icon name="upload" size={18} />
                  {t("courseGroupStudent.form.addToSystem")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
