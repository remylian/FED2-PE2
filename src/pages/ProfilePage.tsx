import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  // Simple route guard (we can make a reusable guard later)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="opacity-80">Account details</p>
        </div>

        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      <section className="rounded-md border p-4 space-y-2">
        <div>
          <p className="text-sm opacity-70">Name</p>
          <p className="font-medium">{user.name}</p>
        </div>

        <div>
          <p className="text-sm opacity-70">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>

        <div>
          <p className="text-sm opacity-70">Role</p>
          <p className="font-medium">{user.venueManager ? "Venue manager" : "Customer"}</p>
        </div>

        {user.avatarUrl && (
          <div className="pt-2">
            <p className="text-sm opacity-70">Avatar</p>
            <img
              src={user.avatarUrl}
              alt={user.avatarAlt ?? `${user.name}'s avatar`}
              className="mt-2 h-16 w-16 rounded-full border object-cover"
            />
          </div>
        )}
      </section>
    </main>
  );
}
