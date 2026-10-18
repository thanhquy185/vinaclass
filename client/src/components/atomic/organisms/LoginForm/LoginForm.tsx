import { Link, useNavigate } from "react-router-dom";
import { Checkbox } from "../../atoms/Checkbox/Checkbox";
import Logo from "../../molecules/Logo/Logo";
import { TextField } from "../../molecules/TextField/TextField";
import { Button, Icon } from "../../atoms";
import Divider from "../../atoms/Divider/Divider";
import { useLogin } from "@/hooks/useLogin";
import { useState, type FormEvent } from "react"; // Thêm FormEvent
import { useTranslation } from "react-i18next";
import type { ErrorResponse, LoginFormSubmit } from "@/types";
import type { AxiosError } from "axios";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useToastStore } from "@/stores/useToast.store";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function LoginForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loginData, setLoginData] = useState("admin");
  const [pass, setPass] = useState("admin");

  const { loginAsync, isLoadingLogin } = useLogin();
  const { startLoading, stopLoading } = useLoadingStore();
  const { showToast } = useToastStore();

  const { loginWithGoogle } = useGoogleAuth();

  // Đổi tên và nhận event
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Ngăn chặn reload trang

    const data: LoginFormSubmit = {
      login: loginData,
      password: pass,
    };

    try {
      startLoading();
      const res = await loginAsync(data);
      console.log(res);
      if (res.original.me.isStudent) {
        navigate("/courses");
      } else if (res.original.role.id === 2) {
        navigate("/course-group");
      } else {
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      stopLoading();
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        const firstError = errors
          ? Object.values(errors)?.[0]
          : ["Lỗi hệ thống"];

        if (Array.isArray(firstError)) {
          showToast(firstError[0], "error");
        }
      } else {
        showToast(t("message.login.failed"), "error");
      }
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Logo large={true} />

      {/* Chuyển đổi div thành form và gán onSubmit */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-h6 text-text-primary">
            Chào mừng đến với MaChHiAn! 👋🏻
          </span>
          <span className="text-body-2 text-text-secondary">
            Vui lòng đăng nhập vào tài khoản của bạn và bắt đầu cuộc phiêu lưu.
          </span>
        </div>

        <TextField
          placeholder="Mã sinh viên"
          value={loginData}
          onChange={(e) => setLoginData(e.target.value)}
          // Thêm thuộc tính HTML5 cơ bản nếu cần
        />

        <div className="flex flex-col gap-2">
          <TextField
            placeholder="Mật khẩu"
            type="password" // Đảm bảo mật khẩu được ẩn
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <div className="flex-bet-center">
            <Checkbox label="Nhớ lần này" />
            <span className="text-body-2 cursor-pointer text-primary-main">
              Quên mật khẩu?
            </span>
          </div>
        </div>

        {/* Chuyển sang type="submit" và xóa onClick */}
        <Button
          type="submit"
          variant={"contained"}
          color={"primary"}
          className="justify-center"
          disabled={isLoadingLogin} // Vô hiệu hóa khi đang load
        >
          Đăng nhập
        </Button>

        <div className="text-body-1 flex gap-1">
          <span className="text-text-secondary">Bạn chưa có tài khoản?</span>
          <Link to="/register">
            <span className="text-primary-main">Bắt đầu ngay</span>
          </Link>
        </div>

        <Divider> Hoặc</Divider>

        <div className="flex justify-center gap-2">
          {/* Button này không có type="submit" nên sẽ không trigger form */}
          <Button type="button" size={"medium"} onClick={loginWithGoogle}>
            <Icon name="googleIcon" />
            Google
          </Button>
        </div>
      </form>
    </div>
  );
}
