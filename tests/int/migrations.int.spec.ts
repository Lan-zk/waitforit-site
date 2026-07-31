import { createClient } from '@libsql/client'
import type { MigrateUpArgs } from '@payloadcms/db-sqlite'
import { sql } from '@payloadcms/db-sqlite'
import { drizzle } from 'drizzle-orm/libsql'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import * as initial from '@/migrations/20260727_101632_initial'
import * as bridge from '@/migrations/20260728_000000_bridge_initial_schema'
import * as publishing from '@/migrations/20260729_035214_replace_posts_novels_with_writings_series'
import * as structuredResume from '@/migrations/20260730_083430_structured_resume'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) =>
        rm(directory, {
          force: true,
          maxRetries: 10,
          recursive: true,
          retryDelay: 100,
        }),
      ),
  )
})

describe('production migration chain', () => {
  it('upgrades the original database without losing users or media', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'waitforit-site-migrations-'))
    temporaryDirectories.push(directory)
    const client = createClient({
      url: `file:${path.join(directory, 'payload.db').replaceAll('\\', '/')}`,
    })
    const db = drizzle(client)
    const args = { db } as MigrateUpArgs

    await initial.up(args)
    await db.run(sql`INSERT INTO \`users\` (\`email\`) VALUES ('owner@example.com');`)
    await db.run(
      sql`INSERT INTO \`media\` (\`alt\`, \`filename\`) VALUES ('Existing image', 'existing.png');`,
    )

    await bridge.up(args)
    await publishing.up(args)
    await structuredResume.up(args)

    const users = await db.run(sql`SELECT \`email\` FROM \`users\`;`)
    const media = await db.run(sql`SELECT \`alt\`, \`filename\` FROM \`media\`;`)
    const tables = await db.run(
      sql`SELECT \`name\` FROM \`sqlite_master\` WHERE \`type\` = 'table';`,
    )
    const tableNames = new Set(
      tables.rows.map((row) => String((row as unknown as { name: unknown }).name)),
    )

    expect(users.rows).toHaveLength(1)
    expect(media.rows).toHaveLength(1)
    expect(tableNames.has('projects')).toBe(true)
    expect(tableNames.has('writings')).toBe(true)
    expect(tableNames.has('series')).toBe(true)
    expect(tableNames.has('resume')).toBe(true)

    await structuredResume.down(args)
    await publishing.down(args)
    await bridge.down(args)

    const preservedUsers = await db.run(sql`SELECT \`email\` FROM \`users\`;`)
    const preservedMedia = await db.run(sql`SELECT \`alt\`, \`filename\` FROM \`media\`;`)
    const mediaColumns = await db.run(sql`PRAGMA table_info(\`media\`);`)
    const mediaColumnNames = new Set(
      mediaColumns.rows.map((row) => String((row as unknown as { name: unknown }).name)),
    )

    expect(preservedUsers.rows).toHaveLength(1)
    expect(preservedMedia.rows).toHaveLength(1)
    expect(mediaColumnNames.has('caption')).toBe(false)

    await client.close()
  })
})
