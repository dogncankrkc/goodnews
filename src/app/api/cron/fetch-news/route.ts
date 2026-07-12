import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { analyzeAndRewriteNews } from "@/lib/gemini";
import { fetchAllRSSFeeds } from "@/lib/rss";

/**
 * Cron job endpoint for news fetching and processing.
 * Triggered by Vercel Cron every 6 hours.
 *
 * Flow:
 * 1. Fetch RSS feeds from all sources (TR + EN)
 * 2. Filter: skip items without image or older than 24h
 * 3. Send each article to Gemini Flash for analysis
 * 4. Gemini filters negative news, rewrites positive ones in BOTH languages
 * 5. Save single row per article with tr_* and en_* fields to Supabase
 * 6. Retention Policy: Delete records older than 7 days
 */
export async function GET(request: Request) {
  // Verify cron secret for security
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // 2. Header'dan Bearer token'ı al (Vercel Cron için)
  const authHeader = request.headers.get("authorization");
  const isAuthorized =
    key === process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    process.env.NODE_ENV === 'development';

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();
  const results = {
    processed: 0,
    saved: 0,
    filtered: 0,
    errors: 0,
    skipped_no_image: 0,
    skipped_old: 0,
  };

  try {
    const rssItems = await fetchAllRSSFeeds();

    // 24 saat öncesinin zamanını hesapla
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const item of rssItems) {
      results.processed++;

      // ── Kural 1: Görseli olmayan haberleri atla ──────────
      if (!item.imageUrl || item.imageUrl.trim() === "") {
        results.skipped_no_image++;
        continue;
      }

      // ── Kural 2: Son 24 saate ait olmayan haberleri atla ─
      if (!item.pubDate) {
        results.skipped_old++;
        continue;
      }

      const pubDateParsed = new Date(item.pubDate);
      if (isNaN(pubDateParsed.getTime()) || pubDateParsed < twentyFourHoursAgo) {
        results.skipped_old++;
        continue;
      }

      try {
        // Check if we already have this article (by source URL)
        if (item.link) {
          const { data: existing } = await supabase
            .from("news")
            .select("id")
            .eq("source_url", item.link)
            .single();

          if (existing) {
            continue; // Skip duplicate
          }
        }

        // Analyze with Gemini — returns both TR and EN in a single call
        const analyzed = await analyzeAndRewriteNews(
          item.title,
          item.content
        );

        if (analyzed === null) {
          results.filtered++;
          continue; // Negative news, skip
        }

        // Görsel doğrudan RSS'den geliyor (DALL-E fallback kaldırıldı)
        const finalImageUrl = item.imageUrl;

        // Save to Supabase — single row with both languages
        const { error } = await supabase.from("news").insert({
          tr_title: analyzed.tr_title,
          tr_content: analyzed.tr_content,
          en_title: analyzed.en_title,
          en_content: analyzed.en_content,
          image_url: finalImageUrl,
          source_url: item.link || null,
          category: analyzed.category,
          is_breaking: analyzed.is_breaking,
          author: "Haber Merkezi",
        });

        if (error) {
          console.error("Supabase insert error:", error);
          results.errors++;
        } else {
          results.saved++;
        }
      } catch (itemError) {
        console.error("Error processing item:", itemError);
        results.errors++;
      }

      // Hız sınırı: Her 3 saniyede 1 istek (istekleri yavaşlatmak için)
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Retention Policy: Delete records older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { error: deleteError } = await supabase
      .from("news")
      .delete()
      .lt("created_at", sevenDaysAgo.toISOString());

    if (deleteError) {
      console.error("Retention policy deletion failed:", deleteError);
    }
  } catch (feedError) {
    console.error("CRITICAL ERROR: Failed to fetch RSS feeds or connect to database.", feedError);
    results.errors++;
    return NextResponse.json({ error: "Failed to fetch feeds or process news", details: feedError }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    results,
  });
}
