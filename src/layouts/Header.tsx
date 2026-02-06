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
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          {/* Placeholder logo block (replace later with <img />) */}
          <div className="flex h-9 w-9 items-center justify-center rounded-md border text-[10px] font-medium text-slate-500">
            LOGO
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-slate-900">Holidaze</p>
            <p className="text-xs text-slate-500">Venue booking</p>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* User context (only when logged in) */}
          {isAuthenticated && user && (
            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-xs text-slate-500">Signed in as</span>
              <span className="text-sm font-medium text-slate-900">{user.name}</span>
            </div>
          )}

          {/* Nav */}
          <nav className="flex items-center gap-4">
            <NavItem to="/venues">Venues</NavItem>

            {!isAuthenticated ? (
              <>
                <NavItem to="/login">Login</NavItem>
                <NavItem to="/register">Register</NavItem>
              </>
            ) : (
              <>
                <NavItem to="/profile">Profile</NavItem>
                <NavItem to="/bookings">My bookings</NavItem>

                {user?.venueManager && <NavItem to="/manager">Manager</NavItem>}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            )}

            {/* Primary CTA */}
            <Link
              to="/venues"
              className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-95"
            >
              Browse
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
