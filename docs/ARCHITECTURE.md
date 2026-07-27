# Architecture

## 分层

```text
Payload npm packages
        ↓
src/payload.config.ts
        ↓
Collections / Globals / access rules
        ↓
Admin UI + REST/GraphQL/Local API
        ↓
SQLite + media storage
        ↓
src/app/(frontend) Next.js pages
```

- `payload`、`@payloadcms/next` 等依赖是框架本体，不在本仓库中修改。
- `src/payload.config.ts` 是项目总配置，注册数据库、编辑器、Collections 和 Globals。
- `src/collections/` 定义可重复内容。当前只有管理员用户与媒体。
- 后续 `src/globals/` 用于站点设置、导航等只有一份的数据。
- `src/app/(payload)/` 是 Payload 管理后台和 API 的 Next.js 接入层，通常不手改生成文件。
- `src/app/(frontend)/` 是访客网站，可以作为普通 Next.js/React 前端自由开发。
- `data/`、`media/` 是运行时状态，不进入 Git。

## 计划中的内容模型

按功能逐步加入，不在初始化阶段一次性预设全部字段：

1. `Posts`：文章、草稿、版本和发布时间。
2. `Tags`：文章分类与筛选。
3. `Projects`：项目展示。
4. `SiteSettings`：站名、简介、社交链接与默认 SEO。
5. `Navigation`：前台导航结构。

内容模型稳定后生成并提交 SQLite 迁移。匿名前台查询使用 Local API 时必须显式考虑
`overrideAccess: false`；Payload Local API 默认可绕过访问控制。

## 不在当前范围

- Fork 或修改 Payload 框架源码
- 通用 Payload 插件或可复用模板产品
- 评论、会员、多语言和可视化页面搭建器
- 复制生产数据库或媒体到开发环境
