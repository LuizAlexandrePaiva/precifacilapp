import { Resend } from "https://esm.sh/resend@4.1.2";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRIMARY = '#2563EB';
const FOREGROUND = '#0A0F1E';
const MUTED = '#6B7280';
const BG_LIGHT = '#F8FAFC';
const BORDER = '#E2E8F0';
const SITE_URL = 'https://precifacil.app.br';

function layout(content: string): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>PreciFácil</title></head><body style="margin:0;padding:0;background-color:${BG_LIGHT};font-family:'Inter',Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_LIGHT};"><tr><td align="center" style="padding:40px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid ${BORDER};overflow:hidden;"><tr><td style="background-color:${PRIMARY};padding:28px 32px;text-align:center;"><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Preci</span><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;opacity:0.85;">Fácil</span></td></tr><tr><td style="padding:32px;">${content}</td></tr><tr><td style="padding:20px 32px;border-top:1px solid ${BORDER};text-align:center;"><p style="margin:0;font-size:12px;color:${MUTED};line-height:1.5;">PreciFácil &middot; <a href="${SITE_URL}" style="color:${PRIMARY};text-decoration:none;">precifacil.app.br</a><br>Dúvidas? <a href="mailto:suporte@precifacil.app.br" style="color:${PRIMARY};text-decoration:none;">suporte@precifacil.app.br</a></p></td></tr></table></td></tr></table></body></html>`;
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const targetEmail = 'eduardaudi66@gmail.com';

    // Get user name
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find((u: any) => u.email === targetEmail);
    let firstName = 'Usuário';
    if (user) {
      const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
      if (name) {
        firstName = name.split(' ')[0];
      } else {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        firstName = profile?.full_name?.split(' ')[0] || 'Usuário';
      }
    }

    const results: any[] = [];

    // EMAIL 1 — Trial expiring in 2 days
    const trialHtml = layout(`
      ${p(`Olá, ${firstName}!`)}
      ${p('Seu período grátis de 14 dias no PreciFácil termina em <strong>2 dias</strong>.')}
      ${p('Ao voltar para o plano Grátis, você perderá acesso a:')}
      <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};">
        <li>Cálculos ilimitados</li>
        <li>Gerador de propostas profissionais</li>
        <li>Histórico completo de projetos</li>
      </ul>
      ${p('Garanta seu acesso e continue precificando com segurança:')}
      ${btn('Assinar agora por R$29/mês', `${SITE_URL}/app`)}
      ${small('Não quer assinar? Tudo bem, você ainda pode usar o plano Grátis com 1 cálculo por mês.')}
      ${signature()}
    `);

    try {
      const { error } = await resend.emails.send({
        from: 'PreciFácil <noreply@precifacil.app.br>',
        to: [targetEmail],
        subject: '[TESTE] Seu período grátis termina em 2 dias ⏳',
        html: trialHtml,
      });
      results.push({ email: 'trial-2d', success: !error, error: error || null });
    } catch (err: any) {
      results.push({ email: 'trial-2d', success: false, error: err.message });
    }

    // EMAIL 2 — Subscription renewing in 2 days (simulated as Essencial)
    const renewalHtml = layout(`
      ${p(`Olá, ${firstName}!`)}
      ${p(`Sua assinatura do plano <strong>Essencial</strong> será renovada automaticamente em <strong>2 dias</strong>.`)}
      ${p(`O valor de <strong>R$ 29,00</strong> será cobrado no cartão cadastrado. Você não precisa fazer nada — tudo é automático!`)}
      ${p('Continue aproveitando todos os recursos do PreciFácil sem interrupção.')}
      ${btn('Gerenciar assinatura', `${SITE_URL}/app`)}
      ${small('Quer cancelar antes da renovação? Acesse suas configurações ou clique em Gerenciar assinatura.')}
      ${signature()}
    `);

    try {
      const { error } = await resend.emails.send({
        from: 'PreciFácil <noreply@precifacil.app.br>',
        to: [targetEmail],
        subject: '[TESTE] Sua assinatura renova em 2 dias 🔄',
        html: renewalHtml,
      });
      results.push({ email: 'renewal-2d', success: !error, error: error || null });
    } catch (err: any) {
      results.push({ email: 'renewal-2d', success: false, error: err.message });
    }

    return new Response(
      JSON.stringify({ target: targetEmail, firstName, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
