import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite'
import { sql } from '@payloadcms/db-sqlite'

type MigrationDatabase = MigrateUpArgs['db']

const mediaColumns = [
  ['caption', 'text'],
  ['sizes_thumbnail_url', 'text'],
  ['sizes_thumbnail_width', 'numeric'],
  ['sizes_thumbnail_height', 'numeric'],
  ['sizes_thumbnail_mime_type', 'text'],
  ['sizes_thumbnail_filesize', 'numeric'],
  ['sizes_thumbnail_filename', 'text'],
  ['sizes_small_url', 'text'],
  ['sizes_small_width', 'numeric'],
  ['sizes_small_height', 'numeric'],
  ['sizes_small_mime_type', 'text'],
  ['sizes_small_filesize', 'numeric'],
  ['sizes_small_filename', 'text'],
  ['sizes_medium_url', 'text'],
  ['sizes_medium_width', 'numeric'],
  ['sizes_medium_height', 'numeric'],
  ['sizes_medium_mime_type', 'text'],
  ['sizes_medium_filesize', 'numeric'],
  ['sizes_medium_filename', 'text'],
  ['sizes_large_url', 'text'],
  ['sizes_large_width', 'numeric'],
  ['sizes_large_height', 'numeric'],
  ['sizes_large_mime_type', 'text'],
  ['sizes_large_filesize', 'numeric'],
  ['sizes_large_filename', 'text'],
  ['sizes_og_url', 'text'],
  ['sizes_og_width', 'numeric'],
  ['sizes_og_height', 'numeric'],
  ['sizes_og_mime_type', 'text'],
  ['sizes_og_filesize', 'numeric'],
  ['sizes_og_filename', 'text'],
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Databases that already reached the Git-backed publishing schema only need
  // this migration recorded. The bridge exists for the original production
  // database, whose initial migration contained only users and media.
  if (await tableExists(db, 'writings')) return

  for (const [name, type] of mediaColumns) {
    await addColumnIfMissing(db, 'media', name, type)
  }
  await createMediaSizeIndexes(db)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`projects\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`slug\` text NOT NULL,
    \`summary\` text,
    \`cover_id\` integer NOT NULL,
    \`sort_order\` numeric DEFAULT 0,
    \`published_at\` text,
    \`external_u_r_l\` text,
    \`repository_u_r_l\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`projects_slug_idx\` ON \`projects\` (\`slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`projects_cover_idx\` ON \`projects\` (\`cover_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`projects_technologies\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await createArrayIndexes(db, 'projects_technologies')

  for (const table of ['posts', 'novels', 'photography'] as const) {
    await db.run(
      sql.raw(`CREATE TABLE IF NOT EXISTS \`${table}\` (
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
    );`),
    )
    await db.run(
      sql.raw(
        `CREATE UNIQUE INDEX IF NOT EXISTS \`${table}_slug_idx\` ON \`${table}\` (\`slug\`);`,
      ),
    )
    await db.run(
      sql.raw(`CREATE INDEX IF NOT EXISTS \`${table}_cover_idx\` ON \`${table}\` (\`cover_id\`);`),
    )
    await db.run(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS \`${table}_updated_at_idx\` ON \`${table}\` (\`updated_at\`);`,
      ),
    )
    await db.run(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS \`${table}_created_at_idx\` ON \`${table}\` (\`created_at\`);`,
      ),
    )
  }

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`resume\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text DEFAULT 'Resume',
    \`cover_id\` integer,
    \`sort_order\` numeric DEFAULT 0,
    \`content\` text,
    \`updated_at\` text,
    \`created_at\` text,
    FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`resume_cover_idx\` ON \`resume\` (\`cover_id\`);`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`site_settings\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`name\` text DEFAULT 'Wait For It',
    \`description\` text,
    \`url\` text DEFAULT 'http://localhost:3000',
    \`email\` text,
    \`updated_at\` text,
    \`created_at\` text
  );`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`site_settings_social\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text NOT NULL,
    \`url\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await createArrayIndexes(db, 'site_settings_social')

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`header\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`updated_at\` text,
    \`created_at\` text
  );`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`header_nav\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text NOT NULL,
    \`href\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await createArrayIndexes(db, 'header_nav')

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`email\` text,
    \`copyright\` text,
    \`updated_at\` text,
    \`created_at\` text
  );`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer_nav\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text NOT NULL,
    \`href\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await createArrayIndexes(db, 'footer_nav')

  await ensureLegacyLockedDocumentRelations(db)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  if (await tableExists(db, 'writings')) {
    throw new Error(
      'Roll back the publishing and structured-resume migrations before the initial-schema bridge.',
    )
  }

  await restoreInitialLockedDocumentRelations(db)
  await db.run(sql`DROP TABLE IF EXISTS \`projects_technologies\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`projects\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`posts\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`novels\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`photography\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`site_settings_social\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`site_settings\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`header_nav\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`header\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`footer_nav\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`footer\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`resume\`;`)
  await restoreInitialMediaTable(db)
}

