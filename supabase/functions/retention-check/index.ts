import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.1.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Email HTML helpers (mirrors src/lib/emailTemplates.ts) ──────────

const PRIMARY = "#2563EB";
const FOREGROUND = "#0A0F1E";
const MUTED = "#6B7280";
const BG_LIGHT = "#F8FAFC";
const BORDER = "#E2E8F0";
const SITE_URL = "https://precifacil.app.br";

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

// ── Email builders ──────────────────────────────────────────────────

function buildRecalculateEmail(firstName: string) {
  return {
    subject: "Seus custos mudaram? Hora de recalcular seu preço",
    html: layout(`
      ${p(`Olá, ${firstName}!`)}
      ${p("Já faz um mês desde o seu cadastro no PreciFácil. Nesse período, é natural que alguns dos seus custos tenham mudado: aluguel, ferramentas, impostos ou até o seu custo de vida.")}
      ${p("Manter o preço da sua hora atualizado é essencial para garantir que você esteja cobrando de forma justa e sustentável.")}
      ${p("Reserve 2 minutos para revisar seus números na calculadora:")}
      ${button("Atualizar minha calculadora", `${SITE_URL}/calculadora`)}
      ${muted("Recomendamos recalcular seu preço sempre que houver mudanças nos seus custos fixos ou variáveis.")}
      ${sig()}
    `),
  };
}

function buildPendingProposalsEmail(firstName: string, count: number) {
  const proposalText =
    count === 1 ? "1 proposta enviada" : `${count} propostas enviadas`;
  return {
    subject: "Você tem propostas aguardando atualização",
    html: layout(`
      ${p(`Olá, ${firstName}!`)}
      ${p(`Notamos que você tem ${proposalText} há mais de 7 dias sem atualização de status.`)}
      ${p("Manter o resultado das suas propostas atualizado ajuda você a acompanhar sua taxa de conversão e tomar decisões melhores sobre precificação.")}
      ${p("Acesse suas propostas e marque o resultado de cada uma:")}
      ${button("Ver minhas propostas", `${SITE_URL}/propostas`)}
      ${muted("Basta clicar em cada proposta e selecionar se foi aprovada ou recusada.")}
      ${sig()}
    `),
  };
}

// ── Main handler ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);
    const resend = new Resend(resendKey);

    const results = { recalculate: 0, pending_proposals: 0, errors: [] as string[] };

    // ── TRIGGER 1: 30 days after signup ─────────────────────────────
    // Find users who signed up 30+ days ago and haven't received this email
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: eligibleUsers, error: usersError } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .lte("created_at", thirtyDaysAgo);

    if (usersError) {
      console.error("Error fetching profiles:", usersError);
      results.errors.push(`profiles query: ${usersError.message}`);
    }

    if (eligibleUsers && eligibleUsers.length > 0) {
      // Get already-sent emails for this type
      const userIds = eligibleUsers.map((u: any) => u.id);
      const { data: alreadySent } = await supabase
        .from("retention_emails_sent")
        .select("user_id")
        .eq("email_type", "recalculate_30d")
        .in("user_id", userIds);

      const sentSet = new Set((alreadySent || []).map((r: any) => r.user_id));

      // Need user emails from auth — use service role to query auth users
      for (const profile of eligibleUsers) {
        if (sentSet.has(profile.id)) continue;

        // Get user email from auth
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
        if (authError || !authUser?.user?.email) {
          console.error("Error fetching auth user:", profile.id, authError);
          continue;
        }

        const firstName = profile.full_name?.split(" ")[0] || "Usuário";
        const { subject, html } = buildRecalculateEmail(firstName);

        const { error: sendError } = await resend.emails.send({
          from: "PreciFácil <noreply@precifacil.app.br>",
          to: [authUser.user.email],
          subject,
          html,
        });

        if (sendError) {
          console.error("Error sending recalculate email:", sendError);
          results.errors.push(`send recalculate to ${profile.id}: ${JSON.stringify(sendError)}`);
          continue;
        }

        // Record sent
        await supabase.from("retention_emails_sent").insert({
          user_id: profile.id,
          email_type: "recalculate_30d",
          trigger_ref: "signup_30d",
        });

        results.recalculate++;
      }
    }

    // ── TRIGGER 2: Proposals with status "enviada" for 7+ days ──────
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: staleProposals, error: proposalsError } = await supabase
      .from("proposals")
      .select("id, user_id, created_at")
      .eq("status", "enviada")
      .lte("created_at", sevenDaysAgo);

    if (proposalsError) {
      console.error("Error fetching proposals:", proposalsError);
      results.errors.push(`proposals query: ${proposalsError.message}`);
    }

    if (staleProposals && staleProposals.length > 0) {
      // Group by user
      const userProposalMap = new Map<string, string[]>();
      for (const prop of staleProposals) {
        const existing = userProposalMap.get(prop.user_id) || [];
        existing.push(prop.id);
        userProposalMap.set(prop.user_id, existing);
      }

      const affectedUserIds = Array.from(userProposalMap.keys());

      // Check already sent — trigger_ref is per-proposal batch snapshot
      // We use a composite ref: sorted proposal IDs hash to detect same set
      const { data: alreadySentProp } = await supabase
        .from("retention_emails_sent")
        .select("user_id, trigger_ref")
        .eq("email_type", "pending_proposals_7d")
        .in("user_id", affectedUserIds);

      // For pending proposals, we send once per user per unique set of proposal IDs
      const sentRefs = new Set(
        (alreadySentProp || []).map((r: any) => `${r.user_id}::${r.trigger_ref}`)
      );

      for (const [userId, proposalIds] of userProposalMap) {
        const triggerRef = proposalIds.sort().join(",");
        const key = `${userId}::${triggerRef}`;
        if (sentRefs.has(key)) continue;

        // Get user info
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .maybeSingle();

        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (authError || !authUser?.user?.email) continue;

        const firstName = profile?.full_name?.split(" ")[0] || "Usuário";
        const { subject, html } = buildPendingProposalsEmail(firstName, proposalIds.length);

        const { error: sendError } = await resend.emails.send({
          from: "PreciFácil <noreply@precifacil.app.br>",
          to: [authUser.user.email],
          subject,
          html,
        });

        if (sendError) {
          console.error("Error sending pending proposals email:", sendError);
          results.errors.push(`send proposals to ${userId}: ${JSON.stringify(sendError)}`);
          continue;
        }

        await supabase.from("retention_emails_sent").insert({
          user_id: userId,
          email_type: "pending_proposals_7d",
          trigger_ref: triggerRef,
        });

        results.pending_proposals++;
      }
    }

    console.log("Retention check complete:", results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Retention check error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
