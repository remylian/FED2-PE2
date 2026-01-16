import { Link } from "react-router-dom";

export default function VenuesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Venues</h1>
      <p className="mt-2 text-slate-300">Placeholder venues list page.</p>

      <p className="mt-6 text-sm text-slate-400">
        Example venue link:{" "}
        <Link className="underline" to="/venues/example-id">
          /venues/example-id
        </Link>
      </p>
    </main>
  );
}
