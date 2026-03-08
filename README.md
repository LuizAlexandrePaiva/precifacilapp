# 💰 PreciFácil

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Calculadora de precificação para freelancers, MEIs e autônomos brasileiros.  
> Descubra quanto cobrar por hora em 2 minutos, gere propostas profissionais em PDF e acompanhe seus projetos — 100% gratuito.

🔗 **[precifacil.app.br](https://precifacil.app.br)**

---

## ✨ Funcionalidades

- **Calculadora de preço mínimo** — Informe meta de renda, custos fixos, horas semanais e regime tributário (MEI, PF, PJ Simples). O sistema calcula o preço/hora que cobre todos os seus custos.
- **Propostas comerciais em 3 pacotes** — Gere propostas com níveis Básico, Padrão e Premium, com escopo, prazo, itens inclusos/excluídos e forma de pagamento.
- **Exportação em PDF** — Baixe propostas prontas para enviar ao cliente por e-mail ou WhatsApp.
- **Dashboard com gráficos** — Visualize receita, projetos e performance em um painel interativo com Recharts.
- **Histórico de projetos** — Registre horas reais, compare com o preço mínimo e descubra se está lucrando ou no prejuízo.
- **Autenticação completa** — Cadastro com e-mail (confirmação obrigatória) e login com Google OAuth.
- **E-mails transacionais** — Confirmação de cadastro e recuperação de senha com templates HTML customizados via Resend.
- **SEO otimizado** — Meta tags Open Graph, JSON-LD, sitemap, robots.txt e canonical tags.
- **Analytics** — Google Analytics 4 e Microsoft Clarity integrados (somente em produção).

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| ⚛️ Frontend | React 18, TypeScript, Vite |
| 🎨 Estilização | Tailwind CSS, shadcn/ui, design tokens HSL |
| 📊 Gráficos | Recharts |
| 📄 PDF | jsPDF |
| 🗄️ Backend | Supabase (PostgreSQL, Auth, Edge Functions) |
| 📧 E-mail | Resend (via Edge Functions) |
| 🔒 Segurança | RLS (Row Level Security), CSP headers, HSTS |
| 📈 Analytics | Google Analytics 4, Microsoft Clarity |
| 🚀 Deploy | Lovable Cloud + Netlify |

---

## 🚀 Instalação e Execução Local

### Pré-requisitos

- **Node.js** ≥ 18
- **npm** ou **bun**
- Um projeto [Supabase](https://supabase.com) configurado

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/LuizAlexandrePaiva/precifacilapp.git
cd precifacil

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais:
#   VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
#   VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key
#   VITE_SUPABASE_PROJECT_ID=seu_project_id

# 4. Execute o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:8080`.

### Variáveis de ambiente opcionais

| Variável | Descrição |
|---|---|
| `VITE_GA4_MEASUREMENT_ID` | ID do Google Analytics 4 (ex: `G-XXXXXXXXXX`) |
| `VITE_CLARITY_ID` | ID do Microsoft Clarity |

### Edge Functions (Supabase)

As Edge Functions precisam dos seguintes secrets configurados no painel do Supabase:

| Secret | Descrição |
|---|---|
| `RESEND_API_KEY` | Chave da API do [Resend](https://resend.com) para envio de e-mails |

---

## 🏗️ Arquitetura e Decisões Técnicas

### 🔐 Segurança em primeiro lugar

- **Nenhuma chave privada no código-fonte.** Todas as chaves sensíveis são armazenadas como secrets no backend e acessadas exclusivamente por Edge Functions.
- **Row Level Security (RLS)** em todas as tabelas (`profiles`, `projects`, `proposals`), garantindo que cada usuário só acessa seus próprios dados via `auth.uid()`.
- **Content Security Policy (CSP)** rigorosa definida em `public/_headers`, bloqueando scripts e conexões não autorizadas.
- **HSTS, X-Frame-Options e Referrer Policy** configurados para proteção contra clickjacking e vazamento de dados.

### ⚡ Backend serverless com Edge Functions

- As Edge Functions do Supabase (Deno) são usadas para lógica que exige secrets, como envio de e-mails transacionais via Resend e hook de personalização de templates de autenticação.
- Isso mantém o frontend como uma SPA estática pura, sem servidor próprio.

### 🧮 Cálculo de preço com regimes tributários brasileiros

- O motor de cálculo (`src/lib/calculator.ts`) aplica alíquotas reais para **MEI (~5%)**, **Autônomo PF (~27,5%)** e **PJ Simples Nacional (~12%)**, considerando semanas de férias, horas semanais e custos fixos.

### 🚀 Performance e UX

- **Code splitting** com `React.lazy` + `Suspense` para carregamento sob demanda de cada página.
- **React Query** para cache inteligente de dados do backend (stale time de 2min).
- **Design responsivo** com layout mobile-first, prevenção de zoom automático em inputs iOS e `whitespace-nowrap` em valores monetários.

---

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis (UI, layout, modais)
│   └── ui/           # shadcn/ui customizados com design tokens
├── contexts/         # AuthContext, MetaContext, SubscriptionContext
├── hooks/            # Custom hooks (use-mobile, use-toast)
├── lib/              # Lógica pura: calculator, generatePdf, analytics
├── pages/            # Rotas: Dashboard, Calculadora, Propostas, Histórico
└── integrations/     # Cliente Supabase (auto-gerado)

supabase/
└── functions/        # Edge Functions (send-email, auth-email-hook)

public/
├── _headers          # Headers de segurança (CSP, HSTS)
├── _redirects        # Regras de redirecionamento SPA
└── og-image.png      # Imagem Open Graph para compartilhamento
```

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por Luiz 🤘
