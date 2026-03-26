-- Add streakFreezeUsedAt column to User table
-- Records when the streak freeze was last used; NULL means never used
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "streakFreezeUsedAt" TIMESTAMP(3);

-- Add track column to User table with default 'javascript'
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "track" TEXT NOT NULL DEFAULT 'javascript';
