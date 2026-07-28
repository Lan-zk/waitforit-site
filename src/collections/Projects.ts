import type { CollectionConfig } from 'payload'

import { adminLabel } from '@/i18n/admin'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: adminLabel('Project', '项目'),
    plural: adminLabel('Projects', '项目'),
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
    {
      name: 'externalURL',
      label: adminLabel('External URL', '外部链接'),
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'repositoryURL',
      label: adminLabel('Repository URL', '代码仓库链接'),
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'technologies',
      label: adminLabel('Technologies', '技术栈'),
      labels: {
        singular: adminLabel('Technology', '技术'),
        plural: adminLabel('Technologies', '技术'),
      },
      type: 'array',
      fields: [
        {
          name: 'name',
          label: adminLabel('Name', '名称'),
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
