import { expect, test } from '@playwright/test'

test('defaults to Simplified Chinese and persists an English selection', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible()
  await expect(page.getByRole('link', { name: '联系' })).toBeVisible()
  await expect(page.getByText('总览', { exact: true })).toBeVisible()

  const englishButton = page.getByRole('button', { name: '切换为英语' })
  await expect(englishButton).toHaveAttribute('aria-pressed', 'false')
  await englishButton.click()

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(
    page.getByRole('navigation', { name: 'Primary navigation' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible()
  await expect(page.getByText('Overview', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Switch to English' }),
  ).toHaveAttribute('aria-pressed', 'true')

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(
    page.getByRole('navigation', { name: 'Primary navigation' }),
  ).toBeVisible()
})

test('falls back to Chinese for an invalid cookie and switches on content pages', async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: 'waitforit-locale',
      url: 'http://localhost:3000',
      value: 'fr',
    },
  ])

  await page.goto('http://localhost:3000/projects', {
    waitUntil: 'networkidle',
  })

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByRole('heading', { name: '作品' })).toBeVisible()
  await page.getByRole('button', { name: '切换为英语' }).click()

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Back home' })).toBeVisible()

  await Promise.all([
    page.waitForURL('**/projects/xylo', { waitUntil: 'commit' }),
    page.getByRole('link', { name: 'XYLO' }).click(),
  ])
  await expect(page.getByText('Content coming soon')).toBeVisible({
    timeout: 30_000,
  })
})

test('renders the localized not-found page', async ({ page }) => {
  await page.goto('http://localhost:3000/projects/does-not-exist')

  await expect(page).toHaveTitle('Wait For It')
  await expect(page.getByRole('heading', { name: '页面未找到' })).toBeVisible()
  await expect(page.getByText('你访问的内容不存在或已被移除。')).toBeVisible()
})
