import type { CollectionConfig } from 'payload'

import { adminLabel } from '@/i18n/admin'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: adminLabel('Post', '文章'),
    plural: adminLabel('Posts', '文章'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'sortOrder', 'publishedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      label: adminLabel('Title', '标题'),
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: adminLabel('Slug', '路径标识'),
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'summary',
      label: adminLabel('Summary', '摘要'),
      type: 'textarea',
    },
    {
      name: 'cover',
      label: adminLabel('Cover', '封面'),
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'sortOrder',
      label: adminLabel('Sort order', '排序'),
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      label: adminLabel('Published at', '发布时间'),
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
