

# PreciFácil — Calculadora de Preço Real para Freelancers

## Visão Geral
SaaS em português brasileiro que ajuda freelancers e MEIs a calcular o preço justo por hora/dia, gerar propostas profissionais e acompanhar projetos. Visual limpo com azul escuro (#0f172a) e azul médio (#3182ce), responsivo.

---

## Páginas e Funcionalidades

### 1. Landing Page (pública)
- Hero com headline "Descubra quanto você realmente precisa cobrar", subtítulo e CTA "Calcular meu preço grátis"
- Seção de benefícios com ícones
- Seção de planos: Grátis, Essencial (R$29/mês), Pro (R$59/mês) em cards comparativos
- Footer simples

### 2. Autenticação (Supabase)
- Cadastro com email/senha
- Login
- Recuperação de senha com página /reset-password
- Rotas protegidas para páginas internas

### 3. Calculadora de Preço (tela principal pós-login)
- Formulário: meta líquida mensal, horas/semana, regime tributário (MEI/Autônomo PF/PJ Simples), custos fixos, semanas de férias
- Fórmula: (meta + custos + imposto estimado por regime) ÷ horas faturáveis reais (descontando férias e 30% não-faturáveis)
- Resultado destacado: preço mínimo/hora, preço mínimo/dia (8h), explicação em linguagem simples
- Salva cálculos no banco

### 4. Gerador de Proposta
- Botão "Gerar Proposta" após calcular
- Formulário: nome do cliente, projeto, escopo, prazo
- Gera 3 pacotes automáticos: Básico (preço base), Padrão (+40%), Premium (+100%)
- Preview formatado da proposta na tela
- Salva proposta no banco

### 5. Histórico de Projetos
- Tabela/lista com: cliente, valor cotado, horas reais, valor/hora real, status (aprovado/recusado)
- Indicador visual verde (acima do mínimo) / vermelho (abaixo)

### 6. Dashboard
- Cards: faturamento do mês, meta mensal, total de propostas, taxa de aprovação (%)
- Alerta se algum projeto ficou abaixo do preço mínimo

### 7. Layout & Navegação
- Sidebar com menu lateral (collapsible) com links: Dashboard, Calculadora, Propostas, Histórico
- Header com trigger do sidebar e info do usuário
- 100% responsivo (mobile-friendly)

---

## Backend (Supabase / Lovable Cloud)
- Tabelas: profiles, calculations, proposals, projects
- Autenticação com email/senha
- RLS para isolar dados por usuário
- Tema de cores customizado (azul escuro + azul médio)

