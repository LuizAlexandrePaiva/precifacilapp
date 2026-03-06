import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type Plan = 'free' | 'trial' | 'essencial' | 'pro';

const ADMIN_EMAILS = ['lapsantis@protonmail.com'];
const TRIAL_DAYS = 14;

interface SubscriptionContextType {
  plan: Plan;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  monthlyCalcCount: number;
  incrementCalcCount: () => void;
  canCalculate: boolean;
  canAccessProposals: boolean;
  canAccessHistory: boolean;
  canAccessDashboard: boolean;
  canExportPdf: boolean;
  canViewChart: boolean;
  isAdmin: boolean;
  trialDaysLeft: number | null;
  isTrialExpired: boolean;
}

const PLANS_CONFIG = {
  essencial: {
    price_id: 'price_1T85PkE1gwfPeM7rCwIpfsbq',
    product_id: 'prod_U6HzKp8Jup6nih',
  },
  pro: {
    price_id: 'price_1T85Q1E1gwfPeM7rWXIYEIv1',
    product_id: 'prod_U6I0MxAJP0ZqTg',
  },
};

export { PLANS_CONFIG };

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

function getCalcCountKey(userId: string) {
  const now = new Date();
  return `precifacil_calc_${userId}_${now.getFullYear()}_${now.getMonth()}`;
}

function calculateTrialDaysLeft(userCreatedAt: string | undefined): number | null {
  if (!userCreatedAt) return null;
  const created = new Date(userCreatedAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysLeft = TRIAL_DAYS - diffDays;
  return daysLeft;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [plan, setPlan] = useState<Plan>('free');
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyCalcCount, setMonthlyCalcCount] = useState(0);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const isTrialExpired = trialDaysLeft !== null && trialDaysLeft <= 0;

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
    if (isAdmin) {
      setPlan('pro');
      setSubscribed(true);
      setTrialDaysLeft(null);
      setLoading(false);
      return;
    }

    if (!session?.access_token) {
      setPlan('free');
      setSubscribed(false);
      setTrialDaysLeft(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      const stripePlan = data.plan || 'free';
      const stripeSubscribed = data.subscribed || false;
      
      if (stripeSubscribed && (stripePlan === 'essencial' || stripePlan === 'pro')) {
        // Active Stripe subscription — no trial needed
        setPlan(stripePlan);
        setSubscribed(true);
        setSubscriptionEnd(data.subscription_end || null);
        setTrialDaysLeft(null);
      } else {
        // No active subscription — check trial
        const daysLeft = calculateTrialDaysLeft(user?.created_at);
        if (daysLeft !== null && daysLeft > 0) {
          // Within trial period — grant essencial-level access
          setPlan('trial');
          setSubscribed(false);
          setSubscriptionEnd(null);
          setTrialDaysLeft(daysLeft);
        } else {
          // Trial expired, no subscription
          setPlan('free');
          setSubscribed(false);
          setSubscriptionEnd(null);
          setTrialDaysLeft(daysLeft);
        }
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      // On error, still check trial
      const daysLeft = calculateTrialDaysLeft(user?.created_at);
      if (daysLeft !== null && daysLeft > 0) {
        setPlan('trial');
        setTrialDaysLeft(daysLeft);
      } else {
        setPlan('free');
        setTrialDaysLeft(daysLeft);
      }
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, isAdmin, user?.created_at]);

  useEffect(() => {
    if (isAdmin) {
      setPlan('pro');
      setSubscribed(true);
      setTrialDaysLeft(null);
      setLoading(false);
      return;
    }
    if (session) {
      refreshSubscription();
    } else {
      setPlan('free');
      setSubscribed(false);
      setTrialDaysLeft(null);
      setLoading(false);
    }
  }, [session, refreshSubscription, isAdmin]);

  useEffect(() => {
    if (!session || isAdmin) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription, isAdmin]);

  const effectivePlan = isAdmin ? 'pro' : plan;
  // Trial gives essencial-level access
  const hasTrialOrPaid = effectivePlan === 'trial' || effectivePlan === 'essencial' || effectivePlan === 'pro';
  const canCalculate = isAdmin || hasTrialOrPaid || monthlyCalcCount < 1;
  const canAccessProposals = isAdmin || hasTrialOrPaid;
  const canAccessHistory = isAdmin || hasTrialOrPaid;
  const canAccessDashboard = isAdmin || hasTrialOrPaid;
  const canExportPdf = isAdmin || effectivePlan === 'pro';
  const canViewChart = isAdmin || effectivePlan === 'pro';

  return (
    <SubscriptionContext.Provider value={{
      plan: effectivePlan,
      subscribed: isAdmin || subscribed,
      subscriptionEnd,
      loading,
      refreshSubscription,
      monthlyCalcCount,
      incrementCalcCount,
      canCalculate,
      canAccessProposals,
      canAccessHistory,
      canAccessDashboard,
      canExportPdf,
      canViewChart,
      isAdmin,
      trialDaysLeft,
      isTrialExpired,
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
