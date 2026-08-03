export default function LoadingArticles() {
  return (
    <div className="container py-20">
      <div className="h-12 w-full max-w-md bg-section rounded-full animate-pulse mb-10" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-navy/10">
            <div className="aspect-[16/10] bg-section animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-5 w-3/4 bg-section rounded animate-pulse" />
              <div className="h-4 w-full bg-section rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-section rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
