import { Skeleton } from "@/components/ui/skeleton"

export default function TrainingLoading() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-80 rounded-lg" />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Table skeleton */}
      <Skeleton className="h-64 rounded-lg" />

      {/* Chart skeleton */}
      <Skeleton className="h-72 rounded-lg" />
    </div>
  )
}
