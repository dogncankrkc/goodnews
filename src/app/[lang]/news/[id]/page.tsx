import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getNewsById } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";

function formatDate(dateStr: string, lang: Locale): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

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

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const typedLang = lang as Locale;
  const dict = await getDictionary(typedLang);
  const news = await getNewsById(id, typedLang);

  if (!news) {
    notFound();
  }

  const categoryKey = news.category as keyof typeof dict.categories;
  const categoryLabel =
    dict.categories[categoryKey] || dict.categories.general;
  const readTime = estimateReadTime(news.content);
  const authorLabel =
    typedLang === "tr"
      ? news.author
      : news.author === "Haber Merkezi"
        ? "Editorial Desk"
        : news.author;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Back button */}
      <Link
        href={`/${typedLang}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors duration-200 mb-8 group"
        id="back-to-home"
      >
        <svg
          className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        {dict.news.backToHome}
      </Link>

      {/* Header */}
      <header className="mb-10">
        {/* Category badge */}
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${getCategoryBadgeClass(
            news.category
          )}`}
        >
          {categoryLabel}
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-4">
          {news.title}
        </h1>

        {/* Meta — Author, Date, Read Time */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          {/* Author with icon */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface">
            <svg
              className="w-4 h-4 text-primary"
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
            <span className="font-medium text-foreground">{authorLabel}</span>
          </span>

          <span className="text-border">|</span>

          {/* Date */}
          <span className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            {formatDate(news.created_at, typedLang)}
          </span>

          <span className="text-border">|</span>

          {/* Read time */}
          <span>
            {readTime} {dict.news.readTime}
          </span>
        </div>
      </header>

      {/* Hero image */}
      {news.image_url ? (
        <div className="rounded-2xl overflow-hidden mb-10 relative h-64 sm:h-80">
          <Image
            src={news.image_url}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden mb-10 h-64 bg-gradient-to-br from-primary/10 via-accent/10 to-warm/10 flex items-center justify-center">
          <span className="text-7xl opacity-20 select-none">✨</span>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none text-gray-700 dark:prose-invert">
        <ReactMarkdown>{news.content}</ReactMarkdown>
      </div>

      {/* Source link */}
      {news.source_url && (
        <div className="mt-10 pt-6 border-t border-border">
          <a
            href={news.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-primary transition-colors duration-200 inline-flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
            {typedLang === "tr" ? "Kaynağa Git" : "Go to Source"}
          </a>
        </div>
      )}
    </article>
  );
}
