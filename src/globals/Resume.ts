import type { GlobalConfig } from 'payload'

export const Resume: GlobalConfig = {
  slug: 'resume',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Resume',
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}
