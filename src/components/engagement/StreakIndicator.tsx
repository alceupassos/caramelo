'use client';

import { useEngagementContext } from '@/contexts/EngagementContext';

export function StreakIndicator() {
  const { streak } = useEngagementContext();
  if (streak.currentStreak === 0) return null;

  return (
    <div className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded text-xs font-bold">
      🔥 {streak.currentStreak}
    </div>
  );
}
