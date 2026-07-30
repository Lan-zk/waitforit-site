import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`resume_core_capabilities_tags\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_core_capabilities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_core_capabilities_tags_order_idx\` ON \`resume_core_capabilities_tags\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_core_capabilities_tags_parent_id_idx\` ON \`resume_core_capabilities_tags\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_core_capabilities\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`summary\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_core_capabilities_order_idx\` ON \`resume_core_capabilities\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_core_capabilities_parent_id_idx\` ON \`resume_core_capabilities\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_professional_projects_technologies\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_professional_projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_professional_projects_technologies_order_idx\` ON \`resume_professional_projects_technologies\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_professional_projects_technologies_parent_id_idx\` ON \`resume_professional_projects_technologies\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_professional_projects_contributions\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`description\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_professional_projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_professional_projects_contributions_order_idx\` ON \`resume_professional_projects_contributions\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_professional_projects_contributions_parent_id_idx\` ON \`resume_professional_projects_contributions\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_professional_projects\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`domain\` text,
    \`start_year\` numeric,
    \`end_year\` numeric,
    \`role\` text,
    \`challenge\` text,
    \`decision\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_professional_projects_order_idx\` ON \`resume_professional_projects\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_professional_projects_parent_id_idx\` ON \`resume_professional_projects\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_governance_cases_responsibilities\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`description\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_governance_cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_governance_cases_responsibilities_order_idx\` ON \`resume_governance_cases_responsibilities\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_governance_cases_responsibilities_parent_id_idx\` ON \`resume_governance_cases_responsibilities\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_governance_cases_focus_areas\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_governance_cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_governance_cases_focus_areas_order_idx\` ON \`resume_governance_cases_focus_areas\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_governance_cases_focus_areas_parent_id_idx\` ON \`resume_governance_cases_focus_areas\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_governance_cases\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`year\` numeric,
    \`summary\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_governance_cases_order_idx\` ON \`resume_governance_cases\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_governance_cases_parent_id_idx\` ON \`resume_governance_cases\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_skill_groups_skills\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_skill_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_skill_groups_skills_order_idx\` ON \`resume_skill_groups_skills\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_skill_groups_skills_parent_id_idx\` ON \`resume_skill_groups_skills\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_skill_groups_scenarios\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_skill_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_skill_groups_scenarios_order_idx\` ON \`resume_skill_groups_scenarios\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_skill_groups_scenarios_parent_id_idx\` ON \`resume_skill_groups_scenarios\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_skill_groups\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_skill_groups_order_idx\` ON \`resume_skill_groups\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_skill_groups_parent_id_idx\` ON \`resume_skill_groups\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_current_focus\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    \`status\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`resume_current_focus_order_idx\` ON \`resume_current_focus\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`resume_current_focus_parent_id_idx\` ON \`resume_current_focus\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`resume_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`projects_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_rels_order_idx\` ON \`resume_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`resume_rels_parent_idx\` ON \`resume_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`resume_rels_path_idx\` ON \`resume_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`resume_rels_projects_id_idx\` ON \`resume_rels\` (\`projects_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`resume\` ADD \`positioning_display_name\` text;`)
  await db.run(sql`ALTER TABLE \`resume\` ADD \`positioning_headline\` text;`)
  await db.run(sql`ALTER TABLE \`resume\` ADD \`positioning_summary\` text;`)
  await db.run(sql`ALTER TABLE \`resume\` ADD \`positioning_experience_years\` numeric;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`resume_core_capabilities_tags\`;`)
  await db.run(sql`DROP TABLE \`resume_core_capabilities\`;`)
  await db.run(sql`DROP TABLE \`resume_professional_projects_technologies\`;`)
  await db.run(sql`DROP TABLE \`resume_professional_projects_contributions\`;`)
  await db.run(sql`DROP TABLE \`resume_professional_projects\`;`)
  await db.run(sql`DROP TABLE \`resume_governance_cases_responsibilities\`;`)
  await db.run(sql`DROP TABLE \`resume_governance_cases_focus_areas\`;`)
  await db.run(sql`DROP TABLE \`resume_governance_cases\`;`)
  await db.run(sql`DROP TABLE \`resume_skill_groups_skills\`;`)
  await db.run(sql`DROP TABLE \`resume_skill_groups_scenarios\`;`)
  await db.run(sql`DROP TABLE \`resume_skill_groups\`;`)
  await db.run(sql`DROP TABLE \`resume_current_focus\`;`)
  await db.run(sql`DROP TABLE \`resume_rels\`;`)
  await db.run(sql`ALTER TABLE \`resume\` DROP COLUMN \`positioning_display_name\`;`)
  await db.run(sql`ALTER TABLE \`resume\` DROP COLUMN \`positioning_headline\`;`)
  await db.run(sql`ALTER TABLE \`resume\` DROP COLUMN \`positioning_summary\`;`)
  await db.run(sql`ALTER TABLE \`resume\` DROP COLUMN \`positioning_experience_years\`;`)
}
