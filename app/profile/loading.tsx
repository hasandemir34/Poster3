export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-off-white pb-20">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="h-4 w-28 bg-cream rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-cream rounded-lg animate-pulse" />
            <div className="h-8 w-24 bg-cream rounded-lg animate-pulse" />
            <div className="h-8 w-8 bg-cream rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 mt-10">
        <div className="bg-white rounded-2xl shadow-card p-6 flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-full bg-cream animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 bg-cream rounded animate-pulse" />
            <div className="h-3.5 w-52 bg-cream rounded animate-pulse" />
            <div className="h-3 w-32 bg-cream rounded animate-pulse" />
          </div>
        </div>

        <div className="h-5 w-36 bg-cream rounded animate-pulse mb-6" />
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-24 bg-cream rounded animate-pulse" />
              <div className="h-10 w-full bg-cream rounded-lg animate-pulse" />
            </div>
          ))}
          <div className="h-10 w-28 bg-cream rounded-lg animate-pulse mt-2" />
        </div>
      </div>
    </main>
  );
}
