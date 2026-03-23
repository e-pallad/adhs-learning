import { execSync } from "child_process"

export async function setup() {
  // DATABASE_URL is set by dotenv-cli (local) or workflow env (CI) before this runs
  execSync("npx prisma db push --force-reset", {
    stdio: "inherit",
    env: { ...process.env, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "continue with the tasks" },
  })
}

export async function teardown() {
  // Nothing — the Docker container handles cleanup
}
