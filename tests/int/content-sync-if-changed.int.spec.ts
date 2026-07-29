import { describe, expect, it, vi } from 'vitest'

import { synchronizeContentIfChanged } from '@/content/syncContentIfChanged'

describe('synchronizeContentIfChanged', () => {
  it('synchronizes a previously unseen commit and records it after success', async () => {
    const synchronize = vi.fn().mockResolvedValue({ writings: 3 })
    const writeLastSuccessfulSha = vi.fn().mockResolvedValue(undefined)

    const outcome = await synchronizeContentIfChanged({
      getCurrentSha: async () => 'commit-a\n',
      readLastSuccessfulSha: async () => null,
      synchronize,
      writeLastSuccessfulSha,
    })

    expect(outcome).toEqual({
      status: 'synchronized',
      sha: 'commit-a',
      report: { writings: 3 },
    })
    expect(synchronize).toHaveBeenCalledOnce()
    expect(writeLastSuccessfulSha).toHaveBeenCalledWith('commit-a')
  })

  it('skips Payload initialization when the current commit already succeeded', async () => {
    const synchronize = vi.fn()
    const writeLastSuccessfulSha = vi.fn()

    const outcome = await synchronizeContentIfChanged({
      getCurrentSha: async () => 'commit-a',
      readLastSuccessfulSha: async () => 'commit-a\n',
      synchronize,
      writeLastSuccessfulSha,
    })

    expect(outcome).toEqual({ status: 'skipped', sha: 'commit-a' })
    expect(synchronize).not.toHaveBeenCalled()
    expect(writeLastSuccessfulSha).not.toHaveBeenCalled()
  })

  it('does not advance the successful commit when synchronization fails', async () => {
    const writeLastSuccessfulSha = vi.fn()

    await expect(
      synchronizeContentIfChanged({
        getCurrentSha: async () => 'commit-b',
        readLastSuccessfulSha: async () => 'commit-a',
        synchronize: async () => {
          throw new Error('invalid frontmatter')
        },
        writeLastSuccessfulSha,
      }),
    ).rejects.toThrow('invalid frontmatter')

    expect(writeLastSuccessfulSha).not.toHaveBeenCalled()
  })

  it('retries the same commit after a failed attempt', async () => {
    let lastSuccessfulSha = 'commit-a'
    const synchronize = vi
      .fn()
      .mockRejectedValueOnce(new Error('database unavailable'))
      .mockResolvedValueOnce({ writings: 4 })

    const dependencies = {
      getCurrentSha: async () => 'commit-b',
      readLastSuccessfulSha: async () => lastSuccessfulSha,
      synchronize,
      writeLastSuccessfulSha: async (sha: string) => {
        lastSuccessfulSha = sha
      },
    }

    await expect(synchronizeContentIfChanged(dependencies)).rejects.toThrow(
      'database unavailable',
    )
    expect(lastSuccessfulSha).toBe('commit-a')

    await expect(synchronizeContentIfChanged(dependencies)).resolves.toEqual({
      status: 'synchronized',
      sha: 'commit-b',
      report: { writings: 4 },
    })
    expect(synchronize).toHaveBeenCalledTimes(2)
    expect(lastSuccessfulSha).toBe('commit-b')
  })
})
