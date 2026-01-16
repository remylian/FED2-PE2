import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight">Holidaze</h1>
      <p className="mt-3 text-slate-300">Welcome to Holidaze!</p>

      <div>
        <Link className="rounded-md  px-3 py-2" to="/venues">
          Browse venues
        </Link>
        <Link className="rounded-md  px-3 py-2" to="/login">
          Login
        </Link>
        <Link className="rounded-md  px-3 py-2" to="/register">
          Register
        </Link>
      </div>
    </main>
  );
}
