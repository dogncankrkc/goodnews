import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "GoodNews/1.0 (+https://goodnews.global)",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["enclosure", "enclosure"],
      ["image", "image"],
    ],
  },
});

export interface RSSItem {
  title: string;
  content: string;
  link: string;
  pubDate?: string;
  imageUrl?: string;
}

/**
 * RSS feed sources — a curated mix of TR and EN sources.
 * Gemini will produce both TR and EN output from any source language,
 * so we no longer need to split by language.
 *
 * Sources are organized: Good-news focused → TR mainstream → EN global
 */
export const RSS_FEEDS: string[] = [
  // ── Good-news focused feeds ──────────────────────────────
  "https://www.goodnewsnetwork.org/feed/",
  "https://www.positive.news/feed/",
  "https://www.optimistdaily.com/feed/",
  "https://www.reddit.com/r/UpliftingNews/.rss",

  // ── Türkiye kaynakları ───────────────────────────────────
  "https://www.ntv.com.tr/gundem.rss",
  "https://www.ntv.com.tr/dunya.rss",
  "https://www.ntv.com.tr/teknoloji.rss",
  "https://www.haberturk.com/rss/gundem.xml",
  "https://www.cnnturk.com/feed/rss/turkiye/news",
  "https://www.sozcu.com.tr/rss/gundem.xml",

  // ── Global / EN sources ──────────────────────────────────
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "http://rss.cnn.com/rss/edition.rss",
  "https://www.theguardian.com/world/rss",
];

/**
 * Helper to extract an image from RSS item.
 */
function extractImage(item: any): string | undefined {
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  if (item.image) {
    return item.image;
  }
  // Try finding an img tag in content
  const content = item.content || item.contentSnippet || "";
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return undefined;
}

/**
 * Fetches and parses all RSS feeds.
 * Returns normalized RSS items from all sources.
 */
export async function fetchAllRSSFeeds(): Promise<RSSItem[]> {
  const allItems: RSSItem[] = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items.slice(0, 50)) {
        // Take top 50 per feed (çok geniş havuz için)
        if (item.title) {
          allItems.push({
            title: item.title,
            content:
              item.contentSnippet ||
              item.content ||
              item.summary ||
              item.title,
            link: item.link || "",
            pubDate: item.pubDate,
            imageUrl: extractImage(item),
          });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch RSS feed ${feedUrl}:`, error);
      // Continue with other feeds even if one fails
    }
  }

  return allItems;
}
