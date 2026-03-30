import { execSync } from 'child_process'
import * as dotenv from 'dotenv'
import { Pool } from 'pg'

// Load test env vars (DATABASE_URL pointing to port 5433, etc.)
dotenv.config({ path: '.env.test' })

export const E2E_USER_ID = 'e2e-user-1'

export default async function globalSetup() {
  // Push schema to test DB (same as Vitest global setup)
  execSync('npx prisma db push --force-reset', {
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'continue with the tasks',
    },
  })

  // Seed the E2E test user via raw SQL to avoid Prisma CJS/ESM issues
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  await pool.query(
    `INSERT INTO users (id, email, name, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NOW(), NOW())
     ON CONFLICT (id) DO NOTHING`,
    [E2E_USER_ID, `${E2E_USER_ID}@test.devfluent`, 'E2E Test User']
  )
  await pool.end()
}
