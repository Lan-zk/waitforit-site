// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'
import '@testing-library/jest-dom/vitest'

process.env.DATABASE_URL = 'file:./data/test.db'
process.env.PAYLOAD_SECRET = 'integration-test-secret'
process.env.CONTENT_REPO_ROOT = './tests/fixtures/content-repo'
