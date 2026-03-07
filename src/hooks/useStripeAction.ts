import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PLANS_CONFIG } from '@/contexts/SubscriptionContext';

const TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}

export function useStripeAction() {
  const [loading, setLoading] = useState(false);

  const checkout = useCallback(async (planKey: 'essencial' | 'pro') => {
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await withTimeout(
        supabase.functions.invoke('create-checkout', {
          body: { priceId: PLANS_CONFIG[planKey].price_id },
        }),
        TIMEOUT_MS
      );
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      if (err?.message === 'timeout') {
        toast.error('A conexão está demorando. Tente novamente em alguns segundos.');
      } else {
        toast.error('Erro ao iniciar checkout');
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const portal = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await withTimeout(
        supabase.functions.invoke('customer-portal'),
        TIMEOUT_MS
      );
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      if (err?.message === 'timeout') {
        toast.error('A conexão está demorando. Tente novamente em alguns segundos.');
      } else {
        toast.error('Erro ao abrir gerenciamento de assinatura');
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { loading, checkout, portal };
}
