import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";

export default function NotFoundPage() {
  usePageMeta({
    title: "Page Not Found | Holidaze",
    description: "The page you are looking for does not exist on Holidaze.",
  });

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
