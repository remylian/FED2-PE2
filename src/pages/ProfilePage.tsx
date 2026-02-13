import { useMemo, useState } from "react";

import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "../auth/authStore";
import { updateProfileAvatar } from "../api/profiles";
import { usePageMeta } from "../hooks/usePageMeta";

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function ProfilePage() {
  usePageMeta({
    title: "My Profile | Holidaze",
    description: "Manage your Holidaze account details, avatar, and booking preferences.",
  });

  const { user, accessToken, updateUser, activeRole, setActiveRole } = useAuthStore();

  const isManagerAccount = Boolean(user?.venueManager);

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [avatarAlt, setAvatarAlt] = useState(user?.avatarAlt ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const url = avatarUrl.trim();
    if (!url) return false;
    if (!isValidUrl(url)) return false;
    if (avatarAlt.trim().length > 120) return false;
    return true;
  }, [avatarUrl, avatarAlt]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Missing access token");
      if (!user?.name) throw new Error("Missing profile name");

      const url = avatarUrl.trim();
      const alt = avatarAlt.trim();

      return updateProfileAvatar(user.name, { url, alt: alt.length ? alt : "" }, accessToken);
    },
    onSuccess: (profile) => {
      const nextUrl = profile.avatar?.url;
      const nextAlt = profile.avatar?.alt ?? null;

      updateUser({
        ...(nextUrl ? { avatarUrl: nextUrl, avatarAlt: nextAlt } : {}),
      });

      toast.success("Avatar updated");
      setLocalError(null);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update avatar";
      toast.error(message);
      setLocalError(message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    const url = avatarUrl.trim();
    if (!url) return setLocalError("Avatar URL is required.");
    if (!isValidUrl(url)) return setLocalError("Please enter a valid URL (including https://).");
    if (avatarAlt.trim().length > 120)
      return setLocalError("Alt text must be 120 characters or less.");

    mutation.mutate();
  }

  const accountLabel = user?.venueManager ? "Venue manager" : "Customer";
  const modeLabel = isManagerAccount
    ? activeRole === "manager"
      ? "Manager mode"
      : "Customer mode"
    : "Customer mode";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
      {/* Header */}
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="opacity-80">Account details</p>
        </div>
      </header>

      {/* Profile header card */}
      {user && (
        <section className="rounded-2xl border feature-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={user.avatarUrl || "/assets/avatar-placeholder.png"}
                alt={user.avatarAlt ?? `${user.name}'s avatar`}
                className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-md border-2 border-gray-400 bg-white object-cover shadow-sm ring-1 ring-black"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/assets/avatar-placeholder.png";
                }}
              />

              <div className="min-w-0">
                <p className="text-xl font-semibold leading-tight truncate sm:text-2xl text-left">
                  {user.name}
                </p>
                <p className="mt-1 text-sm opacity-80 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border bg-gray-100 px-3 py-1 text-xs font-medium opacity-80">
                {accountLabel}
              </span>
              <span className="rounded-full border bg-gray-100 px-3 py-1 text-xs font-medium opacity-80">
                {modeLabel}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Dashboard grid */}
      <div className="grid gap-6  lg:grid-cols-3">
        {/* Account details */}
        {user && (
          <section className="rounded-2xl border gradient-orange p-6 shadow-sm lg:col-span-2">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Account</h2>
              <p className="text-sm opacity-80">Your profile details and current mode.</p>
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-gray-100 p-4">
                <dt className="text-xs opacity-70">Name</dt>
                <dd className="mt-1 font-medium break-words">{user.name}</dd>
              </div>

              <div className="rounded-xl border bg-gray-100 p-4">
                <dt className="text-xs opacity-70">Email</dt>
                <dd className="mt-1 font-medium break-words">{user.email}</dd>
              </div>

              <div className="rounded-xl border bg-gray-100 p-4">
                <dt className="text-xs opacity-70">Account</dt>
                <dd className="mt-1 font-medium">{accountLabel}</dd>
              </div>
            </dl>
          </section>
        )}

        {/* Mode switch (manager only) */}
        {isManagerAccount && (
          <section className="rounded-2xl border gradient-orange  p-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Mode</h2>
              <p className="text-sm  opacity-80">
                Switch between managing venues and booking as a customer.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm btn-primary"
                onClick={() => {
                  const next = activeRole === "manager" ? "customer" : "manager";
                  setActiveRole(next);
                  toast.success(
                    next === "manager" ? "Switched to manager mode" : "Switched to customer mode",
                  );
                }}
              >
                {activeRole === "manager" ? "Switch to customer mode" : "Switch to manager mode"}
              </button>

              <p className="text-sm opacity-80">
                {activeRole === "manager"
                  ? "Booking is disabled in manager mode."
                  : "Manager tools are disabled in customer mode."}
              </p>
            </div>
          </section>
        )}

        {/* Edit Avatar (collapsible) */}
        <section className="rounded-2xl border gradient-orange p-6 shadow-sm lg:col-span-1">
          <details className="group ">
            <summary className="cursor-pointer list-none select-none">
              <div className=" items-left justify-start gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg mb-4 font-semibold">Edit avatar</h2>
                </div>

                <span className="rounded-md border btn-secondary px-3 py-2 text-sm opacity-80 group-open:hidden">
                  Click to Edit Avatar
                </span>
                <span className="rounded-md border btn-secondary px-3 py-2 text-sm opacity-80 hidden group-open:inline">
                  Click to Close
                </span>
              </div>
            </summary>

            <div className="mt-5">
              <form onSubmit={handleSubmit} className="mt-4 w-full max-w-xl space-y-3">
                {localError && (
                  <div className="rounded-md border p-3 text-sm bg-white/50">
                    <p className="font-medium">Couldn’t update avatar</p>
                    <p className="mt-1 opacity-80">{localError}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="avatarUrl">
                    Avatar URL
                  </label>
                  <input
                    id="avatarUrl"
                    className="w-full rounded-md border px-3 py-2 text-sm bg-white/70 focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Use a public image URL. Include https:// "
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="avatarAlt">
                    Alt text (optional)
                  </label>
                  <input
                    id="avatarAlt"
                    className="w-full rounded-md border px-3 py-2 text-sm bg-white/70 focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={avatarAlt}
                    onChange={(e) => setAvatarAlt(e.target.value)}
                    placeholder="Portrait photo"
                    autoComplete="off"
                    maxLength={120}
                  />
                  <p className="text-xs opacity-70">{avatarAlt.trim().length}/120</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    className="rounded-md border px-3 py-2 text-sm btn-secondary "
                    onClick={() => {
                      setAvatarUrl(user?.avatarUrl ?? "");
                      setAvatarAlt(user?.avatarAlt ?? "");
                      setLocalError(null);
                    }}
                    disabled={mutation.isPending}
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="rounded-md border px-3 py-2 text-sm btn-primary"
                    disabled={!canSubmit || mutation.isPending}
                    title={!canSubmit ? "Enter a valid avatar URL first" : undefined}
                  >
                    {mutation.isPending ? "Saving…" : "Save avatar"}
                  </button>
                </div>
              </form>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}
