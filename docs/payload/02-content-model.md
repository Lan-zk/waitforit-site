# 个人站内容模型

## 当前模型

当前站点定位是个人发布与项目展示。内容模型已经从初始 `posts` / `novels` 演示结构迁移为
Git Markdown 正文和 Payload 元数据分离的模型。

| 类型 | Slug | 职责 | 当前状态 |
| --- | --- | --- | --- |
| Collection | `users` | Admin 认证 | 已实现 |
| Collection | `media` | 本地图片、alt、caption 与派生尺寸 | 已实现 |
| Collection | `projects` | 项目封面、摘要、链接、技术栈和排序 | 模型与详情页已实现 |
| Collection | `writings` | 博客和小说章节的同步元数据 | 已实现 |
| Collection | `series` | 多章节小说作品元数据 | 已实现 |
| Collection | `photography` | 摄影标题、封面、摘要和排序 | 模型保留，公开体验暂缓 |
| Global | `resume` | 结构化简历、Projects 关系与 Lexical 补充内容 | 模型与固定模板已实现 |
| Global | `site-settings` | 站名、简介、URL、邮箱和社交链接 | 已实现 |
| Global | `header` | 首页导航 | 已实现 |
| Global | `footer` | 页脚导航、邮箱和版权 | 已实现 |

## Writings 与 Series

`writings` 统一保存博客和小说章节元数据：

- `title`、`slug`、`kind`、`language`
- `summary`、`coverPath`、`publishedAt`
- `sourcePath`、`syncedAt`
- 小说章节使用 `series` 与 `chapterOrder`

`series` 保存小说作品级元数据：

- `title`、`slug`、`language`
- `summary`、`coverPath`、`publishedAt`
- `sourcePath`、`syncedAt`

正文不写入 SQLite，也不在 Payload Admin 中编辑。发布仓库默认分支中的 Markdown 是正文
真源，Payload 只保存路由、列表和关系查询所需元数据。
内容一旦进入发布仓库默认分支就视为公开发布；`publishedAt` 只用于日期展示和排序，
不控制可见性，也不提供草稿、审批或定时发布语义。

两个 Collection 允许匿名读取，普通 REST/GraphQL 创建、更新和删除均被拒绝。同步程序通过
受信任的服务端 Local API 写入。当前模型不使用 Payload drafts、versions 或 localized
内容字段。

## Projects

当前字段：

- `title`
- `slug`
- `summary`
- `cover`
- `technologies`: 内嵌名称数组
- `externalURL`、`repositoryURL`
- `sortOrder`
- `publishedAt`

项目当前采用结构化字段，没有 `gallery`、正文 Blocks、`featured` 或文档级 SEO 字段。
前台详情已经消费这些现有字段，并在链接缺失或协议不安全时隐藏对应动作。如真实项目案例
需要长正文或图库，再通过独立 Schema 变更扩展，不能在页面组件中假设不存在的字段。

## Photography

当前字段为 `title`、`slug`、`summary`、`cover`、`sortOrder` 和 `publishedAt`。模型与路由
暂时保留，但摄影公开入口和详情体验不属于当前建设重点。

## Resume

`resume` 是 Global。旧字段 `title`、`cover`、`sortOrder` 和 Lexical `content` 原样保留，
新增结构化模块：

- `positioning`：展示名称、职业标题、定位摘要、工程经验年数
- `coreCapabilities`：标题、标签和说明
- `professionalProjects`：匿名项目标题、领域、年份、角色、技术栈、业务问题、技术决策和
  个人贡献
- `publicProducts`：到现有 `projects` 的多值关系
- `governanceCases`：年份、说明、职责贡献和关注点
- `skillGroups`：技能分组、技能与适用场景
- `currentFocus`：关注方向和状态

所有新增模块均可选，以保留既有数据并允许分阶段录入。前台使用固定中文模板；Lexical
`content` 作为补充内容继续通过官方 JSX converter 渲染。联系邮箱读取 `site-settings`，
Resume 不保存照片、婚姻状况、私人联系方式、院校、培训机构、公司、医院或客户字段。

## Globals

Globals 适合全站只有一份的数据：

- `site-settings`：站名、简介、站点 URL、邮箱和社交账户
- `header`：导航项数组
- `footer`：导航、版权和联系方式

不要把单例设置建成只允许一条记录的 Collection，除非未来需要每租户一份或版本化查询模式。

## 关系与查询约束

- 为列表页设置 `defaultPopulate` 或显式 `select`，避免取回完整富文本。
- relationship 深度默认保持低值。
- 对 `slug`、`publishedAt`、常用排序字段建立索引。
- 小说章节只在 `writings.series` 保存单向关系；`series` 不重复维护章节数组。
- 内容路径只保存发布仓库相对路径；不得保存宿主机绝对路径。
- 项目、媒体、摄影和 Globals 的公开读取必须经过明确 Access 决策。

## 暂缓模型

当前不创建 `tags`、`categories`、通用 `pages` 或 Page Builder。只有搜索、筛选、独立可编辑
页面等真实需求出现后，再评估这些模型；不要按旧 Blank Template 规划提前加入。

## 参考

- [Collections](https://payloadcms.com/docs/configuration/collections)
- [Globals](https://payloadcms.com/docs/configuration/globals)
- [Fields](https://payloadcms.com/docs/fields/overview)
- `src/collections/Writings.ts`
- `src/collections/Series.ts`
- `src/collections/Projects.ts`
- `src/globals/SiteSettings.ts`
