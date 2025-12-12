import { cn } from "@/lib/utils"

// Base skeleton with shimmer animation
export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

// Skeleton for product cards
export function SkeletonProductCard() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="aspect-square w-full rounded-none" />
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        <Skeleton className="h-3 w-16" />
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-8" />
        </div>
        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        {/* Button */}
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

// Skeleton for product grid
export function SkeletonProductGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  )
}

// Skeleton for list items
export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

// Skeleton for table rows
export function SkeletonTableRow({ columns = 5 }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  )
}

// Skeleton for table
export function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Skeleton for text block
export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  )
}

// Skeleton for order card
export function SkeletonOrderCard() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-12 rounded-lg" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  )
}

// Skeleton for stats card
export function SkeletonStatsCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

