import type { GlobalConfig } from 'payload'

import { adminLabel } from '@/i18n/admin'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: adminLabel('Footer', '页脚'),
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'nav',
      label: adminLabel('Navigation', '导航'),
      labels: {
        singular: adminLabel('Navigation item', '导航项'),
        plural: adminLabel('Navigation items', '导航项'),
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
          name: 'href',
          label: adminLabel('Link', '链接地址'),
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'email',
      label: adminLabel('Email', '邮箱'),
      type: 'text',
    },
    {
      name: 'copyright',
      label: adminLabel('Copyright', '版权信息'),
      type: 'text',
    },
  ],
}
