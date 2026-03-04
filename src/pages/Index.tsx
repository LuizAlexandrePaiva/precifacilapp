import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calculator, FileText, TrendingUp, Shield, Clock, Target, Check } from 'lucide-react';

const benefits = [
  { icon: Calculator, title: 'Cálculo Preciso', desc: 'Fórmula que considera impostos, férias e horas não faturáveis' },
  { icon: FileText, title: 'Propostas Profissionais', desc: 'Gere propostas com 3 pacotes automaticamente' },
  { icon: TrendingUp, title: 'Acompanhe Resultados', desc: 'Dashboard com faturamento, metas e taxa de aprovação' },
  { icon: Shield, title: 'Nunca Cobre Menos', desc: 'Alertas visuais quando um projeto fica abaixo do mínimo' },
  { icon: Clock, title: 'Economize Tempo', desc: 'Pare de usar planilhas e calculadora de celular' },
  { icon: Target, title: 'Metas Claras', desc: 'Saiba exatamente quanto precisa faturar por mês' },
];

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    features: ['1 cálculo por mês', 'Resultado básico', 'Sem propostas'],
    cta: 'Começar Grátis',
    highlighted: false,
  },
  {
    name: 'Essencial',
    price: 'R$ 29',
    period: '/mês',
    features: ['Cálculos ilimitados', 'Gerador de propostas', 'Histórico de projetos', 'Dashboard básico'],
    cta: 'Assinar Essencial',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 'R$ 59',
    period: '/mês',
    features: ['Tudo do Essencial', 'Exportar propostas em PDF', 'Dashboard completo', 'Suporte prioritário'],
    cta: 'Assinar Pro',
    highlighted: false,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            Preci<span className="text-primary">Fácil</span>
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in">
            Descubra quanto você{' '}
            <span className="text-primary">realmente</span> precisa cobrar
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Chega de achômetro. Calcule seu preço real considerando impostos, férias, custos fixos e horas não faturáveis.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 animate-fade-in" style={{ animationDelay: '0.2s' }} asChild>
            <Link to="/cadastro">Calcular meu preço grátis</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Por que usar o PreciFácil?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <Card key={b.title} className="border-0 shadow-sm bg-card">
                <CardContent className="pt-6">
                  <div className="rounded-lg bg-accent w-12 h-12 flex items-center justify-center mb-4">
                    <b.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                  <p className="text-muted-foreground text-sm">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Planos</h2>
          <p className="text-center text-muted-foreground mb-12">Escolha o plano ideal para o seu momento</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.highlighted ? 'border-primary shadow-lg scale-105' : 'border shadow-sm'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Mais popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'} asChild>
                    <Link to="/cadastro">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Preci<span className="text-primary">Fácil</span></span>{' '}
          &copy; {new Date().getFullYear()}. Feito para freelancers e MEIs brasileiros.
        </div>
      </footer>
    </div>
  );
}
