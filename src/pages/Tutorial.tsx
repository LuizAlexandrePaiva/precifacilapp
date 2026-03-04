import { BookOpen, Calculator, FileText, History, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    icon: Calculator,
    title: '1. Como calcular seu preço mínimo',
    description: 'O preço mínimo é o menor valor que você pode cobrar por hora sem ter prejuízo. Ele leva em conta todos os seus custos fixos, variáveis e quanto você quer trabalhar por mês.',
    steps: [
      'Acesse a Calculadora no menu lateral.',
      'Preencha seus custos fixos mensais (aluguel, internet, ferramentas, etc.).',
      'Informe seus custos variáveis e impostos estimados.',
      'Defina quantas horas por dia e quantos dias por mês você pretende trabalhar.',
      'O sistema calcula automaticamente seu preço mínimo por hora.',
      'Clique em "Gerar Proposta" para usar esse valor como base de uma nova proposta.',
    ],
  },
  {
    icon: FileText,
    title: '2. Como gerar uma proposta profissional',
    description: 'Uma proposta registra o cliente, o escopo do trabalho e o valor que você vai cobrar. Você pode escolher entre três níveis de preço para ajustar a margem de lucro.',
    steps: [
      'Acesse Propostas no menu lateral e clique em "Nova Proposta".',
      'Preencha o nome do cliente e o nome do projeto.',
      'Descreva o escopo do trabalho (o que será entregue).',
      'Informe o preço por hora (pode vir automaticamente da calculadora).',
      'Escolha o nível da proposta: mínimo (×1), justo (×1,4) ou premium (×2).',
      'Defina o prazo estimado em horas ou dias.',
      'Confira o valor total calculado e clique em "Salvar Proposta".',
    ],
  },
  {
    icon: History,
    title: '3. Como registrar o resultado de um projeto',
    description: 'Depois de concluir um projeto, registre quantas horas você realmente gastou. Isso permite comparar o valor cobrado com o custo real e entender se o projeto foi rentável.',
    steps: [
      'Quando o cliente aceitar, vá até Propostas e clique em "Aprovar".',
      'O projeto aparecerá automaticamente no Histórico de Projetos.',
      'Após concluir o trabalho, acesse o Histórico de Projetos.',
      'Clique em "Informar horas" na linha do projeto.',
      'Digite quantas horas você realmente trabalhou.',
      'O sistema mostra o valor/hora real e se sua margem ficou acima ou abaixo do mínimo.',
    ],
  },
  {
    icon: LayoutDashboard,
    title: '4. Como interpretar o Dashboard',
    description: 'O Dashboard reúne indicadores-chave para você acompanhar a saúde financeira dos seus projetos de forma rápida e visual.',
    steps: [
      'Acesse o Dashboard no menu lateral (é a tela inicial).',
      'Veja o total de propostas enviadas, aprovadas e recusadas.',
      'Confira o faturamento estimado com base nas propostas aprovadas.',
      'Analise a taxa de aprovação para entender sua conversão.',
      'Compare o valor cobrado com as horas reais gastas nos projetos concluídos.',
      'Use essas informações para ajustar seus preços e melhorar sua rentabilidade.',
    ],
  },
];

export default function Tutorial() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Tutorial
        </h1>
        <p className="text-muted-foreground mt-1">
          Aprenda a usar o PreciFácil do início ao fim
        </p>
      </div>

      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <section.icon className="h-5 w-5 text-primary" />
              {section.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              {section.steps.map((step, i) => (
                <li key={i} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
