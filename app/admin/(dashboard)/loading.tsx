export default function AdminLoading() {
  return (
    <div role="status" aria-label="جارٍ التحميل" className="space-y-6">
      <div className="h-10 w-56 rounded-xl bg-navy/10 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-paper animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-paper animate-pulse" />
    </div>
  );
}
