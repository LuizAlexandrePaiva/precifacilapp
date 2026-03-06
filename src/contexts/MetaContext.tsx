import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MetaContextType {
  metaMensal: number | null;
  metaLiquida: number | null;
  metaLoaded: boolean;
  carregarMeta: (userId: string) => Promise<void>;
  atualizarMeta: (metaMensal: number, metaLiquida: number) => void;
}

const MetaContext = createContext<MetaContextType | undefined>(undefined);

export function MetaProvider({ children }: { children: ReactNode }) {
  const [metaMensal, setMetaMensal] = useState<number | null>(null);
  const [metaLiquida, setMetaLiquida] = useState<number | null>(null);
  const [metaLoaded, setMetaLoaded] = useState(false);

  const carregarMeta = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('meta_mensal, meta_liquida')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao carregar meta:', error.message, error.code);
      setMetaLoaded(true);
      return;
    }

    if (data) {
      const ml = data.meta_liquida;
      const mm = Number(data.meta_mensal);
      if (ml != null && Number(ml) > 0) {
        setMetaMensal(mm);
        setMetaLiquida(Number(ml));
      } else {
        setMetaMensal(null);
        setMetaLiquida(null);
      }
    }
    setMetaLoaded(true);
  }, []);

  const atualizarMeta = useCallback((newMetaMensal: number, newMetaLiquida: number) => {
    setMetaMensal(newMetaMensal);
    setMetaLiquida(newMetaLiquida);
  }, []);

  // Auto-load meta from auth session directly
  useEffect(() => {
    const inicializar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await carregarMeta(session.user.id);
      }
    };
    inicializar();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        carregarMeta(session.user.id);
      } else {
        setMetaMensal(null);
        setMetaLiquida(null);
        setMetaLoaded(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [carregarMeta]);

  return (
    <MetaContext.Provider value={{ metaMensal, metaLiquida, metaLoaded, carregarMeta, atualizarMeta }}>
      {children}
    </MetaContext.Provider>
  );
}

export function useMeta() {
  const context = useContext(MetaContext);
  if (!context) throw new Error('useMeta must be used within MetaProvider');
  return context;
}
