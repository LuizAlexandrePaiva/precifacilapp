import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, FileText, Send, Check, DollarSign, AlertTriangle, HelpCircle, Clock, Layers, Sparkles, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { SEO } from '@/components/SEO';
import { Helmet } from 'react-helmet-async';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const painPoints = [
  {
    icon: DollarSign,
    text: 'Trabalho o mês inteiro mas no final não sobra nada',
  },
  {
    icon: AlertTriangle,
    text: 'Tenho medo de cobrar caro e perder o cliente',
  },
  {
    icon: HelpCircle,
    text: 'Não sei se meu preço cobre todos os meus custos',
  },
];

const steps = [
  {
    icon: Calculator,
    title: 'Diga quanto quer ganhar',
    desc: 'Informe sua meta mensal, seus custos e quantas horas trabalha. O PreciFácil calcula tudo automaticamente.',
    step: '01',
  },
  {
    icon: FileText,
    title: 'Descubra seu preço real',
    desc: 'Veja o valor mínimo que você precisa cobrar por hora para não sair no prejuízo, com o cálculo completo na tela.',
    step: '02',
  },
  {
    icon: Send,
    title: 'Envie uma proposta profissional',
    desc: 'Monte uma proposta com 3 opções de preço, exporte em PDF e envie para o cliente pelo canal que preferir.',
    step: '03',
  },
];

const proofNumbers = [
  {
    icon: Clock,
    number: '2 min',
    text: 'para descobrir seu preço mínimo real',
  },
  {
    icon: Layers,
    number: '3 níveis',
    text: 'de proposta: Mínimo, Justo e Premium',
  },
  {
    icon: Sparkles,
    number: '100%',
    text: 'gratuito, com todos os recursos liberados',
  },
];

