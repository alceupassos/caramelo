'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserLevel, Achievement, DailyStreak, EngagementState } from '@/types/engagement';

const STORAGE_KEY = 'caramelo_engagement';

const ACHIEVEMENTS_DEF = [
  { id: 'first_win', name: 'Primeira Vitória', description: 'Ganhe seu primeiro jogo', icon: '🏆', requirement: 1, reward: 1000 },
  { id: 'high_roller', name: 'High Roller', description: 'Aposte 100.000+ de uma vez', icon: '💎', requirement: 100000, reward: 5000 },
  { id: 'crash_survivor', name: 'Sobrevivente', description: 'Escape com 10x+ no Crash', icon: '🚀', requirement: 10, reward: 10000 },
  { id: 'lucky_seven', name: 'Lucky Seven', description: 'Ganhe 7 vezes seguidas', icon: '🍀', requirement: 7, reward: 7777 },
  { id: 'tigrinho_master', name: 'Mestre Tigrinho', description: 'Ative Free Spins 10 vezes', icon: '🐯', requirement: 10, reward: 15000 },
  { id: 'mine_sweeper', name: 'Mine Sweeper', description: 'Revele 20 tiles seguros em Mines', icon: '💣', requirement: 20, reward: 20000 },
  { id: 'dice_god', name: 'Dice God', description: 'Acerte Roll Under 5', icon: '🎲', requirement: 1, reward: 25000 },
  { id: 'streak_3', name: 'Streak de 3', description: 'Jogue 3 dias seguidos', icon: '🔥', requirement: 3, reward: 2000 },
  { id: 'streak_7', name: 'Streak de 7', description: 'Jogue 7 dias seguidos', icon: '🔥', requirement: 7, reward: 5000 },
  { id: 'streak_30', name: 'Streak Lord', description: 'Jogue 30 dias seguidos', icon: '👑', requirement: 30, reward: 50000 },
  { id: 'level_10', name: 'Nível 10', description: 'Alcance o nível 10', icon: '⭐', requirement: 10, reward: 5000 },
  { id: 'level_25', name: 'Nível 25', description: 'Alcance o nível 25', icon: '⭐', requirement: 25, reward: 15000 },
  { id: 'level_50', name: 'Nível 50', description: 'Alcance o nível 50', icon: '⭐', requirement: 50, reward: 50000 },
  { id: 'level_100', name: 'Centurion', description: 'Alcance o nível 100', icon: '👑', requirement: 100, reward: 500000 },
  { id: 'big_win', name: 'Big Win', description: 'Ganhe 1.000.000+ em um jogo', icon: '💰', requirement: 1000000, reward: 100000 },
  { id: 'games_100', name: '100 Jogos', description: 'Jogue 100 partidas', icon: '🎮', requirement: 100, reward: 10000 },
  { id: 'games_1000', name: '1000 Jogos', description: 'Jogue 1000 partidas', icon: '🎮', requirement: 1000, reward: 100000 },
  { id: 'all_games', name: 'Explorador', description: 'Jogue todos os 5 tipos de jogo', icon: '🌟', requirement: 5, reward: 10000 },
  { id: 'comeback', name: 'Comeback', description: 'Ganhe após 5 derrotas seguidas', icon: '💪', requirement: 1, reward: 5000 },
  { id: 'millionaire', name: 'Milionário', description: 'Acumule 10M+ de créditos', icon: '🤑', requirement: 10000000, reward: 500000 },
];

function getLevelTitle(level: number): string {
  if (level <= 5) return 'Novato';
  if (level <= 15) return 'Jogador';
  if (level <= 30) return 'Veterano';
  if (level <= 50) return 'Mestre';
  if (level <= 75) return 'Lenda';
  return 'Deus';
}

function calculateLevel(totalXP: number): UserLevel {
  const level = Math.max(1, Math.floor(Math.sqrt(totalXP / 100)));
  const currentLevelXP = level * level * 100;
  const nextLevelXP = (level + 1) * (level + 1) * 100;
  const exp = totalXP - currentLevelXP;
  const expToNextLevel = nextLevelXP - currentLevelXP;

  return {
    level,
    exp,
    expToNextLevel,
    title: getLevelTitle(level),
  };
}

function getBonusMultiplier(streak: number): number {
  if (streak >= 30) return 3.0;
  if (streak >= 14) return 2.0;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
}

interface StoredState {
  totalXP: number;
  achievements: Record<string, { progress: number; completed: boolean; completedAt?: string }>;
  streak: DailyStreak;
  totalGamesPlayed: number;
}

