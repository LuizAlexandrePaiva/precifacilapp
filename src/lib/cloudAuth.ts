import { supabase } from "@/integrations/supabase/client";

export async function signInWithGoogleOAuth() {
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/app`,
    },
  });

  if (error) {
    return { error };
  }

  return { error: null };
}
