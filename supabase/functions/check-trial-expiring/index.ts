import { Resend } from "https://esm.sh/resend@4.1.2";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-TRIAL-EXPIRING] ${step}${detailsStr}`);
};

// ── Constantes de estilo ──

const PRIMARY = '#2563EB';
const FOREGROUND = '#0A0F1E';
const MUTED = '#6B7280';
const BG_LIGHT = '#F8FAFC';
const BORDER = '#E2E8F0';
const SITE_URL = 'https://precifacil.app.br';

function layout(content: string): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>PreciFácil</title></head><body style="margin:0;padding:0;background-color:${BG_LIGHT};font-family:'Inter',Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_LIGHT};"><tr><td align="center" style="padding:40px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid ${BORDER};overflow:hidden;"><tr><td style="background-color:${PRIMARY};padding:28px 32px;text-align:center;"><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Preci</span><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;opacity:0.85;">Fácil</span></td></tr><tr><td style="padding:32px;">${content}</td></tr><tr><td style="padding:20px 32px;border-top:1px solid ${BORDER};text-align:center;"><p style="margin:0;font-size:12px;color:${MUTED};line-height:1.5;">PreciFácil &middot; <a href="${SITE_URL}" style="color:${PRIMARY};text-decoration:none;">precifacil.app.br</a></p></td></tr></table></td></tr></table></body></html>`;
}

function btn(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;"><tr><td style="background-color:${PRIMARY};border-radius:8px;"><a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${text}</a></td></tr></table>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${FOREGROUND};">${text}</p>`;
}

function small(text: string): string {
  return `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:${MUTED};">${text}</p>`;
}

function signature(): string {
  return `<p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:${FOREGROUND};">Equipe PreciFácil</p>`;
}

Deno.serve(async (req) => {
  logStep('Function invoked');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Calcular intervalo: usuários criados há exatamente 13 dias (trial expira amanhã)
    const now = new Date();
    const thirteenDaysAgo = new Date(now);
    thirteenDaysAgo.setDate(now.getDate() - 13);

    const startOfDay = new Date(thirteenDaysAgo);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(thirteenDaysAgo);
    endOfDay.setHours(23, 59, 59, 999);

    logStep('Searching users with trial expiring tomorrow', {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });

    // Buscar usuários criados há 13 dias (trial = 14 dias, expira amanhã)
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw new Error(`Failed to list users: ${listError.message}`);

    const expiringUsers = usersData.users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return createdAt >= startOfDay && createdAt <= endOfDay;
    });

    logStep(`Found ${expiringUsers.length} users with trial expiring tomorrow`);

    let sentCount = 0;
    let errorCount = 0;

    for (const user of expiringUsers) {
      const email = user.email;
      if (!email) continue;

      // Buscar nome do perfil, fallback para user_metadata
      let userName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      if (!userName) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        userName = profile?.full_name || 'Usuário';
      }
      const firstName = userName.split(' ')[0];

      const html = layout(`
        ${p(`Olá, ${firstName}!`)}
        ${p('Seu período gratuito de 14 dias no PreciFácil termina <strong>amanhã</strong>.')}
        ${p('Para continuar utilizando todos os recursos sem interrupção, escolha o plano ideal para você:')}
        <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};">
          <li><strong>Essencial</strong> — Cálculos e propostas ilimitados</li>
          <li><strong>Pro</strong> — Tudo do Essencial + PDF, gráficos e mais</li>
        </ul>
        ${btn('Escolher meu plano', `${SITE_URL}/app`)}
        ${small('Não perca o acesso aos seus dados e projetos!')}
        ${signature()}
      `);

      try {
        const { error: emailError } = await resend.emails.send({
          from: 'PreciFácil <noreply@precifacil.app.br>',
          to: [email],
          subject: 'Seu período gratuito termina amanhã — PreciFácil',
          html,
        });

        if (emailError) {
          logStep('Failed to send email', { email, error: emailError });
          errorCount++;
        } else {
          logStep('Email sent', { email });
          sentCount++;
        }
      } catch (err) {
        logStep('Error sending email', { email, error: err.message });
        errorCount++;
      }
    }

    logStep('Completed', { sentCount, errorCount, totalUsers: expiringUsers.length });

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, errors: errorCount, total: expiringUsers.length }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    logStep('FATAL ERROR', { error: err.message });
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
