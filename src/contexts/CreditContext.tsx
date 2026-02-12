'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useCreditWallet } from '@/hooks/useCreditWallet';

type CreditContextValue = ReturnType<typeof useCreditWallet>;

const CreditContext = createContext<CreditContextValue | null>(null);

export function CreditProvider({ children }: { children: ReactNode }) {
  const creditWallet = useCreditWallet();

  return (
    <CreditContext.Provider value={creditWallet}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits(): CreditContextValue {
  const ctx = useContext(CreditContext);
  if (!ctx) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return ctx;
}
