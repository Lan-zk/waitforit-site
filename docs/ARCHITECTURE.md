# Architecture

## 运行时分层

```text
私有发布仓库                         Payload Admin
content/blog + content/novels             │
        │                                  │
        ▼                                  ▼
扫描、校验与元数据同步 ───────────→ Payload Collections / Globals
        │                                  │
        │                           SQLite + local media
        │                                  │
        └──────── 正文只读文件路径 ────────┤
                                           ▼
                              Next.js Server Components
                                           │
                  ┌────────────────────────┼──────────────────────┐
                  ▼                        ▼                      ▼
            博客与小说页面          项目/简历等页面        WebGL 首页 Manifest
```

- `payload`、`@payloadcms/next` 等依赖是框架本体，不在本仓库中修改。
- `src/payload.config.ts` 是项目总配置，注册数据库、编辑器、Collections 和 Globals。
- `src/collections/` 定义 `users`、`media`、`projects`、`writings`、`series` 和
  `photography`。
- `src/globals/` 定义 `resume`、`site-settings`、`header` 和 `footer`。
- `src/app/(payload)/` 是 Payload 管理后台和 API 的 Next.js 接入层，通常不手改生成文件。
- `src/app/(frontend)/` 是访客网站。Server Components 直接使用 Payload Local API，
  浏览器组件不初始化 Payload。
- `src/content/` 负责发布仓库扫描、路径边界、Markdown 读取和元数据同步。
- `data/`、`media/` 是运行时状态，不进入 Git。

## 当前内容模型

| 类型 | Slug | 当前职责 |
| --- | --- | --- |
| Collection | `users` | Payload Admin 认证 |
| Collection | `media` | 本地图片、alt、caption 和派生尺寸 |
| Collection | `projects` | 项目标题、封面、摘要、技术栈和外部链接 |
| Collection | `writings` | 博客与小说章节的只读同步元数据 |
| Collection | `series` | 多章节小说作品元数据 |
| Collection | `photography` | 暂时保留的摄影基础模型 |
| Global | `resume` | 结构化简历、Projects 关系和保留的 Lexical 补充内容 |
| Global | `site-settings` | 站名、简介、URL、邮箱和社交链接 |
| Global | `header` | 首页导航 |
| Global | `footer` | 页脚导航、邮箱和版权 |

`writings` 与 `series` 不保存 Markdown 正文，也不使用 Payload drafts。发布仓库默认分支中
`content/` 下的文件是正文真源；SQLite 只保存查询和路由所需元数据。同步模型的普通
REST/GraphQL 写入被拒绝，受信任的服务端同步通过 Local API 写入。

## 前台状态

- `/`：Payload 数据驱动的 Three.js/WebGL 首页。
- `/blog`、`/blog/[slug]`：博客列表和 Markdown 正文已实现。
- `/novel`、作品和章节路由：作品介绍、章节目录、正文及前后章节导航已实现。
- `/projects`：列表与详情已实现；详情只消费现有封面、摘要、技术栈和安全外链。
- `/resume`：结构化 Resume Global 与固定模板已实现；公开产品复用 Projects，旧 Lexical
  内容作为补充区保留。
- `/photography`：模型与路由保留；首页 Manifest、Header、Footer 和公开快捷入口过滤。
- 博客正文使用低干扰蓝色 Side Rays，小说章节使用 Galaxy；两者在减少动态效果、页面
  隐藏或 WebGL 不可用时退回静态背景。
- 内页 Header/Footer 由 `site-settings`、`header`、`footer` 统一驱动；首页保持场景叠层，
  内页使用正常文档流。

## 查询与渲染边界

- 列表查询使用窄 `select`、低 `depth`、有界 `limit` 和已索引排序字段。
- 面向公开请求且必须遵循 Access 的 Local API 查询设置 `overrideAccess: false`。
- Markdown 文件路径必须是发布仓库内的相对路径；拒绝绝对路径、路径穿越和符号链接逃逸。
- 相对图片通过 `/content-assets/*` 受控路由读取，不公开宿主机真实路径。
- 作者内容保持原语言；`zh-CN` / `en` 只翻译公共 UI 和 Admin 自有标签。
- 首页场景的相机、几何、纹理生命周期、断点、Raycaster 与释放逻辑属于回归敏感区域。
- 阅读背景在 Client Component 内初始化 OGL，但不访问 Payload；服务端页面仍通过 Local
  API 读取元数据。
- Resume 新字段全部可选，迁移只增加结构化表、关系表和定位列，不删除旧富文本数据。

## 暂不建设

- Fork 或修改 Payload 框架源码
- 通用 Payload 插件或可复用模板产品
- 评论、会员和可视化页面搭建器
- Payload 内的 Markdown 正文编辑或 Git 回写
- 搜索、标签、RSS、完整 SEO 和内容级自动翻译
- 复制生产数据库或媒体到开发环境
