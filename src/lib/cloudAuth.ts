import { supabase } from "@/integrations/supabase/client";

const GOOGLE_REDIRECT_TO = "https://precifacil.app.br";

export async function signInWithGoogleOAuth() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: GOOGLE_REDIRECT_TO,
    },
  });

  return { error };
}
