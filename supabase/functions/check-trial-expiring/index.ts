import { Resend } from "https://esm.sh/resend@4.1.2";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

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

// ── Helpers ──

function dayRange(daysAgo: number, now: Date): { start: Date; end: Date } {
  const d = new Date(now);
  d.setDate(now.getDate() - daysAgo);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function getFirstName(user: any, supabase: any): Promise<string> {
  let userName = user.user_metadata?.full_name || user.user_metadata?.name || '';
  if (!userName) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    userName = profile?.full_name || 'Usuário';
  }
  return userName.split(' ')[0];
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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2025-08-27.basil' });

    const now = new Date();

    // ── Fetch all users once ──
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw new Error(`Failed to list users: ${listError.message}`);
    const allUsers = usersData.users;

    let totalSent = 0;
    let totalErrors = 0;

    // ================================================================
    // EMAIL 1 — Trial expira AMANHÃ (criado há 13 dias — lógica existente)
    // ================================================================
    {
      const { start, end } = dayRange(13, now);
      logStep('Checking trial expiring tomorrow (13 days ago)', { start: start.toISOString(), end: end.toISOString() });

      const users = allUsers.filter((u) => {
        const c = new Date(u.created_at);
        return c >= start && c <= end;
      });
      logStep(`Found ${users.length} users with trial expiring tomorrow`);

      for (const user of users) {
        const email = user.email;
        if (!email) continue;
        const firstName = await getFirstName(user, supabase);

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
          if (emailError) { logStep('Failed (trial-1d)', { email, error: emailError }); totalErrors++; }
          else { logStep('Sent (trial-1d)', { email }); totalSent++; }
        } catch (err) { logStep('Error (trial-1d)', { email, error: err.message }); totalErrors++; }
      }
    }

    // ================================================================
    // EMAIL 2 — Trial expira em 2 DIAS (criado há 12 dias)
    // ================================================================
    {
      const { start, end } = dayRange(12, now);
      logStep('Checking trial expiring in 2 days (12 days ago)', { start: start.toISOString(), end: end.toISOString() });

      const users = allUsers.filter((u) => {
        const c = new Date(u.created_at);
        return c >= start && c <= end;
      });
      logStep(`Found ${users.length} users with trial expiring in 2 days`);

      for (const user of users) {
        const email = user.email;
        if (!email) continue;
        const firstName = await getFirstName(user, supabase);

        const html = layout(`
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
          const { error: emailError } = await resend.emails.send({
            from: 'PreciFácil <noreply@precifacil.app.br>',
            to: [email],
            subject: 'Seu período grátis termina em 2 dias ⏳',
            html,
          });
          if (emailError) { logStep('Failed (trial-2d)', { email, error: emailError }); totalErrors++; }
          else { logStep('Sent (trial-2d)', { email }); totalSent++; }
        } catch (err) { logStep('Error (trial-2d)', { email, error: err.message }); totalErrors++; }
      }
    }

    // ================================================================
    // EMAIL 3 — Assinatura renova em 2 DIAS
    // ================================================================
    {
      logStep('Checking subscriptions renewing in 2 days');

      const twoDaysFromNow = new Date(now);
      twoDaysFromNow.setDate(now.getDate() + 2);
      const renewStart = Math.floor(new Date(twoDaysFromNow).setHours(0, 0, 0, 0) / 1000);
      const renewEnd = Math.floor(new Date(twoDaysFromNow).setHours(23, 59, 59, 999) / 1000);

      // Product ID → plan mapping (prod + test)
      const planMap: Record<string, { name: string; price: string }> = {
        'prod_U5avmHLpzQ3Wwl': { name: 'Essencial', price: '29,00' },
        'prod_U6HzKp8Jup6nih': { name: 'Essencial', price: '29,00' },
        'prod_U5av2HKRFqJrDg': { name: 'Pro', price: '59,00' },
        'prod_U6I0MxAJP0ZqTg': { name: 'Pro', price: '59,00' },
      };

      // List active subscriptions from Stripe whose current_period_end falls in 2 days
      let hasMore = true;
      let startingAfter: string | undefined;
      let renewingSubs: Array<{ email: string; planName: string; planPrice: string }> = [];

      while (hasMore) {
        const params: any = { status: 'active', limit: 100, expand: ['data.customer'] };
        if (startingAfter) params.starting_after = startingAfter;

        const subs = await stripe.subscriptions.list(params);

        for (const sub of subs.data) {
          const periodEnd = typeof sub.current_period_end === 'number'
            ? sub.current_period_end
            : Math.floor(Date.parse(String(sub.current_period_end)) / 1000);

          if (periodEnd >= renewStart && periodEnd <= renewEnd) {
            const productId = sub.items.data[0]?.price?.product as string;
            const plan = planMap[productId];
            if (!plan) continue; // unknown product, skip

            const customer = sub.customer as any;
            const customerEmail = customer?.email;
            if (!customerEmail) continue;

            renewingSubs.push({ email: customerEmail, planName: plan.name, planPrice: plan.price });
          }
        }

        hasMore = subs.has_more;
        if (hasMore && subs.data.length > 0) {
          startingAfter = subs.data[subs.data.length - 1].id;
        }
      }

      logStep(`Found ${renewingSubs.length} subscriptions renewing in 2 days`);

      for (const { email, planName, planPrice } of renewingSubs) {
        // Try to get user name
        let firstName = 'Usuário';
        const matchedUser = allUsers.find((u) => u.email === email);
        if (matchedUser) {
          firstName = await getFirstName(matchedUser, supabase);
        }

        const html = layout(`
          ${p(`Olá, ${firstName}!`)}
          ${p(`Sua assinatura do plano <strong>${planName}</strong> será renovada automaticamente em <strong>2 dias</strong>.`)}
          ${p(`O valor de <strong>R$ ${planPrice}</strong> será cobrado no cartão cadastrado. Você não precisa fazer nada — tudo é automático!`)}
          ${p('Continue aproveitando todos os recursos do PreciFácil sem interrupção.')}
          ${btn('Gerenciar assinatura', `${SITE_URL}/app`)}
          ${small('Quer cancelar antes da renovação? Acesse suas configurações ou clique em Gerenciar assinatura.')}
          ${signature()}
        `);

        try {
          const { error: emailError } = await resend.emails.send({
            from: 'PreciFácil <noreply@precifacil.app.br>',
            to: [email],
            subject: 'Sua assinatura renova em 2 dias 🔄',
            html,
          });
          if (emailError) { logStep('Failed (renewal-2d)', { email, error: emailError }); totalErrors++; }
          else { logStep('Sent (renewal-2d)', { email }); totalSent++; }
        } catch (err) { logStep('Error (renewal-2d)', { email, error: err.message }); totalErrors++; }
      }
    }

    logStep('Completed', { totalSent, totalErrors });

    return new Response(
      JSON.stringify({ success: true, sent: totalSent, errors: totalErrors }),
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
