import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthStore } from "../auth/authStore";
import { deleteVenue, listVenuesByProfile, type Venue } from "../api/venues";
import Skeleton from "../components/ui/Skeleton";
import { usePageMeta } from "../hooks/usePageMeta";

export default function ManagerDashboardPage() {
  usePageMeta({
    title: "Manager Dashboard | Holidaze",
    description: "Manage your venues, bookings, and listings on Holidaze.",
  });

  const queryClient = useQueryClient();
  const { user, accessToken } = useAuthStore();

  const profileName = user?.name ?? null;

  const venuesQuery = useQuery<Venue[], Error>({
    queryKey: ["venues", "profile", profileName],
    queryFn: async () => {
      if (!accessToken) throw new Error("Missing access token");
      if (!profileName) throw new Error("Missing profile name");
      return listVenuesByProfile(profileName, accessToken);
    },
    enabled: Boolean(accessToken && profileName),
    staleTime: 30_000,
  });

  const venues = venuesQuery.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (venueId: string) => {
      if (!accessToken) throw new Error("Missing access token");
      return deleteVenue(venueId, accessToken);
    },
    onSuccess: async () => {
      if (profileName) {
        await queryClient.invalidateQueries({
          queryKey: ["venues", "profile", profileName],
        });
      }
      toast.success("Venue deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete venue");
    },
  });

  function handleDelete(venue: Venue) {
    if (deleteMutation.isPending) return;

    const ok = window.confirm(`Delete venue "${venue.name}"?\n\nThis cannot be undone.`);
    if (!ok) return;

    deleteMutation.mutate(venue.id);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Manager dashboard</h1>
          <p className="opacity-80">Manage venues and view bookings</p>
        </div>
      </header>

      {user && (
        <section className="border-b p-1 space-y-1">
          <p className="text-sm">
            You are signed in as a <span className="font-medium">venue manager</span>.
          </p>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">My venues</h2>

          <Link
            to="/manager/venues/new"
            className="rounded-md border btn-primary px-3 py-2 text-sm"
          >
            Create venue
          </Link>
        </div>

        {venuesQuery.isLoading && (
          <ul
            className="grid gap-6 sm:grid-cols-2 items-stretch"
            aria-busy="true"
            aria-live="polite"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="rounded-md border p-4 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <Skeleton className="h-40 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex justify-end gap-3">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {venuesQuery.isError && (
          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Couldn’t load venues</p>
            <p className="mt-1 opacity-80">{venuesQuery.error.message}</p>
          </div>
        )}

        {!venuesQuery.isLoading && !venuesQuery.isError && (
          <>
            {venues.length === 0 ? (
              <p className="text-sm opacity-80">You haven’t created any venues yet.</p>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 items-stretch">
                {venues.map((v) => {
                  const isDeletingThis =
                    deleteMutation.isPending && deleteMutation.variables === v.id;

                  const cover = v.media?.[0];

                  return (
                    <li
                      key={v.id}
                      className="rounded-md border feature-card p-4 flex h-full flex-col gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <h2 className="text-lg text-left font-semibold truncate">{v.name}</h2>
                      </div>

                      <Link
                        to={`/venues/${v.id}`}
                        className="block h-40 w-full overflow-hidden rounded-md border bg-slate-100"
                        title="View venue"
                      >
                        {cover?.url ? (
                          <img
                            src={cover.url}
                            alt={cover.alt ?? `${v.name} image`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-sm opacity-60">No image</span>
                          </div>
                        )}
                      </Link>

                      <div className="text-sm text-left opacity-80 space-y-1">
                        <div>
                          <span className="opacity-70">Price:</span>{" "}
                          <span className="font-medium">{v.price} NOK / night</span>
                        </div>
                        <div>
                          <span className="opacity-70">Max guests:</span>{" "}
                          <span className="font-medium">{v.maxGuests}</span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-end gap-2 pt-1">
                        <Link
                          to={`/manager/venues/${v.id}/edit`}
                          className="btn-secondary px-2 py-1 bg-orange-200 rounded shadow-md hover:bg-orange-300"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="btn-secondary px-2 py-1 bg-orange-200 rounded shadow-md hover:bg-orange-300"
                          onClick={() => handleDelete(v)}
                          disabled={deleteMutation.isPending}
                        >
                          {isDeletingThis ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}
