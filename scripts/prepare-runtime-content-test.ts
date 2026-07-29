import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'

const workspaceRoot = process.cwd()
const testResultsRoot = path.resolve(workspaceRoot, 'test-results')
const runtimeRoot = path.resolve(testResultsRoot, 'runtime-content')
const fixtureRoot = path.resolve(
  workspaceRoot,
  'tests',
  'fixtures',
  'content-repo',
)

const relativeRuntimeRoot = path.relative(testResultsRoot, runtimeRoot)
if (
  relativeRuntimeRoot === '' ||
  relativeRuntimeRoot.startsWith('..') ||
  path.isAbsolute(relativeRuntimeRoot)
) {
  throw new Error(
    `Refusing to reset runtime content outside test-results: ${runtimeRoot}`,
  )
}

await rm(runtimeRoot, { force: true, recursive: true })
await mkdir(path.join(runtimeRoot, 'data'), { recursive: true })
await cp(fixtureRoot, path.join(runtimeRoot, 'content-repo'), {
  recursive: true,
})
