import type { GlobalConfig } from 'payload'

import { adminLabel } from '@/i18n/admin'

export const Resume: GlobalConfig = {
  slug: 'resume',
  label: adminLabel('Resume', '简历'),
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      label: adminLabel('Title', '标题'),
      type: 'text',
      defaultValue: 'Resume',
    },
    {
      name: 'cover',
      label: adminLabel('Cover', '封面'),
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'sortOrder',
      label: adminLabel('Sort order', '排序'),
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'content',
      label: adminLabel('Content', '内容'),
      type: 'richText',
    },
  ],
}
