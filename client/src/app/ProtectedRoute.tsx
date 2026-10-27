import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/useAuthStore";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page.
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
