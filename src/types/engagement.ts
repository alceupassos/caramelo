export interface UserLevel {
  level: number;
  exp: number;
  expToNextLevel: number;
  title: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  completed: boolean;
  reward: number;
  completedAt?: string;
}

export interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastPlayedAt: string | null;
  bonusMultiplier: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  totalWon: number;
  level: number;
  winRate: number;
}

export interface EngagementState {
  level: UserLevel;
  achievements: Achievement[];
  streak: DailyStreak;
}
