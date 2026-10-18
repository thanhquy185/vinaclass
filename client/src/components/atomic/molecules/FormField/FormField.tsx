import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/atomic/atoms";

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
};

export default function FormField({
  label,
  name,
  type = "text",
  placeholder,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  const currentType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {/* Label: Sử dụng text-muted cho nhẹ nhàng, chuyên nghiệp */}
      <label
        className="text-muted mb-0.5 text-[13px] font-medium"
        htmlFor={name}
      >
        {label}
      </label>

      <div className="relative">
        <Input
          id={name}
          name={name}
          type={currentType}
          placeholder={placeholder}
          // Đảm bảo Input bên trong cũng sử dụng text-main và border-neutral
          className={`pr-10 ${isPasswordType ? "font-normal" : ""}`}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            // Icon mặc định màu muted, khi hover đổi sang primary
            className="text-muted hover:text-primary absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
