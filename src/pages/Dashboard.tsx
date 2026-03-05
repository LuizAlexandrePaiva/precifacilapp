import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, DollarSign, Target, FileText, TrendingUp, AlertTriangle, Crown } from 'lucide-react';
import { useSubscription, PLANS_CONFIG } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const planLabels: Record<string, string> = {
  free: 'Grátis',
  essencial: 'Essencial',
  pro: 'Pro',
};

export default function Dashboard() {
  const { plan, subscriptionEnd, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);

  // Handle checkout return
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Pagamento confirmado! Atualizando seu plano...');
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  const stats = {
    faturamentoMes: 0,
    metaMensal: 5000,
    totalPropostas: 0,
    taxaAprovacao: 0,
    projetosAbaixoMinimo: 0,
  };

  const cards = [
    { title: 'Faturamento do Mês', value: `R$ ${stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-primary' },
    { title: 'Meta Mensal', value: `R$ ${stats.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Target, color: 'text-primary' },
    { title: 'Propostas Enviadas', value: stats.totalPropostas.toString(), icon: FileText, color: 'text-primary' },
    { title: 'Taxa de Aprovação', value: `${stats.taxaAprovacao}%`, icon: TrendingUp, color: 'text-primary' },
  ];

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Erro ao abrir gerenciamento de assinatura');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async (planKey: 'essencial' | 'pro') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PLANS_CONFIG[planKey].price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Erro ao iniciar checkout');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Subscription Card */}
      <Card className="border-primary/30">
        <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Plano atual:</span>
                <Badge variant={plan === 'free' ? 'outline' : 'default'}>{planLabels[plan]}</Badge>
              </div>
              {subscriptionEnd && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Renova em {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {plan === 'free' && (
              <Button size="sm" onClick={() => handleUpgrade('essencial')}>Assinar Essencial</Button>
            )}
            {plan === 'essencial' && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleUpgrade('pro')}>Upgrade Pro</Button>
                <Button size="sm" variant="ghost" onClick={handleManageSubscription} disabled={portalLoading}>
                  Gerenciar
                </Button>
              </>
            )}
            {plan === 'pro' && (
              <Button size="sm" variant="ghost" onClick={handleManageSubscription} disabled={portalLoading}>
                Gerenciar assinatura
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.projetosAbaixoMinimo > 0 && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm">
              <strong>{stats.projetosAbaixoMinimo}</strong> projeto(s) ficaram abaixo do preço mínimo este mês.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Comece usando a <strong>Calculadora</strong> para definir seu preço e registre projetos no <strong>Histórico</strong> para ver seus dados aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
