-- Add enums and Subscription table for the new billing tier model.
CREATE TYPE IF NOT EXISTS "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'LIFETIME');
CREATE TYPE IF NOT EXISTS "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING');

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE';

CREATE TABLE IF NOT EXISTS subscriptions (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "stripeCustomerId" TEXT UNIQUE,
  "stripeSubId" TEXT UNIQUE,
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES users("id") ON DELETE CASCADE
);
