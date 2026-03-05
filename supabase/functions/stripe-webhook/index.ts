import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@4.1.2";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
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

// ── Enviar email ──

async function sendEmail(resend: InstanceType<typeof Resend>, to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: 'PreciFácil <noreply@precifacil.app.br>',
    to: [to],
    subject,
    html,
  });
  if (error) {
    logStep('Email send error', error);
    throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
  }
  logStep('Email sent successfully', { to, subject, id: data?.id });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2025-08-27.basil' });
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    logStep('Missing stripe-signature header');
    return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 400, headers: corsHeaders });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    logStep('Webhook signature verification failed', { error: err.message });
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers: corsHeaders });
  }

  logStep('Event received', { type: event.type, id: event.id });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  // Buscar nome do usuário no perfil
  async function getUserName(email: string): Promise<string> {
    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const user = usersData?.users?.find(u => u.email === email);
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (profile?.full_name) return profile.full_name;
        if (user.user_metadata?.full_name) return user.user_metadata.full_name;
        if (user.user_metadata?.name) return user.user_metadata.name;
      }
    } catch (err) {
      logStep('Error fetching user name', { error: err.message });
    }
    return 'Usuário';
  }

  try {
    switch (event.type) {
      // ── PAGAMENTO CONFIRMADO ──
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const email = paymentIntent.receipt_email || paymentIntent.metadata?.email;
        if (!email) {
          logStep('No email found on payment_intent, trying customer lookup');
          break;
        }

        const amountFormatted = (paymentIntent.amount / 100).toFixed(2).replace('.', ',');
        const date = new Date().toLocaleDateString('pt-BR');
        const planName = paymentIntent.metadata?.plan_name || 'Essencial';
        const userName = paymentIntent.metadata?.user_name || await getUserName(email);

        const html = layout(`
          ${p(`Olá, ${userName.split(' ')[0]}!`)}
          ${p('Seu pagamento foi processado com sucesso. Confira os detalhes abaixo:')}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
            <tr><td style="padding:12px 16px;background-color:${BG_LIGHT};font-size:13px;color:${MUTED};font-weight:600;">Plano</td><td style="padding:12px 16px;background-color:${BG_LIGHT};font-size:15px;color:${FOREGROUND};font-weight:600;text-align:right;">${planName}</td></tr>
            <tr><td style="padding:12px 16px;font-size:13px;color:${MUTED};font-weight:600;">Valor</td><td style="padding:12px 16px;font-size:15px;color:${FOREGROUND};font-weight:600;text-align:right;">R$ ${amountFormatted}</td></tr>
            <tr><td style="padding:12px 16px;background-color:${BG_LIGHT};font-size:13px;color:${MUTED};font-weight:600;">Data</td><td style="padding:12px 16px;background-color:${BG_LIGHT};font-size:15px;color:${FOREGROUND};text-align:right;">${date}</td></tr>
          </table>
          ${btn('Acessar minha conta', SITE_URL)}
          ${small('Obrigado por confiar no PreciFácil!')}
          ${signature()}
        `);

        await sendEmail(resend, email, 'Pagamento confirmado — PreciFácil', html);
        break;
      }

      // ── UPGRADE DE PLANO ──
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = (event.data as any).previous_attributes;

        if (!previousAttributes?.items) {
          logStep('Subscription updated but no plan change detected, skipping');
          break;
        }

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = customer.email;
        if (!email) break;

        const productId = subscription.items.data[0]?.price?.product as string;
        const product = await stripe.products.retrieve(productId);
        const newPlan = product.name || 'Pro';
        const userName = customer.name || await getUserName(email);

        const features = newPlan.toLowerCase().includes('pro')
          ? `<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};"><li>Exportação de propostas em PDF</li><li>Dashboard completo com gráficos</li><li>Cálculos e propostas ilimitados</li><li>Suporte via WhatsApp</li></ul>`
          : `<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:${FOREGROUND};"><li>Cálculos e propostas ilimitados</li><li>Histórico completo de projetos</li><li>Geração de propostas profissionais</li></ul>`;

        const html = layout(`
          ${p(`Olá, ${userName.split(' ')[0]}!`)}
          ${p(`Seu plano foi atualizado para <strong>${newPlan}</strong> com sucesso.`)}
          ${p('Com o upgrade, você desbloqueou os seguintes recursos:')}
          ${features}
          ${btn('Explorar novos recursos', SITE_URL)}
          ${small('Aproveite tudo o que o PreciFácil tem a oferecer!')}
          ${signature()}
        `);

        await sendEmail(resend, email, 'Seu plano foi atualizado — PreciFácil', html);
        break;
      }

      // ── CANCELAMENTO ──
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = customer.email;
        if (!email) break;

        const userName = customer.name || await getUserName(email);
        const accessUntil = new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR');

        const html = layout(`
          ${p(`Olá, ${userName.split(' ')[0]}!`)}
          ${p('Confirmamos o cancelamento da sua assinatura no PreciFácil.')}
          ${p(`Seu acesso aos recursos do plano permanece ativo até <strong>${accessUntil}</strong>. Após essa data, sua conta será revertida para o plano gratuito.`)}
          ${p('Caso mude de ideia, você pode reativar sua assinatura a qualquer momento:')}
          ${btn('Reativar assinatura', `${SITE_URL}/app`)}
          ${small('Sentiremos sua falta! Estaremos aqui quando precisar.')}
          ${signature()}
        `);

        await sendEmail(resend, email, 'Assinatura cancelada — PreciFácil', html);
        break;
      }

      default:
        logStep('Unhandled event type', { type: event.type });
    }
  } catch (err) {
    logStep('Error processing webhook event', { error: err.message });
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
