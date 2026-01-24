import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../auth/authStore";

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
