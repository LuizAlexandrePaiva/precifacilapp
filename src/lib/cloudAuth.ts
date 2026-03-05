import { lovable } from "@/integrations/lovable/index";

export async function signInWithGoogleOAuth() {
  const redirectUri = window.location.origin;
  console.log("🔑 [OAuth Debug] redirect_uri sendo enviada:", redirectUri);
  console.log("🔑 [OAuth Debug] window.location.href:", window.location.href);
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: redirectUri,
  });

  if (result.error) {
    return { error: result.error };
  }

  return { error: null };
}
