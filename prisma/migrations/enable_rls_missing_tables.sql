-- Enable RLS on tables added after the initial RLS migration.
-- App accesses DB via Prisma (postgres superuser) which bypasses RLS;
-- this blocks direct PostgREST/anon key access to all tables.

ALTER TABLE public.github_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_pairs  ENABLE ROW LEVEL SECURITY;
