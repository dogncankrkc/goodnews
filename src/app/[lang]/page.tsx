import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getNewsByLanguage } from "@/lib/supabase";
import Hero from "@/components/Hero";
import NewsSlider from "@/components/NewsSlider";
import NewsGrid from "@/components/NewsGrid";
import Link from "next/link";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category;

  if (!hasLocale(lang)) {
    notFound();
  }

  const typedLang = lang as Locale;
  const dict = await getDictionary(typedLang);
  const allNews = await getNewsByLanguage(typedLang, 30, category);

  // Görseli olmayan haberleri client tarafında da sağlama al
  const allNewsWithImages = allNews.filter((item) => item.image_url);

  const breakingNews = allNewsWithImages.filter((n) => n.is_breaking);
  const regularNews = allNewsWithImages.filter((n) => !n.is_breaking);

  // İlk 5 haberi slider'a, kalanı grid'e ayır
  const sliderNews = regularNews.slice(0, 5);
  const gridNews = regularNews.slice(5);

  return (
    <>
      <Hero dict={dict} />

      {/* News Slider — en güncel 5 haber */}
      {sliderNews.length > 0 && !category && (
        <NewsSlider news={sliderNews} lang={typedLang} dict={dict} />
      )}

      {/* Breaking News Banner (Son Güzellikler) */}
      {breakingNews.length > 0 && !category && (
        <section className="bg-gradient-to-r dark:!bg-none dark:border-none from-yellow-100 to-green-100 border-y border-yellow-200 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-400 mb-6 flex items-center gap-2">
              {/* @ts-ignore - dynamic dict lookup */}
              {dict.news.breakingNewsBanner || "✨ Breaking Good News"}
            </h2>
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x no-scrollbar">
              {breakingNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/${lang}/news/${news.id}`}
                  className="snap-start shrink-0 w-80 sm:w-96 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/80 dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow border border-white/50 dark:border-slate-700/50"
                >
                  <span className="inline-block px-2.5 py-1 bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 text-xs font-semibold rounded-full mb-3">
                    {/* @ts-ignore - dynamic dict lookup */}
                    {dict.categories[news.category as keyof typeof dict.categories] || news.category}
                  </span>
                  <h3 className="font-bold text-foreground dark:text-slate-100 mb-2 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-muted dark:text-slate-300 line-clamp-2">
                    {news.content}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
        id="news"
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {category
              ? dict.categories[category as keyof typeof dict.categories]
              : dict.news.sectionTitle}
          </h2>
          <p className="text-muted text-base">{dict.news.sectionSubtitle}</p>
          <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>

        <NewsGrid news={category ? regularNews : gridNews} dict={dict} lang={typedLang} />
      </section>
    </>
  );
}
