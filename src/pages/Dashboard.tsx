import { InfoModal } from '@/components/InfoModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, DollarSign, Target, FileText, TrendingUp, AlertTriangle, Crown, Lock, Clock, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMeta } from '@/contexts/MetaContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useStripeAction } from '@/hooks/useStripeAction';

const planLabels: Record<string, string> = {
  free: 'Grátis',
  trial: 'Teste Gratuito',
  essencial: 'Essencial',
  pro: 'Pro',
};

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Dashboard() {
  const { plan, subscriptionEnd, refreshSubscription, canViewChart, canViewStats, canAccessDashboard, trialDaysLeft, isTrialExpired, loading: subLoading } = useSubscription();
  const { user } = useAuth();
  const { metaMensal, metaLoaded, carregarMeta } = useMeta();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loading: stripeLoading, checkout: stripeCheckout, portal: stripePortal } = useStripeAction();
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Pagamento confirmado! Atualizando seu plano...');
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    Promise.all([
      supabase
        .from('projects')
        .select('id, cliente, projeto, valor_cotado, status, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('proposals')
        .select('id, status')
        .order('created_at', { ascending: false }),
    ]).then(([projRes, propRes]) => {
      setProjects(projRes.data || []);
      setProposals(propRes.data || []);
      setDataLoading(false);
    });
  }, [user]);

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

    const totalPropostas = proposals.length;
    const propostasAprovadas = proposals.filter(p => p.status === 'aprovada' || p.status === 'aceita').length;
    const taxaAprovacao = totalPropostas > 0
      ? Math.round((propostasAprovadas / totalPropostas) * 100)
      : 0;

    return { faturamentoMes, totalPropostas, taxaAprovacao };
  }, [projects, proposals]);

  const metaProgress = metaMensal && metaMensal > 0 ? Math.min(100, Math.round((stats.faturamentoMes / metaMensal) * 100)) : 0;

  const cards = [
    { title: 'Faturamento do Mês', value: `R$ ${stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-primary' },
    { title: 'Propostas Enviadas', value: stats.totalPropostas.toString(), icon: FileText, color: 'text-primary' },
    { title: 'Taxa de Aprovação', value: `${stats.taxaAprovacao}%`, icon: TrendingUp, color: 'text-primary' },
  ];

  const handleManageSubscription = () => stripePortal();
  const handleUpgrade = (planKey: 'essencial' | 'pro') => stripeCheckout(planKey);

  if (subLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!canAccessDashboard) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
        </div>
        <Card className="border-amber-500/50">
          <CardContent className="py-12 text-center space-y-4">
            <Lock className="h-12 w-12 text-amber-600 mx-auto" />
            <h2 className="text-xl font-semibold">Recurso disponível nos planos pagos</h2>
            <p className="text-muted-foreground">O Dashboard está disponível a partir do plano Essencial (R$ 29/mês).</p>
            <Button onClick={() => handleUpgrade('essencial')}>Assinar Essencial</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Trial Banner */}
      {plan === 'trial' && trialDaysLeft !== null && trialDaysLeft > 0 && (
        <Card className="border-primary/50 bg-accent">
          <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">
                  Período gratuito: <span className="text-primary">{trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aproveite todos os recursos do PreciFácil durante o seu teste gratuito de 14 dias.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleUpgrade('essencial')}>Assinar Essencial</Button>
              <Button size="sm" variant="outline" onClick={() => handleUpgrade('pro')}>Assinar Pro</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trial Expired Banner */}
      {isTrialExpired && plan === 'free' && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Seu período gratuito de 14 dias expirou</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Escolha um plano para continuar utilizando todos os recursos sem interrupção.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleUpgrade('essencial')}>Essencial — R$ 29/mês</Button>
              <Button size="sm" variant="outline" onClick={() => handleUpgrade('pro')}>Pro — R$ 59/mês</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Card */}
      <Card className="border-primary/30">
        <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Plano atual:</span>
                <Badge
                  variant={plan === 'free' || plan === 'trial' ? 'outline' : 'default'}
                  className={plan === 'free' || plan === 'trial' ? 'border-primary/40 bg-primary/10 text-primary font-semibold' : ''}
                >
                  {planLabels[plan]}
                </Badge>
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

      {/* Stats Cards */}
      {canViewStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      ) : (
        <Card className="border-muted">
          <CardContent className="py-10 text-center space-y-4">
            <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">Métricas disponíveis no plano Pro</h3>
            <p className="text-sm text-muted-foreground">Faturamento do Mês, Propostas Enviadas e Taxa de Aprovação estão disponíveis no plano Pro (R$ 59/mês).</p>
            <Button onClick={() => handleUpgrade('pro')}>Fazer upgrade para o Pro</Button>
          </CardContent>
        </Card>
      )}

      {/* Meta de Faturamento Card — Read Only */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Meta de Faturamento
            <InfoModal
              title="Meta de Faturamento"
              content={
                <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                  <li style={{ marginBottom: 8 }}><strong>Calculado automaticamente</strong> — com base no valor que você definiu na Calculadora de Preço.</li>
                  <li><strong>Para atualizar</strong>, acesse a Calculadora e informe o novo valor que deseja ganhar por mês.</li>
                </ul>
              }
              actionLabel="Ir para a Calculadora"
              onAction={() => navigate('/app/calculadora')}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!metaLoaded ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : metaMensal === null ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Você ainda não definiu sua meta. Use a Calculadora para calcular seu preço mínimo e sua meta será criada automaticamente.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/app/calculadora')}>
                Ir para a Calculadora <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                R$ {(metaMensal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Total que você precisa faturar com seus clientes neste mês</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R$ {stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span>{metaProgress}%</span>
                </div>
                <Progress value={metaProgress} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

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

      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Comece usando a <strong>Calculadora</strong> para descobrir seu preço mínimo e registre projetos no <strong>Histórico</strong> para acompanhar seus resultados aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
