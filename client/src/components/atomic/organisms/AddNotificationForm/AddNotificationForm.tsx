import { useSubjectsByTeacher, useSubject } from "@/hooks/useSubject";
import { Button } from "../../atoms";
import { Checkbox } from "../../atoms/Checkbox/Checkbox";
import SelectField from "../../atoms/Select/SelectField";
import { Overlay } from "../../molecules/Overlay/Overlay";
import { TextArea } from "../../molecules/TextArea/TextArea";
import { TextField } from "../../molecules/TextField/TextField";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import type {
  Subject,
  NotificationCreate,
  NotificationResponse,
  NotificationUpdate,
} from "@/types";
import {
  NotificationValidate,
  type NotificationError,
} from "@/validate/notification.validate";
import { useTranslation } from "react-i18next";

interface AddNotificationFormProps {
  onClose: () => void;
  onSaveCreate: (data: NotificationCreate) => void;
  onSaveUpdate: (id: number, data: NotificationUpdate) => void;
  selectedItem: NotificationResponse | null;
  mode: "create" | "view" | "update" | "none";
}

type Group = {
  id: number;
  label: string;
  checked: boolean;
};

export default function AddNotificationForm({
  onClose,
  onSaveCreate,
  onSaveUpdate,
  selectedItem,
  mode,
}: AddNotificationFormProps) {
  const { t } = useTranslation();
  const { user, role } = useAuthStore();
  const defaultFormData: NotificationCreate = {
    title: "",
    content: "",
    senderId: user ? user.id : 0,
    courseGroupIds: [],
  };
  const [groups, setGroups] = useState<Group[]>([]);
  const { subjects: teacherSubjects } = useSubjectsByTeacher(user?.id || 0);
  const { subjects: AllSubjects } = useSubject();
  const monHocDisplays = useMemo<Subject[]>(() => {
    if (!user || !role) return [];

    if (role.roleName === "teacher") {
      return teacherSubjects;
    } else {
      return AllSubjects;
    }
  }, [user, role, teacherSubjects, AllSubjects]);


  const selectedNotifi: NotificationCreate = selectedItem
    ? {
        title: selectedItem.title,
        content: selectedItem.content,
        senderId: selectedItem.senderId,
        courseGroupIds: selectedItem.courseGroups.map((nhp) => nhp.id),
      }
    : defaultFormData;

  const [formData, setFormData] = useState<NotificationCreate>(selectedNotifi);

  const isCreate = mode === "create";
  const isView = mode === "view";
  const isEdit = mode === "update";

  // const selectedMaMonHoc =
  //   selectedItem?.nhom_hoc_phans?.[0]?.mon_hoc.maMonHoc ?? 0;

  useEffect(() => {
    const selectedMonHocId = selectedItem?.courseGroups?.[0]?.subjectId ?? 0;
    // Lấy danh sách nhóm đã chọn
    const selectedNhomIds =
      selectedItem?.courseGroups?.map((nhom) => nhom.id) ?? [];

    const loadDataCheckBox = () => {
      const groupOfSubject: Group[] = monHocDisplays
        .filter((item) => Number(item.id) === selectedMonHocId)
        .flatMap((item) =>
          item.courseGroups.map((nhom) => ({
            id: nhom.id,
            label: nhom.groupName,
            checked: selectedNhomIds.includes(nhom.id),
          }))
        );
      setGroups(groupOfSubject);
    };
    if (isEdit || isView) {
      loadDataCheckBox();
    }
  }, [isEdit, isView, selectedItem, monHocDisplays]);

  const handleChange = <K extends keyof NotificationCreate>(
    field: K,
    value: NotificationCreate[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const subjects = monHocDisplays.map((item) => ({
    label: item.subjectName,
    value: item.id,
  }));

  const handleSelectSubject = (value: string | number) => {
    if (!value) return;
    const subjectId = typeof value === "number" ? value : Number(value);

    const groupOfSubject: Group[] = monHocDisplays
      .filter((item) => item.id === subjectId) //tạm không sửa prop Nhom hoc phan
      .flatMap((item) =>
        item.courseGroups.map((nhom) => ({
          id: nhom.id,
          label: nhom.groupName,
          checked: false,
        }))
      );

    setGroups(groupOfSubject);
    setFormData((prev) => ({
      ...prev,
      courseGroupIds: [], // reset khi đổi môn học
    }));
  };

  const handleCheck = (id: number, checked: boolean) => {
    setGroups((prev) =>
      prev.map((group) => (group.id === id ? { ...group, checked } : group))
    );

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        courseGroupIds: [...prev.courseGroupIds, id],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        courseGroupIds: prev.courseGroupIds.filter((itemId) => itemId !== id),
      }));
    }
  };

  const handleCheckAll = (checked: boolean) => {
    setGroups((prev) => prev.map((group) => ({ ...group, checked })));

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        courseGroupIds: groups.map((group) => group.id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        courseGroupIds: [],
      }));
    }
  };

  const [errors, setErrors] = useState<NotificationError>({});
  const handleSend = () => {
    // console.log("courseGroupIds", formData.courseGroupIds);
    if (mode === "update") {
      const data: NotificationUpdate = {
        courseGroupIds: formData.courseGroupIds,
        title: formData.title,
        content: formData.content,
        senderId: formData.senderId,
      };
      if (!selectedItem) {
        console.log("lỗi thiếu id");
        return;
      }

      const validationErrors = NotificationValidate.create(formData);

      // nếu có lỗi
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSaveUpdate(selectedItem.id, data);
    } else if (mode === "create") {
      const validationErrors = NotificationValidate.create(formData);

      // nếu có lỗi
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSaveCreate(formData);
    }
  };

  let title = "";
  switch (mode) {
    case "create":
      title = t("notificationForm.title.create");
      break;
    case "update":
      title = t("notificationForm.title.update");
      break;
    case "view":
      title = t("notificationForm.title.view");
      break;

    default:
      break;
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex w-[600px] flex-col rounded-lg bg-background-paper pb-2">
        <div className="text-h6 rounded-md bg-background-body-background px-5 pt-4 text-text-primary">
          {title}
        </div>
        <div className="flex flex-col gap-5 rounded-md bg-background-body-background p-5 text-text-secondary">
          <TextField
            label={t("notificationForm.fields.title.label")}
            placeholder={t("notificationForm.fields.title.placeholder")}
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            disabled={isView}
            error={errors.title}
          />
          {/*  */}
          <TextArea
            label={t("notificationForm.fields.content.label")}
            placeholder={t("notificationForm.fields.content.placeholder")}
            value={formData.content}
            onChange={(e) => handleChange("content", e.target.value)}
            disabled={isView}
            error={errors.content}
          />

          {/*  */}
          <div className="flex flex-col rounded-md border border-other-outlined-border">
            <div className="flex-bet-center gap-3 rounded-t-md bg-action-hover px-8 py-5 text-text-secondary">
              <span className="text-body-1-semibold">
                {t("notificationForm.assign.label")}
              </span>
              <SelectField
                classname="!flex-[unset] bg-background-body-background"
                placeholder={t("notificationForm.assign.placeholder")}
                options={subjects}
                value={subjects ? subjects[0]?.value : 0}
                onSelect={(value) => {
                  handleSelectSubject(value);
                }}
                disabled={isView}
              />
            </div>

            <div className="flex flex-col px-5 pb-2 text-text-secondary">
              <div className="p-4">
                <Checkbox
                  label={t("notificationForm.selectAll")}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  disabled={isView}
                />
              </div>

              <div className="flex flex-wrap gap-0">
                {groups.map((group) => (
                  <div key={group.id} className="p-4">
                    <Checkbox
                      label={group.label}
                      checked={group.checked}
                      onChange={(e) => handleCheck(group.id, e.target.checked)}
                      disabled={isView}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {errors.courseGroupIds && (
            <div className="text-sm text-red-500">{errors.courseGroupIds}</div>
          )}

          {/*  */}
          <div className="flex justify-end gap-2">
            <Button variant={"outline"} onClick={onClose}>
              {t("notificationForm.actions.back")}
            </Button>
            {!isView && (
              <Button
                variant={"contained"}
                color={"primary"}
                onClick={handleSend}
              >
                {isCreate
                  ? t("notificationForm.actions.send")
                  : t("notificationForm.actions.save")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}
