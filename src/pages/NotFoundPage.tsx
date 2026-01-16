import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-slate-300">That page doesn’t exist.</p>

      <div className="mt-6">
        <Link className="underline" to="/">
          Go home
        </Link>
      </div>
    </main>
  );
}
