import { test as base, type Page } from '@playwright/test'
type Fixtures = {
  authedPage: Page
}

/**
 * Extends the base Playwright test with an `authedPage` fixture.
 * The page has the demo-session cookie set, matching the same flow
 * used by visitors who click "Try demo mode" on the login screen.
 */
export const test = base.extend<Fixtures>({
  authedPage: async ({ browser }, use) => {
    const ctx = await browser.newContext()
    await ctx.addCookies([
      {
        name: 'devfluent_demo',
        value: '1',
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
