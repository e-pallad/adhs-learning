import { execSync } from "child_process"

export async function setup() {
  // DATABASE_URL is set by dotenv-cli (local) or workflow env (CI) before this runs
  execSync("npx prisma db push --force-reset --skip-generate", {
    stdio: "inherit",
    env: { ...process.env },
  })
}

export async function teardown() {
  // Nothing — the Docker container handles cleanup
}