async function addColumnIfMissing(
  db: MigrationDatabase,
  table: string,
  column: string,
  type: string,
) {
  const columns = await tableColumns(db, table)
  if (!columns.has(column)) {
    await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD \`${column}\` ${type};`))
  }
}

async function createArrayIndexes(db: MigrationDatabase, table: string) {
  await db.run(
    sql.raw(`CREATE INDEX IF NOT EXISTS \`${table}_order_idx\` ON \`${table}\` (\`_order\`);`),
  )
  await db.run(
    sql.raw(
      `CREATE INDEX IF NOT EXISTS \`${table}_parent_id_idx\` ON \`${table}\` (\`_parent_id\`);`,
    ),
  )
}

async function createMediaSizeIndexes(db: MigrationDatabase) {
  for (const size of ['thumbnail', 'small', 'medium', 'large', 'og']) {
    await db.run(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS \`media_sizes_${size}_sizes_${size}_filename_idx\` ON \`media\` (\`sizes_${size}_filename\`);`,
      ),
    )
  }
}

async function ensureLegacyLockedDocumentRelations(db: MigrationDatabase) {
  const columns = await tableColumns(db, 'payload_locked_documents_rels')
  const legacyColumns = [
    'users_id',
    'media_id',
    'projects_id',
    'posts_id',
    'novels_id',
    'photography_id',
  ]
  if (legacyColumns.every((column) => columns.has(column))) return

  await db.run(sql`CREATE TABLE \`__bridge_payload_locked_documents_rels\` (
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

  const selectedRelations = legacyColumns
    .map((column) => (columns.has(column) ? `\`${column}\`` : 'NULL'))
    .join(', ')
  await db.run(
    sql.raw(`INSERT INTO \`__bridge_payload_locked_documents_rels\`
      (\`id\`, \`order\`, \`parent_id\`, \`path\`, ${legacyColumns
        .map((column) => `\`${column}\``)
        .join(', ')})
      SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, ${selectedRelations}
      FROM \`payload_locked_documents_rels\`;`),
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__bridge_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await createLegacyLockedDocumentIndexes(db)
}

async function restoreInitialLockedDocumentRelations(db: MigrationDatabase) {
  await db.run(sql`CREATE TABLE \`__initial_payload_locked_documents_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`users_id\` integer,
    \`media_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`INSERT INTO \`__initial_payload_locked_documents_rels\`
    (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`)
    SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`
    FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__initial_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
}

async function createLegacyLockedDocumentIndexes(db: MigrationDatabase) {
  for (const column of [
    'order',
    'parent_id',
    'path',
    'users_id',
    'media_id',
    'projects_id',
    'posts_id',
    'novels_id',
    'photography_id',
  ]) {
    const suffix = column === 'parent_id' ? 'parent' : column.replace(/_id$/, '_id')
    await db.run(
      sql.raw(
        `CREATE INDEX \`payload_locked_documents_rels_${suffix}_idx\` ON \`payload_locked_documents_rels\` (\`${column}\`);`,
      ),
    )
  }
}

async function restoreInitialMediaTable(db: MigrationDatabase) {
  await db.run(sql`CREATE TABLE \`__initial_media\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`alt\` text NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`url\` text,
    \`thumbnail_u_r_l\` text,
    \`filename\` text,
    \`mime_type\` text,
    \`filesize\` numeric,
    \`width\` numeric,
    \`height\` numeric,
    \`focal_x\` numeric,
    \`focal_y\` numeric
  );`)
  await db.run(sql`INSERT INTO \`__initial_media\`
    (\`id\`, \`alt\`, \`updated_at\`, \`created_at\`, \`url\`, \`thumbnail_u_r_l\`,
     \`filename\`, \`mime_type\`, \`filesize\`, \`width\`, \`height\`, \`focal_x\`, \`focal_y\`)
    SELECT \`id\`, \`alt\`, \`updated_at\`, \`created_at\`, \`url\`, \`thumbnail_u_r_l\`,
     \`filename\`, \`mime_type\`, \`filesize\`, \`width\`, \`height\`, \`focal_x\`, \`focal_y\`
    FROM \`media\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`ALTER TABLE \`__initial_media\` RENAME TO \`media\`;`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
}

async function tableColumns(db: MigrationDatabase, table: string) {
  const result = await db.run(sql.raw(`PRAGMA table_info(\`${table}\`);`))
  return new Set(result.rows.map((row) => String((row as unknown as { name: unknown }).name)))
}

async function tableExists(db: MigrationDatabase, table: string) {
  const result = await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table}';`),
  )
  return result.rows.length > 0
}
