import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth/authStore";

export default function AuthToggle() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  if (isAuthenticated) {
    return (
      <button type="button" onClick={handleLogout} className="rounded-md border px-3 py-2 text-sm">
        Log out
      </button>
    );
  }

  return (
    <Link to="/login" className="rounded-md border px-3 py-2 text-sm inline-block">
      Log in
    </Link>
  );
}
