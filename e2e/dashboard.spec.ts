import { test, expect } from './fixtures'

test.describe('Dashboard (authenticated)', () => {
  test('navigates to /dashboard without redirect', async ({ authedPage: page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('/learning loads without redirect', async ({ authedPage: page }) => {
    await page.goto('/learning')
    await expect(page).toHaveURL(/\/learning/)
  })

  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
