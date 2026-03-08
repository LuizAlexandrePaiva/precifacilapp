
-- Add ON DELETE CASCADE to profiles table (references auth.users)
-- First drop existing FK if any, then re-add with cascade
-- profiles.id references auth.users(id)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- projects.user_id should cascade on user delete
-- First check and drop existing constraint
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT constraint_name INTO fk_name
  FROM information_schema.table_constraints
  WHERE table_schema = 'public' AND table_name = 'projects' AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%user_id%';
  IF fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.projects DROP CONSTRAINT ' || fk_name;
  END IF;
END $$;

-- proposals.user_id should cascade on user delete  
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT constraint_name INTO fk_name
  FROM information_schema.table_constraints
  WHERE table_schema = 'public' AND table_name = 'proposals' AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%user_id%';
  IF fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.proposals DROP CONSTRAINT ' || fk_name;
  END IF;
END $$;

-- projects.proposal_id should cascade when proposal is deleted
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_proposal_id_fkey;
ALTER TABLE public.projects ADD CONSTRAINT projects_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE SET NULL;
