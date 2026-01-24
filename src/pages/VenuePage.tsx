import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getVenueById, type Venue } from "../api/venues";

export default function VenuePage() {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Missing venue id");
      setIsLoading(false);
      return;
    }

    const venueId = id; // guaranteed string in this scope
    let alive = true;

    async function run() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getVenueById(venueId);
        if (alive) setVenue(data);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Failed to load venue");
      } finally {
        if (alive) setIsLoading(false); // no return in finally
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <Link to="/venues" className="text-sm underline">
        ← Back to venues
      </Link>

      {isLoading && <p className="text-sm opacity-80">Loading venue…</p>}

      {error && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Couldn’t load venue</p>
          <p className="mt-1 opacity-80">{error}</p>
        </div>
      )}

      {!isLoading && !error && venue && (
        <>
          <header className="space-y-1">
            <h1 className="text-2xl font-bold">{venue.name}</h1>
            <p className="text-sm opacity-80">
              Price: {venue.price} • Guests: {venue.maxGuests} • Rating: {venue.rating}
            </p>
          </header>

          {/* Cover image (only if exists) */}
          {venue.media?.[0]?.url && (
            <img
              src={venue.media[0].url}
              alt={venue.media[0].alt ?? `${venue.name} image`}
              className="h-64 w-full rounded-md border object-cover"
              loading="lazy"
            />
          )}

          {venue.description && <p className="opacity-90">{venue.description}</p>}

          {/* Core only for now — availability/calendar + booking next */}
        </>
      )}
    </main>
  );
}
