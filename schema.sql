-- Grants + RLS policies for Supabase (public schema).
-- Run after the tables are created (e.g., after Prisma migrations).

-- Ensure API roles can use the public schema.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

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
