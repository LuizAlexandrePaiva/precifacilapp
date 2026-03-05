import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

const lovableAuth = createLovableAuth();

export async function signInWithGoogleOAuth() {
  const result = await lovableAuth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });

  if (result.redirected) {
    return { error: null };
  }

  if (result.error) {
    return { error: result.error };
  }

  await supabase.auth.setSession(result.tokens);
  return { error: null };
}
