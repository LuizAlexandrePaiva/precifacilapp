import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionContextType {
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { loading: authLoading } = useAuth();

  return (
    <SubscriptionContext.Provider value={{ loading: authLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
}
