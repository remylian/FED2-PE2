import type { PaginationMeta } from "../../api/venues";

type Props = {
  meta: PaginationMeta | null;
  isLoading: boolean;
  onPrev: (page: number) => void;
  onNext: (page: number) => void;
};

export default function PaginationControls({ meta, isLoading, onPrev, onNext }: Props) {
  if (!meta) return null;

  const canPrev = meta.previousPage !== null;
  const canNext = meta.nextPage !== null;

  return (
    <div className="flex items-center justify-center gap-6 pt-6">
      {/* Previous */}
      <button
        type="button"
        disabled={!canPrev || isLoading}
        onClick={() => meta.previousPage !== null && onPrev(meta.previousPage)}
        className="
          rounded-full border px-4 py-2 text-sm transition
          hover:bg-slate-900/5
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        ←
      </button>

      {/* Page indicator */}
      <div className="text-sm font-medium min-w-[120px] text-center">
        Page {meta.currentPage} of {meta.pageCount}
      </div>

      {/* Next */}
      <button
        type="button"
        disabled={!canNext || isLoading}
        onClick={() => meta.nextPage !== null && onNext(meta.nextPage)}
        className="
          rounded-full border px-4 py-2 text-sm transition
          hover:bg-slate-900/5
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        →
      </button>
    </div>
  );
}
