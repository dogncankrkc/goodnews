export default function NewsCardSkeleton() {
  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Image skeleton */}
      <div className="relative h-48 overflow-hidden bg-surface animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-warm/5" />
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        {/* Category badge skeleton */}
        <div className="w-20 h-5 rounded-full bg-surface animate-pulse" />

        {/* Title skeleton — two lines */}
        <div className="space-y-2">
          <div className="h-5 w-full rounded-lg bg-surface animate-pulse" />
          <div className="h-5 w-3/4 rounded-lg bg-surface animate-pulse" />
        </div>

        {/* Content skeleton — three lines */}
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded-md bg-surface animate-pulse" />
          <div className="h-3.5 w-full rounded-md bg-surface animate-pulse" />
          <div className="h-3.5 w-2/3 rounded-md bg-surface animate-pulse" />
        </div>

        {/* Meta info skeleton */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-surface animate-pulse" />
            <div className="w-24 h-3 rounded bg-surface animate-pulse" />
          </div>
          <div className="w-16 h-3 rounded bg-surface animate-pulse" />
        </div>

        {/* Read more skeleton */}
        <div className="w-28 h-4 rounded bg-surface animate-pulse mt-2" />
      </div>
    </article>
  );
}

/**
 * Grid of skeleton cards — mirrors NewsGrid layout.
 * Use count to match the expected number of cards.
 */
export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      id="news-grid-skeleton"
    >
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Full-width slider skeleton — mirrors NewsSlider layout.
 */
export function NewsSliderSkeleton() {
  return (
    <section className="relative w-full overflow-hidden bg-foreground/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="w-48 h-7 rounded-lg bg-surface animate-pulse" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div
          className="relative rounded-3xl overflow-hidden bg-surface animate-pulse"
          style={{ aspectRatio: "16/7" }}
        >
          {/* Gradient shimmer */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-warm/5" />

          {/* Content placeholder at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 space-y-3">
            <div className="w-20 h-5 rounded-full bg-white/10 animate-pulse" />
            <div className="w-3/4 h-7 rounded-lg bg-white/10 animate-pulse" />
            <div className="w-1/2 h-5 rounded-lg bg-white/10 animate-pulse" />
            <div className="w-32 h-10 rounded-xl bg-white/10 animate-pulse mt-2" />
          </div>

          {/* Dot indicators placeholder */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full bg-white/15 animate-pulse ${
                  i === 0 ? "w-8 h-2.5" : "w-2.5 h-2.5"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
