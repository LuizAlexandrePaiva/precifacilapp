// PreciFácil — Templates de emails transacionais
// Cores extraídas da paleta do site (index.css)
const PRIMARY = '#2563EB';       // hsl(213, 74%, 49%)
const PRIMARY_DARK = '#1E40AF';  // hover
const FOREGROUND = '#0A0F1E';    // hsl(222, 84%, 5%)
const MUTED = '#6B7280';         // hsl(215, 16%, 47%)
const BG_LIGHT = '#F8FAFC';      // hsl(210, 20%, 98%)
const BORDER = '#E2E8F0';        // hsl(214, 32%, 91%)
const SITE_URL = 'https://precifacil.app.br';

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PreciFácil</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_LIGHT};font-family:'Inter',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_LIGHT};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">
          <!-- Cabeçalho -->
          <tr>
            <td style="background-color:${PRIMARY};padding:28px 32px;text-align:center;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Preci</span><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;opacity:0.85;">Fácil</span>
            </td>
          </tr>
          <!-- Conteúdo -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Rodapé -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid ${BORDER};text-align:center;">
              <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.5;">
                PreciFácil &middot; <a href="${SITE_URL}" style="color:${PRIMARY};text-decoration:none;">precifacil.app.br</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
  <tr>
    <td style="background-color:${PRIMARY};border-radius:8px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

function paragraph(text: string, style?: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${FOREGROUND};${style || ''}">${text}</p>`;
}

function mutedText(text: string): string {
  return `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:${MUTED};">${text}</p>`;
}

function signature(): string {
  return `<p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:${FOREGROUND};">Equipe PreciFácil</p>`;
}

// ========== EMAIL 1 — BOAS-VINDAS ==========
export function welcomeEmail(userName: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  return {
    subject: 'Bem-vindo ao PreciFácil',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph('Seja muito bem-vindo ao <strong>PreciFácil</strong>, a ferramenta que ajuda freelancers a calcular o preço real dos seus serviços de forma rápida e profissional.')}
      ${paragraph('Com o PreciFácil, você pode:')}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};">
        <li>Calcular seu preço mínimo por hora com precisão</li>
        <li>Gerar propostas profissionais para seus clientes</li>
        <li>Acompanhar o histórico dos seus projetos</li>
      </ul>
      ${paragraph('Você tem <strong>14 dias de acesso gratuito</strong> para explorar todos os recursos da plataforma.')}
      ${button('Acessar minha conta', SITE_URL)}
      ${mutedText('Aproveite ao máximo o seu período de teste!')}
      ${signature()}
    `),
  };
}

// ========== EMAIL 2 — CONFIRMAÇÃO DE PAGAMENTO ==========
export function paymentConfirmedEmail(userName: string, planName: string, amount: string, date: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  return {
    subject: 'Pagamento confirmado — PreciFácil',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph('Seu pagamento foi processado com sucesso. Confira os detalhes abaixo:')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:12px 16px;background-color:${BG_LIGHT};font-size:13px;color:${MUTED};font-weight:600;">Plano</td>
          <td style="padding:12px 16px;background-color:${BG_LIGHT};font-size:15px;color:${FOREGROUND};font-weight:600;text-align:right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:${MUTED};font-weight:600;">Valor</td>
          <td style="padding:12px 16px;font-size:15px;color:${FOREGROUND};font-weight:600;text-align:right;">R$ ${amount}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;background-color:${BG_LIGHT};font-size:13px;color:${MUTED};font-weight:600;">Data</td>
          <td style="padding:12px 16px;background-color:${BG_LIGHT};font-size:15px;color:${FOREGROUND};text-align:right;">${date}</td>
        </tr>
      </table>
      ${button('Acessar minha conta', SITE_URL)}
      ${mutedText('Obrigado por confiar no PreciFácil!')}
      ${signature()}
    `),
  };
}

