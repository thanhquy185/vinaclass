import { Link, useNavigate } from "react-router-dom";
import { Checkbox } from "../../atoms/Checkbox/Checkbox";
import Logo from "../../molecules/Logo/Logo";
import { TextField } from "../../molecules/TextField/TextField";
import { Button, Icon } from "../../atoms";
import Divider from "../../atoms/Divider/Divider";
import { type FormEvent } from "react";

export default function RegisterForm() {
  const navigate = useNavigate();

  const handleRegister = (e: FormEvent) => {
    e.preventDefault(); // Chặn reload trang
    console.log("Form submitted");
    // Thực hiện logic đăng ký (gọi API) ở đây
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Logo large={true} />

      {/* Chuyển đổi div thành form và gán onSubmit */}
      <form onSubmit={handleRegister} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-h6 text-text-primary">
            Cuộc phiêu lưu bắt đầu từ đây! 🚀
          </span>
          <span className="text-body-2 text-text-secondary">
            Giúp trải nghiệm của bạn trở nên dễ dàng và thú vị hơn!
          </span>
        </div>

        <TextField placeholder="Mã sinh viên" />

        <TextField placeholder="Mật khẩu" type="password" />

        <div className="flex flex-col gap-2">
          <TextField placeholder="Nhập lại mật khẩu" type="password" />
          <div className="flex gap-1">
            <Checkbox label="Tôi đồng ý với mọi" />
            <span className="text-body-2 cursor-pointer text-primary-main">
              điều khoản
            </span>
          </div>
        </div>

        {/* Button Đăng ký dùng type="submit" */}
        <Button
          type="submit"
          variant={"contained"}
          color={"primary"}
          className="justify-center"
        >
          Đăng ký ngay
        </Button>

        <div className="text-body-1 flex gap-1">
          <span className="text-text-secondary">Bạn đã có tài khoản?</span>
          <Link to="/login">
            <span className="text-primary-main">Đăng nhập ngay</span>
          </Link>
        </div>

        <Divider> Hoặc</Divider>

        <div className="flex justify-center gap-2">
          {/* Nút Google dùng type="button" để tránh trigger submit form */}
          <Button type="button" size={"medium"}>
            <Icon name="googleIcon" />
            Google
          </Button>
        </div>
      </form>
    </div>
  );
}
