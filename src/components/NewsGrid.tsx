"use client";

import { useState, useEffect, useRef } from "react";
import type { NewsItem } from "@/lib/supabase";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/dictionaries";
import NewsCard from "./NewsCard";
import NewsCardSkeleton from "./NewsCardSkeleton";
import { fetchMoreNewsAction } from "@/app/actions";

const LIMIT = 12;

export default function NewsGrid({
  news: initialNews,
  dict,
  lang,
  category,
}: {
  news: NewsItem[];
  dict: Dictionary;
  lang: Locale;
  category?: string;
}) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [offset, setOffset] = useState(initialNews.length);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialNews.length >= LIMIT);

  const prevCategoryRef = useRef(category);
  const prevLangRef = useRef(lang);

  useEffect(() => {
    // Sadece kategori veya dil gerçekten değiştiyse state'i sıfırla.
    // Bu sayede Server Action yüzünden değişen initialNews referansı yüzünden haberler kaybolmaz.
    if (prevCategoryRef.current !== category || prevLangRef.current !== lang) {
      setNews(initialNews);
      setOffset(initialNews.length);
      setHasMore(initialNews.length >= LIMIT);
      prevCategoryRef.current = category;
      prevLangRef.current = lang;
    }
  }, [initialNews, category, lang]);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const moreNews = await fetchMoreNewsAction(lang, LIMIT, offset, category);
      
      if (!moreNews || moreNews.length === 0) {
        setHasMore(false);
      } else {
        // Mükerrer kayıtları engelle (Deduplication)
        const uniqueMoreNews = moreNews.filter(
          (newItem) => !news.some((prevItem) => prevItem.id === newItem.id)
        );

        setNews((prev) => [...prev, ...uniqueMoreNews]);
        setOffset((prev) => prev + moreNews.length);
        
        if (moreNews.length < LIMIT) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more news:", error);
    } finally {
      setIsLoading(false);
    }
  };
  if (news.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🌤️</div>
        <p className="text-lg text-muted dark:text-gray-300 max-w-md mx-auto">{dict.news.noNews}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full"
        id="news-grid"
      >
        {news.map((item, index) => (
          <NewsCard
            key={`${item.id}-${index}`}
            news={item}
            dict={dict}
            lang={lang}
            index={index}
          />
        ))}
        {isLoading && (
          <>
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </>
        )}
      </div>

      <div className="mt-16 w-full flex justify-center">
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoading}
            className={`
              px-8 py-3 rounded-full font-semibold transition-all duration-300
              border-2 border-primary text-primary hover:bg-primary hover:text-white
              dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-slate-900
              ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:-translate-y-1 active:scale-95"}
            `}
          >
            {isLoading ? dict.grid.loading : dict.grid.loadMore}
          </button>
        )}
      </div>
    </div>
  );
}
