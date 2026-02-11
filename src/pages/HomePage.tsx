import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-10xl px-6 py-10 space-y-10">
      {/* HERO CONTAINER */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <section className="relative bg-[url('/assets/hero-banner.png')] bg-cover bg-center">
          {/* Warm overlay + readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-white/70" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />

          {/* Centered content */}
          <div className="relative flex min-h-[420px] items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl text-center">
              <img src="/assets/logo.png" alt="Holidaze Logo" />

              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Discover your perfect getaway
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-800/80">
                Welcome to Holidaze! Find the ideal vacation spot from a curated selection of unique
                rentals. Whether you want a cozy cabin, a beachfront villa, or a chic city apartment
                — we’ve got you covered.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FEATURE STRIP CONTAINER */}
      <div className="rounded-3xl  py-10 ">
        <div className="grid gap-10 sm:grid-cols-3">
          {/* Browse */}
          <div className="rounded-2xl  feature-card shadow-md">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-white text-sm">
              🌴
            </div>

            <h2 className="text-base font-semibold">Explore unique places to stay</h2>

            <div className="mt-5">
              <Link to="/venues" className="btn-primary">
                Browse venues
              </Link>
            </div>
          </div>

          {/* Login */}
          <div className="rounded-2xl feature-card shadow-md p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-white text-sm">
              🔐
            </div>

            <h2 className="text-base font-semibold">Manage your profile and bookings.</h2>

            <div className="mt-5">
              <Link
                to="/login"
                className="inline-flex rounded-full btn-primary text-sm font-semibold"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Register */}
          <div className="rounded-2xl feature-card shadow-md p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-white text-sm">
              ✨
            </div>

            <h2 className="text-base font-semibold">Create an account to start booking</h2>

            <div className="mt-5">
              <Link to="/register" className="inline-flex rounded-full  btn-primary font-semibold">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