// ========== EMAIL 3 — UPGRADE DE PLANO ==========
export function upgradeEmail(userName: string, newPlan: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  const features = newPlan.toLowerCase() === 'pro'
    ? `<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};">
        <li>Exportação de propostas em PDF</li>
        <li>Dashboard completo com gráficos</li>
        <li>Cálculos e propostas ilimitados</li>
        <li>Suporte via WhatsApp</li>
      </ul>`
    : `<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};">
        <li>Cálculos e propostas ilimitados</li>
        <li>Histórico completo de projetos</li>
        <li>Geração de propostas profissionais</li>
      </ul>`;

  return {
    subject: 'Seu plano foi atualizado — PreciFácil',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph(`Seu plano foi atualizado para <strong>${newPlan}</strong> com sucesso.`)}
      ${paragraph('Com o upgrade, você desbloqueou os seguintes recursos:')}
      ${features}
      ${button('Explorar novos recursos', SITE_URL)}
      ${mutedText('Aproveite tudo o que o PreciFácil tem a oferecer!')}
      ${signature()}
    `),
  };
}

// ========== EMAIL 4 — CANCELAMENTO DE ASSINATURA ==========
export function cancellationEmail(userName: string, accessUntil: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  return {
    subject: 'Assinatura cancelada — PreciFácil',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph('Confirmamos o cancelamento da sua assinatura no PreciFácil.')}
      ${paragraph(`Seu acesso aos recursos do plano permanece ativo até <strong>${accessUntil}</strong>. Após essa data, sua conta será revertida para o plano gratuito.`)}
      ${paragraph('Caso mude de ideia, você pode reativar sua assinatura a qualquer momento:')}
      ${button('Reativar assinatura', `${SITE_URL}/app`)}
      ${mutedText('Sentiremos sua falta! Estaremos aqui quando precisar.')}
      ${signature()}
    `),
  };
}

// ========== EMAIL 5 — LEMBRETE DE TRIAL EXPIRANDO ==========
export function trialExpiringEmail(userName: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  return {
    subject: 'Seu período gratuito termina amanhã — PreciFácil',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph('Seu período gratuito de 14 dias no PreciFácil termina <strong>amanhã</strong>.')}
      ${paragraph('Para continuar utilizando todos os recursos sem interrupção, escolha o plano ideal para você:')}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};">
        <li><strong>Essencial</strong> — Cálculos e propostas ilimitados</li>
        <li><strong>Pro</strong> — Tudo do Essencial + PDF, gráficos e mais</li>
      </ul>
      ${button('Escolher meu plano', `${SITE_URL}/app`)}
      ${mutedText('Não perca o acesso aos seus dados e projetos!')}
      ${signature()}
    `),
  };
}

// ========== EMAIL 6 — AVISO DE TRIAL EXPIRANDO EM 2 DIAS ==========
export function trialExpiring2DaysEmail(userName: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  return {
    subject: 'Seu período grátis termina em 2 dias ⏳',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph('Seu período grátis de 14 dias no PreciFácil termina em <strong>2 dias</strong>.')}
      ${paragraph('Ao voltar para o plano Grátis, você perderá acesso a:')}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};">
        <li>Cálculos ilimitados</li>
        <li>Gerador de propostas profissionais</li>
        <li>Histórico completo de projetos</li>
      </ul>
      ${paragraph('Garanta seu acesso e continue precificando com segurança:')}
      ${button('Assinar agora por R$29/mês', `${SITE_URL}/app`)}
      ${mutedText('Não quer assinar? Tudo bem, você ainda pode usar o plano Grátis com 1 cálculo por mês.')}
      ${signature()}
    `),
  };
}

// ========== EMAIL 7 — AVISO DE RENOVAÇÃO EM 2 DIAS ==========
export function renewalReminder2DaysEmail(userName: string, planName: string, planPrice: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  return {
    subject: 'Sua assinatura renova em 2 dias 🔄',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph(`Sua assinatura do plano <strong>${planName}</strong> será renovada automaticamente em <strong>2 dias</strong>.`)}
      ${paragraph(`O valor de <strong>R$ ${planPrice}</strong> será cobrado no cartão cadastrado. Você não precisa fazer nada — tudo é automático!`)}
      ${paragraph('Continue aproveitando todos os recursos do PreciFácil sem interrupção.')}
      ${button('Gerenciar assinatura', `${SITE_URL}/app`)}
      ${mutedText('Quer cancelar antes da renovação? Acesse suas configurações ou clique em Gerenciar assinatura.')}
      ${signature()}
    `),
  };
}

// ========== EMAIL 8 — RECUPERAÇÃO DE SENHA ==========
export function passwordResetEmail(userName: string, resetLink: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  return {
    subject: 'Redefinição de senha — PreciFácil',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph('Recebemos uma solicitação para redefinir a senha da sua conta no PreciFácil.')}
      ${paragraph('Clique no botão abaixo para criar uma nova senha:')}
      ${button('Redefinir minha senha', resetLink)}
      ${mutedText('Este link expira em 1 hora. Se você não solicitou a redefinição de senha, ignore este email — sua conta permanece segura.')}
      ${signature()}
    `),
  };
}
