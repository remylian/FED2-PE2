import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { loginUser } from "../api/auth";
import { useAuthStore } from "../auth/authStore";
import { usePageMeta } from "../hooks/usePageMeta";

const LoginFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

function fieldClass(hasError: boolean) {
  return [
    "w-full",
    "rounded-lg",
    "border",
    "bg-white",
    "px-3 py-2",
    "text-sm",
    "shadow-sm",
    "focus:outline-none",
    "focus:ring-2",
    hasError ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-emerald-500",
  ].join(" ");
}

export default function LoginPage() {
  usePageMeta({
    title: "Login | Holidaze",
    description: "Log in to your Holidaze account to manage bookings and explore vacation rentals.",
  });

  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);

    try {
      const auth = await loginUser(values);
      setSession(auth);

      toast.success(`Welcome back, ${auth.user.name}`);

      navigate(auth.user.venueManager ? "/manager" : "/profile", {
        replace: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="text-sm opacity-80">Welcome back. Enter your details to continue.</p>
        </header>

        <section className="rounded-2xl border feature-card p-6 shadow-sm space-y-4">
          {serverError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              {serverError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1 ">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={fieldClass(Boolean(errors.email))}
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={fieldClass(Boolean(errors.password))}
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button
              className="btn-primary w-full disabled:opacity-60 hover:cursor-pointer"
              type="submit"
              disabled={isSubmitting || !isValid}
              title={!isValid ? "Enter your email and password to continue" : undefined}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </section>

        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <Link className="underline" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
