export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4 sm:p-6">
      <div className="h-8 w-64 rounded-lg bg-gray-100" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-gray-100 bg-gray-50" />
        ))}
      </div>
      <div className="h-80 rounded-xl border border-gray-100 bg-gray-50" />
    </div>
  );
}
