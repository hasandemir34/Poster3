export default function OrdersLoading() {
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
        <div className="h-7 w-44 bg-cream rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between mb-6">
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 bg-cream rounded animate-pulse" />
                    <div className="h-4 w-32 bg-cream rounded animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-cream rounded animate-pulse" />
                    <div className="h-4 w-20 bg-cream rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-28 bg-cream rounded-full animate-pulse" />
                </div>
                <div className="border-t border-gray-50 pt-4">
                  <div className="h-4 w-36 bg-cream rounded animate-pulse" />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-between">
                <div className="h-3 w-28 bg-cream rounded animate-pulse" />
                <div className="h-3 w-20 bg-cream rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
