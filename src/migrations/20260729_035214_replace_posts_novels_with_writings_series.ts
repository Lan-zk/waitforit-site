import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite'
import { sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`series\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`slug\` text NOT NULL,
    \`language\` text NOT NULL,
    \`summary\` text,
    \`source_path\` text NOT NULL,
    \`cover_path\` text,
    \`published_at\` text,
    \`synced_at\` text NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`series_slug_idx\` ON \`series\` (\`slug\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`series_source_path_idx\` ON \`series\` (\`source_path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`series_published_at_idx\` ON \`series\` (\`published_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`series_updated_at_idx\` ON \`series\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`series_created_at_idx\` ON \`series\` (\`created_at\`);`,
  )

  await db.run(sql`CREATE TABLE \`writings\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`slug\` text NOT NULL,
    \`kind\` text NOT NULL,
    \`language\` text NOT NULL,
    \`summary\` text,
    \`source_path\` text NOT NULL,
    \`series_id\` integer,
    \`chapter_order\` numeric,
    \`cover_path\` text,
    \`published_at\` text,
    \`synced_at\` text NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`series_id\`) REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`writings_slug_idx\` ON \`writings\` (\`slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`writings_kind_idx\` ON \`writings\` (\`kind\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`writings_source_path_idx\` ON \`writings\` (\`source_path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`writings_series_idx\` ON \`writings\` (\`series_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`writings_chapter_order_idx\` ON \`writings\` (\`chapter_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`writings_published_at_idx\` ON \`writings\` (\`published_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`writings_updated_at_idx\` ON \`writings\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`writings_created_at_idx\` ON \`writings\` (\`created_at\`);`,
  )

  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`users_id\` integer,
    \`media_id\` integer,
    \`projects_id\` integer,
    \`writings_id\` integer,
    \`series_id\` integer,
    \`photography_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`writings_id\`) REFERENCES \`writings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`series_id\`) REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`photography_id\`) REFERENCES \`photography\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`
    (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`, \`projects_id\`, \`photography_id\`)
    SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`, \`projects_id\`, \`photography_id\`
    FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await createLockedDocumentIndexes(db)

  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`DROP TABLE \`novels\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`posts\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`slug\` text NOT NULL,
    \`summary\` text,
    \`cover_id\` integer NOT NULL,
    \`sort_order\` numeric DEFAULT 0,
    \`published_at\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await createLegacyContentIndexes(db, 'posts')

  await db.run(sql`CREATE TABLE \`novels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`slug\` text NOT NULL,
    \`summary\` text,
    \`cover_id\` integer NOT NULL,
    \`sort_order\` numeric DEFAULT 0,
    \`published_at\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await createLegacyContentIndexes(db, 'novels')

  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`users_id\` integer,
    \`media_id\` integer,
    \`projects_id\` integer,
    \`posts_id\` integer,
    \`novels_id\` integer,
    \`photography_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`novels_id\`) REFERENCES \`novels\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`photography_id\`) REFERENCES \`photography\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`
    (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`, \`projects_id\`, \`photography_id\`)
    SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`, \`projects_id\`, \`photography_id\`
    FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await createLegacyLockedDocumentIndexes(db)

  await db.run(sql`DROP TABLE \`writings\`;`)
  await db.run(sql`DROP TABLE \`series\`;`)
}

type MigrationDatabase = MigrateUpArgs['db']

async function createLockedDocumentIndexes(db: MigrationDatabase) {
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  for (const field of [
    'users_id',
    'media_id',
    'projects_id',
    'writings_id',
    'series_id',
    'photography_id',
  ]) {
    await db.run(
      sql.raw(
        `CREATE INDEX \`payload_locked_documents_rels_${field}_idx\` ON \`payload_locked_documents_rels\` (\`${field}\`);`,
      ),
    )
  }
}

async function createLegacyLockedDocumentIndexes(db: MigrationDatabase) {
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  for (const field of [
    'users_id',
    'media_id',
    'projects_id',
    'posts_id',
    'novels_id',
    'photography_id',
  ]) {
    await db.run(
      sql.raw(
        `CREATE INDEX \`payload_locked_documents_rels_${field}_idx\` ON \`payload_locked_documents_rels\` (\`${field}\`);`,
      ),
    )
  }
}

async function createLegacyContentIndexes(
  db: MigrationDatabase,
  table: 'novels' | 'posts',
) {
  await db.run(
    sql.raw(
      `CREATE UNIQUE INDEX \`${table}_slug_idx\` ON \`${table}\` (\`slug\`);`,
    ),
  )
  await db.run(
    sql.raw(
      `CREATE INDEX \`${table}_cover_idx\` ON \`${table}\` (\`cover_id\`);`,
    ),
  )
  await db.run(
    sql.raw(
      `CREATE INDEX \`${table}_updated_at_idx\` ON \`${table}\` (\`updated_at\`);`,
    ),
  )
  await db.run(
    sql.raw(
      `CREATE INDEX \`${table}_created_at_idx\` ON \`${table}\` (\`created_at\`);`,
    ),
  )
}
