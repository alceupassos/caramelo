'use client';

import { motion } from 'framer-motion';

interface AchievementToastProps {
  achievement: {
    name: string;
    icon: string;
    reward: number;
  };
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed top-20 right-4 z-50 bg-gradient-to-r from-yellow-900/90 to-amber-900/90 backdrop-blur border border-yellow-600/50 rounded-xl p-4 shadow-2xl max-w-sm"
      onClick={onClose}
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl">{achievement.icon}</span>
        <div>
          <div className="text-yellow-400 font-bold text-sm">Conquista Desbloqueada!</div>
          <div className="text-white font-bold">{achievement.name}</div>
          <div className="text-yellow-300 text-sm">+{achievement.reward.toLocaleString()} creditos</div>
        </div>
      </div>
    </motion.div>
  );
}
