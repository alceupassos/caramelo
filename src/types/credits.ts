export type Currency = 'CREDITS' | 'SOL';

export interface CreditWallet {
  balance: number;
  currency: Currency;
  dailyBonus: number;
  lastBonusAt: string | null;
  totalEarned: number;
  totalSpent: number;
}

export interface CreditTransaction {
  _id: string;
  userId: string;
  amount: number;
  type: 'BONUS' | 'WIN' | 'LOSS' | 'BET' | 'DAILY';
  gameType?: string;
  gameId?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface BetResult {
  success: boolean;
  newBalance: number;
  transaction: CreditTransaction;
}
