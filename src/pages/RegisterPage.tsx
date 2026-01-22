import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerAndLogin } from "../api/auth";
import { useAuthStore } from "../auth/authStore";

/**
 * UI-level validation schema.
 *
 * This mirrors the validation rules in src/api/auth.ts.
 * UI validation improves UX; API validation remains the source of truth.
 */
const RegisterFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .email("Enter a valid email")
    .endsWith("@stud.noroff.no", "Must be a @stud.noroff.no email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  venueManager: z.boolean(),
});

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      venueManager: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    try {
      // Register does NOT return a token in the Noroff API.
      // We register, then immediately log in to get accessToken + user session.
      const auth = await registerAndLogin(values);

      // Store session globally (Zustand) + persist via authStore/authStorage
      setSession(auth);

      // Redirect based on role
      navigate(auth.user.venueManager ? "/manager" : "/profile", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Registration failed");
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm opacity-80">
        Use your <span className="font-medium">@stud.noroff.no</span> email.
      </p>

      {serverError && <div className="mt-4 rounded-md border p-3 text-sm">{serverError}</div>}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="w-full rounded-md border px-3 py-2"
            autoComplete="name"
            {...register("name")}
          />
          {errors.name && <p className="text-sm">{errors.name.message}</p>}
        </div>

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
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && <p className="text-sm">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="venueManager"
            type="checkbox"
            className="h-4 w-4"
            {...register("venueManager")}
          />
          <label className="text-sm" htmlFor="venueManager">
            I want to be a venue manager
          </label>
        </div>

        <button
          className="w-full rounded-md border px-3 py-2 disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        Already have an account?{" "}
        <Link className="underline" to="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}
