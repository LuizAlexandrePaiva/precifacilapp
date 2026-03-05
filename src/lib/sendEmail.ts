import { supabase } from '@/integrations/supabase/client';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    });

    if (error) {
      console.error('[sendEmail] Erro ao enviar email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[sendEmail] Exceção:', err);
    return { success: false, error: err.message };
  }
}
