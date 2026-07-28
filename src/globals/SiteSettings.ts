import type { GlobalConfig } from 'payload'

import { adminLabel } from '@/i18n/admin'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: adminLabel('Site settings', '站点设置'),
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      label: adminLabel('Name', '站点名称'),
      type: 'text',
      defaultValue: 'Wait For It',
    },
    {
      name: 'description',
      label: adminLabel('Description', '站点描述'),
      type: 'textarea',
    },
    {
      name: 'url',
      label: adminLabel('URL', '站点地址'),
      type: 'text',
      defaultValue: 'http://localhost:3000',
    },
    {
      name: 'email',
      label: adminLabel('Email', '邮箱'),
      type: 'text',
    },
    {
      name: 'social',
      label: adminLabel('Social links', '社交链接'),
      labels: {
        singular: adminLabel('Social link', '社交链接'),
        plural: adminLabel('Social links', '社交链接'),
      },
      type: 'array',
      fields: [
        {
          name: 'label',
          label: adminLabel('Label', '名称'),
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          label: adminLabel('URL', '链接地址'),
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
