import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { analyzeAndRewriteNews } from "@/lib/gemini";
import { fetchAllRSSFeeds } from "@/lib/rss";
import OpenAI from "openai";

/**
 * Cron job endpoint for news fetching and processing.
 * Triggered by Vercel Cron every 6 hours.
 *
 * Flow:
 * 1. Fetch RSS feeds from all sources (TR + EN)
 * 2. Send each article to Gemini Flash for analysis
 * 3. Gemini filters negative news, rewrites positive ones in BOTH languages
 * 4. Fallback: Generate image via DALL-E 3 if RSS has no image
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
    process.env.NODE_ENV === 'development'; // Lokal geliştirme için bypass

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();
  const results = { processed: 0, saved: 0, filtered: 0, errors: 0 };

  try {
    const rssItems = await fetchAllRSSFeeds();

    for (const item of rssItems) {
      results.processed++;

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

        let finalImageUrl = item.imageUrl || null;

        // DALL-E 3 Fallback if no image from RSS
        if (!finalImageUrl && analyzed.image_prompt && process.env.OPENAI_API_KEY) {
          try {
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY,
            });
            const imageResponse = await openai.images.generate({
              model: "dall-e-3",
              prompt: analyzed.image_prompt,
              n: 1,
              size: "1024x1024",
            });
            finalImageUrl = imageResponse.data?.[0]?.url || null;
          } catch (imgError) {
            console.error("DALL-E generation failed:", imgError);
          }
        }

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
