-- Add track column to monthly_projects
ALTER TABLE "monthly_projects"
  ADD COLUMN IF NOT EXISTS "track" TEXT NOT NULL DEFAULT 'javascript';

-- Drop old unique constraint and add new one including track
ALTER TABLE "monthly_projects"
  DROP CONSTRAINT IF EXISTS "monthly_projects_userId_month_key";

ALTER TABLE "monthly_projects"
  ADD CONSTRAINT "monthly_projects_userId_track_month_key" UNIQUE ("userId", "track", "month");
