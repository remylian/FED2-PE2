import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../auth/authStore";

export default function RequireManager({ children }: { children: React.ReactNode }) {
  const { user, accessToken, activeRole } = useAuthStore();

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.venueManager) {
    return <Navigate to="/profile" replace />;
  }

  if (activeRole !== "manager") {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
