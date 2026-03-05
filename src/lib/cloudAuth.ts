import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

const lovableAuth = createLovableAuth({
  oauthBrokerUrl: "https://oauth.lovable.app/initiate",
});

export async function signInWithGoogleOAuth() {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const result = await lovableAuth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
    extraParams: projectId ? { project_id: projectId } : undefined,
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
