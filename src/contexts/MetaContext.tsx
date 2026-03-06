import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
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
      console.error('Erro ao carregar meta:', error.message);
      setMetaLoaded(true);
      return;
    }

    if (data) {
      const ml = (data as any).meta_liquida;
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
