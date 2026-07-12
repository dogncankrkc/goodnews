"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NewsItem } from "@/lib/supabase";

function getCategoryBadgeClass(category: string): string {
  const classes: Record<string, string> = {
    technology: "badge-technology",
    science: "badge-science",
    health: "badge-health",
    environment: "badge-environment",
    education: "badge-education",
    community: "badge-community",
    culture: "badge-culture",
    general: "badge-general",
  };
  return classes[category] || classes.general;
}

interface NewsSliderProps {
  news: NewsItem[];
  lang: string;
  dict: {
    news: {
      sliderTitle: string;
      readMore: string;
      readTime: string;
      previous: string;
      next: string;
    };
    categories: Record<string, string>;
  };
}

export default function NewsSlider({ news, lang, dict }: NewsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const slideTo = useCallback(
    (newIndex: number, dir: "left" | "right") => {
      if (isAnimating || news.length === 0) return;
      setIsAnimating(true);
      setDirection(dir);
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setIsAnimating(false);
      }, 500);
    },
    [isAnimating, news.length]
  );

  const goNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % news.length;
    slideTo(nextIndex, "right");
  }, [currentIndex, news.length, slideTo]);

  const goPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + news.length) % news.length;
    slideTo(prevIndex, "left");
  }, [currentIndex, news.length, slideTo]);

  // Auto-play: her 5 saniyede bir sonraki slide'a geç
  useEffect(() => {
    if (isPaused || news.length <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext, isPaused, news.length]);

  // Touch/swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  if (news.length === 0) return null;

  const currentNews = news[currentIndex];
  const categoryKey = currentNews.category as keyof typeof dict.categories;
  const categoryLabel = dict.categories[categoryKey] || dict.categories.general;

  const animationClass = isAnimating
    ? direction === "right"
      ? "animate-slide-out-left"
      : "animate-slide-out-right"
    : direction === "right"
    ? "animate-slide-in-right"
    : "animate-slide-in-left";

  return (
    <section
      className="relative w-full overflow-hidden bg-foreground/5"
      id="news-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider title */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {dict.news.sliderTitle}
        </h2>
      </div>

      {/* Main slider area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: "16/7" }}>
          {/* Background image */}
          <div className={`absolute inset-0 ${animationClass}`}>
            {currentNews.image_url ? (
              <Image
                src={currentNews.image_url}
                alt={currentNews.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1152px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-warm/20" />
            )}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 slider-gradient" />

          {/* Content */}
          <div className={`absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10 ${animationClass}`}>
            {/* Category badge */}
            <span
              className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-sm ${getCategoryBadgeClass(
                currentNews.category
              )}`}
            >
              {categoryLabel}
            </span>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug mb-2 line-clamp-2 drop-shadow-md">
              <Link href={`/${lang}/news/${currentNews.id}`} className="hover:underline decoration-2 underline-offset-4">
                {currentNews.title}
              </Link>
            </h3>

            {/* Excerpt */}
            <p className="text-sm sm:text-base text-white/80 leading-relaxed line-clamp-2 max-w-2xl mb-4 drop-shadow-sm">
              {currentNews.content.substring(0, 180)}...
            </p>

            {/* Read more */}
            <Link
              href={`/${lang}/news/${currentNews.id}`}
              className="inline-flex items-center gap-2 self-start px-5 py-2.5 bg-white/15 backdrop-blur-md text-white text-sm font-semibold rounded-xl border border-white/20 hover:bg-white/25 transition-all duration-300 group"
            >
              {dict.news.readMore}
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          {/* Navigation arrows */}
          {news.length > 1 && (
            <>
              <button
                onClick={goPrev}
                disabled={isAnimating}
                aria-label={dict.news.previous}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-black/50 transition-all duration-200 disabled:opacity-30 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={goNext}
                disabled={isAnimating}
                aria-label={dict.news.next}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-black/50 transition-all duration-200 disabled:opacity-30 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Dot indicators */}
          {news.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {news.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (index === currentIndex) return;
                    slideTo(index, index > currentIndex ? "right" : "left");
                  }}
                  aria-label={`Slide ${index + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentIndex
                      ? "w-8 h-2.5 bg-white"
                      : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
