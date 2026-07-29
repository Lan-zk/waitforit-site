import { spawn } from 'node:child_process'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export type ContentSyncOutcome<T> =
  | {
      status: 'skipped'
      sha: string
    }
  | {
      status: 'synchronized'
      sha: string
      report: T
    }

export interface ContentSyncIfChangedDependencies<T> {
  getCurrentSha: () => Promise<string>
  readLastSuccessfulSha: () => Promise<string | null>
  synchronize: () => Promise<T>
  writeLastSuccessfulSha: (sha: string) => Promise<void>
}

function normalizeSha(value: string, source: string) {
  const sha = value.trim()
  if (!sha) {
    throw new Error(`${source} returned an empty Git commit SHA.`)
  }
  return sha
}

export async function synchronizeContentIfChanged<T>(
  dependencies: ContentSyncIfChangedDependencies<T>,
): Promise<ContentSyncOutcome<T>> {
  const currentSha = normalizeSha(
    await dependencies.getCurrentSha(),
    'getCurrentSha',
  )
  const lastSuccessfulSha = (await dependencies.readLastSuccessfulSha())?.trim()

  if (currentSha === lastSuccessfulSha) {
    return {
      status: 'skipped',
      sha: currentSha,
    }
  }

  const report = await dependencies.synchronize()
  await dependencies.writeLastSuccessfulSha(currentSha)

  return {
    status: 'synchronized',
    sha: currentSha,
    report,
  }
}

async function runCommand(command: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
        return
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}${
            stderr.trim() ? `: ${stderr.trim()}` : ''
          }`,
        ),
      )
    })
  })
}

export function readGitHead(repositoryRoot: string) {
  return runCommand('git', ['-C', repositoryRoot, 'rev-parse', 'HEAD'])
}

export async function readSuccessfulSha(stateFile: string) {
  try {
    return await readFile(stateFile, 'utf8')
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return null
    }
    throw error
  }
}

export async function writeSuccessfulSha(stateFile: string, sha: string) {
  const stateDirectory = dirname(stateFile)
  const temporaryStateFile = `${stateFile}.${process.pid}.${randomUUID()}.tmp`

  await mkdir(stateDirectory, { recursive: true })
  try {
    await writeFile(temporaryStateFile, `${sha}\n`, 'utf8')
    await rename(temporaryStateFile, stateFile)
  } finally {
    await rm(temporaryStateFile, { force: true })
  }
}
