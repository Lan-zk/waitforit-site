# 数据查询与前端渲染

## Server Component 基线

站内服务端页面使用：

```ts
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const result = await payload.find({
  collection: 'posts',
  where: {
    slug: { equals: slug },
  },
  depth: 1,
  limit: 1,
  select: {
    title: true,
    slug: true,
    content: true,
    meta: true,
  },
})
```

无结果时调用 Next.js `notFound()`，不要渲染空壳详情页。

## 查询规则

- 列表页永远使用 `select`，不取完整富文本和大关系。
- `depth` 从 0 或 1 开始，只在渲染确实需要时增加。
- 使用 `pagination: false` 前确认结果集有严格上限。
- 排序字段应建立索引。
- 不在 React Client Component 初始化 Payload。
- 外部客户端使用 REST/GraphQL，并让 Access 决定结果。

## 常用查询封装

推荐建立：

```text
src/utilities/getPostBySlug.ts
src/utilities/getPosts.ts
src/utilities/getProjectBySlug.ts
src/utilities/getGlobals.ts
src/utilities/getRedirects.ts
```

封装中固定：

- collection/global slug
- 最小 `select`
- 统一 draft/locale 参数
- 缓存标签
- 找不到时的返回约定

不要创建隐藏 Access 行为的“万能 find”包装器。

## RichText 与 Blocks

- 数据模型 Config 与前端 Renderer 必须成对提交。
- Block 使用 `blockType` 做显式映射。
- 未知 Block 在开发环境报错，在生产环境安全跳过并记录。
- Lexical 数据优先使用官方 React/JSX converter。
- 上传和 relationship 节点要控制 `depth` 和空值。

## Metadata

Next.js `generateMetadata` 从 Payload SEO 字段构造：

- title
- description
- canonical
- openGraph images
- robots

`SiteSettings` 提供默认值，文档级 `meta` 覆盖默认值。不要让 Admin 中可编辑的 URL
直接形成不可信重定向。

## 缓存

优先使用可定向失效的 path/tag：

- Posts 变更：详情路径、文章列表、相关标签
- Projects 变更：详情路径、项目列表
- Header/Footer 变更：布局相关 tag
- Redirects 变更：redirects tag

Hook 里执行短小的 revalidation；复杂派生数据进入 Job。

## 参考

- [Local API](https://payloadcms.com/docs/local-api/overview)
- [Queries](https://payloadcms.com/docs/queries/overview)
- [Rich Text Converters](https://payloadcms.com/docs/rich-text/converters)
- `payload/templates/website/src/utilities/getDocument.ts`
- `payload/templates/website/src/components/RenderBlocks.tsx`
