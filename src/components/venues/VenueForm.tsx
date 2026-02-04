import { useMemo, useState } from "react";
import type { CreateVenueInput, UpdateVenueInput, Venue } from "../../api/venues";

type CreateProps = {
  mode: "create";
  isSubmitting: boolean;
  onSubmit: (values: CreateVenueInput) => void;
  onCancel: () => void;
};

type EditProps = {
  mode: "edit";
  initialVenue: Venue;
  isSubmitting: boolean;
  onSubmit: (values: UpdateVenueInput) => void;
  onCancel: () => void;
};

type Props = CreateProps | EditProps;

export default function VenueForm(props: Props) {
  const initial =
    props.mode === "edit"
      ? props.initialVenue
      : ({
          name: "",
          description: "",
          price: 1000,
          maxGuests: 2,
          media: [],
          meta: {},
        } as Partial<Venue>);

  const [name, setName] = useState(initial.name ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [price, setPrice] = useState<number>(Number(initial.price ?? 1000));
  const [maxGuests, setMaxGuests] = useState<number>(Number(initial.maxGuests ?? 2));

  const firstMedia = initial.media?.[0];
  const [mediaUrl, setMediaUrl] = useState(firstMedia?.url ?? "");
  const [mediaAlt, setMediaAlt] = useState(firstMedia?.alt ?? "");

  const [wifi, setWifi] = useState(Boolean(initial.meta?.wifi));
  const [parking, setParking] = useState(Boolean(initial.meta?.parking));
  const [breakfast, setBreakfast] = useState(Boolean(initial.meta?.breakfast));
  const [pets, setPets] = useState(Boolean(initial.meta?.pets));

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!Number.isFinite(price) || price <= 0) return false;
    if (!Number.isFinite(maxGuests) || maxGuests <= 0) return false;
    return true;
  }, [name, price, maxGuests]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || props.isSubmitting) return;

    const mediaArray = mediaUrl.trim()
      ? [
          {
            url: mediaUrl.trim(),
            alt: mediaAlt.trim() ? mediaAlt.trim() : null,
          },
        ]
      : [];

    const base = {
      name: name.trim(),
      description: description.trim() ? description.trim() : undefined,
      price,
      maxGuests,
      meta: { wifi, parking, breakfast, pets },
      media: mediaArray,
    };

    if (props.mode === "create") {
      const payload: CreateVenueInput = {
        ...base,
        media: base.media.length ? base.media : undefined,
      };
      props.onSubmit(payload);
      return;
    }

    const payload: UpdateVenueInput = {
      ...base,
    };
    props.onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="rounded-md border p-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cozy cabin in the woods"
            autoComplete="off"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell customers what makes this place special…"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="price">
              Price (NOK/night)
            </label>
            <input
              id="price"
              type="number"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={1}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="maxGuests">
              Max guests
            </label>
            <input
              id="maxGuests"
              type="number"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={maxGuests}
              onChange={(e) => setMaxGuests(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>
      </section>

      <section className="rounded-md border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Media</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="mediaUrl">
            Image URL (optional)
          </label>
          <input
            id="mediaUrl"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://…"
            autoComplete="off"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="mediaAlt">
            Image alt text (optional)
          </label>
          <input
            id="mediaAlt"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={mediaAlt ?? ""}
            onChange={(e) => setMediaAlt(e.target.value)}
            placeholder="Front view of the cabin"
            autoComplete="off"
          />
        </div>
      </section>

      <section className="rounded-md border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Amenities</h2>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={wifi} onChange={(e) => setWifi(e.target.checked)} />
            WiFi
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={parking}
              onChange={(e) => setParking(e.target.checked)}
            />
            Parking
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={breakfast}
              onChange={(e) => setBreakfast(e.target.checked)}
            />
            Breakfast
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={pets} onChange={(e) => setPets(e.target.checked)} />
            Pets allowed
          </label>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm"
          onClick={props.onCancel}
          disabled={props.isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-md border px-3 py-2 text-sm"
          disabled={!canSubmit || props.isSubmitting}
          title={!canSubmit ? "Fill required fields first" : undefined}
        >
          {props.isSubmitting
            ? "Saving…"
            : props.mode === "create"
              ? "Create venue"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}
