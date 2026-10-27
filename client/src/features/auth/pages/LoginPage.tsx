import LoginForm from "@/features/auth/components/LoginForm";
import AuthTemplate from "@/features/auth/components/AuthTemplate";

export default function LoginPage() {
  return (
    <AuthTemplate>
      <LoginForm />
    </AuthTemplate>
  );
}
