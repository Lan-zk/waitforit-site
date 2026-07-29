import type { CollectionConfig } from 'payload'

import { adminLabel } from '@/i18n/admin'

const syncedFieldAdmin = {
  position: 'sidebar' as const,
  readOnly: true,
}

export const Series: CollectionConfig = {
  slug: 'series',
  labels: {
    singular: adminLabel('Novel series', '小说作品'),
    plural: adminLabel('Novel series', '小说作品'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'language', 'publishedAt', 'syncedAt'],
    description: adminLabel(
      'Read-only metadata synchronized from the publishing repository.',
      '从发布仓库同步的只读元数据。',
    ),
  },
  access: {
    create: () => false,
    delete: () => false,
    read: () => true,
    update: () => false,
  },
  fields: [
    {
      name: 'title',
      label: adminLabel('Title', '标题'),
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'slug',
      label: adminLabel('Slug', '路径标识'),
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: syncedFieldAdmin,
    },
    {
      name: 'language',
      label: adminLabel('Content language', '内容语言'),
      type: 'text',
      required: true,
      admin: syncedFieldAdmin,
    },
    {
      name: 'summary',
      label: adminLabel('Summary', '摘要'),
      type: 'textarea',
      admin: { readOnly: true },
    },
    {
      name: 'sourcePath',
      label: adminLabel('Source path', '源文件路径'),
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: syncedFieldAdmin,
    },
    {
      name: 'coverPath',
      label: adminLabel('Cover path', '封面路径'),
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'publishedAt',
      label: adminLabel('Published at', '发布时间'),
      type: 'date',
      index: true,
      admin: {
        ...syncedFieldAdmin,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'syncedAt',
      label: adminLabel('Synced at', '同步时间'),
      type: 'date',
      required: true,
      admin: {
        ...syncedFieldAdmin,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}
