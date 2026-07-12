import { NewsGridSkeleton, NewsSliderSkeleton } from "@/components/NewsCardSkeleton";

/**
 * Next.js App Router loading UI —
 * Automatically shown while page.tsx's async data fetching is in progress.
 * Uses skeleton components that mirror the actual page layout.
 */
export default function Loading() {
  return (
    <>
      {/* Hero skeleton — mirrors Hero component structure */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Badge skeleton */}
            <div className="flex justify-center">
              <div className="w-52 h-9 rounded-full bg-white/40 animate-pulse" />
            </div>
            {/* Title skeleton */}
            <div className="space-y-3">
              <div className="w-64 h-12 rounded-xl bg-white/30 animate-pulse mx-auto" />
              <div className="w-80 h-12 rounded-xl bg-primary/10 animate-pulse mx-auto" />
            </div>
            {/* Subtitle skeleton */}
            <div className="space-y-2 max-w-2xl mx-auto">
              <div className="w-full h-5 rounded-lg bg-white/20 animate-pulse" />
              <div className="w-3/4 h-5 rounded-lg bg-white/20 animate-pulse mx-auto" />
            </div>
            {/* CTA skeleton */}
            <div className="flex justify-center pt-2">
              <div className="w-44 h-14 rounded-2xl bg-primary/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
              fill="var(--color-background)"
            />
          </svg>
        </div>
      </section>

      {/* Slider skeleton */}
      <NewsSliderSkeleton />

      {/* Grid section skeleton */}
      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
        id="news"
      >
        {/* Section header skeleton */}
        <div className="text-center mb-12">
          <div className="w-48 h-8 rounded-lg bg-surface animate-pulse mx-auto mb-3" />
          <div className="w-72 h-5 rounded-lg bg-surface animate-pulse mx-auto" />
          <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>

        <NewsGridSkeleton count={6} />
      </section>
    </>
  );
}
