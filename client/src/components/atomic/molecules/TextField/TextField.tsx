import { forwardRef, useState } from "react";
import Input from "../../atoms/Input/Input";
import type { InputProps } from "../../atoms/Input/Input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../atoms";

interface TextFieldProps extends InputProps {
  label?: string;
  error?: string;
  classNameParent?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { label, error, placeholder = "", classNameParent = "", type, ...props },
    ref
  ) => {
    // State quản lý việc hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);

    // Kiểm tra xem input hiện tại có phải là loại password không
    const isPasswordType = type === "password";

    // Hàm chuyển đổi trạng thái ẩn/hiện
    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div
        className={`flex flex-col gap-1 text-text-primary ${classNameParent}`}
      >
        {label && (
          <label className="text-body-2-semibold text-text-secondary">
            {label}
          </label>
        )}

        <div className="relative w-full">
          <Input
            ref={ref}
            placeholder={placeholder}
            // Nếu là password và đang ở chế độ "show", đổi type thành "text"
            type={isPasswordType && showPassword ? "text" : type}
            className={`${isPasswordType ? "pr-10" : ""} ${props.className || ""}`}
            {...props}
          />

          {/* Chỉ hiển thị nút icon nếu type truyền vào là password */}
          {isPasswordType && (
            <Button
              type="button"
              size={"small"}
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled transition-colors hover:text-text-secondary"
              tabIndex={-1} // Tránh focus vào nút này khi dùng phím Tab
            >
              {showPassword ? (
                <Eye size={20} strokeWidth={1.5} />
              ) : (
                <EyeOff size={20} strokeWidth={1.5} />
              )}
            </Button>
          )}
        </div>

        {error && (
          <span className="text-caption mt-0.5 text-alert-error-content">
            {error}
          </span>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";
