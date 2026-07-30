import { expect, type Page, test } from '@playwright/test'

async function findClickableCard(page: Page) {
  const canvas = page.locator('canvas')
  const hoverLabel = page.locator('canvas ~ div[data-visible]').first()
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-texture-count')))
    .toBeGreaterThan(0)
  await expect
    .poll(async () =>
      Number(await canvas.getAttribute('data-scene-visible-count')),
    )
    .toBeGreaterThan(0)
  const box = await canvas.boundingBox()
  if (!box) {
    throw new Error('Homepage canvas has no bounding box.')
  }

  for (let y = box.y + 80; y < box.y + box.height - 40; y += 40) {
    for (let x = box.x + 40; x < box.x + box.width - 40; x += 40) {
      await canvas.dispatchEvent('pointermove', {
        clientX: x,
        clientY: y,
        isPrimary: true,
        pointerId: 1,
        pointerType: 'mouse',
      })
      await page.waitForTimeout(20)
      const visible = await hoverLabel.getAttribute('data-visible')
      const title = await hoverLabel.textContent()
      if (visible === 'true' && title?.trim()) {
        return { title: title.trim(), x, y }
      }
    }
  }

  throw new Error('No raycastable homepage card was found.')
}

test('homepage scene loads canvas with WebGL and no console errors', async ({ page }) => {
  test.setTimeout(60_000)
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

test('clicking a rendered canvas card opens its detail route', async ({
  page,
}) => {
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  const card = await findClickableCard(page)
  const cardLink = page
    .locator('canvas ~ nav a')
    .filter({ hasText: card.title })
    .first()
  const href = await cardLink.getAttribute('href')
  expect(href).toMatch(/^\/(?:blog|novel|projects|resume)/)

  await Promise.all([
    page.waitForURL((url) => url.pathname === href, { waitUntil: 'commit' }),
    page.mouse.click(card.x, card.y),
  ])

  expect(errors).toEqual([])
})

test('shows usable project links when WebGL is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value(this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
        if (contextId === 'webgl' || contextId === 'webgl2') return null
        return Reflect.apply(originalGetContext, this, [contextId, ...args])
      },
    })
  })

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  await expect(page.locator('canvas')).toHaveAttribute(
    'data-webgl-unavailable',
    'true',
  )
  const fallbackNavigation = page.locator('canvas ~ nav')
  await expect(fallbackNavigation).toBeVisible()

  const firstLink = fallbackNavigation.getByRole('link').first()
  const href = await firstLink.getAttribute('href')
  expect(href).toBeTruthy()
  await Promise.all([
    page.waitForURL((url) => url.pathname === href),
    firstLink.click(),
  ])
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

test('preserves the scene runtime contract across the 768px boundary', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 844 })
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  const canvas = page.locator('canvas')
  const desktopHeader = page.locator('[data-header-layout="desktop"]')
  const mobileHeader = page.locator('[data-header-layout="mobile"]')
  await expect(canvas).toHaveAttribute('data-scene-layout', 'desktop')
  await expect(canvas).toHaveAttribute('data-camera-distance', '1500')
  await expect(desktopHeader).toHaveCSS('display', 'flex')
  await expect(mobileHeader).toHaveCSS('display', 'none')
  await expect
    .poll(async () =>
      Number(await canvas.getAttribute('data-scene-instance-count')),
    )
    .toBeGreaterThanOrEqual(20)
  await expect
    .poll(async () =>
      Number(await canvas.getAttribute('data-scene-visible-count')),
    )
    .toBeGreaterThanOrEqual(10)
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-texture-count')))
    .toBeGreaterThan(0)

  const textureCount = Number(await canvas.getAttribute('data-texture-count'))
  expect(textureCount).toBeLessThanOrEqual(20)

  await page.setViewportSize({ width: 767, height: 844 })
  await expect(canvas).toHaveAttribute('data-scene-layout', 'mobile')
  await expect(canvas).toHaveAttribute('data-camera-distance', '1150')
  await expect(desktopHeader).toHaveCSS('display', 'none')
  await expect(mobileHeader).toHaveCSS('display', 'block')

  await page.setViewportSize({ width: 768, height: 844 })
  await expect(canvas).toHaveAttribute('data-scene-layout', 'desktop')
  await expect(canvas).toHaveAttribute('data-camera-distance', '1500')
  await expect(desktopHeader).toHaveCSS('display', 'flex')
  await expect(mobileHeader).toHaveCSS('display', 'none')
})

