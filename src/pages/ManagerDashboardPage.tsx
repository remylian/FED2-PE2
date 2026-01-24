import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import RequireManager from "../components/auth/RequireManager";

export default function ManagerDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <RequireManager>
      <main className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Manager dashboard</h1>
            <p className="opacity-80">Manage venues and view bookings</p>
          </div>

          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        {user && (
          <section className="rounded-md border p-4">
            <p className="text-sm">
              You are signed in as a <span className="font-medium">venue manager</span>.
            </p>
          </section>
        )}
      </main>
    </RequireManager>
  );
}
