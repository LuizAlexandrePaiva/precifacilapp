
CREATE TABLE public.retention_emails_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_type text NOT NULL,
  trigger_ref text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, email_type, trigger_ref)
);

ALTER TABLE public.retention_emails_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.retention_emails_sent
  FOR ALL USING (false);
