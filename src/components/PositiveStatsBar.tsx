"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TreeDeciduous, Zap, Dog, Droplets, Utensils } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface GlobalStats {
  trees: number;
  energy: number;
  pets: number;
  plastic: number;
  meals: number;
}

export default function PositiveStatsBar({ dict, initialStats }: { dict: Dictionary, initialStats?: GlobalStats | null }) {
  const getStartingValue = (ratePerSecond: number) => {
    const now = new Date();
    const midnight = new Date(now).setHours(0, 0, 0, 0);
    const secondsSinceMidnight = (now.getTime() - midnight) / 1000;
    return Math.floor(secondsSinceMidnight * ratePerSecond);
  };

  const [stats, setStats] = useState({
    trees: initialStats?.trees ?? getStartingValue(60),
    energy: initialStats?.energy ?? getStartingValue(270),
    pets: initialStats?.pets ?? getStartingValue(0.5),
    plastic: initialStats?.plastic ?? getStartingValue(15),
    meals: initialStats?.meals ?? getStartingValue(80),
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setStats((prev) => ({
        trees: prev.trees + 180, // 60 * 3
        energy: prev.energy + 810, // 270 * 3
        pets: prev.pets + 1.5, // 0.5 * 3
        plastic: prev.plastic + 45, // 15 * 3
        meals: prev.meals + 240, // 80 * 3
      }));
    }, 3000); // 3 saniyede 1 kez güncellenir (daha sakin bir akış)

    return () => clearInterval(interval);
  }, []);

  // Hydration mismatch prevention
  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="h-[140px] bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border border-gray-100 dark:border-slate-700/50 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  const statItems = [
    { id: "trees", label: dict.stats.trees, value: stats.trees, icon: TreeDeciduous, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
    { id: "energy", label: dict.stats.energy, value: stats.energy, icon: Zap, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/20" },
    { id: "pets", label: dict.stats.pets, value: stats.pets, icon: Dog, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-500/20" },
    { id: "plastic", label: dict.stats.plastic, value: stats.plastic, icon: Droplets, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-500/20" },
    { id: "meals", label: dict.stats.meals, value: stats.meals, icon: Utensils, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-500/20" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center mb-5 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white tracking-tight">
          {dict.stats.title}
        </h2>
      </div>
      <div className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border border-gray-100 dark:border-slate-700/50 rounded-3xl p-5 sm:p-6 shadow-sm overflow-hidden relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 relative z-10">
          {statItems.map((item) => (
            <div key={item.id} className="flex flex-col items-center text-center group">
              <div className={`p-3 rounded-2xl mb-3 ${item.bg} ${item.color} group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 shadow-sm`}>
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xl sm:text-2xl font-bold text-foreground dark:text-white tracking-tight tabular-nums">
                  {Math.floor(item.value).toLocaleString()}
                </span>
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" strokeWidth={3} />
              </div>
              <span className="text-xs sm:text-sm text-muted dark:text-slate-400 font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
