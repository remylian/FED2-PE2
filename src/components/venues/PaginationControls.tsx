import type { PaginationMeta } from "../../api/venues";

type Props = {
  meta: PaginationMeta | null;
  isLoading: boolean;
  onPrev: (page: number) => void;
  onNext: (page: number) => void;
};

export default function PaginationControls({ meta, isLoading, onPrev, onNext }: Props) {
  const canPrev = meta?.previousPage !== null;
  const canNext = meta?.nextPage !== null;

  if (!meta) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm disabled:opacity-60"
        disabled={!canPrev || isLoading}
        onClick={() => meta.previousPage !== null && onPrev(meta.previousPage)}
      >
        ← Prev
      </button>

      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm disabled:opacity-60"
        disabled={!canNext || isLoading}
        onClick={() => meta.nextPage !== null && onNext(meta.nextPage)}
      >
        Next →
      </button>
    </div>
  );
}
