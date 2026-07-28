import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle('Wait For It')
    await expect(page.getByRole('link', { name: 'Wait For It' })).toBeVisible()
  })
})
