import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Raw database row — contains both TR and EN fields in a single row.
 */
export type NewsRow = {
  id: string;
  tr_title: string;
  tr_content: string;
  en_title: string;
  en_content: string;
  image_url: string | null;
  source_url: string | null;
  category: string;
  author: string;
  is_breaking: boolean;
  created_at: string;
};

/**
 * Locale-resolved news item — title/content are already resolved
 * to the correct language for display.
 */
export type NewsItem = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  source_url: string | null;
  category: string;
  author: string;
  is_breaking: boolean;
  created_at: string;
};

/**
 * Resolves a raw DB row into a locale-specific NewsItem.
 */
function resolveLocale(row: NewsRow, lang: "tr" | "en"): NewsItem {
  return {
    id: row.id,
    title: lang === "tr" ? row.tr_title : row.en_title,
    content: lang === "tr" ? row.tr_content : row.en_content,
    image_url: row.image_url,
    source_url: row.source_url,
    category: row.category,
    author: row.author,
    is_breaking: row.is_breaking || false,
    created_at: row.created_at,
  };
}

/**
 * Creates a Supabase client for server-side usage.
 * Uses the service role key for full access (cron jobs, API routes).
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}

/**
 * Creates a Supabase client using the anon key for client-safe operations.
 */
export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Fetches news items resolved to the given locale, ordered by newest first.
 * Optionally filters by category.
 */
export async function getNewsByLanguage(
  language: "tr" | "en",
  limit = 20,
  category?: string
): Promise<NewsItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return empty array if Supabase is not configured (dev mode)
  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  let query = supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching news:", error);
    return [];
  }

  return ((data as NewsRow[]) || []).map((row) => resolveLocale(row, language));
}

/**
 * Fetches a single news item by ID, resolved to the given locale.
 */
export async function getNewsById(
  id: string,
  language: "tr" | "en"
): Promise<NewsItem | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching news by ID:", error);
    return null;
  }

  return resolveLocale(data as NewsRow, language);
}
