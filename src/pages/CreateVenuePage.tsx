import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthStore } from "../auth/authStore";
import { createVenue, type CreateVenueInput } from "../api/venues";
import VenueForm from "../components/venues/VenueForm";

export default function CreateVenuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuthStore();

  const profileName = user?.name ?? null;

  const mutation = useMutation({
    mutationFn: async (input: CreateVenueInput) => {
      if (!accessToken) throw new Error("Missing access token");
      return createVenue(input, accessToken);
    },
    onSuccess: async () => {
      if (profileName) {
        await queryClient.invalidateQueries({ queryKey: ["venues", "profile", profileName] });
      }
      toast.success("Venue created");
      navigate("/manager", { replace: true });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create venue");
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Create venue</h1>
        <p className="opacity-80">Add a new venue for customers to book.</p>
      </header>

      <VenueForm
        mode="create"
        isSubmitting={mutation.isPending}
        onCancel={() => navigate("/manager")}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </main>
  );
}
