import { useParams } from "react-router-dom";

export default function VenuePage() {
  const { id } = useParams();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Venue</h1>
      <p className="mt-2 text-slate-300">Placeholder venue detail page.</p>

      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-sm text-slate-300">
          Route param <code className="rounded bg-slate-800 px-1">id</code>:{" "}
          <span className="font-mono">{id ?? "(missing)"}</span>
        </p>
      </div>
    </main>
  );
}
