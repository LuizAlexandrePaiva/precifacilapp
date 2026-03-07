# PreciFácil

**Calculadora de preço real para freelancers, MEIs e autônomos.**

PreciFácil é um SaaS que ajuda profissionais independentes a precificar seus serviços de forma justa e sustentável, gerar propostas profissionais e acompanhar seus projetos com métricas financeiras.

🔗 **[precifacil.app.br](https://precifacil.app.br)**

---

## Funcionalidades

### 🧮 Calculadora de Preço
- Cálculo do preço/hora real com base em custos fixos, variáveis, impostos, margem de lucro e horas produtivas
- Meta de renda líquida mensal como referência
- Comparação entre valor cotado e preço mínimo sustentável

### 📝 Propostas Profissionais
- Criação de propostas comerciais completas com escopo, prazo, forma de pagamento e itens inclusos/não inclusos
- Envio por e-mail diretamente pela plataforma
- Exportação em PDF (plano Pro)

### 📊 Dashboard & Histórico
- Painel com métricas de faturamento, taxa de aprovação e volume de propostas
- Gráficos de desempenho ao longo do tempo (plano Pro)
- Histórico completo de projetos com status e horas reais

### 🔔 E-mails Automáticos
- **Boas-vindas** ao criar conta
- **Confirmação de pagamento** ao assinar
- **Atualização de plano** (upgrade/downgrade)
- **Cancelamento** de assinatura
- **Aviso de trial expirando** (2 dias e 1 dia antes)
- **Lembrete de renovação** (2 dias antes da cobrança)
- **Redefinição de senha** e **confirmação de cadastro**

---

## Planos

| Recurso | Grátis | Essencial · R$29/mês | Pro · R$59/mês |
|---|:---:|:---:|:---:|
| Cálculos de preço | 1/mês | Ilimitados | Ilimitados |
| Propostas | ❌ | Ilimitadas | Ilimitadas |
| Histórico de projetos | ❌ | ✅ | ✅ |
| Dashboard | ❌ | Básico | Completo |
| Exportação PDF | ❌ | ❌ | ✅ |
| Gráficos e métricas | ❌ | ❌ | ✅ |
| Suporte WhatsApp | ❌ | ❌ | ✅ |

Novos usuários recebem **14 dias de trial** com acesso nível Essencial.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons |
| Estado | React Context, TanStack React Query |
| Backend | Lovable Cloud (Supabase) — Auth, Database, Edge Functions |
| Pagamentos | Stripe (Checkout, Customer Portal, Webhooks) |
| E-mails transacionais | Resend |
| E-mails de autenticação | Supabase Auth (domínio `notify.precifacil.app.br`) |
| PDF | jsPDF |
| Deploy | Netlify |

---

## Segurança

- **Row Level Security (RLS)** em todas as tabelas — cada usuário acessa apenas seus próprios dados
- **Validação JWT** em todas as Edge Functions autenticadas
- **Verificação de assinatura** no webhook do Stripe (`whsec_`)
- **Headers HTTP** de proteção: `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- **Rotas protegidas** no frontend com redirecionamento automático
- Nenhuma chave secreta exposta no código do cliente
- Proteção contra brute force via Supabase Auth

---

## Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis e UI (shadcn)
├── contexts/         # AuthContext, MetaContext, SubscriptionContext
├── hooks/            # Hooks customizados
├── lib/              # Utilitários, cálculos, geração de PDF, envio de e-mail
├── pages/            # Páginas da aplicação
└── integrations/     # Cliente e tipos do Supabase (auto-gerados)

supabase/
└── functions/        # Edge Functions (checkout, subscription, webhooks, e-mails)

public/
├── _headers          # Headers de segurança (Netlify)
└── _redirects        # Regras de redirecionamento SPA
```

---

## Variáveis de Ambiente

### Frontend (`.env` — gerado automaticamente)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Edge Functions (secrets do Supabase)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

---

## Deploy

O projeto é publicado via **Netlify** com deploy contínuo a partir do repositório Git.

As Edge Functions são deployadas automaticamente pelo Lovable Cloud.

---

## Licença

Projeto proprietário. Todos os direitos reservados.
