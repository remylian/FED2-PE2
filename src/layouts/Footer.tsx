import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className=" bg-gradient-to-t from-orange-200/60 via-orange-100 to-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-600">© {year} Holidaze. All rights reserved.</p>

        <nav className="flex gap-4 text-xs">
          <Link className="opacity-80 hover:opacity-100" to="/venues">
            Venues
          </Link>
          <Link className="opacity-80 hover:opacity-100" to="/login">
            Login
          </Link>
          <Link className="opacity-80 hover:opacity-100" to="/register">
            Register
          </Link>
        </nav>
      </div>
    </footer>
  );
}
