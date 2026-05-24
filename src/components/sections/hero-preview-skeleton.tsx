export function HeroPreviewSkeleton() {
  return (
    <div
      className="mx-auto mt-16 max-w-6xl animate-pulse rounded-3xl border border-white/10 bg-black/30 p-8 sm:mt-20"
      aria-hidden
    >
      <div className="mb-6 h-8 w-48 rounded-full bg-white/10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-video rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}
