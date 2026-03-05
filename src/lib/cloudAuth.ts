import { lovable } from "@/integrations/lovable/index";

export async function signInWithGoogleOAuth() {
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });

  if (result.error) {
    return { error: result.error };
  }

  return { error: null };
}
