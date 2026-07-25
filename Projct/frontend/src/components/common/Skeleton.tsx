/** Renders animated placeholder shapes for loading states. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${70 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-6 bg-gray-100 rounded mb-2" style={{ width: `${95 - i * 3}%` }} />
      ))}
    </div>
  );
}
