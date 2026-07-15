"use client";

import { useState, useEffect } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface ReportButtonProps {
  newsId: string;
  dict: Dictionary;
}

export default function ReportButton({ newsId, dict }: ReportButtonProps) {
  const [isReported, setIsReported] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storageKey = `reported_news_${newsId}`;
    if (localStorage.getItem(storageKey)) {
      setIsReported(true);
    }
  }, [newsId]);

  const handleReport = async () => {
    if (isReported || isLoading) return;

    // Optimistic Update
    setIsReported(true);
    const storageKey = `reported_news_${newsId}`;
    localStorage.setItem(storageKey, "true");

    try {
      setIsLoading(true);
      const url = `${window.location.origin}/api/news/${newsId}/report`;
      const response = await fetch(url, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to report news");
      }
    } catch (error) {
      console.error("Error reporting news:", error);
      // Revert if failed
      setIsReported(false);
      localStorage.removeItem(storageKey);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-70"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        {dict.report.button}
      </button>
    );
  }

  return (
    <button
      onClick={handleReport}
      disabled={isReported || isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
        ${
          isReported
            ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 cursor-not-allowed"
            : "text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95"
        }
      `}
      aria-label={dict.report.button}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isReported ? (
          <>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" x2="4" y1="22" y2="15" />
          </>
        ) : (
          <>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </>
        )}
      </svg>
      {isReported ? dict.report.reported : dict.report.button}
    </button>
  );
}
