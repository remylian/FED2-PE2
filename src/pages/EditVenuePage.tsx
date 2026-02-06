import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthStore } from "../auth/authStore";
import { getVenueById, updateVenue, type Venue, type UpdateVenueInput } from "../api/venues";
import VenueForm from "../components/venues/VenueForm";

export default function EditVenuePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuthStore();

  const profileName = user?.name ?? null;

  const venueQuery = useQuery<Venue, Error>({
    queryKey: ["venue", id, { owner: true }],
    queryFn: async () => {
      if (!id) throw new Error("Missing venue id");
      return getVenueById(id, { owner: true });
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (input: UpdateVenueInput) => {
      if (!id) throw new Error("Missing venue id");
      if (!accessToken) throw new Error("Missing access token");
      return updateVenue(id, input, accessToken);
    },
    onSuccess: async (updated) => {
      if (profileName) {
        await queryClient.invalidateQueries({ queryKey: ["venues", "profile", profileName] });
      }
      await queryClient.invalidateQueries({ queryKey: ["venue", updated.id] });

      toast.success("Venue updated");
      navigate("/manager", { replace: true });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update venue");
    },
  });

  if (venueQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-sm opacity-80">Loading venue…</p>
      </main>
    );
  }

  if (venueQuery.isError) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 space-y-3">
        <p className="font-medium">Couldn’t load venue</p>
        <p className="text-sm opacity-80">{venueQuery.error.message}</p>
      </main>
    );
  }

  const venue = venueQuery.data;
  if (!venue) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 space-y-3">
        <p className="font-medium">Venue not found</p>
        <p className="text-sm opacity-80">No venue data was returned.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Edit venue</h1>
        <p className="opacity-80">Update details for “{venue.name}”.</p>
      </header>

      <VenueForm
        mode="edit"
        initialVenue={venue}
        isSubmitting={mutation.isPending}
        onCancel={() => navigate("/manager")}
        onSubmit={(values: UpdateVenueInput) => mutation.mutate(values)}
      />
    </main>
  );
}
