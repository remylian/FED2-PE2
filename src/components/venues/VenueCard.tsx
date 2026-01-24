import { Link } from "react-router-dom";
import type { Venue } from "../../api/venues";

type Props = {
  venue: Venue;
};

export default function VenueCard({ venue }: Props) {
  const cover = venue.media?.[0];

  return (
    <li className="rounded-md border p-4">
      {cover?.url ? (
        <img
          src={cover.url}
          alt={cover.alt ?? `${venue.name} image`}
          className="mb-3 h-40 w-full rounded-md border object-cover"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="mb-3 h-40 w-full rounded-md border flex items-center justify-center text-sm opacity-70">
          No image
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium truncate">{venue.name}</p>
          <p className="text-sm opacity-80">
            Price: {venue.price} • Guests: {venue.maxGuests} • Rating: {venue.rating}
          </p>
        </div>

        <Link className="text-sm underline shrink-0" to={`/venues/${venue.id}`}>
          View
        </Link>
      </div>
    </li>
  );
}
