import RegisterForm from "@/features/auth/components/RegisterForm";
import AuthTemplate from "@/features/auth/components/AuthTemplate";

export default function RegisterPage() {
  return (
    <AuthTemplate>
      <RegisterForm />
    </AuthTemplate>
  );
}
