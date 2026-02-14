import type { Venue } from "../../api/venues";

export default function VenueHero({ venue }: { venue: Venue }) {
  const cover = venue.media?.[0];

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

      {cover?.url && (
        <img
          src={cover.url}
          alt={cover.alt ?? `${venue.name} image`}
          className="h-96 w-full rounded-md border object-cover"
          loading="lazy"
        />
      )}

      <p className="text-sm opacity-80">
        Price: {venue.price} • Guests: {venue.maxGuests} • Rating: {venue.rating}
      </p>

      {venue.description && <p className="opacity-90">{venue.description}</p>}
    </>
  );
}
