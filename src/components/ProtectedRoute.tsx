import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      setChecking(false);
      return;
    }

    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_concluido')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data && data.onboarding_concluido === false) {
          // Mark as done so it only happens once
          await supabase
            .from('profiles')
            .update({ onboarding_concluido: true } as any)
            .eq('id', user.id);

          navigate('/app/tutorial', { replace: true });
        }
      } catch {
        // Silently continue to dashboard
      } finally {
        setChecked(true);
        setChecking(false);
      }
    };

    checkOnboarding();
  }, [user, loading, navigate]);

  if (loading || (user && checking && !checked)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
