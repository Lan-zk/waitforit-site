import { expect, test } from '@playwright/test'

test('homepage scene loads canvas with WebGL and no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('Failed to load resource')) {
        errors.push(text)
      }
    }
  })
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()

  const hasWebGL = await canvas.evaluate((el) => {
    const c = el as HTMLCanvasElement
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  })
  expect(hasWebGL).toBeTruthy()

  await page.mouse.move(720, 400)
  await page.mouse.wheel(0, 300)
  await page.waitForTimeout(400)
  await page.mouse.wheel(0, -300)
  await page.waitForTimeout(400)

  await page.mouse.move(900, 300)
  await page.waitForTimeout(300)

  expect(errors).toEqual([])
})

test('homepage scene works on mobile viewport (390x844)', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
      errors.push(msg.text())
    }
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()

  await page.mouse.move(195, 420)
  await page.mouse.wheel(0, 200)
  await page.waitForTimeout(400)

  expect(errors).toEqual([])
})
