import { Link } from "react-router-dom";
import type { Venue } from "../../api/venues";

type Props = {
  venue: Venue;
};

export default function VenueCard({ venue }: Props) {
  const cover = venue.media?.[0];
  const coverUrl = cover?.url?.trim() || "";
  const coverAlt = cover?.alt?.trim() || `${venue.name} – venue image`;

  return (
    <li>
      <Link
        to={`/venues/${venue.id}`}
        className="
          group block overflow-hidden rounded-xl border border-gray-300
          gradient-orange text-left shadow-sm transition-all duration-200
          hover:-translate-y-1 hover:shadow-xl
        "
      >
        {/* Title */}
        <div className="px-4 pt-4 text-center">
          <h3 className="font-semibold text-base text-left truncate">{venue.name}</h3>
        </div>

        {/* Image wrapper (fixed height ALWAYS) */}
        <div className="relative px-4 pt-3">
          <div className="h-60 w-full overflow-hidden rounded-md border bg-slate-100 flex items-center justify-center">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={coverAlt}
                className="
                  h-full w-full object-cover
                  transition-transform duration-300
                  group-hover:scale-105
                "
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-sm opacity-60">No image</span>
            )}
          </div>

          {/* Price badge */}
          <span
            className="
            absolute top-5 right-6
            bg-emerald-100 backdrop-blur-sm
            text-sm font-semibold
            px-3 py-1 
            border shadow-sm
          "
          >
            ${venue.price}
          </span>
        </div>

        {/* Owner */}
        {venue.owner?.name && (
          <div className="px-4 pt-3 text-sm opacity-70">
            Hosted by <span className="font-medium">{venue.owner.name}</span>
          </div>
        )}

        {/* Meta info */}
        <div className="px-4 py-4 text-sm flex justify-between opacity-80">
          <p>Max Guests: {venue.maxGuests}</p>
          <p>Rating: {venue.rating}</p>
        </div>
      </Link>
    </li>
  );
}
