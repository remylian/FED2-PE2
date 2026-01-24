type SortKey = "created" | "updated" | "price" | "rating" | "maxGuests" | "name";
type SortOrder = "asc" | "desc";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;

  sort: SortKey;
  onSortChange: (value: SortKey) => void;

  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
};

export default function VenuesToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  sortOrder,
  onSortOrderChange,
}: Props) {
  const orderLabelAsc = sort === "name" ? "A → Z" : "Asc";
  const orderLabelDesc = sort === "name" ? "Z → A" : "Desc";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="max-w-md">
        <label className="sr-only" htmlFor="search">
          Search venues
        </label>
        <input
          id="search"
          className="w-full rounded-md border px-3 py-2"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by name or description…"
        />
      </div>

      <div className="flex gap-2 sm:justify-end">
        <label className="sr-only" htmlFor="sort">
          Sort
        </label>
        <select
          id="sort"
          className="rounded-md border px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          <option value="created">Newest</option>
          <option value="updated">Recently updated</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="maxGuests">Max guests</option>
          <option value="name">Name</option>
        </select>

        <label className="sr-only" htmlFor="order">
          Sort order
        </label>
        <select
          id="order"
          className="rounded-md border px-3 py-2 text-sm"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
        >
          <option value="desc">{orderLabelDesc}</option>
          <option value="asc">{orderLabelAsc}</option>
        </select>
      </div>
    </div>
  );
}

export type { SortKey, SortOrder };
