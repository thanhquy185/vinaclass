import { useState } from "react";
import { Button, Icon } from "@/components/atomic/atoms";
import { TextField } from "@/components/atomic/molecules/TextField/TextField";
import type { StudentRecord } from "@/types";
import { Overlay } from "../../molecules/Overlay/Overlay";
import Tabs from "../../molecules/Tabs/Tabs";
import { RadioGroup } from "../../molecules/RadioGroup/RadioGroup";

export type StudentFormData = Partial<StudentRecord>;

interface StudentFormProps {
  initialData?: StudentRecord | null;
  onSave: (data: StudentFormData) => void;
  onCancel: () => void;
}

export function StudentForm({
  initialData,
  onSave,
  onCancel,
}: StudentFormProps) {
  const [selectedTab, setSelectedTab] = useState("manual");

  const [formData, setFormData] = useState<StudentFormData>(
    initialData ?? {
      studentCode: "",
      fullName: "",
      email: "",
      gender: "Nam",
      dateOfBirth: "",
      avatarUrl: "",
    }
  );

  const handleChange = (
    field: keyof StudentFormData,
    value: StudentFormData[keyof StudentFormData]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Overlay onClose={onCancel}>
      <div className="flex w-[600px] flex-col gap-3 rounded-lg bg-background-paper pb-2">
        <Tabs
          value={selectedTab}
          onChange={setSelectedTab}
          childClassName="flex-1"
          tabs={[
            { value: "manual", label: "Thêm thủ công" },
            { value: "file", label: "Thêm từ file" },
          ]}
        />

        {selectedTab === "manual" ? (
          <>
            <div className="flex max-h-[70vh] flex-col gap-5 overflow-auto px-8 py-0">
              <TextField
                label="Mã sinh viên"
                placeholder="Nhập mã sinh viên"
                value={formData.studentCode}
                onChange={(e) => handleChange("studentCode", e.target.value)}
              />

              <TextField
                label="Họ và tên"
                placeholder="Nhập họ và tên sinh viên"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />

              <TextField
                label="Email"
                placeholder="Nhập địa chỉ email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />

              <div className="flex gap-4">
                <span className="text-input-text font-semibold text-text-secondary">
                  Giới tính
                </span>
                <RadioGroup
                  name="gender"
                  options={[
                    { label: "Nam", value: true }, // true đại diện cho "Nam"
                    { label: "Nữ", value: false }, // false đại diện cho "Nữ"
                  ]}
                  value={formData.gender === "Nam"}
                  onChange={(val: boolean) =>
                    handleChange("gender", val ? "Nam" : "Nữ")
                  }
                  disabled={false}
                />
              </div>

              <TextField
                label="Ngày sinh"
                type="date"
                placeholder="Ngày sinh"
                value={
                  formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              />
            </div>

            <div className="flex justify-end px-5 py-2">
              <div className="flex gap-2">
                <Button variant="outline" color="standard" onClick={onCancel}>
                  Quay lại
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onSave(formData)}
                >
                  {initialData ? "Cập nhật" : "Lưu sinh viên"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-4 px-6">
            <Icon name="upload" size={48} className="text-text-disabled" />
            <p className="text-text-secondary">
              Kéo thả file vào đây hoặc nhấn để chọn file
            </p>
            <Button variant="outline" color="primary">
              Chọn file Excel
            </Button>
          </div>
        )}
      </div>
    </Overlay>
  );
}
