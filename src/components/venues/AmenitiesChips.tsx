import type { Venue } from "../../api/venues";

type AmenityKey = "wifi" | "parking" | "breakfast" | "pets";

const AMENITIES: Array<{ key: AmenityKey; label: string }> = [
  { key: "wifi", label: "WiFi" },
  { key: "parking", label: "Parking" },
  { key: "breakfast", label: "Breakfast" },
  { key: "pets", label: "Pets allowed" },
];

export default function AmenitiesChips({ meta }: { meta?: Venue["meta"] }) {
  if (!meta) return null;

  const enabled = AMENITIES.filter((a) => Boolean(meta[a.key]));
  if (enabled.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold opacity-80">Amenities</h2>
      <div className="flex flex-wrap gap-2">
        {enabled.map((a) => (
          <span
            key={a.key}
            className="rounded-full border bg-white/70 px-3 py-1 text-xs font-medium"
          >
            {a.label}
          </span>
        ))}
      </div>
    </section>
  );
}
