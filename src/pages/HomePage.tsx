import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      {/* Hero / Welcome */}
      <section className="space-y-8">
        {/* Logo + title */}
        <div className="space-y-3">
          {/* Placeholder for large logo (replace with image later) */}
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg border text-xs font-medium text-slate-500">
            LOGO
          </div>

          <h1 className="text-4xl font-bold tracking-tight">Welcome to Holidaze</h1>

          <p className="max-w-xl text-base opacity-80">
            Holidaze helps you discover and book unique venues for your next getaway — from cozy
            cabins to city apartments.
          </p>
        </div>

        {/* Primary directions */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/venues"
            className="rounded-md border border-blue-600 bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
          >
            Browse venues
          </Link>

          <Link to="/register" className="rounded-md border px-5 py-2.5 text-sm font-medium">
            Create an account
          </Link>
        </div>
      </section>

      {/* Secondary info */}
      <section className="mt-16 grid gap-8 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">For travelers</h2>
          <p className="text-sm opacity-80">
            Browse venues, check availability, and book your stay in just a few clicks. Your
            upcoming and past bookings are always available in your profile.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">For venue managers</h2>
          <p className="text-sm opacity-80">
            Create and manage venues, update details, and keep track of bookings for your properties
            — all in one place.
          </p>
        </div>
      </section>
    </main>
  );
}
