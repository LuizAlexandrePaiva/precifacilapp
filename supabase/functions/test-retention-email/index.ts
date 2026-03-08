import { Resend } from "https://esm.sh/resend@4.1.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRIMARY = "#2563EB";
const FOREGROUND = "#0A0F1E";
const MUTED = "#6B7280";
const BG_LIGHT = "#F8FAFC";
const BORDER = "#E2E8F0";
const SITE_URL = "https://precifacil.app.br";
const UNSUBSCRIBE_BASE = `${Deno.env.get("SUPABASE_URL")}/functions/v1/handle-unsubscribe`;

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>PreciFácil</title></head>
<body style="margin:0;padding:0;background-color:${BG_LIGHT};font-family:'Inter',Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_LIGHT};">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">
<tr><td style="background-color:${PRIMARY};padding:28px 32px;text-align:center;">
<span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Preci</span><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;opacity:0.85;">Fácil</span>
</td></tr>
<tr><td style="padding:32px;">${content}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid ${BORDER};text-align:center;">
<p style="margin:0;font-size:12px;color:${MUTED};line-height:1.5;">PreciFácil &middot; <a href="${SITE_URL}" style="color:${PRIMARY};text-decoration:none;">precifacil.app.br</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function button(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
<tr><td style="background-color:${PRIMARY};border-radius:8px;">
<a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${text}</a>
</td></tr></table>`;
}

const p = (t: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${FOREGROUND};">${t}</p>`;
const muted = (t: string) =>
  `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:${MUTED};">${t}</p>`;
const sig = () =>
  `<p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:${FOREGROUND};">Equipe PreciFácil</p>`;

function unsubLink(userId: string, emailType: string): string {
  const url = `${UNSUBSCRIBE_BASE}?user_id=${userId}&type=${emailType}`;
  return `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:${MUTED};text-align:center;">
<a href="${url}" style="color:${MUTED};text-decoration:underline;">Cancelar recebimento destes emails</a></p>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const resend = new Resend(resendKey);

    const { type, to } = await req.json();
    const email = to || "lapsantis@gmail.com";
    const testUserId = "00000000-0000-0000-0000-000000000000";

    let subject: string;
    let html: string;
    let emailType: string;

    if (type === "recalculate") {
      emailType = "recalculate_30d";
      subject = "Seus custos mudaram? Hora de recalcular seu preço";
      html = layout(`
        ${p("Olá, Teste!")}
        ${p("Já faz um mês desde o seu cadastro no PreciFácil. Nesse período, é natural que alguns dos seus custos tenham mudado: aluguel, ferramentas, impostos ou até o seu custo de vida.")}
        ${p("Manter o preço da sua hora atualizado é essencial para garantir que você esteja cobrando de forma justa e sustentável.")}
        ${p("Reserve 2 minutos para revisar seus números na calculadora:")}
        ${button("Atualizar minha calculadora", `${SITE_URL}/calculadora`)}
        ${muted("Recomendamos recalcular seu preço sempre que houver mudanças nos seus custos fixos ou variáveis.")}
        ${sig()}
        ${unsubLink(testUserId, emailType)}
      `);
    } else if (type === "proposals") {
      emailType = "pending_proposals_7d";
      subject = "Você tem propostas aguardando atualização";
      html = layout(`
        ${p("Olá, Teste!")}
        ${p("Notamos que você tem 3 propostas enviadas há mais de 7 dias sem atualização de status.")}
        ${p("Manter o resultado das suas propostas atualizado ajuda você a acompanhar sua taxa de conversão e tomar decisões melhores sobre precificação.")}
        ${p("Acesse suas propostas e marque o resultado de cada uma:")}
        ${button("Ver minhas propostas", `${SITE_URL}/propostas`)}
        ${muted("Basta clicar em cada proposta e selecionar se foi aprovada ou recusada.")}
        ${sig()}
        ${unsubLink(testUserId, emailType)}
      `);
    } else {
      return new Response(
        JSON.stringify({ error: 'Tipo inválido. Use "recalculate" ou "proposals".' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const unsubUrl = `${UNSUBSCRIBE_BASE}?user_id=${testUserId}&type=${emailType}`;

    const { data, error } = await resend.emails.send({
      from: "PreciFácil <noreply@precifacil.app.br>",
      to: [email],
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data, sent_to: email, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
