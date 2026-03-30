import { test as base, type Page } from '@playwright/test'
import { E2E_USER_ID } from './global-setup'

type Fixtures = {
  authedPage: Page
}

/**
 * Extends the base Playwright test with an `authedPage` fixture.
 * The page has a `x-test-user-id` cookie set, which proxy.ts and
 * getCurrentUser() recognize as a valid session when E2E_TEST=true.
 */
export const test = base.extend<Fixtures>({
  authedPage: async ({ browser }, use) => {
    const ctx = await browser.newContext()
    await ctx.addCookies([
      {
        name: 'x-test-user-id',
        value: E2E_USER_ID,
        domain: 'localhost',
        path: '/',
      },
    ])
    const page = await ctx.newPage()
    await use(page)
    await ctx.close()
  },
})

export { expect } from '@playwright/test'
