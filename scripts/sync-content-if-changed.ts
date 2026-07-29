import 'dotenv/config'

import { getContentRepositoryRoot } from '../src/content/paths'
import {
  readGitHead,
  readSuccessfulSha,
  synchronizeContentIfChanged,
  writeSuccessfulSha,
} from '../src/content/syncContentIfChanged'

const repositoryRoot = getContentRepositoryRoot()
const stateFile =
  process.env.CONTENT_SYNC_STATE_FILE ??
  '/app/data/content-sync-last-successful-sha'

const outcome = await synchronizeContentIfChanged({
  getCurrentSha: () => readGitHead(repositoryRoot),
  readLastSuccessfulSha: () => readSuccessfulSha(stateFile),
  synchronize: async () => {
    const [{ getPayload }, { syncContentRepository }, { default: config }] =
      await Promise.all([
        import('payload'),
        import('../src/content/syncContent'),
        import('../src/payload.config'),
      ])
    const payload = await getPayload({ config })

    try {
      return await syncContentRepository(payload, { repositoryRoot })
    } finally {
      await payload.destroy()
    }
  },
  writeLastSuccessfulSha: (sha) => writeSuccessfulSha(stateFile, sha),
})

console.log(JSON.stringify(outcome, null, 2))
