import { test, expect } from './fixtures'

test.describe('Dashboard (authenticated)', () => {
  test('navigates to /dashboard without redirect', async ({ authedPage: page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText('Demo mode is read-only.')).toBeVisible()
  })

  test('/learning loads without redirect', async ({ authedPage: page }) => {
    await page.goto('/learning')
    await expect(page).toHaveURL(/\/learning/)
    await expect(page.getByText('Month 1')).toBeVisible()
    await expect(page.getByText('Month 2')).toHaveCount(0)
  })

  test('demo users are redirected from non-demo months to month 1', async ({ authedPage: page }) => {
    await page.goto('/learning/2')
    await expect(page).toHaveURL(/\/learning\/1/)
    await expect(page.getByText('Demo mode is read-only.')).toBeVisible()
  })

  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
