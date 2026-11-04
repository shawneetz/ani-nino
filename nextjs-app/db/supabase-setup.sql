-- db/supabase-setup.sql
-- What this file does: after migrations have created the tables, it makes the
-- database read-only for the website and locks the public Supabase API.
-- Run once in the Supabase SQL editor. Replace the password before running.
-- Run section 3 again whenever you add new tables.

-- 1) Read-only login role used by the running website (DATABASE_URL).
CREATE ROLE anino_app LOGIN PASSWORD 'CHANGE_ME_STRONG_PASSWORD' CONNECTION LIMIT 10;

-- Even if someone grants more later, this role's sessions stay read-only.
ALTER ROLE anino_app SET default_transaction_read_only = on;
ALTER ROLE anino_app SET statement_timeout = '5s';

-- 2) Let the role see the public schema and read every current table.
GRANT USAGE ON SCHEMA public TO anino_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anino_app;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anino_app;

-- Tables created by future migrations (run as postgres) become readable too.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT ON TABLES TO anino_app;

-- 3) Row Level Security on every table.
-- Supabase exposes tables through a public REST API. With RLS on and no policy
-- for the anon/authenticated roles, that API can read and write nothing.
-- The only policy below lets anino_app SELECT. The postgres owner (used by
-- migrations and seeding) bypasses RLS.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS app_read ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY app_read ON public.%I FOR SELECT TO anino_app USING (true)', t);
  END LOOP;
END $$;

-- Check (connect as anino_app): this must fail.
--   INSERT INTO sources(id,title,publisher,kind) VALUES ('x','x','x','news');
