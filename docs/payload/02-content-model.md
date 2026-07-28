# 个人站内容模型

## 建议模型

当前站点定位是个人发布与项目展示。推荐先实现固定需求，再决定是否需要通用 Page Builder。

| 类型 | Slug | 职责 | 建议阶段 |
| --- | --- | --- | --- |
| Collection | `posts` | 文章、草稿、作者、标签、SEO | 第一阶段 |
| Collection | `projects` | 项目案例、封面、链接、技术栈、排序 | 第一阶段 |
| Collection | `tags` | 文章和项目的扁平标签 | 第一阶段 |
| Collection | `pages` | 可编辑的独立页面或 Block 页面 | 确认需要后 |
| Collection | `media` | 图片、视频和文件元数据 | 已存在，需增强 |
| Collection | `users` | Admin/编辑者认证 | 已存在，需角色时增强 |
| Global | `site-settings` | 站名、简介、默认 SEO、社交链接 | 第一阶段 |
| Global | `header` | 主导航 | 第一阶段 |
| Global | `footer` | 页脚导航和版权信息 | 第一阶段 |

## Posts

最小字段：

- `title`: text, required
- `slug`: text/slug, required, unique, indexed
- `excerpt`: textarea
- `content`: richText
- `heroImage`: upload → media
- `tags`: relationship → tags, hasMany
- `publishedAt`: date
- `meta`: SEO group
- drafts/versions

公开读取必须只返回 published 文档；Admin 用户可以读取草稿。

## Projects

最小字段：

- `title`
- `slug`
- `summary`
- `cover`
- `gallery`
- `content` 或结构化 Blocks
- `technologies`: relationship 或 select
- `externalURL`、`repositoryURL`
- `featured`
- `sortOrder`
- `publishedAt`
- `meta`

如果项目详情布局高度一致，优先结构化字段；只有编辑者确实需要自由组合模块时才使用
Blocks。

## Tags 与 Categories

- 普通筛选使用扁平 `tags`。
- 需要父子路径和面包屑时才使用 `categories` + Nested Docs。
- 不同时创建功能重复的 Tags 与 Categories。
- slug 改动需要 Redirects 或固定不可修改策略。

## Globals

Globals 适合全站只有一份的数据：

- `site-settings`：默认 metadata、站点 URL、简介、社交账户
- `header`：导航项数组
- `footer`：导航、版权和联系方式

不要把单例设置建成只允许一条记录的 Collection，除非未来需要每租户一份或版本化查询模式。

## 关系与查询约束

- 为列表页设置 `defaultPopulate` 或显式 `select`，避免取回完整富文本。
- relationship 深度默认保持低值。
- 公开作者信息不要直接展开完整 `users` 文档；使用受控字段或填充后的公开作者结构。
- 对 `slug`、`publishedAt`、常用排序字段建立索引。

## 参考

- [Collections](https://payloadcms.com/docs/configuration/collections)
- [Globals](https://payloadcms.com/docs/configuration/globals)
- [Fields](https://payloadcms.com/docs/fields/overview)
- `payload/templates/website/src/collections/Pages/index.ts`
- `payload/templates/website/src/collections/Posts/index.ts`
