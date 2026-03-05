import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type Plan = 'free' | 'essencial' | 'pro';

interface SubscriptionContextType {
  plan: Plan;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  /** Monthly calculation count for free users */
  monthlyCalcCount: number;
  incrementCalcCount: () => void;
  canCalculate: boolean;
  canAccessProposals: boolean;
}

const PLANS_CONFIG = {
  essencial: {
    price_id: 'price_1T7PjJE1gwfPeM7rxhK4HiRI',
    product_id: 'prod_U5avmHLpzQ3Wwl',
  },
  pro: {
    price_id: 'price_1T7PjsE1gwfPeM7rAbWAP7O2',
    product_id: 'prod_U5av2HKRFqJrDg',
  },
};

export { PLANS_CONFIG };

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

function getCalcCountKey(userId: string) {
  const now = new Date();
  return `precifacil_calc_${userId}_${now.getFullYear()}_${now.getMonth()}`;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [plan, setPlan] = useState<Plan>('free');
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyCalcCount, setMonthlyCalcCount] = useState(0);

  // Load calc count from localStorage for free users
  useEffect(() => {
    if (user) {
      const key = getCalcCountKey(user.id);
      const stored = localStorage.getItem(key);
      setMonthlyCalcCount(stored ? parseInt(stored) : 0);
    }
  }, [user]);

  const incrementCalcCount = useCallback(() => {
    if (!user) return;
    const key = getCalcCountKey(user.id);
    const newCount = monthlyCalcCount + 1;
    setMonthlyCalcCount(newCount);
    localStorage.setItem(key, String(newCount));
  }, [user, monthlyCalcCount]);

  const refreshSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setPlan('free');
      setSubscribed(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      setPlan(data.plan || 'free');
      setSubscribed(data.subscribed || false);
      setSubscriptionEnd(data.subscription_end || null);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setPlan('free');
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (session) {
      refreshSubscription();
    } else {
      setPlan('free');
      setSubscribed(false);
      setLoading(false);
    }
  }, [session, refreshSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  const canCalculate = plan !== 'free' || monthlyCalcCount < 1;
  const canAccessProposals = plan !== 'free';

  return (
    <SubscriptionContext.Provider value={{
      plan,
      subscribed,
      subscriptionEnd,
      loading,
      refreshSubscription,
      monthlyCalcCount,
      incrementCalcCount,
      canCalculate,
      canAccessProposals,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
}
