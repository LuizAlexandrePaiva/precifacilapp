import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Calculator,
  FileText,
  History,
  LayoutDashboard,
  BookOpen,
  ArrowRight,
  Settings,
  CreditCard,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Pencil,
  Download,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface StepCardProps {
  stepNumber: number;
  icon: React.ElementType;
  title: string;
  description: string;
}

function StepCard({ stepNumber, icon: Icon, title, description }: StepCardProps) {
  return (
    <Card className="border border-border hover:border-primary/30 transition-colors">
      <CardContent className="p-4 flex gap-4 items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
          {stepNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-primary flex-shrink-0" />
            <h4 className="font-semibold text-sm text-foreground">{title}</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface SectionProps {
  steps: StepCardProps[];
  actionLabel: string;
  actionPath?: string;
  actionOnClick?: () => void;
  navigate: (path: string) => void;
}

function Section({ steps, actionLabel, actionPath, actionOnClick, navigate }: SectionProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <StepCard key={step.stepNumber} {...step} />
      ))}
      <Button
        onClick={() => actionOnClick ? actionOnClick() : actionPath && navigate(actionPath)}
        className="w-full sm:w-auto mt-2"
        variant="outline"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

const tabs = [
  { value: 'calculadora', label: 'Calculadora', icon: Calculator },
  { value: 'propostas', label: 'Propostas', icon: FileText },
  { value: 'historico', label: 'Histórico', icon: History },
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'conta', label: 'Conta', icon: Settings },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calculadora');

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      // silently fail
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Como Usar o PreciFácil?
        </h1>
        <p className="text-muted-foreground mt-1">
          Aprenda cada funcionalidade em poucos passos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 min-w-[100px] text-xs sm:text-sm gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary"
            >
              <tab.icon className="h-3.5 w-3.5 hidden sm:block" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Calculadora */}
        <TabsContent value="calculadora">
          <Section
            navigate={navigate}
            actionLabel="Ir para Calculadora"
            actionPath="/app/calculadora"
            steps={[
              {
                stepNumber: 1,
                icon: DollarSign,
                title: 'Informe sua meta líquida',
                description:
                  'Digite quanto você quer receber limpo por mês, depois de impostos e custos.',
              },
              {
                stepNumber: 2,
                icon: Calculator,
                title: 'Preencha seus custos fixos',
                description:
                  'Inclua aluguel, internet, ferramentas, assinaturas e qualquer gasto recorrente.',
              },
              {
                stepNumber: 3,
                icon: Clock,
                title: 'Defina suas horas de trabalho',
                description:
                  'Indique quantas horas por semana você trabalha e quantas semanas de férias tira por ano.',
              },
              {
                stepNumber: 4,
                icon: Target,
                title: 'Veja seu preço mínimo por hora',
                description:
                  'O sistema calcula o menor valor/hora viável. Cobrar abaixo disso significa prejuízo.',
              },
              {
                stepNumber: 5,
                icon: ArrowRight,
                title: 'Use esse número como base',
                description:
                  'Clique em "Gerar Proposta" para criar uma proposta usando seu preço mínimo como ponto de partida.',
              },
            ]}
          />
        </TabsContent>

        {/* Propostas */}
        <TabsContent value="propostas">
          <Section
            navigate={navigate}
            actionLabel="Ir para Propostas"
            actionPath="/app/propostas"
            steps={[
              {
                stepNumber: 1,
                icon: FileText,
                title: 'Crie uma proposta em 2 minutos',
                description:
                  'Preencha cliente, projeto, escopo e prazo. O preço/hora pode vir direto da calculadora.',
              },
              {
                stepNumber: 2,
                icon: TrendingUp,
                title: 'Escolha entre 3 níveis de preço',
                description:
                  'Mínimo (x1): cobre seus custos. Justo (x1,4): margem confortável. Premium (x2): projetos de alto valor.',
              },
              {
                stepNumber: 3,
                icon: Send,
                title: 'Envie para o cliente',
                description:
                  'Compartilhe a proposta diretamente por WhatsApp ou e-mail com todos os detalhes formatados.',
              },
              {
                stepNumber: 4,
                icon: Download,
                title: 'Gere o PDF profissional',
                description:
                  'Baixe um PDF com layout limpo contendo seus dados, escopo, valores e condições de pagamento.',
              },
            ]}
          />
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico">
          <Section
            navigate={navigate}
            actionLabel="Ir para Histórico"
            actionPath="/app/historico"
            steps={[
              {
                stepNumber: 1,
                icon: FileText,
                title: 'Aprove uma proposta',
                description:
                  'Quando o cliente aceitar, marque a proposta como aprovada. O projeto aparece automaticamente no histórico.',
              },
              {
                stepNumber: 2,
                icon: Clock,
                title: 'Informe as horas reais trabalhadas',
                description:
                  'Após concluir o projeto, registre quantas horas você realmente gastou.',
              },
              {
                stepNumber: 3,
                icon: BarChart3,
                title: 'Analise sua rentabilidade',
                description:
                  'Compare o valor cobrado com as horas reais. Descubra se sua precificação está saudável ou se precisa ajustar.',
              },
            ]}
          />
        </TabsContent>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <Section
            navigate={navigate}
            actionLabel="Ir para Dashboard"
            actionPath="/app"
            steps={[
              {
                stepNumber: 1,
                icon: LayoutDashboard,
                title: 'Acompanhe suas métricas',
                description:
                  'Veja propostas enviadas, aprovadas, recusadas e o faturamento total do mês em um só lugar.',
              },
              {
                stepNumber: 2,
                icon: Target,
                title: 'Configure sua Meta Mensal',
                description:
                  'Defina quanto quer faturar por mês. A barra de progresso mostra o quanto já alcançou com projetos concluídos.',
              },
              {
                stepNumber: 3,
                icon: Pencil,
                title: 'Edite a meta a qualquer momento',
                description:
                  'Clique no ícone de lápis ao lado da meta para alterar o valor. A mudança é salva automaticamente.',
              },
              {
                stepNumber: 4,
                icon: TrendingUp,
                title: 'Interprete faturamento vs meta',
                description:
                  'Se a barra está verde, você está no caminho certo. Se está baixa, considere ajustar preços ou prospectar mais clientes.',
              },
            ]}
          />
        </TabsContent>

        {/* Conta */}
        <TabsContent value="conta">
          <Section
            navigate={navigate}
            actionLabel="Gerenciar assinatura"
            actionOnClick={handleManageSubscription}
            steps={[
              {
                stepNumber: 1,
                icon: CreditCard,
                title: 'Gerencie seu plano pelo portal Stripe',
                description:
                  'Faça upgrade, downgrade ou altere sua forma de pagamento diretamente pelo portal seguro da Stripe. Clique em "Gerenciar assinatura" abaixo.',
              },
              {
                stepNumber: 2,
                icon: DollarSign,
                title: 'Cancele quando quiser pela Stripe',
                description:
                  'Sem fidelidade. Cancele a assinatura a qualquer momento pelo portal da Stripe. Seu acesso continua até o fim do período pago.',
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
