CREATE TABLE IF NOT EXISTS "waitlist_entries" (
  "id"        TEXT        NOT NULL PRIMARY KEY,
  "email"     TEXT        NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "waitlist_entries_email_key" UNIQUE ("email")
);