test('handles WebGL context loss and restoration without losing the scene', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  const canvas = page.locator('canvas')
  await expect(canvas).toHaveAttribute('data-context-state', 'ready')

  const lossWasPrevented = await canvas.evaluate((element) => {
    const event = new Event('webglcontextlost', {
      bubbles: false,
      cancelable: true,
    })
    element.dispatchEvent(event)
    return event.defaultPrevented
  })

  expect(lossWasPrevented).toBeTruthy()
  await expect(canvas).toHaveAttribute('data-context-state', 'lost')

  await canvas.evaluate((element) => {
    element.dispatchEvent(new Event('webglcontextrestored'))
  })
  await expect(canvas).toHaveAttribute('data-context-state', 'restored')
  await expect
    .poll(async () =>
      Number(await canvas.getAttribute('data-scene-visible-count')),
    )
    .toBeGreaterThanOrEqual(10)
})

test('supports touch drag and reveals a tappable mobile card label', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Homepage canvas has no bounding box.')

  const beforeProgress = Number(
    await canvas.getAttribute('data-scene-progress'),
  )
  const x = box.x + box.width * 0.5
  const startY = box.y + box.height * 0.62

  await canvas.dispatchEvent('pointerdown', {
    clientX: x,
    clientY: startY,
    isPrimary: true,
    pointerId: 41,
    pointerType: 'touch',
  })
  await canvas.dispatchEvent('pointermove', {
    clientX: x,
    clientY: startY - 120,
    isPrimary: true,
    pointerId: 41,
    pointerType: 'touch',
  })
  await canvas.dispatchEvent('pointerup', {
    clientX: x,
    clientY: startY - 120,
    isPrimary: true,
    pointerId: 41,
    pointerType: 'touch',
  })

  await expect
    .poll(async () => Number(await canvas.getAttribute('data-scene-progress')))
    .not.toBe(beforeProgress)

  const selectedLink = page.locator('canvas ~ a[data-visible]')
  let selected = false
  let pointerId = 50
  for (let y = box.y + 140; y < box.y + box.height - 120 && !selected; y += 64) {
    for (let tapX = box.x + 36; tapX < box.x + box.width - 36; tapX += 52) {
      pointerId += 1
      await canvas.dispatchEvent('pointerdown', {
        clientX: tapX,
        clientY: y,
        isPrimary: true,
        pointerId,
        pointerType: 'touch',
      })
      await canvas.dispatchEvent('pointerup', {
        clientX: tapX,
        clientY: y,
        isPrimary: true,
        pointerId,
        pointerType: 'touch',
      })
      selected =
        (await selectedLink.getAttribute('data-visible')) === 'true'
      if (selected) break
    }
  }

  expect(selected).toBeTruthy()
  await expect(selectedLink).toHaveAttribute(
    'href',
    /^\/(?:blog|novel|projects|resume)/,
  )
  await expect(selectedLink).not.toHaveText('')
})

test('reveals the project index when a keyboard link receives focus', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  const projectNavigation = page.locator('canvas ~ nav')
  const firstProjectLink = projectNavigation.getByRole('link').first()
  await page.keyboard.press('Tab')

  await expect(firstProjectLink).toBeFocused()
  await expect(projectNavigation).toBeVisible()
  await expect(firstProjectLink).toHaveCSS('background-color', 'rgb(0, 47, 167)')
})

test('keeps photography out of homepage discovery', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

  await expect(page.locator('a[href^="/photography"]')).toHaveCount(0)
  const manifestLinks = await page
    .locator('canvas ~ nav a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
  expect(manifestLinks.some((href) => href?.startsWith('/photography'))).toBe(
    false,
  )
})
