import 'dotenv/config'

import { getPayload } from 'payload'

import { getContentRepositoryRoot } from '../src/content/paths'
import { syncContentRepository } from '../src/content/syncContent'
import config from '../src/payload.config'

const payload = await getPayload({ config })

try {
  const report = await syncContentRepository(payload, {
    repositoryRoot: getContentRepositoryRoot(),
  })
  console.log(JSON.stringify(report, null, 2))
} finally {
  await payload.destroy()
}
