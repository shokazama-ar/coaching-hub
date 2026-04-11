export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-gray-200" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-white shadow-sm" />
      ))}
    </div>
  );
}
