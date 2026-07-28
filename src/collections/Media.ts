import type { CollectionConfig } from 'payload'

import { adminLabel } from '@/i18n/admin'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: adminLabel('Media item', '媒体文件'),
    plural: adminLabel('Media', '媒体'),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      label: adminLabel('Alternative text', '替代文本'),
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      label: adminLabel('Caption', '图片说明'),
      type: 'textarea',
    },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 200,
      },
      {
        name: 'small',
        width: 640,
      },
      {
        name: 'medium',
        width: 1024,
      },
      {
        name: 'large',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        fit: 'cover',
        position: 'center',
      },
    ],
  },
}
