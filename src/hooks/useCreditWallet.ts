'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CreditWallet, CreditTransaction, Currency } from '@/types/credits';

const WALLET_KEY = 'caramelo_credit_wallet';
const TRANSACTIONS_KEY = 'caramelo_credit_transactions';
const MAX_TRANSACTIONS = 50;

const INITIAL_CREDITS = Number(process.env.NEXT_PUBLIC_INITIAL_CREDITS) || 5000000;
const DAILY_BONUS = Number(process.env.NEXT_PUBLIC_DAILY_BONUS) || 500;
const CURRENCY_MODE: Currency = (process.env.NEXT_PUBLIC_CURRENCY_MODE as Currency) || 'CREDITS';

function generateId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getStoredWallet(): CreditWallet | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredTransactions(): CreditTransaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function createDefaultWallet(): CreditWallet {
  return {
    balance: INITIAL_CREDITS,
    currency: CURRENCY_MODE,
    dailyBonus: DAILY_BONUS,
    lastBonusAt: null,
    totalEarned: INITIAL_CREDITS,
    totalSpent: 0,
  };
}

export function useCreditWallet() {
  const [wallet, setWallet] = useState<CreditWallet>(createDefaultWallet);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getStoredWallet();
    if (stored) {
      setWallet(stored);
    } else {
      const defaultWallet = createDefaultWallet();
      localStorage.setItem(WALLET_KEY, JSON.stringify(defaultWallet));
      setWallet(defaultWallet);
    }
    setTransactions(getStoredTransactions());
    setIsLoaded(true);
  }, []);

  // Persist wallet changes
  const persistWallet = useCallback((updated: CreditWallet) => {
    setWallet(updated);
    localStorage.setItem(WALLET_KEY, JSON.stringify(updated));
  }, []);

  // Persist transaction changes
  const persistTransactions = useCallback((updated: CreditTransaction[]) => {
    const trimmed = updated.slice(0, MAX_TRANSACTIONS);
    setTransactions(trimmed);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(trimmed));
  }, []);

  const addTransaction = useCallback(
    (type: CreditTransaction['type'], amount: number, balanceAfter: number, gameType?: string, gameId?: string): CreditTransaction => {
      const txn: CreditTransaction = {
        _id: generateId(),
        userId: 'local',
        amount,
        type,
        gameType,
        gameId,
        balanceAfter,
        createdAt: new Date().toISOString(),
      };
      const updated = [txn, ...getStoredTransactions()];
      persistTransactions(updated);
      return txn;
    },
    [persistTransactions]
  );

  const deductBet = useCallback(
    (amount: number, gameType?: string, gameId?: string) => {
      if (amount <= 0) return null;
      const current = getStoredWallet() ?? wallet;
      if (current.balance < amount) return null;

      const newBalance = current.balance - amount;
      const updated: CreditWallet = {
        ...current,
        balance: newBalance,
        totalSpent: current.totalSpent + amount,
      };
      persistWallet(updated);
      const txn = addTransaction('BET', -amount, newBalance, gameType, gameId);
      return { success: true, newBalance, transaction: txn };
    },
    [wallet, persistWallet, addTransaction]
  );

  const addWinnings = useCallback(
    (amount: number, gameType?: string, gameId?: string) => {
      if (amount <= 0) return null;
      const current = getStoredWallet() ?? wallet;

      const newBalance = current.balance + amount;
      const updated: CreditWallet = {
        ...current,
        balance: newBalance,
        totalEarned: current.totalEarned + amount,
      };
      persistWallet(updated);
      const txn = addTransaction('WIN', amount, newBalance, gameType, gameId);
      return { success: true, newBalance, transaction: txn };
    },
    [wallet, persistWallet, addTransaction]
  );

  const canClaimBonus = useMemo(() => {
    if (!wallet.lastBonusAt) return true;
    const last = new Date(wallet.lastBonusAt).getTime();
    const now = Date.now();
    return now - last >= 24 * 60 * 60 * 1000;
  }, [wallet.lastBonusAt]);

  const claimDailyBonus = useCallback(() => {
    if (!canClaimBonus) return null;
    const current = getStoredWallet() ?? wallet;

    const newBalance = current.balance + DAILY_BONUS;
    const updated: CreditWallet = {
      ...current,
      balance: newBalance,
      totalEarned: current.totalEarned + DAILY_BONUS,
      lastBonusAt: new Date().toISOString(),
    };
    persistWallet(updated);
    const txn = addTransaction('DAILY', DAILY_BONUS, newBalance);
    return { success: true, newBalance, transaction: txn };
  }, [canClaimBonus, wallet, persistWallet, addTransaction]);

  return {
    wallet,
    balance: wallet.balance,
    currency: wallet.currency,
    transactions,
    isLoaded,
    canClaimBonus,
    deductBet,
    addWinnings,
    claimDailyBonus,
  };
}
