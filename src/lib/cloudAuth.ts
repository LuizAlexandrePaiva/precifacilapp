import { supabase } from "@/integrations/supabase/client";

export async function signInWithGoogleOAuth() {
  console.log("🔑 [OAuth Debug] Usando Supabase OAuth direto (sem broker Lovable)");
  console.log("🔑 [OAuth Debug] redirect_uri:", window.location.origin);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    return { error };
  }

  return { error: null };
}
