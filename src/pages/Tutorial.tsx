import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, FileText, History, LayoutDashboard, BookOpen, ArrowRight, Settings,
  CreditCard, Target, TrendingUp, Clock, DollarSign, BarChart3,
  Download, Send,
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
  actionLabel?: string;
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
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'calculadora', label: 'Calculadora', icon: Calculator },
  { value: 'propostas', label: 'Propostas', icon: FileText },
  { value: 'historico', label: 'Histórico', icon: History },
  { value: 'conta', label: 'Conta', icon: Settings },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current); };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 overflow-hidden">
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
        <TabsList className="hidden sm:inline-flex w-full h-auto gap-1 bg-muted p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 text-sm gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="sm:hidden -mx-4 px-4 overflow-x-auto overflow-y-hidden scrollbar-hide" style={{ maxWidth: '100vw' }}>
          <div className="flex gap-2 pb-2 pr-4" style={{ width: 'max-content' }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card text-muted-foreground border border-border hover:border-primary/30'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

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
                  'Veja o total de propostas enviadas, sua taxa de aprovação e o faturamento do mês em um só lugar.',
              },
              {
                stepNumber: 2,
                icon: Target,
                title: 'Meta de Faturamento automática',
                description:
                  'A Meta de Faturamento é definida automaticamente pela Calculadora de Preço e não pode ser editada diretamente no Dashboard. Para atualizá-la, acesse a Calculadora e altere o valor que deseja ganhar por mês.',
              },
              {
                stepNumber: 3,
                icon: TrendingUp,
                title: 'Interprete faturamento vs meta',
                description:
                  'Se a barra está verde, você está no caminho certo. Se está baixa, considere ajustar preços ou prospectar mais clientes.',
              },
            ]}
          />
        </TabsContent>

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
                title: 'Informe quanto quer ganhar por mês',
                description:
                  'No campo "Quanto quero ganhar por mês", digite o valor líquido desejado. Se você já fez um cálculo antes, o campo pré-preenche automaticamente com o último valor salvo. Campos de R$ formatam automaticamente ao digitar.',
              },
              {
                stepNumber: 2,
                icon: Calculator,
                title: 'Preencha seus custos e horas',
                description:
                  'Informe custos fixos mensais (R$), horas de trabalho por semana, regime tributário e semanas sem trabalhar por ano. Os campos numéricos exibem sufixos como "horas" e "semanas" para facilitar o preenchimento.',
              },
              {
                stepNumber: 3,
                icon: Target,
                title: 'Veja seu preço mínimo por hora',
                description:
                  'O sistema calcula o menor valor/hora viável. Se o valor que você quer ganhar mudou em relação ao anterior, o sistema pergunta se deseja atualizar a Meta de Faturamento no Dashboard.',
              },
              {
                stepNumber: 4,
                icon: ArrowRight,
                title: 'Gere uma proposta a partir do resultado',
                description:
                  'Após o cálculo, clique no botão "Gerar Proposta" para criar uma proposta comercial usando seu preço mínimo como ponto de partida.',
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
                title: 'Crie uma proposta completa',
                description:
                  'Preencha seus dados (nome, email, WhatsApp com máscara automática), dados do projeto (cliente, projeto, escopo), preço/hora (R$ com formatação automática), nível da proposta, prazo, validade e forma de pagamento.',
              },
              {
                stepNumber: 2,
                icon: TrendingUp,
                title: 'Escolha entre 3 níveis de preço',
                description:
                  'Mínimo (x1): cobre seus custos. Justo (x1,4): margem confortável e recomendado. Premium (x2): projetos de alto valor ou urgentes.',
              },
              {
                stepNumber: 3,
                icon: Send,
                title: 'Compartilhe com o cliente',
                description:
                  'Baixe o PDF da proposta e envie para o cliente pelo canal de sua preferência, como WhatsApp ou e-mail.',
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

        {/* Conta */}
        <TabsContent value="conta">
          <div className="space-y-3">
            <StepCard
              stepNumber={1}
              icon={CreditCard}
              title="Sua conta"
              description="O PreciFácil é 100% gratuito. Todos os recursos estão disponíveis para você sem nenhum custo."
            />
            <StepCard
              stepNumber={2}
              icon={DollarSign}
              title="Dúvidas?"
              description="Entre em contato pelo email suporte@precifacil.app.br. Respondemos em até 1 dia útil."
            />
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
