
-- Proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente TEXT NOT NULL,
  projeto TEXT NOT NULL,
  escopo TEXT NOT NULL DEFAULT '',
  prazo NUMERIC NOT NULL DEFAULT 0,
  prazo_unidade TEXT NOT NULL DEFAULT 'horas',
  preco_hora NUMERIC NOT NULL DEFAULT 0,
  pacote TEXT NOT NULL DEFAULT 'basico',
  valor_pacote NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own proposals" ON public.proposals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own proposals" ON public.proposals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proposals" ON public.proposals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Projects (history) table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  cliente TEXT NOT NULL,
  projeto TEXT NOT NULL,
  valor_cotado NUMERIC NOT NULL DEFAULT 0,
  horas_reais NUMERIC,
  preco_min_hora NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aprovado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
