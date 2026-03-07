const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Não encontramos uma conta com este e-mail. Verifique o e-mail ou crie uma conta gratuitamente.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
  'User already registered': 'Este e-mail já possui uma conta. Tente Fazer login ou recupere sua senha.',
  'Signup requires a valid password': 'Informe uma senha válida.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'For security purposes, you can only request this after': 'Aguarde alguns segundos antes de tentar novamente.',
};

export function translateSupabaseError(message: string, context?: 'login' | 'signup'): string {
  // Check exact matches first
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (message.includes(key)) {
      return value;
    }
  }

  // Fallback: return a generic PT-BR message
  if (context === 'login') return 'Erro ao entrar. Tente novamente.';
  if (context === 'signup') return 'Erro ao criar conta. Tente novamente.';
  return 'Ocorreu um erro. Tente novamente.';
}
