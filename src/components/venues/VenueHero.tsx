import type { Venue } from "../../api/venues";

export default function VenueHero({ venue }: { venue: Venue }) {
  const cover = venue.media?.[0];
  const coverUrl = cover?.url?.trim() || "";
  const fallbackAlt = `${venue.name} – venue image`;

  return (
    <>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{venue.name}</h1>

        {venue.owner?.name && (
          <p className="text-sm opacity-70">
            Hosted by <span className="font-medium">{venue.owner.name}</span>
          </p>
        )}
      </header>

      {coverUrl ? (
        <img
          src={coverUrl}
          alt={cover?.alt?.trim() || fallbackAlt}
          className="h-96 w-full rounded-md border object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-96 w-full rounded-md border flex items-center justify-center bg-gray-100 text-sm opacity-60">
          No image available
        </div>
      )}

      <div className="text-sm opacity-80">
        <p>Price: ${venue.price}/Night</p>
        <p>Max guests: {venue.maxGuests}</p>
        <p>Rating: {venue.rating}</p>
      </div>

      {venue.description && <p className="opacity-90">{venue.description}</p>}
    </>
  );
}
