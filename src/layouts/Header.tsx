import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../auth/authStore";

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "text-sm transition-opacity",
          isActive ? "font-medium opacity-100" : "opacity-80 hover:opacity-100",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    toast.success("Logged out");
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-orange-200 via-orange-100 to-gray-100">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-6 py-3">
        {/* LEFT: Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/assets/nav-logo.png" alt="Holidaze logo" className="h-8 w-auto" />
        </Link>

        {/* CENTER: Main navigation */}
        <nav className="flex justify-center gap-6">
          {isAuthenticated && (
            <>
              <NavItem to="/venues">Browse venues</NavItem>
              <NavItem to="/bookings">My bookings</NavItem>
              <NavItem to="/profile">Profile</NavItem>
              {user?.venueManager && <NavItem to="/manager">Manager</NavItem>}
            </>
          )}
        </nav>

        {/* RIGHT: Auth / user actions */}
        <div className="flex items-center justify-end gap-4">
          {!isAuthenticated ? (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Register</NavItem>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-3 py-1.5 text-sm font-medium "
              >
                Log out
              </button>

              <div className="hidden sm:flex flex-col px-3 py-1.5 text-right leading-tight">
                <span className="text-xs text-slate-500">Signed in as</span>
                <span className="text-sm font-medium text-slate-900">{user?.name}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
