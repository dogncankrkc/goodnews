"use client";

import { useState, useEffect } from "react";
import { NewsItem } from "@/lib/supabase";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ReactionType = keyof NewsItem["reactions"];

interface NewsReactionsProps {
  newsId: string;
  initialReactions: NewsItem["reactions"];
  dict: Dictionary;
}

const REACTION_OPTIONS: { type: ReactionType; emoji: string; label: string; activeColor: string }[] = [
  { type: "inspiring", emoji: "👏", label: "İlham Verici", activeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
  { type: "innovative", emoji: "💡", label: "Yenilikçi", activeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300 dark:border-amber-700" },
  { type: "heartwarming", emoji: "❤️", label: "İç Isıtan", activeColor: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-rose-300 dark:border-rose-700" },
  { type: "promising", emoji: "🚀", label: "Gelecek Vaat Eden", activeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700" },
];

export default function NewsReactions({ newsId, initialReactions, dict }: NewsReactionsProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storageKey = `reacted_news_${newsId}`;
    const storedReaction = localStorage.getItem(storageKey);
    if (storedReaction && REACTION_OPTIONS.some((r) => r.type === storedReaction)) {
      setUserReaction(storedReaction as ReactionType);
    }
  }, [newsId]);

  const handleReact = async (type: ReactionType) => {
    const previousReaction = userReaction;
    const isToggle = previousReaction === type;
    const isSwap = previousReaction !== null && previousReaction !== type;
    
    // Prepare API payload and determine optimistic state
    let oldReaction: ReactionType | null = null;
    let newReaction: ReactionType | null = type;

    if (isToggle) {
      // Scenario B: Toggle/undo
      oldReaction = type;
      newReaction = null;
    } else if (isSwap) {
      // Scenario C: Swap
      oldReaction = previousReaction;
      newReaction = type;
    }

    // Optimistic Update
    setReactions((prev) => {
      const next = { ...prev };
      if (oldReaction) next[oldReaction] = Math.max(0, next[oldReaction] - 1);
      if (newReaction) next[newReaction] = next[newReaction] + 1;
      return next;
    });
    setUserReaction(newReaction);
    
    // Save to localStorage
    const storageKey = `reacted_news_${newsId}`;
    if (newReaction) {
      localStorage.setItem(storageKey, newReaction);
    } else {
      localStorage.removeItem(storageKey);
    }

    // API Call
    try {
      const url = `${window.location.origin}/api/news/${newsId}/react`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldReaction, newReaction }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit reaction");
      }
    } catch (error) {
      console.error("Error submitting reaction:", error);
      // Revert Optimistic Update
      setReactions((prev) => {
        const next = { ...prev };
        if (oldReaction) next[oldReaction] = next[oldReaction] + 1;
        if (newReaction) next[newReaction] = Math.max(0, next[newReaction] - 1);
        return next;
      });
      setUserReaction(previousReaction);
      
      if (previousReaction) {
        localStorage.setItem(storageKey, previousReaction);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  };

  // Avoid hydration mismatch by not rendering the user's specific state until mounted
  if (!isClient) {
    return (
      <div className="flex flex-wrap gap-3 mt-12 py-6 border-t border-border">
        {REACTION_OPTIONS.map((reaction) => (
          <button
            key={reaction.type}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium opacity-70"
            disabled
          >
            <span className="text-xl">{reaction.emoji}</span>
            <span>{reactions[reaction.type]}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-12 py-8 border-t border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{dict.reactions.title}</h3>
      <div className="flex flex-wrap gap-3">
        {REACTION_OPTIONS.map((reaction) => {
          const isSelected = userReaction === reaction.type;

          return (
            <button
              key={reaction.type}
              onClick={() => handleReact(reaction.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95
                ${
                  isSelected
                    ? `${reaction.activeColor} ring-2 ring-offset-1 ring-primary/20 dark:ring-offset-slate-950 scale-105`
                    : "border-border bg-surface text-foreground hover:bg-gray-100 dark:hover:bg-slate-800"
                }
              `}
              aria-label={`${dict.reactions[reaction.type as keyof typeof dict.reactions]} (${reactions[reaction.type]})`}
            >
              <span className={`text-xl transition-transform ${isSelected ? "scale-110" : ""}`}>
                {reaction.emoji}
              </span>
              <span className={isSelected ? "font-bold" : ""}>
                {reactions[reaction.type]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
