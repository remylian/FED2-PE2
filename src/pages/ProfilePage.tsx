import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "../auth/authStore";
import { updateProfileAvatar } from "../api/profiles";

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, accessToken, logout, updateUser, activeRole, setActiveRole } = useAuthStore();

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

  function handleLogout() {
    logout();
    toast.success("Logged out");
    navigate("/", { replace: true });
  }

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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="opacity-80">Account details</p>
        </div>

        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      <nav className="flex gap-3 text-sm">
        <Link className="underline" to="/bookings">
          My bookings
        </Link>

        {isManagerAccount && activeRole === "manager" && (
          <Link className="underline" to="/manager">
            Manager dashboard
          </Link>
        )}
      </nav>

      {user && (
        <section className="rounded-md border p-4 space-y-2">
          <div>
            <p className="text-sm opacity-70">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Account</p>
            <p className="font-medium">{user.venueManager ? "Venue manager" : "Customer"}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Mode</p>
            <p className="font-medium">
              {isManagerAccount
                ? activeRole === "manager"
                  ? "Manager mode"
                  : "Customer mode"
                : "Customer mode"}
            </p>
          </div>
        </section>
      )}

      {isManagerAccount && (
        <section className="rounded-md border p-4 space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Mode</h2>
            <p className="text-sm opacity-80">
              Switch between managing venues and booking as a customer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm"
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

      <section className="rounded-md border p-4 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Avatar</h2>
          <p className="text-sm opacity-80">
            Use a publicly accessible image URL. The API will reject unreachable URLs.
          </p>
        </div>

        {user?.avatarUrl && (
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.avatarAlt ?? `${user.name}'s avatar`}
              className="h-16 w-16 rounded-full border object-cover"
            />
            <div className="text-sm opacity-80 break-all">{user.avatarUrl}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {localError && (
            <div className="rounded-md border p-3 text-sm">
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
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="avatarAlt">
              Alt text (optional)
            </label>
            <input
              id="avatarAlt"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={avatarAlt}
              onChange={(e) => setAvatarAlt(e.target.value)}
              placeholder="Portrait photo"
              autoComplete="off"
              maxLength={120}
            />
            <p className="text-xs opacity-70">{avatarAlt.trim().length}/120</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm"
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
              className="rounded-md border px-3 py-2 text-sm"
              disabled={!canSubmit || mutation.isPending}
              title={!canSubmit ? "Enter a valid avatar URL first" : undefined}
            >
              {mutation.isPending ? "Saving…" : "Save avatar"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