function getDefaultStoredState(): StoredState {
  return {
    totalXP: 0,
    achievements: {},
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedAt: null,
      bonusMultiplier: 1.0,
    },
    totalGamesPlayed: 0,
  };
}

function loadState(): StoredState {
  if (typeof window === 'undefined') return getDefaultStoredState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultStoredState();
  } catch {
    return getDefaultStoredState();
  }
}

function saveState(state: StoredState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

function buildAchievements(stored: StoredState['achievements']): Achievement[] {
  return ACHIEVEMENTS_DEF.map((def) => {
    const saved = stored[def.id];
    return {
      ...def,
      progress: saved?.progress ?? 0,
      completed: saved?.completed ?? false,
      completedAt: saved?.completedAt,
    };
  });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isConsecutiveDay(prev: Date, now: Date): boolean {
  const nextDay = new Date(prev);
  nextDay.setDate(nextDay.getDate() + 1);
  return isSameDay(nextDay, now);
}

export function useEngagement() {
  const [storedState, setStoredState] = useState<StoredState>(getDefaultStoredState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount and check streak
  useEffect(() => {
    const state = loadState();

    // Check streak validity
    if (state.streak.lastPlayedAt) {
      const lastPlayed = new Date(state.streak.lastPlayedAt);
      const now = new Date();

      if (!isSameDay(lastPlayed, now) && !isConsecutiveDay(lastPlayed, now)) {
        // Streak broken
        state.streak.currentStreak = 0;
        state.streak.bonusMultiplier = 1.0;
        saveState(state);
      }
    }

    setStoredState(state);
    setIsLoaded(true);
  }, []);

  const persist = useCallback((updated: StoredState) => {
    setStoredState(updated);
    saveState(updated);
  }, []);

  const addXP = useCallback(
    (amount: number, _source: string): { leveledUp: boolean; newLevel?: number } => {
      const current = loadState();
      const oldLevel = calculateLevel(current.totalXP).level;
      current.totalXP += amount;
      current.totalGamesPlayed += 1;

      // Update streak
      const now = new Date();
      if (current.streak.lastPlayedAt) {
        const lastPlayed = new Date(current.streak.lastPlayedAt);
        if (!isSameDay(lastPlayed, now)) {
          if (isConsecutiveDay(lastPlayed, now)) {
            current.streak.currentStreak += 1;
          } else {
            current.streak.currentStreak = 1;
          }
        }
      } else {
        current.streak.currentStreak = 1;
      }

      current.streak.lastPlayedAt = now.toISOString();
      current.streak.longestStreak = Math.max(
        current.streak.longestStreak,
        current.streak.currentStreak
      );
      current.streak.bonusMultiplier = getBonusMultiplier(current.streak.currentStreak);

      const newLevel = calculateLevel(current.totalXP).level;
      persist(current);

      const leveledUp = newLevel > oldLevel;
      return { leveledUp, newLevel: leveledUp ? newLevel : undefined };
    },
    [persist]
  );

  const checkAchievement = useCallback(
    (id: string, progress: number): { unlocked: boolean; achievement?: Achievement } => {
      const current = loadState();
      const def = ACHIEVEMENTS_DEF.find((a) => a.id === id);
      if (!def) return { unlocked: false };

      const saved = current.achievements[id];
      if (saved?.completed) return { unlocked: false };

      const newProgress = Math.max(saved?.progress ?? 0, progress);
      const completed = newProgress >= def.requirement;

      current.achievements[id] = {
        progress: newProgress,
        completed,
        completedAt: completed ? new Date().toISOString() : saved?.completedAt,
      };

      persist(current);

      if (completed) {
        const achievement: Achievement = {
          ...def,
          progress: newProgress,
          completed: true,
          completedAt: current.achievements[id].completedAt,
        };
        return { unlocked: true, achievement };
      }

      return { unlocked: false };
    },
    [persist]
  );

  const getStreakBonus = useCallback((): number => {
    const current = loadState();
    return current.streak.bonusMultiplier;
  }, []);

  const level = calculateLevel(storedState.totalXP);
  const achievements = buildAchievements(storedState.achievements);
  const streak = storedState.streak;
  const totalGamesPlayed = storedState.totalGamesPlayed;

  return {
    level,
    achievements,
    streak,
    addXP,
    checkAchievement,
    getStreakBonus,
    totalGamesPlayed,
    isLoaded,
  };
}
