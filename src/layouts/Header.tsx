import { useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../auth/authStore";

function NavItem({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "relative px-2 py-2 text-sm transition-colors",
          isActive ? "font-semibold text-slate-900" : "text-slate-900/80 hover:text-slate-900",
          "after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:rounded-full",
          isActive ? "after:bg-slate-900/60" : "after:bg-transparent hover:after:bg-slate-900/30",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

function MobileMenuItem({
  to,
  end,
  children,
  onSelect,
}: {
  to: string;
  end?: boolean;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={() => onSelect()}
      className={({ isActive }) =>
        [
          "block px-3 py-2 text-sm",
          isActive ? "hamburger-active text-white font-medium" : "hover:bg-slate-900/5",
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

  const mobileDetailsRef = useRef<HTMLDetailsElement | null>(null);

  const closeMobileMenu = () => {
    if (mobileDetailsRef.current) mobileDetailsRef.current.open = false;
  };

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const details = mobileDetailsRef.current;
      if (!details?.open) return;

      const target = e.target as Node | null;
      if (target && details.contains(target)) return;

      details.open = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const details = mobileDetailsRef.current;
      if (!details?.open) return;
      details.open = false;
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function handleLogout() {
    logout();
    toast.success("Logged out");
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-orange-200 via-orange-100 to-gray-100">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center px-6 py-3">
        {/* LEFT: Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/assets/nav-logo.png" alt="Holidaze logo" className="h-8 w-auto" />
        </Link>

        {/* CENTER: Main navigation (desktop only) */}
        <nav className="hidden lg:flex justify-center gap-6">
          {isAuthenticated && (
            <>
              <NavItem to="/venues" end>
                Browse venues
              </NavItem>
              <NavItem to="/bookings" end>
                My bookings
              </NavItem>
              <NavItem to="/profile" end>
                Profile
              </NavItem>
              {user?.venueManager && (
                <NavItem to="/manager" end>
                  Manager
                </NavItem>
              )}
            </>
          )}
        </nav>

        {/* RIGHT: Desktop auth/user actions */}
        <div className="hidden lg:flex items-center justify-end gap-4">
          {!isAuthenticated ? (
            <>
              <NavItem to="/login" end>
                Login
              </NavItem>
              <NavItem to="/register" end>
                Register
              </NavItem>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-3 py-1.5 text-sm font-medium cursor-pointer hover:text-sky-600 "
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

        {/* RIGHT: Mobile hamburger (mobile only) */}
        <div className="flex justify-end justify-self-end lg:hidden">
          <details ref={mobileDetailsRef} className="relative">
            <summary
              className="list-none cursor-pointer rounded-md border px-3 py-2 text-sm select-none bg-white/70"
              aria-label="Open menu"
            >
              ☰
            </summary>

            <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg p-2">
              <div className="flex flex-col">
                {isAuthenticated ? (
                  <>
                    <MobileMenuItem to="/venues" end onSelect={closeMobileMenu}>
                      Browse venues
                    </MobileMenuItem>
                    <MobileMenuItem to="/bookings" end onSelect={closeMobileMenu}>
                      My bookings
                    </MobileMenuItem>
                    <MobileMenuItem to="/profile" end onSelect={closeMobileMenu}>
                      Profile
                    </MobileMenuItem>

                    {user?.venueManager && (
                      <MobileMenuItem to="/manager" end onSelect={closeMobileMenu}>
                        Manager
                      </MobileMenuItem>
                    )}

                    <div className="my-2 border-t" />

                    <button
                      type="button"
                      className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-slate-900/5"
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                    >
                      Log out
                    </button>

                    <div className="px-3 py-2 text-xs text-slate-600">
                      Signed in as <span className="font-medium text-slate-900">{user?.name}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <MobileMenuItem to="/login" end onSelect={closeMobileMenu}>
                      Login
                    </MobileMenuItem>
                    <MobileMenuItem to="/register" end onSelect={closeMobileMenu}>
                      Register
                    </MobileMenuItem>
                  </>
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
