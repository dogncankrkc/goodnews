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
  audience_type: string;
  author: string;
  is_breaking: boolean;
  created_at: string;
  reaction_inspiring: number;
  reaction_innovative: number;
  reaction_heartwarming: number;
  reaction_promising: number;
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
  audience_type: string;
  author: string;
  is_breaking: boolean;
  created_at: string;
  reactions: {
    inspiring: number;
    innovative: number;
    heartwarming: number;
    promising: number;
  };
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
    audience_type: row.audience_type || 'UNIVERSAL',
    author: row.author,
    is_breaking: row.is_breaking || false,
    created_at: row.created_at,
    reactions: {
      inspiring: row.reaction_inspiring || 0,
      innovative: row.reaction_innovative || 0,
      heartwarming: row.reaction_heartwarming || 0,
      promising: row.reaction_promising || 0,
    },
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
  offset = 0,
  category?: string,
  region: string = "GLOBAL"
): Promise<NewsItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Throw error if Supabase is not configured to help with debugging
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase Anon Key or URL in getNewsByLanguage");
    throw new Error("Database configuration is missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  let query = supabase
    .from("news")
    .select("*")
    .not("image_url", "is", null)
    .neq("image_url", "")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category", category);
  }

  // Filter based on region and audience_type
  if (region === "GLOBAL") {
    // Non-TR users only see UNIVERSAL news
    query = query.eq("audience_type", "UNIVERSAL");
  } else {
    // TR users see both UNIVERSAL and TR_LOCAL (no filter needed, or explicitly IN filter if more types added later)
    query = query.in("audience_type", ["UNIVERSAL", "TR_LOCAL"]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching news:", error);
    throw new Error(`Failed to fetch news: ${error.message}`);
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
    console.error("Missing Supabase Anon Key or URL in getNewsById");
    throw new Error("Database configuration is missing.");
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching news by ID:", error);
    throw new Error(`Failed to fetch news by ID: ${error.message}`);
  }

  return resolveLocale(data as NewsRow, language);
}

/**
 * Fetches the global positive statistics for the homepage bar.
 */
export type GlobalStats = {
  trees: number;
  energy: number;
  pets: number;
  plastic: number;
  meals: number;
};

export async function getGlobalStats(): Promise<GlobalStats | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase configuration in getGlobalStats");
    return null;
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("global_stats")
    .select("trees, energy, pets, plastic, meals")
    .eq("id", 1)
    .single();

  if (error || !data) {
    // Return null if table doesn't exist yet or query fails, so client can fallback
    return null;
  }

  return data as GlobalStats;
}
