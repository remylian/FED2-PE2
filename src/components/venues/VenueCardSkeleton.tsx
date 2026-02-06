import Skeleton from "../ui/Skeleton";

export default function VenueCardSkeleton() {
  return (
    <li className="rounded-md border p-4 space-y-3">
      <Skeleton className="h-40 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </li>
  );
}
