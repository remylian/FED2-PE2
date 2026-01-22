import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginUser } from "../api/auth";
import { useAuthStore } from "../auth/authStore";

/**
 * UI-level validation schema.
 * Mirrors the input rules in src/api/auth.ts for better UX.
 */
const LoginFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
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

      navigate(auth.user.venueManager ? "/manager" : "/profile", {
        replace: true,
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="mt-2 text-sm opacity-80">Welcome back. Enter your details to continue.</p>

      {serverError && <div className="mt-4 rounded-md border p-3 text-sm">{serverError}</div>}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="w-full rounded-md border px-3 py-2"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && <p className="text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-md border px-3 py-2"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && <p className="text-sm">{errors.password.message}</p>}
        </div>

        <button
          className="w-full rounded-md border px-3 py-2 disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        Don’t have an account?{" "}
        <Link className="underline" to="/register">
          Create one
        </Link>
      </p>
    </main>
  );
}