const faqs = [
  {
    q: 'O PreciFácil funciona para qualquer tipo de freelancer?',
    a: 'Sim. Funciona para designers, desenvolvedores, consultores, redatores, fotógrafos, coaches e qualquer profissional que presta serviços. A calculadora se adapta ao seu regime tributário e tipo de trabalho.',
  },
  {
    q: 'Preciso saber contabilidade para usar?',
    a: 'Não. O PreciFácil foi feito para quem não entende de contabilidade. Você responde perguntas simples em português e o sistema faz todos os cálculos automaticamente.',
  },
  {
    q: 'A proposta gerada é profissional o suficiente para enviar ao cliente?',
    a: 'Sim. A proposta é gerada em formato limpo e profissional, com 3 opções de pacote, escopo e prazo. Pronta para enviar por email ou WhatsApp.',
  },
  {
    q: 'Funciona para MEI, autônomo e PJ?',
    a: 'Sim. O PreciFácil foi feito para a realidade brasileira. Na calculadora você escolhe seu regime tributário (MEI ~5%, Autônomo PF ~27,5% ou PJ Simples Nacional ~12%) e o sistema aplica o imposto correto no cálculo do seu preço mínimo. Sem precisar entender de contabilidade.',
  },
  {
    q: 'Posso refazer o cálculo quantas vezes quiser?',
    a: 'Sim, sem limite. Você pode simular cenários diferentes, mudar sua meta de ganho, ajustar horas ou custos e ver como isso afeta seu preço mínimo em tempo real. Quanto mais você testar, mais seguro fica na hora de cobrar.',
  },
  {
    q: 'Ainda tem dúvidas?',
    a: 'Fale com a gente pelo e-mail <a href="mailto:suporte@precifacil.app.br" class="text-primary underline">suporte@precifacil.app.br</a>. Respondemos em até 1 dia útil.',
  },
];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="PreciFácil · Calculadora de preço para freelancers"
        description="Descubra quanto cobrar como freelancer em 2 minutos. Calculadora de preço por hora, gerador de propostas comerciais e dashboard gratuito para MEIs e autônomos."
        path="/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "PreciFácil",
          "url": "https://precifacil.app.br",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL"
          },
          "description": "Calculadora de precificação para freelancers, MEIs e autônomos. Calcule seu preço mínimo por hora, gere propostas comerciais profissionais em PDF e acompanhe seus projetos.",
          "inLanguage": "pt-BR",
          "creator": {
            "@type": "Organization",
            "name": "PreciFácil"
          }
        })}</script>
      </Helmet>
      {/* Header */}
      <header className="border-b border-border/50 bg-secondary/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-secondary-foreground">
            Preci<span className="text-primary">Fácil</span>
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-secondary-foreground hover:text-primary" asChild>
              <Link to="/blog">Blog</Link>
            </Button>
            {user ? (
              <Button asChild>
                <Link to="/app">Ir para o App</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="text-secondary-foreground hover:text-primary" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/cadastro">Criar conta grátis</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1. Hero */}
      <section className="relative overflow-hidden py-24 md:py-36" style={{
        background: 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(213 74% 25%) 50%, hsl(213 74% 49%) 100%)',
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(213 74% 49% / 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(213 74% 60% / 0.3) 0%, transparent 40%)',
        }} />
        <div className="container text-center max-w-3xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Descubra o preço certo{' '}
            <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
              antes de perder dinheiro.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            O PreciFácil calcula o mínimo que você precisa cobrar para não trabalhar no prejuízo. Em 2 minutos. 100% gratuito.
          </p>
          <Button size="lg" className="text-base sm:text-lg px-8 sm:px-12 py-8 rounded-xl font-bold shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all w-full sm:w-auto" asChild>
            <Link to="/cadastro" className="whitespace-nowrap">Calcular meu preço agora</Link>
          </Button>
          <p className="text-sm text-blue-200/60 mt-4">100% gratuito · Sem cartão de crédito · Todos os recursos liberados</p>
        </div>
      </section>

      {/* 2. Pain Points */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Isso soa familiar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {painPoints.map((p, i) => (
              <Card key={i} className="border-0 shadow-md bg-card text-center">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center mx-auto mb-5">
                    <p.icon className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-medium text-foreground leading-snug">"{p.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-lg md:text-xl font-semibold text-primary max-w-2xl mx-auto">
            Se algum desses é o seu caso, o PreciFácil resolve isso pra você.
          </p>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="py-20">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Como funciona</h2>
          <p className="text-center text-muted-foreground mb-14 text-lg">Três passos simples. Nenhuma planilha. Nenhum contador.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                <span className="text-6xl font-black text-primary/10 absolute -top-4 left-1/2 -translate-x-1/2 select-none">{s.step}</span>
                <div className="relative z-10 pt-8">
                  <div className="rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-5" style={{
                    background: 'linear-gradient(135deg, hsl(213 74% 49%) 0%, hsl(213 74% 35%) 100%)',
                  }}>
                    <s.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Social Proof */}
      <section className="py-20" style={{
        background: 'linear-gradient(160deg, hsl(213 74% 97%) 0%, hsl(213 30% 93%) 100%)',
      }}>
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
            Feito para a realidade do freelancer brasileiro
          </h2>
          <p className="text-center text-muted-foreground mb-14 text-lg">
            Sem planilha, sem contador, sem complicação.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {proofNumbers.map((item, i) => (
              <Card key={i} className="border-0 shadow-md bg-card text-center">
                <CardContent className="pt-10 pb-8 px-6">
                  <div className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-4xl md:text-5xl font-extrabold text-primary mb-3">{item.number}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Urgency */}
      <section className="py-20 relative overflow-hidden" style={{
        background: 'linear-gradient(160deg, hsl(222 47% 11%) 0%, hsl(222 47% 16%) 40%, hsl(213 74% 30%) 100%)',
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(ellipse at 70% 0%, hsl(213 74% 49% / 0.5) 0%, transparent 60%)',
        }} />
        <div className="container text-center max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Cada mês cobrando errado é dinheiro que você{' '}
            <span className="text-blue-300">não vai recuperar.</span>
          </h2>
          <p className="text-lg text-blue-100/70 mb-10 max-w-xl mx-auto">
            Cada proposta enviada sem cálculo é lucro perdido. Descubra agora o preço que cobre seus custos de verdade.
          </p>
          <Button size="lg" className="text-base sm:text-lg px-8 sm:px-12 py-8 rounded-xl font-bold shadow-xl shadow-primary/30 w-full sm:w-auto" asChild>
            <Link to="/cadastro" className="text-center whitespace-nowrap">Criar conta grátis</Link>
          </Button>
        </div>
      </section>

      {/* 6. Features highlight */}
      <section className="py-20">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Tudo liberado. Zero custo.</h2>
          <p className="text-center text-muted-foreground mb-14 text-lg">Crie sua conta e use todas as ferramentas sem restrição.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Cálculos ilimitados de preço mínimo',
              'Gerador de propostas profissionais',
              'Exportação de propostas em PDF',
              'Dashboard completo com gráficos',
              'Histórico de projetos',
              'Suporte por email',
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3 p-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" className="px-10 py-7 text-base rounded-xl font-bold" asChild>
              <Link to="/cadastro">Começar agora, é grátis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Dúvidas frequentes</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-6 shadow-sm">
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: faq.a }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10" style={{
        background: 'linear-gradient(180deg, hsl(222 47% 11%) 0%, hsl(222 47% 8%) 100%)',
      }}>
        <div className="container text-center text-sm text-blue-200/50">
          <span className="font-semibold text-white">Preci<span className="text-primary">Fácil</span></span>{' '}
          &copy; {new Date().getFullYear()}. Feito para freelancers e MEIs brasileiros.
        </div>
      </footer>
    </div>
  );
}
