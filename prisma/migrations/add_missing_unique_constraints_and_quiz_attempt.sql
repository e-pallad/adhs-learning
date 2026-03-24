-- Applied 2026-03-24
-- All unique constraints were missing from the initial schema push.
-- Prisma upsert uses ON CONFLICT which requires unique indexes to exist.

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key"
  ON "users"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "daily_logs_userId_date_key"
  ON "daily_logs"("userId", "date");

CREATE UNIQUE INDEX IF NOT EXISTS "block_progress_userId_blockId_key"
  ON "block_progress"("userId", "blockId");

CREATE UNIQUE INDEX IF NOT EXISTS "roadmap_progress_userId_roadmapId_nodeId_key"
  ON "roadmap_progress"("userId", "roadmapId", "nodeId");

CREATE UNIQUE INDEX IF NOT EXISTS "monthly_projects_userId_month_key"
  ON "monthly_projects"("userId", "month");

CREATE UNIQUE INDEX IF NOT EXISTS "achievements_userId_slug_key"
  ON "achievements"("userId", "slug");

-- QuizAttempt table was never created (quiz_attempt.sql was not applied)
CREATE TABLE IF NOT EXISTS "QuizAttempt" (
  "id"          TEXT         NOT NULL,
  "userId"      TEXT         NOT NULL,
  "blockId"     TEXT         NOT NULL,
  "score"       INTEGER      NOT NULL,
  "passed"      BOOLEAN      NOT NULL,
  "perfect"     BOOLEAN      NOT NULL,
  "xpEarned"    INTEGER      NOT NULL DEFAULT 0,
  "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "QuizAttempt_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "QuizAttempt_userId_blockId_idx"
  ON "QuizAttempt"("userId", "blockId");
