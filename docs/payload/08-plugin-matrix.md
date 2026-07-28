# 官方插件采用矩阵

## 原则

- 只为已经存在的产品需求安装插件。
- 官方插件版本与 Payload 固定为 `3.86.0`。
- 安装后检查插件新增的 Collection、Endpoint、Access、Hook 和 Admin Component。
- 插件不会自动完成所有前端工作，例如 Redirects 仍需要前端执行跳转。

## 推荐顺序

| 插件/能力 | 建议 | 引入条件 | 必须配套 |
| --- | --- | --- | --- |
| SEO | 高 | Posts/Projects 模型确定 | Next metadata、默认 SEO、OG 图测试 |
| Redirects | 高 | 存在可变 slug/URL | 前端 redirect 查询、缓存失效 |
| Form Builder | 中 | 需要联系/订阅表单 | Access、反垃圾、Email Adapter |
| Search | 中 | 内容量足够且需要站内搜索 | beforeSync、索引重建、搜索 UI |
| Nested Docs | 条件 | 层级 Pages/Categories | 面包屑、级联更新测试 |
| Sentry | 上线前 | 有 Sentry 项目 | Next.js Sentry 配置、隐私过滤 |
| Storage Adapter | 按部署 | 无持久盘或多实例 | 环境变量、URL、备份策略 |
| Import/Export | 后期 | 批量运营或迁移 | Jobs、管理员权限、关系映射 |
| MCP | 后期 | 需要 Agent 读取/管理内容 | API Key、最小 capability、审计 |
| Multi-Tenant | 不采用 | 只有一个站点 | — |
| Stripe/Ecommerce | 不采用 | 当前没有交易需求 | — |

## SEO

插件可注入 `meta` 字段，也可像官方 Website Template 一样显式组合 SEO Fields。
个人站推荐显式组合，以便固定字段位置、类型和生成逻辑。

## Redirects

插件增加 `redirects` Collection。前端需要：

- 在请求阶段查找旧路径
- 返回正确 301/302/307/308
- 缓存 redirect 数据
- Collection 变更时失效缓存

## Search

插件建立简化的 `search` Collection，并通过 Hook 同步。它适合站内结构化检索，不等同于
大型全文搜索引擎。

初期只同步：

- title
- excerpt/summary
- slug
- collection type
- publishedAt
- tags

## Form Builder

表单定义和提交记录存入数据库。匿名用户只允许创建 Submission，不允许读取。邮件发送、
限流、验证码/蜜罐、隐私保留周期需要项目自行实现。

## MCP

MCP 是内容操作接口，不是代码生成 Skill。内容模型和 Access 稳定前不要启用。启用时从
只读能力开始，并验证 API Key 所属用户的 Payload Access 仍然生效。

## 参考

- [Plugins Overview](https://payloadcms.com/docs/plugins/overview)
- [SEO](https://payloadcms.com/docs/plugins/seo)
- [Redirects](https://payloadcms.com/docs/plugins/redirects)
- [Search](https://payloadcms.com/docs/plugins/search)
- [Form Builder](https://payloadcms.com/docs/plugins/form-builder)
- [MCP](https://payloadcms.com/docs/plugins/mcp)
- `payload/templates/website/src/plugins/index.ts`
