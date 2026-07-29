import path from 'node:path'

import { defineConfig, devices } from '@playwright/test'

const runtimeRoot = path.resolve('test-results', 'runtime-content')
const runtimeEnvironment = {
  ...process.env,
  CONTENT_REPO_ROOT: path.join(runtimeRoot, 'content-repo'),
  DATABASE_URL: `file:${path.join(runtimeRoot, 'data', 'payload.db')}`,
  PAYLOAD_SECRET: 'runtime-content-e2e-secret',
}

export default defineConfig({
  testDir: './tests/e2e-runtime',
  forbidOnly: true,
  fullyParallel: false,
  reporter: 'list',
  retries: 0,
  timeout: 240_000,
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
  },
  workers: 1,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run dev:e2e:content-runtime',
    env: {
      ...runtimeEnvironment,
      NODE_OPTIONS: '--no-deprecation',
    },
    reuseExistingServer: false,
    timeout: 180_000,
    url: 'http://localhost:3100',
  },
})
