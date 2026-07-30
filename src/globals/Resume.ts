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
      name: 'positioning',
      label: adminLabel('Personal positioning', '个人定位'),
      type: 'group',
      admin: {
        description: adminLabel(
          'Public identity only. Do not enter private contact, employer, school, training provider, marital status, or client names.',
          '仅填写公开身份信息。不要录入私人联系方式、公司、院校、培训机构、婚姻状况或客户名称。',
        ),
      },
      fields: [
        {
          name: 'displayName',
          label: adminLabel('Display name', '展示名称'),
          type: 'text',
        },
        {
          name: 'headline',
          label: adminLabel('Headline', '职业标题'),
          type: 'text',
        },
        {
          name: 'summary',
          label: adminLabel('Summary', '定位摘要'),
          type: 'textarea',
        },
        {
          name: 'experienceYears',
          label: adminLabel('Years in engineering', '工程经验年数'),
          type: 'number',
          min: 0,
          max: 80,
        },
      ],
    },
    {
      name: 'coreCapabilities',
      label: adminLabel('Core capabilities', '核心能力'),
      labels: {
        singular: adminLabel('Core capability', '核心能力'),
        plural: adminLabel('Core capabilities', '核心能力'),
      },
      type: 'array',
      fields: [
        {
          name: 'title',
          label: adminLabel('Title', '标题'),
          type: 'text',
          required: true,
        },
        {
          name: 'tags',
          label: adminLabel('Tags', '标签'),
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
        {
          name: 'summary',
          label: adminLabel('Summary', '说明'),
          type: 'textarea',
        },
      ],
    },
    {
      name: 'professionalProjects',
      label: adminLabel(
        'Anonymous professional projects',
        '匿名职业项目案例',
      ),
      labels: {
        singular: adminLabel('Professional project', '职业项目案例'),
        plural: adminLabel('Professional projects', '职业项目案例'),
      },
      type: 'array',
      admin: {
        description: adminLabel(
          'Use anonymous project descriptions and years only. Do not include employer, hospital, customer, or institution names.',
          '仅使用匿名项目描述和年份，不要填写公司、医院、客户或机构名称。',
        ),
      },
      fields: [
        {
          name: 'title',
          label: adminLabel('Project title', '项目标题'),
          type: 'text',
          required: true,
        },
        {
          name: 'domain',
          label: adminLabel('Domain', '项目领域'),
          type: 'text',
        },
        {
          name: 'startYear',
          label: adminLabel('Start year', '开始年份'),
          type: 'number',
          min: 1900,
          max: 2100,
        },
        {
          name: 'endYear',
          label: adminLabel('End year', '结束年份'),
          type: 'number',
          min: 1900,
          max: 2100,
        },
        {
          name: 'role',
          label: adminLabel('Role', '承担角色'),
          type: 'text',
        },
        {
          name: 'technologies',
          label: adminLabel('Technologies', '技术栈'),
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
        {
          name: 'challenge',
          label: adminLabel('Business problem', '业务问题'),
          type: 'textarea',
        },
        {
          name: 'decision',
          label: adminLabel('Technical decision', '技术决策'),
          type: 'textarea',
        },
        {
          name: 'contributions',
          label: adminLabel('Contributions', '个人贡献'),
          type: 'array',
          fields: [
            {
              name: 'description',
              label: adminLabel('Description', '贡献说明'),
              type: 'textarea',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'publicProducts',
      label: adminLabel('Public products', '公开产品'),
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
    },
    {
      name: 'governanceCases',
      label: adminLabel('Engineering governance', '工程治理案例'),
      labels: {
        singular: adminLabel('Governance case', '工程治理案例'),
        plural: adminLabel('Governance cases', '工程治理案例'),
      },
      type: 'array',
      fields: [
        {
          name: 'title',
          label: adminLabel('Title', '标题'),
          type: 'text',
          required: true,
        },
        {
          name: 'year',
          label: adminLabel('Year', '年份'),
          type: 'number',
          min: 1900,
          max: 2100,
        },
        {
          name: 'summary',
          label: adminLabel('Summary', '说明'),
          type: 'textarea',
        },
        {
          name: 'responsibilities',
          label: adminLabel('Responsibilities', '职责与贡献'),
          type: 'array',
          fields: [
            {
              name: 'description',
              label: adminLabel('Description', '说明'),
              type: 'textarea',
              required: true,
            },
          ],
        },
        {
          name: 'focusAreas',
          label: adminLabel('Focus areas', '关注点'),
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
    },
    {
      name: 'skillGroups',
      label: adminLabel('Technical graph', '技术能力图谱'),
      labels: {
        singular: adminLabel('Skill group', '能力分组'),
        plural: adminLabel('Skill groups', '能力分组'),
      },
      type: 'array',
      fields: [
        {
          name: 'title',
          label: adminLabel('Group title', '分组标题'),
          type: 'text',
          required: true,
        },
        {
          name: 'skills',
          label: adminLabel('Skills', '技能'),
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
        {
          name: 'scenarios',
          label: adminLabel('Scenarios', '适用场景'),
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
    },
    {
      name: 'currentFocus',
      label: adminLabel('Current focus', '当前关注方向'),
      labels: {
        singular: adminLabel('Focus item', '关注方向'),
        plural: adminLabel('Focus items', '关注方向'),
      },
      type: 'array',
      fields: [
        {
          name: 'name',
          label: adminLabel('Name', '名称'),
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          label: adminLabel('Status', '状态'),
          type: 'select',
          options: [
            {
              label: adminLabel('Active', '持续实践'),
              value: 'active',
            },
            {
              label: adminLabel('Exploring', '探索中'),
              value: 'exploring',
            },
          ],
        },
      ],
    },
    {
      name: 'content',
      label: adminLabel('Supplementary content', '补充富文本'),
      type: 'richText',
    },
  ],
}
