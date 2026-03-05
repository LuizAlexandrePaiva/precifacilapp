
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS inclusos text DEFAULT '',
ADD COLUMN IF NOT EXISTS nao_inclusos text DEFAULT '',
ADD COLUMN IF NOT EXISTS forma_pagamento text DEFAULT '50% na assinatura · 50% na entrega final',
ADD COLUMN IF NOT EXISTS validade_dias integer DEFAULT 7,
ADD COLUMN IF NOT EXISTS freelancer_nome text DEFAULT '',
ADD COLUMN IF NOT EXISTS freelancer_email text DEFAULT '',
ADD COLUMN IF NOT EXISTS freelancer_whatsapp text DEFAULT '';
