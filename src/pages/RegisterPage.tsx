import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { registerAndLogin } from "../api/auth";
import { useAuthStore } from "../auth/authStore";

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    mode: "onChange",
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
      const auth = await registerAndLogin(values);
      setSession(auth);
      toast.success("Account created");
      navigate(auth.user.venueManager ? "/manager" : "/profile", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm opacity-80">
            Use your <span className="font-medium">@stud.noroff.no</span> email.
          </p>
        </header>

        <section className="rounded-2xl border feature-card p-6 shadow-sm space-y-4">
          {serverError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              {serverError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className={fieldClass(Boolean(errors.name))}
                autoComplete="name"
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
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
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              <p className="text-xs opacity-70">Minimum 8 characters.</p>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-300 hover:shadow-md p-3 ">
              <input
                id="venueManager"
                type="checkbox"
                className="mt-1 h-4 w-4"
                {...register("venueManager")}
              />
              <div className="space-y-0.5">
                <label className="text-sm font-medium" htmlFor="venueManager">
                  I want to be a venue manager
                </label>
                <p className="text-xs opacity-70">You can switch modes later from your profile.</p>
              </div>
            </div>

            <button
              className="btn-primary w-full disabled:opacity-60 hover:cursor-pointer"
              type="submit"
              disabled={isSubmitting || !isValid}
              title={!isValid ? "Fix the highlighted fields to continue" : undefined}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </section>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link className="underline" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
