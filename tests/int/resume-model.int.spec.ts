import type { Payload, Field } from 'payload'
import { getPayload } from 'payload'

import { Resume } from '@/globals/Resume'
import config from '@/payload.config'
import type { Resume as ResumeData } from '@/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let original: ResumeData

function collectFieldNames(fields: Field[]): string[] {
  return fields.flatMap((field) => {
    const name = 'name' in field && typeof field.name === 'string' ? [field.name] : []
    const nested = 'fields' in field && Array.isArray(field.fields)
      ? collectFieldNames(field.fields)
      : []

    return [...name, ...nested]
  })
}

describe('structured resume model', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
    original = await payload.findGlobal({ slug: 'resume', depth: 0 })
  })

  afterAll(async () => {
    if (!payload || !original) return

    await payload.updateGlobal({
      slug: 'resume',
      data: {
        coreCapabilities: original.coreCapabilities ?? [],
        currentFocus: original.currentFocus ?? [],
        governanceCases: original.governanceCases ?? [],
        positioning: original.positioning ?? {
          displayName: null,
          experienceYears: null,
          headline: null,
          summary: null,
        },
        professionalProjects: original.professionalProjects ?? [],
        publicProducts:
          original.publicProducts?.map((project) =>
            typeof project === 'object' ? project.id : project,
          ) ?? [],
        skillGroups: original.skillGroups ?? [],
      },
    })
  })

  it('defines the approved modules without private identity fields', () => {
    const names = collectFieldNames(Resume.fields)

    expect(names).toEqual(
      expect.arrayContaining([
        'positioning',
        'coreCapabilities',
        'professionalProjects',
        'publicProducts',
        'governanceCases',
        'skillGroups',
        'currentFocus',
        'content',
      ]),
    )
    expect(names).not.toEqual(
      expect.arrayContaining([
        'photo',
        'maritalStatus',
        'privatePhone',
        'school',
        'trainingProvider',
        'employer',
        'hospital',
        'customer',
      ]),
    )
  })

  it('supports trusted structured writes and anonymous reads', async () => {
    const marker = `resume-${Date.now()}`

    await expect(
      payload.updateGlobal({
        slug: 'resume',
        data: {
          positioning: { headline: marker },
        },
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await payload.updateGlobal({
      slug: 'resume',
      data: {
        coreCapabilities: [
          {
            summary: 'A structured capability',
            tags: [{ name: 'Payload' }],
            title: marker,
          },
        ],
        positioning: {
          headline: marker,
        },
      },
    })

    const anonymousRead = await payload.findGlobal({
      slug: 'resume',
      depth: 0,
      overrideAccess: false,
    })

    expect(anonymousRead.positioning?.headline).toBe(marker)
    expect(anonymousRead.coreCapabilities?.[0]).toMatchObject({
      title: marker,
      tags: [{ name: 'Payload' }],
    })
  })
})
