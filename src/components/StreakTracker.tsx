"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface StreakTrackerProps {
  newsId: string;
  dict: Dictionary;
}

export default function StreakTracker({ newsId, dict }: StreakTrackerProps) {
  useEffect(() => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const storageKey = "goodnews_streak";
      
      const storedData = localStorage.getItem(storageKey);
      let streakData = storedData ? JSON.parse(storedData) : { date: today, readArticles: [] };

      // Reset array if it's a new day
      if (streakData.date !== today) {
        streakData = { date: today, readArticles: [] };
      }

      // Add newsId if not already read today
      if (!streakData.readArticles.includes(newsId)) {
        streakData.readArticles.push(newsId);
        localStorage.setItem(storageKey, JSON.stringify(streakData));

        const count = streakData.readArticles.length;

        // Show motivational toasts on milestones
        if (count === 3) {
          toast.success(dict.streak.milestone3);
        } else if (count === 5) {
          toast.success(dict.streak.milestone5);
        } else if (count === 10) {
          toast.success(dict.streak.milestone10);
        }
      }
    } catch (error) {
      console.error("Error tracking streak:", error);
    }
  }, [newsId]);

  // Görünmez bileşen (Sadece mantık barındırır)
  return null;
}
