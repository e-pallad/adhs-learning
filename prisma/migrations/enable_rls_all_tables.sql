-- Enable RLS on all public tables (app accesses DB via Prisma/postgres superuser
-- which bypasses RLS; this blocks direct PostgREST/anon access to all tables)

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_courses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."QuizAttempt"      ENABLE ROW LEVEL SECURITY;
