import type { NewsItem } from "@/lib/supabase";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import Image from "next/image";

function getCategoryBadgeClass(category: string): string {
  const classes: Record<string, string> = {
    technology: "text-purple-700 dark:text-purple-300",
    science: "text-blue-700 dark:text-blue-300",
    health: "text-emerald-700 dark:text-emerald-300",
    environment: "text-green-700 dark:text-green-300",
    education: "text-amber-700 dark:text-amber-300",
    community: "text-pink-700 dark:text-pink-300",
    culture: "text-fuchsia-700 dark:text-fuchsia-300",
    general: "text-slate-700 dark:text-slate-300",
  };
  return classes[category] || classes.general;
}


function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function NewsCard({
  news,
  dict,
  lang,
  index = 0,
}: {
  news: NewsItem;
  dict: Dictionary;
  lang: Locale;
  index?: number;
}) {
  const categoryKey = news.category as keyof typeof dict.categories;
  const categoryLabel =
    dict.categories[categoryKey] || dict.categories.general;
  const readTime = estimateReadTime(news.content);
  const authorLabel =
    lang === "tr" ? news.author : news.author === "Haber Merkezi" ? "Editorial Desk" : news.author;

  return (
    <article
      className={`card-hover bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-fade-in-up`}
      style={{ animationDelay: `${index * 100}ms` }}
      id={`news-card-${news.id}`}
    >
      {/* Image placeholder with gradient */}
      <div className="relative h-48 overflow-hidden">
        {news.image_url ? (
          <Image
            src={news.image_url}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-warm/10 flex items-center justify-center">
            <span className="text-5xl opacity-30 select-none">
              {news.category === "technology"
                ? "💡"
                : news.category === "science"
                ? "🔬"
                : news.category === "health"
                ? "💚"
                : news.category === "environment"
                ? "🌱"
                : news.category === "education"
                ? "📚"
                : news.category === "community"
                ? "🤝"
                : news.category === "culture"
                ? "🎨"
                : "✨"}
            </span>
          </div>
        )}
        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm ${getCategoryBadgeClass(
            news.category
          )}`}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground dark:text-white leading-snug mb-2 line-clamp-2 hover:text-primary transition-colors duration-200">
          <Link href={`/${lang}/news/${news.id}`}>{news.title}</Link>
        </h3>

        <p className="text-sm text-muted dark:text-gray-300 leading-relaxed line-clamp-3 mb-4">
          {news.content.substring(0, 150) + "..."}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            <span>{authorLabel}</span>
          </div>
          <span>
            {readTime} {dict.news.readTime}
          </span>
        </div>

        {/* Read more link */}
        <Link
          href={`/${lang}/news/${news.id}`}
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:text-primary-dark transition-colors duration-200 group"
          id={`read-more-${news.id}`}
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
    </article>
  );
}
