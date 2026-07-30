import * as migration_20260729_035214_replace_posts_novels_with_writings_series from './20260729_035214_replace_posts_novels_with_writings_series'
import * as migration_20260730_083430_structured_resume from './20260730_083430_structured_resume'

export const migrations = [
  {
    up: migration_20260729_035214_replace_posts_novels_with_writings_series.up,
    down: migration_20260729_035214_replace_posts_novels_with_writings_series.down,
    name: '20260729_035214_replace_posts_novels_with_writings_series',
  },
  {
    up: migration_20260730_083430_structured_resume.up,
    down: migration_20260730_083430_structured_resume.down,
    name: '20260730_083430_structured_resume',
  },
]
