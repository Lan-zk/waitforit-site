import { expect, test } from '@playwright/test'

test.describe('Git Markdown publishing', () => {
  test.describe.configure({ timeout: 90_000 })

  test('renders the blog list, GFM article, and controlled relative image', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/blog')

    await expect(
      page.getByRole('heading', { level: 1, name: '博客' }),
    ).toBeVisible()
    const blogCard = page.locator('[data-spotlight-card]')
    await expect(blogCard).toHaveCount(1)
    await expect(blogCard).toHaveCSS('text-decoration-line', 'none')
    await expect(blogCard).toHaveCSS('border-radius', '12px')

    const cardBox = await blogCard.boundingBox()
    expect(cardBox).not.toBeNull()
    await page.mouse.move(
      (cardBox?.x ?? 0) + (cardBox?.width ?? 0) / 2,
      (cardBox?.y ?? 0) + (cardBox?.height ?? 0) / 2,
    )
    await expect
      .poll(() =>
        blogCard.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--spotlight-opacity').trim(),
        ),
      )
      .toBe('1')

    await Promise.all([
      page.waitForURL(/\/blog\/site-content-publishing$/, { timeout: 30_000 }),
      page
        .getByRole('link', { name: /内容仓库如何驱动个人站/ })
        .click(),
    ])
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: '内容仓库如何驱动个人站',
      }),
    ).toHaveCount(1)
    await expect(
      page.locator('[data-reading-background="side-rays"]'),
    ).toBeVisible()
    await expect(
      page.locator('[data-reading-kind="blog"] canvas'),
    ).toBeVisible()
    await expect(page.locator('main')).toHaveCSS(
      'background-color',
      'rgba(14, 14, 14, 0.18)',
    )
    await expect(page.locator('[data-reading-scroll-reveal]')).toHaveCount(1)
    await expect(page.locator('footer')).toHaveCount(0)
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.locator('pre code')).toContainText('PublishedWriting')
    const image = page.getByRole('img', {
      name: '内容从写作仓库流向个人站的示意图',
    })
    await expect(image).toBeVisible()
    await expect(image).toHaveAttribute(
      'src',
      '/content-assets/blog/site-content-publishing/assets/publishing-flow.svg',
    )
    expect(await image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBe(
      1200,
    )

    await page.getByRole('button', { name: '切换为英语' }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('link', { name: 'Back to blog' })).toBeVisible()
    await expect(page.locator('article')).toHaveAttribute('lang', 'zh-CN')
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: '内容仓库如何驱动个人站',
      }),
    ).toBeVisible()
  })

  test('renders a series, ordered chapters, and chapter navigation', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/novel')
    const novelCard = page.locator('[data-spotlight-card]')
    await expect(novelCard).toHaveCount(1)
    await expect(novelCard).toHaveCSS('text-decoration-line', 'none')

    await novelCard.click()
    await page.waitForURL(/\/novel\/last-train$/, { timeout: 30_000 })

    await expect(
      page.getByRole('heading', { level: 1, name: '最后一班列车' }),
    ).toHaveCount(1)
    const chapters = page
      .getByRole('heading', { name: '章节目录' })
      .locator('..')
      .getByRole('listitem')
    await expect(chapters).toHaveCount(2)
    await expect(chapters.nth(0)).toContainText('抵达')
    await expect(chapters.nth(1)).toContainText('无名站台')

    await Promise.all([
      page.waitForURL(/\/novel\/last-train\/arrival$/, { timeout: 30_000 }),
      page.getByRole('link', { name: '抵达' }).click(),
    ])
    await expect(
      page.locator('[data-reading-background="galaxy"]'),
    ).toBeVisible()
    const scrollReveal = page.locator('[data-reading-scroll-reveal]')
    await expect(scrollReveal).toHaveCount(1)
    await expect(page.locator('footer')).toHaveCount(0)
    const lastParagraph = scrollReveal.locator(':scope > p').last()
    await expect
      .poll(() =>
        lastParagraph.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).opacity),
        ),
      )
      .toBeLessThan(1)
    await lastParagraph.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        lastParagraph.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).opacity),
        ),
      )
      .toBeGreaterThan(0.98)
    await expect(page.locator('article')).toHaveAttribute('lang', 'zh-CN')
    await expect(page.getByText('雨是在晚上十点后变大的。')).toBeVisible()
    await Promise.all([
      page.waitForURL(/\/novel\/last-train\/platform$/, { timeout: 30_000 }),
      page.getByRole('link', { name: /下一章.*无名站台/ }).click(),
    ])
    await expect(page.getByText('列车停稳后，只有第三节车厢开了门。')).toBeVisible()
  })

  test('uses the static reading fallback when reduced motion is requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('http://localhost:3000/blog/site-content-publishing')

    await expect(
      page.locator('[data-reading-background="fallback"]'),
    ).toBeVisible()
    await expect(page.locator('[data-reading-background] canvas')).toHaveCount(0)
    const firstBlock = page.locator('[data-reading-scroll-reveal] > *').first()
    await expect(firstBlock).toHaveCSS('filter', 'none')
    await expect(firstBlock).toHaveCSS('opacity', '1')
  })

  test('keeps wide Markdown content inside a 390px mobile viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 })
    await page.goto('http://localhost:3000/blog/site-content-publishing')

    const main = page.locator('main')
    await expect(main).toBeVisible()
    const dimensions = await main.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.locator('pre')).toBeVisible()
  })

  test('keeps scrolling reading content behind the mobile header scrim', async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 })
    await page.goto('http://localhost:3000/blog/site-content-publishing')
    await page.evaluate(() => window.scrollTo(0, 240))

    const scrim = await page.locator('body > header').evaluate((element) => {
      const styles = getComputedStyle(element, '::before')
      return {
        backgroundImage: styles.backgroundImage,
        height: styles.height,
      }
    })

    expect(scrim.height).toBe('128px')
    expect(scrim.backgroundImage).toContain('linear-gradient')
  })

  test('keeps the mobile document footer compact', async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 })
    await page.goto('http://localhost:3000/novel')

    const footer = page.locator('footer')
    const footerBox = await footer.boundingBox()

    expect(footerBox).not.toBeNull()
    expect(footerBox?.height).toBeLessThanOrEqual(180)
  })

  test('returns the controlled not-found page for missing metadata', async ({
    page,
  }) => {
    const response = await page.goto(
      'http://localhost:3000/blog/does-not-exist',
    )

    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { name: '页面未找到' }),
    ).toBeVisible()
  })
})
