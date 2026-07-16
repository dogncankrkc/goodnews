"use client";

import { useEffect, useState, useRef } from "react";
import { Users } from "lucide-react";
import { createPublicClient } from "@/lib/supabase";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// İstemciyi (Client) bileşen dışına alarak sayfa yüklendiğinde sadece 1 kez oluşturuyoruz.
// Bu sayede "Multiple GoTrueClient instances detected" uyarısının kesin olarak önüne geçilir.
const supabase = createPublicClient();

export default function CollectiveGoodnessCounter({ dict }: { dict: Dictionary }) {
  const [activeUsers, setActiveUsers] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const userIdRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);

    // Rastgele UUID Ataması (Tarayıcıda kalıcı)
    let anonId = localStorage.getItem("goodnews_anon_id");
    if (!anonId) {
      anonId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem("goodnews_anon_id", anonId);
    }
    userIdRef.current = anonId;

    // Supabase Presence (Aktif Kullanıcılar)
    const presenceRoom = supabase.channel("global_presence", {
      config: { presence: { key: anonId } },
    });

    presenceRoom
      .on("presence", { event: "sync" }, () => {
        const state = presenceRoom.presenceState();
        const currentCount = Object.keys(state).length;
        
        setActiveUsers((prev) => {
          if (prev !== currentCount) {
             setIsPulsing(true);
             setTimeout(() => setIsPulsing(false), 500);
          }
          return currentCount;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceRoom.track({ user_id: anonId });
        }
      });

    // React Strict Mode Cleanup
    return () => {
      supabase.removeChannel(presenceRoom);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  return (
    <div className="hidden md:flex items-center gap-4 text-xs lg:text-sm font-medium animate-fade-in-up">
      {/* Aktif Kullanıcılar */}
      <div className={`flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 group cursor-default transition-all duration-300 ${isPulsing ? 'scale-105' : 'scale-100'}`}>
        <Users className="w-4 h-4 lg:w-4 lg:h-4 group-hover:opacity-80" strokeWidth={2.5} />
        <span>
          <span className="tabular-nums font-bold">{activeUsers}</span> {dict.presence?.activeUsers || "Kişi Aktif"}
        </span>
      </div>
    </div>
  );
}
