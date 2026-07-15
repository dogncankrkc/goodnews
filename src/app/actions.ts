"use server";

import { getNewsByLanguage } from "@/lib/supabase";
import { headers } from "next/headers";

export async function fetchMoreNewsAction(
  lang: "tr" | "en",
  limit: number,
  offset: number,
  category?: string
) {
  const headersList = await headers();
  const region = headersList.get("x-user-region") || "GLOBAL";
  return await getNewsByLanguage(lang, limit, offset, category, region);
}
