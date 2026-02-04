import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { deleteVenue, listVenuesByProfile, type Venue } from "../api/venues";

export default function ManagerDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, accessToken, logout } = useAuthStore();

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
        await queryClient.invalidateQueries({ queryKey: ["venues", "profile", profileName] });
      }
    },
  });

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

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

        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      {user && (
        <section className="rounded-md border p-4 space-y-1">
          <p className="text-sm">
            You are signed in as a <span className="font-medium">venue manager</span>.
          </p>
          <p className="text-sm opacity-80">
            Signed in as <span className="font-medium">{user.name}</span>
          </p>
        </section>
      )}

      {deleteMutation.isError && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Couldn’t delete venue</p>
          <p className="mt-1 opacity-80">{(deleteMutation.error as Error).message}</p>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">My venues</h2>

          <Link to="/manager/venues/new" className="rounded-md border px-3 py-2 text-sm">
            Create venue
          </Link>
        </div>

        {venuesQuery.isLoading && <p className="text-sm opacity-80">Loading venues…</p>}

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
              <ul className="space-y-3">
                {venues.map((v) => {
                  const isDeletingThis =
                    deleteMutation.isPending && deleteMutation.variables === v.id;

                  return (
                    <li key={v.id} className="rounded-md border p-4 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{v.name}</p>
                          <p className="text-sm opacity-80">
                            {v.price} NOK/night • max {v.maxGuests} guests
                          </p>
                        </div>

                        <div className="flex gap-3 text-sm">
                          <Link to={`/venues/${v.id}`} className="underline">
                            View
                          </Link>
                          <Link to={`/manager/venues/${v.id}/edit`} className="underline">
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="underline"
                            onClick={() => handleDelete(v)}
                            disabled={deleteMutation.isPending}
                            title={deleteMutation.isPending ? "Please wait…" : "Delete venue"}
                          >
                            {isDeletingThis ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </div>

                      {v.media?.[0]?.url && (
                        <img
                          src={v.media[0].url}
                          alt={v.media[0].alt ?? `${v.name} image`}
                          className="h-40 w-full rounded-md border object-cover"
                          loading="lazy"
                        />
                      )}
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
