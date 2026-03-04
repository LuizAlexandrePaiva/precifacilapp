import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, DollarSign, Target, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  // Placeholder data — will be connected to DB later
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

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
