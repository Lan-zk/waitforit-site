import { exec } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

import { expect, test } from '@playwright/test'

const execAsync = promisify(exec)
const workspaceRoot = process.cwd()
const runtimeRoot = path.resolve(
  workspaceRoot,
  'test-results',
  'runtime-content',
)
const repositoryRoot = path.join(runtimeRoot, 'content-repo')
const articleDirectory = path.join(
  repositoryRoot,
  'content',
  'blog',
  'runtime-publishing',
)
const articlePath = path.join(articleDirectory, 'index.md')
const runtimeEnvironment = {
  ...process.env,
  CONTENT_REPO_ROOT: repositoryRoot,
  DATABASE_URL: `file:${path.join(runtimeRoot, 'data', 'payload.db')}`,
  PAYLOAD_SECRET: 'runtime-content-e2e-secret',
}

function assertInsideRuntimeRoot(targetPath: string) {
  const relativeTarget = path.relative(runtimeRoot, targetPath)
  expect(relativeTarget).not.toBe('')
  expect(relativeTarget.startsWith('..')).toBe(false)
  expect(path.isAbsolute(relativeTarget)).toBe(false)
}

async function runContentSync() {
  const result = await execAsync('npm run content:sync', {
    cwd: workspaceRoot,
    encoding: 'utf8',
    env: runtimeEnvironment,
    maxBuffer: 1024 * 1024,
    timeout: 180_000,
    windowsHide: true,
  })

  expect(result.stderr).not.toContain('ERROR')
  return result.stdout
}

test('publishes, updates, and removes Markdown without rebuilding the running site', async ({
  page,
}) => {
  assertInsideRuntimeRoot(articleDirectory)
  await mkdir(articleDirectory, { recursive: true })
  await writeFile(
    articlePath,
    `---
title: 运行时发布测试
language: zh-CN
summary: 验证运行中的站点可以同步 Git Markdown。
publishedAt: 2026-07-29T12:00:00+08:00
---

这是一段刚刚加入内容仓库的正文。
`,
    'utf8',
  )

  const createOutput = await runContentSync()
  expect(createOutput).toContain('"createdWritings": 4')

  await page.goto('/blog/runtime-publishing')
  await expect(
    page.getByRole('heading', { level: 1, name: '运行时发布测试' }),
  ).toBeVisible()
  await expect(
    page.getByText('这是一段刚刚加入内容仓库的正文。'),
  ).toBeVisible()

  const originalMarkdown = await readFile(articlePath, 'utf8')
  await writeFile(
    articlePath,
    originalMarkdown.replace(
      '这是一段刚刚加入内容仓库的正文。',
      '正文已经修改，页面无需重新构建。',
    ),
    'utf8',
  )

  await page.reload()
  await expect(page.getByText('正文已经修改，页面无需重新构建。')).toBeVisible()
  await expect(
    page.getByText('这是一段刚刚加入内容仓库的正文。'),
  ).toHaveCount(0)

  assertInsideRuntimeRoot(articleDirectory)
  await rm(articleDirectory, { force: true, recursive: true })
  const deleteOutput = await runContentSync()
  expect(deleteOutput).toContain('"deletedWritings": 1')

  const response = await page.goto('/blog/runtime-publishing')
  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { name: '页面未找到' }),
  ).toBeVisible()
})

test('renders the existing Resume Global with localized empty states', async ({
  page,
}) => {
  await page.goto('/resume')

  await expect(page.getByText('简历内容正在整理中。')).toBeVisible()
  await page.getByRole('button', { name: '切换为英语' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(
    page.getByText('Resume content is being prepared.'),
  ).toBeVisible()
})
