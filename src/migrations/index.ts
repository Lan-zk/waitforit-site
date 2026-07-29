import * as migration_20260729_035214_replace_posts_novels_with_writings_series from './20260729_035214_replace_posts_novels_with_writings_series'

export const migrations = [
  {
    up: migration_20260729_035214_replace_posts_novels_with_writings_series.up,
    down: migration_20260729_035214_replace_posts_novels_with_writings_series.down,
    name: '20260729_035214_replace_posts_novels_with_writings_series',
  },
]
