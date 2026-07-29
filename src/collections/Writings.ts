import type {
  CollectionConfig,
  NumberFieldSingleValidation,
  RelationshipFieldSingleValidation,
} from 'payload'

import { adminLabel } from '@/i18n/admin'

const syncedFieldAdmin = {
  position: 'sidebar' as const,
  readOnly: true,
}

function getSiblingKind(siblingData: unknown) {
  if (typeof siblingData !== 'object' || siblingData === null) return undefined
  return (siblingData as { kind?: unknown }).kind
}

const validateSeries: RelationshipFieldSingleValidation = (
  value,
  { siblingData },
) => {
  const kind = getSiblingKind(siblingData)
  if (kind === 'novelChapter' && !value) {
    return 'Novel chapters must reference a series.'
  }
  if (kind === 'blog' && value) {
    return 'Blog writings cannot reference a series.'
  }
  return true
}

const validateChapterOrder: NumberFieldSingleValidation = (
  value,
  { siblingData },
) => {
  const kind = getSiblingKind(siblingData)
  if (
    kind === 'novelChapter' &&
    (typeof value !== 'number' || !Number.isInteger(value))
  ) {
    return 'Novel chapters require an integer chapter order.'
  }
  if (kind === 'blog' && value !== null && value !== undefined) {
    return 'Blog writings cannot define a chapter order.'
  }
  return true
}

export const Writings: CollectionConfig = {
  slug: 'writings',
  labels: {
    singular: adminLabel('Writing', '文章'),
    plural: adminLabel('Writings', '文章'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'kind',
      'slug',
      'series',
      'chapterOrder',
      'syncedAt',
    ],
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
      name: 'kind',
      label: adminLabel('Kind', '类型'),
      type: 'select',
      required: true,
      index: true,
      options: [
        {
          label: adminLabel('Blog', '博客'),
          value: 'blog',
        },
        {
          label: adminLabel('Novel chapter', '小说章节'),
          value: 'novelChapter',
        },
      ],
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
      name: 'series',
      label: adminLabel('Novel series', '所属小说'),
      type: 'relationship',
      relationTo: 'series',
      index: true,
      admin: {
        ...syncedFieldAdmin,
        condition: (_, siblingData) => siblingData?.kind === 'novelChapter',
      },
      validate: validateSeries,
    },
    {
      name: 'chapterOrder',
      label: adminLabel('Chapter order', '章节顺序'),
      type: 'number',
      index: true,
      min: 0,
      admin: {
        ...syncedFieldAdmin,
        condition: (_, siblingData) => siblingData?.kind === 'novelChapter',
      },
      validate: validateChapterOrder,
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
