'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useEngagement } from '@/hooks/useEngagement';

type EngagementContextValue = ReturnType<typeof useEngagement>;

const EngagementContext = createContext<EngagementContextValue | null>(null);

export function EngagementProvider({ children }: { children: ReactNode }) {
  const engagement = useEngagement();

  return (
    <EngagementContext.Provider value={engagement}>
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagementContext(): EngagementContextValue {
  const ctx = useContext(EngagementContext);
  if (!ctx) {
    throw new Error('useEngagementContext must be used within an EngagementProvider');
  }
  return ctx;
}
