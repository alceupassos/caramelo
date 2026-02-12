'use client';

import { useEffect, useRef, useState } from 'react';
import { useCredits } from '@/contexts/CreditContext';

function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

export function CreditBalance() {
  const { balance } = useCredits();
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevBalance = useRef(balance);

  useEffect(() => {
    if (prevBalance.current === balance) return;

    setIsPulsing(true);
    const diff = balance - prevBalance.current;
    const steps = 20;
    const increment = diff / steps;
    let current = prevBalance.current;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        current = balance;
        clearInterval(interval);
        setTimeout(() => setIsPulsing(false), 600);
      }
      setDisplayBalance(Math.round(current));
    }, 30);

    prevBalance.current = balance;

    return () => clearInterval(interval);
  }, [balance]);

  useEffect(() => {
    setDisplayBalance(balance);
    prevBalance.current = balance;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`flex items-center gap-1.5 bg-gradient-to-r from-yellow-900/30 to-yellow-700/20 border border-yellow-600/30 px-3 py-1.5 rounded-lg transition-all duration-300 ${
        isPulsing ? 'animate-pulse-win scale-105 border-yellow-400/60' : ''
      }`}
    >
      <span className="text-lg">🪙</span>
      <span className="text-sm font-bold text-yellow-300 tabular-nums">
        {formatNumber(displayBalance)}
      </span>
    </div>
  );
}
