import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
  },
  // Run tests serially — they share one test DB container
  workers: 1,
  webServer: {
    command: 'E2E_TEST=true next dev',
    url: 'http://localhost:3000',
    // Always start fresh — E2E_TEST=true must be in the server environment
    reuseExistingServer: false,
  },
})
