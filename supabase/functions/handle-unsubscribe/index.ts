import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const emailType = url.searchParams.get("type");

    if (!userId || !emailType) {
      return new Response(renderPage("Parâmetros inválidos.", false), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const validTypes = ["recalculate_30d", "pending_proposals_7d", "all"];
    if (!validTypes.includes(emailType)) {
      return new Response(renderPage("Tipo de email inválido.", false), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const typesToInsert = emailType === "all"
      ? ["recalculate_30d", "pending_proposals_7d"]
      : [emailType];

    for (const t of typesToInsert) {
      await supabase.from("email_unsubscribes").upsert(
        { user_id: userId, email_type: t },
        { onConflict: "user_id,email_type" }
      );
    }

    return new Response(renderPage("Você foi descadastrado com sucesso. Não receberá mais este tipo de email.", true), {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new Response(renderPage("Erro ao processar solicitação. Tente novamente.", false), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});

function renderPage(message: string, success: boolean): string {
  const color = success ? "#16a34a" : "#dc2626";
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>PreciFácil</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Inter',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="max-width:480px;padding:40px;background:#fff;border-radius:12px;border:1px solid #E2E8F0;text-align:center;">
  <h1 style="font-size:24px;font-weight:800;color:#2563EB;margin-bottom:24px;">PreciFácil</h1>
  <p style="font-size:16px;color:${color};line-height:1.6;">${message}</p>
  <a href="https://precifacil.app.br" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#2563EB;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Voltar ao site</a>
</div>
</body></html>`;
}
