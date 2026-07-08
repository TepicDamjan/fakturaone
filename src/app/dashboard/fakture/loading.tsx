export default function FaktureLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4 sm:p-6">
      <div className="h-8 w-56 rounded-lg bg-gray-100" />
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="h-10 rounded-lg bg-gray-50" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-50/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
