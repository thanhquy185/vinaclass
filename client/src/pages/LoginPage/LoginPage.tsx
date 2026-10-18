import { LoginForm } from "@/components/atomic/organisms";
import { AuthTemplate } from "@/components/atomic/templates";

export default function LoginPage() {
  return (
    <AuthTemplate>
      <LoginForm />
    </AuthTemplate>
  );
}
