import type { CollectionConfig } from 'payload'

import { adminLabel } from '@/i18n/admin'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: adminLabel('User', '用户'),
    plural: adminLabel('Users', '用户'),
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
