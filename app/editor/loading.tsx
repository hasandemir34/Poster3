export default function EditorLoading() {
  return (
    <div className="flex flex-col h-[100dvh] max-w-4xl mx-auto px-4 py-2 overflow-hidden">
      {/* Toolbar */}
      <div className="flex-none flex items-center justify-between mb-2">
        <div className="h-8 w-32 bg-cream rounded-lg animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-24 bg-cream rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Grid placeholder */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="w-full max-w-[600px] aspect-square bg-cream rounded-xl animate-pulse" />
      </div>

      {/* Order button */}
      <div className="flex-none pt-2 pb-1 flex justify-center">
        <div className="h-12 w-64 bg-cream rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
