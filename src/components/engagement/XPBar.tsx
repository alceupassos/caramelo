'use client';

import { useEngagementContext } from '@/contexts/EngagementContext';

export function XPBar() {
  const { level } = useEngagementContext();
  const progress = (level.exp / level.expToNextLevel) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
        Lvl {level.level}
      </span>
      <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
