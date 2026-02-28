-- Grants + RLS policies for Supabase (public schema).
-- Run after the tables are created (e.g., after Prisma migrations).

-- Ensure API roles can use the public schema.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT CREATE ON SCHEMA public TO service_role;
ALTER ROLE service_role SET search_path = public;

-- Table privileges.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Sequence privileges (for any serial/identity sequences).
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Default privileges for future tables/sequences.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- Enable RLS.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Policies (drop-and-create so reruns are safe).
DROP POLICY IF EXISTS "Users can manage own row" ON public.users;
CREATE POLICY "Users can manage own row"
  ON public.users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Leads are owned by user" ON public.leads;
CREATE POLICY "Leads are owned by user"
  ON public.leads
  FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Messages are owned by user" ON public.messages;
CREATE POLICY "Messages are owned by user"
  ON public.messages
  FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Reminders are owned by user" ON public.reminders;
CREATE POLICY "Reminders are owned by user"
  ON public.reminders
  FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- Beta waitlist
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.beta_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.beta_waitlist TO anon, authenticated, service_role;

ALTER TABLE public.beta_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can join waitlist" ON public.beta_waitlist;
CREATE POLICY "Public can join waitlist"
  ON public.beta_waitlist
  FOR INSERT
  WITH CHECK (true);
