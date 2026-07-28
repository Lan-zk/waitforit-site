# Payload 开发知识库索引

本目录保存 `waitforit-site` 开发时需要反复检索的 Payload 知识。它不是 Payload
官方文档的镜像，而是基于当前项目、Payload 官方文档和 Payload 源码整理的项目级决策、
安全边界、实现模式与验证清单。

## 使用方式

Agent 在修改 Payload 配置或前端数据层之前，应先阅读：

1. [00-version-and-sources.md](./00-version-and-sources.md)
2. 与任务直接相关的专题文档
3. 项目根目录下对应的 `skills/<skill-name>/SKILL.md`

当本文档与代码不一致时，以当前 `package.json`、已安装类型定义和 `payload/origin/3.x`
源码为准，并更新本文档。

## 文档清单

| 文件 | 作用 | 常见使用场景 |
| --- | --- | --- |
| [00-version-and-sources.md](./00-version-and-sources.md) | 固定版本边界、证据优先级和源码入口 | 安装插件、查 API、升级依赖 |
| [01-architecture.md](./01-architecture.md) | 解释 Config、数据模型、API、Admin 和数据库的关系 | 新功能设计、排查数据流 |
| [02-content-model.md](./02-content-model.md) | 定义个人站推荐的 Collections、Globals 和关系 | 增加文章、项目、标签、站点设置 |
| [03-access-and-security.md](./03-access-and-security.md) | 访问控制、认证、Local API 和上传安全边界 | 开放匿名读取、表单、MCP、后台权限 |
| [04-data-fetching-and-rendering.md](./04-data-fetching-and-rendering.md) | Next.js 中查询、选择字段、渲染和缓存模式 | 页面、列表、详情、站点导航 |
| [05-publishing-and-preview.md](./05-publishing-and-preview.md) | 草稿、版本、预览、实时预览和缓存失效 | 文章发布、定时发布、编辑预览 |
| [06-hooks-jobs-transactions.md](./06-hooks-jobs-transactions.md) | Hook 生命周期、事务和后台任务的选择规则 | 搜索同步、邮件、重验证、第三方集成 |
| [07-media-and-storage.md](./07-media-and-storage.md) | 媒体字段、图片尺寸、访问控制和存储选择 | 图片上传、OG 图、对象存储 |
| [08-plugin-matrix.md](./08-plugin-matrix.md) | 官方插件的采用顺序、收益、代价和前置条件 | SEO、重定向、搜索、表单、MCP |
| [09-schema-migrations-and-testing.md](./09-schema-migrations-and-testing.md) | Schema 变更、迁移、类型生成和测试闭环 | 新增字段、部署、回滚、CI |

## 项目当前基线

- Payload：`3.86.0`
- Next.js：`16.2.12`
- Node.js：`24.x`
- 数据库：SQLite
- 富文本：Lexical
- 当前 Collections：`users`、`media`
- 当前阶段：Blank Template 基线，内容模型尚未落地

## 维护要求

- 每次升级 Payload 后先更新版本文档，再更新其他专题。
- 示例只保留项目实际采用的模式。
- 不复制大段官方文档；记录官方 URL、源码位置和项目决策。
- 新增公开写入口时必须同步更新访问控制和测试文档。
- 所有文档使用 UTF-8。
