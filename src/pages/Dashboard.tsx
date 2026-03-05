import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, DollarSign, Target, FileText, TrendingUp, AlertTriangle, Crown, Lock } from 'lucide-react';
import { useSubscription, PLANS_CONFIG } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const planLabels: Record<string, string> = {
  free: 'Grátis',
  essencial: 'Essencial',
  pro: 'Pro',
};

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Dashboard() {
  const { plan, subscriptionEnd, refreshSubscription, canViewChart } = useSubscription();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Pagamento confirmado! Atualizando seu plano...');
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setProjects(data || []));
  }, [user]);

  // Build last 6 months chart data from projects
  const chartData = useMemo(() => {
    const now = new Date();
    const months: { name: string; faturamento: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      const total = projects
        .filter((p) => {
          const pd = new Date(p.created_at);
          return `${pd.getFullYear()}-${pd.getMonth()}` === monthKey && p.status === 'concluido';
        })
        .reduce((sum, p) => sum + Number(p.valor_cotado || 0), 0);
      months.push({ name: monthNames[d.getMonth()], faturamento: total });
    }
    return months;
  }, [projects]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = projects.filter((p) => {
      const pd = new Date(p.created_at);
      return pd.getMonth() === now.getMonth() && pd.getFullYear() === now.getFullYear();
    });
    const faturamentoMes = thisMonth
      .filter((p) => p.status === 'concluido')
      .reduce((s, p) => s + Number(p.valor_cotado || 0), 0);
    return {
      faturamentoMes,
      metaMensal: 5000,
      totalPropostas: projects.length,
      taxaAprovacao: projects.length > 0
        ? Math.round((projects.filter(p => p.status === 'aprovado' || p.status === 'concluido').length / projects.length) * 100)
        : 0,
      projetosAbaixoMinimo: 0,
    };
  }, [projects]);

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

      {/* Revenue Chart - Pro only */}
      {canViewChart ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução do Faturamento (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `R$${v}`} />
                <RechartsTooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                />
                <Bar dataKey="faturamento" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-muted">
          <CardContent className="py-10 text-center space-y-4">
            <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">Gráfico de evolução disponível no plano Pro</h3>
            <p className="text-sm text-muted-foreground">Acompanhe a evolução do seu faturamento mês a mês com o plano Pro (R$ 59/mês).</p>
            <Button onClick={() => handleUpgrade('pro')}>Fazer upgrade para o Pro</Button>
          </CardContent>
        </Card>
      )}

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
