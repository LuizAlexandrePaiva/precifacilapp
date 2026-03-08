import { SEO } from '@/components/SEO';
import { InfoModal } from '@/components/InfoModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, DollarSign, Target, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMeta } from '@/contexts/MetaContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Dashboard() {
  const { user } = useAuth();
  const { metaMensal, metaLoaded, carregarMeta } = useMeta();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

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
        .select('id, status, valor_pacote, created_at')
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
      const total = proposals
        .filter((p) => {
          const pd = new Date(p.created_at);
          return `${pd.getFullYear()}-${pd.getMonth()}` === monthKey && (p.status === 'aprovada' || p.status === 'aceita');
        })
        .reduce((sum, p) => sum + Number(p.valor_pacote || 0), 0);
      months.push({ name: monthNames[d.getMonth()], faturamento: total });
    }
    return months;
  }, [proposals]);

  const stats = useMemo(() => {
    const now = new Date();
    const proposalsThisMonth = proposals.filter((p) => {
      const pd = new Date(p.created_at);
      return pd.getMonth() === now.getMonth() && pd.getFullYear() === now.getFullYear();
    });
    const faturamentoMes = proposalsThisMonth
      .filter((p) => p.status === 'aprovada' || p.status === 'aceita')
      .reduce((s, p) => s + Number(p.valor_pacote || 0), 0);

    const totalPropostas = proposals.length;
    const propostasAprovadas = proposals.filter(p => p.status === 'aprovada' || p.status === 'aceita').length;
    const taxaAprovacao = totalPropostas > 0
      ? Math.round((propostasAprovadas / totalPropostas) * 100)
      : 0;

    return { faturamentoMes, totalPropostas, taxaAprovacao };
  }, [proposals]);

  const metaProgress = metaMensal && metaMensal > 0 ? Math.min(100, Math.round((stats.faturamentoMes / metaMensal) * 100)) : 0;

  const cards = [
    { title: 'Faturamento do Mês', value: `R$ ${stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-primary' },
    { title: 'Propostas Enviadas', value: stats.totalPropostas.toString(), icon: FileText, color: 'text-primary' },
    { title: 'Taxa de Aprovação', value: `${stats.taxaAprovacao}%`, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SEO title="Dashboard" description="Acompanhe seu faturamento, propostas e metas de precificação." path="/app" noindex />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
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

      {/* Meta de Faturamento Card */}
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

      {/* Revenue Chart */}
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

      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Comece usando a <strong>Calculadora</strong> para descobrir seu preço mínimo e registre projetos no <strong>Histórico</strong> para acompanhar seus resultados aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
