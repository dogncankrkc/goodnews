import type { NewsItem } from "@/lib/supabase";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/dictionaries";
import NewsCard from "./NewsCard";

export default function NewsGrid({
  news,
  dict,
  lang,
}: {
  news: NewsItem[];
  dict: Dictionary;
  lang: Locale;
}) {
  if (news.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🌤️</div>
        <p className="text-lg text-muted dark:text-gray-300 max-w-md mx-auto">{dict.news.noNews}</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      id="news-grid"
    >
      {news.map((item, index) => (
        <NewsCard
          key={item.id}
          news={item}
          dict={dict}
          lang={lang}
          index={index}
        />
      ))}
    </div>
  );
}
