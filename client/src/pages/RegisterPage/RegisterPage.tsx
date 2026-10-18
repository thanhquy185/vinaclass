import RegisterForm from "@/components/atomic/organisms/RegisterForm/RegisterForm";
import { AuthTemplate } from "@/components/atomic/templates";

export default function RegisterPage() {
  return (
    <AuthTemplate>
      <RegisterForm />
    </AuthTemplate>
  );
}
