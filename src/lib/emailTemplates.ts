// PreciFácil: Templates de emails essenciais (autenticação)
const PRIMARY = '#2563EB';
const FOREGROUND = '#0A0F1E';
const MUTED = '#6B7280';
const BG_LIGHT = '#F8FAFC';
const BORDER = '#E2E8F0';
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
          <tr>
            <td style="background-color:${PRIMARY};padding:28px 32px;text-align:center;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Preci</span><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;opacity:0.85;">Fácil</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
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

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${FOREGROUND};">${text}</p>`;
}

function mutedText(text: string): string {
  return `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:${MUTED};">${text}</p>`;
}

function signature(): string {
  return `<p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:${FOREGROUND};">Equipe PreciFácil</p>`;
}

// ========== EMAIL 1: BOAS-VINDAS ==========
export function welcomeEmail(userName: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  return {
    subject: 'Bem-vindo ao PreciFácil',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph('Seja muito bem-vindo ao <strong>PreciFácil</strong>, a ferramenta gratuita que ajuda freelancers a calcular o preço real dos seus serviços de forma rápida e profissional.')}
      ${paragraph('Com o PreciFácil, você pode:')}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};">
        <li>Calcular seu preço mínimo por hora com precisão</li>
        <li>Gerar propostas profissionais para seus clientes</li>
        <li>Exportar propostas em PDF</li>
        <li>Acompanhar o histórico dos seus projetos</li>
      </ul>
      ${paragraph('Todos os recursos estão disponíveis para você, sem nenhum custo.')}
      ${button('Acessar minha conta', SITE_URL)}
      ${mutedText('Bom trabalho!')}
      ${signature()}
    `),
  };
}

// ========== EMAIL 2: RECUPERAÇÃO DE SENHA ==========
export function passwordResetEmail(userName: string, resetLink: string): { subject: string; html: string } {
  const firstName = userName?.split(' ')[0] || 'Usuário';
  return {
    subject: 'Redefinição de senha · PreciFácil',
    html: layout(`
      ${paragraph(`Olá, ${firstName}!`)}
      ${paragraph('Recebemos uma solicitação para redefinir a senha da sua conta no PreciFácil.')}
      ${paragraph('Clique no botão abaixo para criar uma nova senha:')}
      ${button('Redefinir minha senha', resetLink)}
      ${mutedText('Este link expira em 1 hora. Se você não solicitou a redefinição de senha, ignore este email. Sua conta permanece segura.')}
      ${signature()}
    `),
  };
}
