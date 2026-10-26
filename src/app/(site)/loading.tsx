import { CardSkeleton, Skeleton } from "@/components/ui/LoadingSkeleton";

export default function SiteLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading page content…</span>

      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-full max-w-xl sm:h-12" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
