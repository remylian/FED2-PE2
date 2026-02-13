import { Link } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { usePageMeta } from "../hooks/usePageMeta";

export default function HomePage() {
  usePageMeta({
    title: "Holidaze | Discover Unique Vacation Rentals",
    description:
      "Discover curated vacation rentals on Holidaze. Browse cozy cabins, beachfront villas, and stylish city apartments for your perfect getaway.",
  });

  const { isAuthenticated } = useAuthStore();

  return (
    <main className="mx-auto max-w-10xl px-6 py-10 space-y-10">
      {/* HERO CONTAINER */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <section className="relative bg-[url('/assets/hero-banner.webp')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-white/70" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />

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

      {/* FEATURE STRIP */}
      <div className="rounded-3xl py-10">
        <div
          className={[
            "grid gap-10 items-stretch",
            isAuthenticated ? "place-items-center" : "sm:grid-cols-3",
          ].join(" ")}
        >
          {/* Browse */}
          <div className={isAuthenticated ? "w-full max-w-sm" : ""}>
            <div className="rounded-2xl feature-card shadow-md p-6 text-center flex h-full flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto mb-1 flex  items-center justify-center h-36 w-36  rounded-full text-sm">
                <img src="/assets/browse-icon.png" alt="browse venues icon" />
              </div>

              <h2 className="text-base font-semibold">Explore unique places to stay</h2>

              <div className="mt-auto pt-2">
                <Link to="/venues" className="btn-primary">
                  Browse venues
                </Link>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <>
              {/* Login */}
              <div className="rounded-2xl feature-card shadow-md p-6 text-center flex h-full flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="mx-auto mb-1 flex  items-center justify-center h-36 w-36  rounded-full text-sm">
                  <img src="/assets/login-icon.png" alt="login icon" />
                </div>

                <h2 className="text-base font-semibold">Manage your profile and bookings.</h2>

                <div className="mt-auto pt-2">
                  <Link
                    to="/login"
                    className="inline-flex rounded-full btn-primary text-sm font-semibold"
                  >
                    Login
                  </Link>
                </div>
              </div>

              {/* Register */}
              <div className="rounded-2xl feature-card shadow-md p-6 text-center flex h-full flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="mx-auto mb-1 flex  items-center justify-center h-36 w-36  rounded-full text-sm">
                  <img src="/assets/register-icon.png" alt="register icon" />
                </div>

                <h2 className="text-base font-semibold">Create an account to start booking</h2>

                <div className="mt-auto pt-2">
                  <Link
                    to="/register"
                    className="inline-flex rounded-full btn-primary font-semibold"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
