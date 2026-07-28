# Payload 项目架构

## 总体结构

```text
payload.config.ts
  ├─ Database Adapter
  ├─ Collections / Globals / Fields
  ├─ Auth / Access / Hooks / Jobs
  ├─ Plugins / Admin Components / Editor
  └─ Typescript output
          ↓
Payload core operations
  ├─ Local API
  ├─ REST API
  └─ GraphQL API
          ↓
Access → validation → hooks → transaction → database
          ↓
Next.js frontend / Payload Admin
```

Payload 是 code-first 框架。`payload.config.ts` 同时决定数据库 schema、Admin 表单、API、
类型生成、认证和业务生命周期。

## 包职责

| 包 | 职责 |
| --- | --- |
| `payload` | 核心操作、Local API、Access、Hooks、Validation 和类型 |
| `@payloadcms/next` | Admin Panel 与 Next.js HTTP 层 |
| `@payloadcms/ui` | Admin UI 组件与 Hooks |
| `@payloadcms/db-sqlite` | 当前 SQLite Adapter |
| `@payloadcms/richtext-lexical` | 富文本编辑、节点和转换 |
| `sharp` | 图片尺寸、裁切和格式处理 |

## 项目目录约定

推荐逐步形成：

```text
src/
  access/         通用访问控制函数
  app/
    (frontend)/   访客网站
    (payload)/    Payload Admin 和 API 接入
  blocks/         Block Config 与前端组件
  collections/    Collection Config
  fields/         可复用 Field 工厂
  globals/        Header、Footer、SiteSettings
  hooks/          跨 Collection 的 Hook
  plugins/        官方插件装配
  utilities/      Payload 查询、URL、SEO、缓存工具
  payload.config.ts
  payload-types.ts
```

`src/app/(payload)` 中的框架接入文件通常不手工修改。业务代码集中在 Config、数据模型和
`(frontend)`。

## API 选择

- Next.js Server Component、Route Handler、Hook：优先 Local API。
- 浏览器或外部客户端：REST。
- 已有 GraphQL 消费方或需要精确 GraphQL schema：GraphQL。
- 不要在同一 Next.js 服务内部为了“解耦”而绕一圈 REST。

Local API 没有 HTTP 开销，但默认会绕过 Access。涉及当前用户时必须显式设置
`overrideAccess: false` 并传入 `user` 或 `req`。

## Config 模块化规则

- 一个 Collection/Global 一个入口文件。
- Access 函数独立，避免在每个配置中复制。
- Field 工厂返回新对象，避免跨 Collection 共享可变引用。
- Hook 保持单一职责；长耗时任务进入 Jobs Queue。
- 插件集中在 `src/plugins/index.ts`，不要散落在根 Config 中。

## 官方与源码参考

- [Payload Concepts](https://payloadcms.com/docs/getting-started/concepts)
- [Payload Config](https://payloadcms.com/docs/configuration/overview)
- `payload/templates/website/src/payload.config.ts`
- `payload/templates/website/src/plugins/index.ts`
