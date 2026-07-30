# waitforit-site 建设总览与进度

> 最后更新：2026-07-30
>
> 本文是后续开发的单一进度入口，记录目标、已确认决策、目标架构、阶段计划、验证结果和风险。
>
> 第一阶段的原始执行记录已归档至 [`docs/progress/2026-07-28-phase-1.md`](./docs/progress/2026-07-28-phase-1.md)。

## 1. 项目定位

本项目是一个由 Payload CMS 和 Next.js 构建、部署在个人服务器上的长期个人站。

目标优先级：

1. 私人知识沉淀：知识在 Obsidian 中形成和维护。
2. 简历：提供稳定、可维护的个人身份与经历页面。
3. 长期写作出版：将选定的 Markdown 内容持续发布到站点。
4. 摄影：后续提供独立的摄影作品体验。
5. 个人品牌：通过视觉、内容和持续维护自然形成，不单独做营销系统。

第一版正式内容的优先级：

1. 博客
2. 多章节短篇小说
3. 简历
4. 摄影和项目展示后移

## 2. 已确认的产品与技术决策

| 编号 | 决策 | 结果 |
| --- | --- | --- |
| D-001 | 首页定位 | WebGL 场景继续作为默认主视觉入口，不增加普通内容索引替代首页 |
| D-002 | 写作来源 | Obsidian 是知识沉淀工具；单独的 GitHub 私有仓库保存全部待发布 Markdown |
| D-003 | 发布含义 | 发布仓库默认分支中的 `content/` 内容全部视为公开内容，不建立草稿或审批状态机 |
| D-004 | 版本控制 | 文章版本、修改和回滚由作者通过 Git 人工控制 |
| D-005 | 正文存储 | Markdown 正文不写入 SQLite；服务器从 Git 工作目录只读文件 |
| D-006 | SQLite 职责 | 只保存文章元数据、路由标识、小说章节关系和仓库相对路径 |
| D-007 | Git 同步 | 第一阶段使用单工作目录和普通 `git pull --ff-only`，不做 Worktree、Commit 快照或自动版本保留 |
| D-008 | 内容模型 | 博客与小说章节统一为 `writings`；多章节短篇小说由 `series` 组织 |
| D-009 | Markdown | 第一阶段支持标准 Markdown、GFM、YAML Frontmatter 和相对资源 |
| D-010 | Obsidian 扩展 | 第一阶段不支持 `[[双链]]`、`![[附件嵌入]]`、Callout、Dataview |
| D-011 | MDX/HTML | 不使用 MDX，不执行文章内 JavaScript，默认不开放原生 HTML |
| D-012 | 多语言 | 公共 UI 和 Payload Admin 支持简体中文与英语；作者内容保持原语言，不做字段级翻译 |
| D-013 | 部署 | 继续采用个人服务器、Docker、SQLite 和持久化本地文件基线 |
| D-014 | SEO/域名 | 不作为当前阶段目标；域名与 TLS 在部署阶段处理，应用级 SEO 后续单独建设 |
| D-015 | 自动拉取 | 发布仓库由服务器上的只读 Deploy Key 访问，使用 systemd timer 每 1 分钟执行一次快进拉取，不开放 Webhook 入口 |
| D-016 | 内容资源 | 相对图片由 `/content-assets/*` 受控路由读取；路径必须位于 `content/`，只开放图片扩展名并设置 CSP 与 `nosniff` |
| D-017 | 页面标题 | Frontmatter `title` 是页面唯一 H1；正文若重复以同名 H1 开头，渲染时只移除这一处重复标题 |
| D-018 | M4 编排语言 | SHA 比较、成功状态记录、失败重试和 Payload 同步使用 TypeScript/Node；不维护 Bash/Python 业务脚本 |
| D-019 | M4 调度边界 | systemd 只按分钟直接执行 `git pull --ff-only` 和一次 Compose 工具容器；工具容器在 SHA 未变化时不初始化 Payload |
| D-020 | 首页降级 | WebGL 初始化失败时显示可访问的项目链接；开发期 React Effect 重挂载不得主动丢失仍会复用的 canvas context |
| D-021 | 当前前台重点 | 暂缓部署工作，先完成项目详情、Globals 消费和文章阅读版式 |
| D-022 | 摄影入口 | 保留 `photography` 模型与路由代码，当前首页与导航隐藏摄影入口 |
| D-023 | 项目详情范围 | 第一版只消费现有封面、摘要、技术栈、外部链接和仓库链接，不先扩展项目 Schema |
| D-024 | 简历架构 | 使用结构化 Resume Global、复用现有 Projects 和固定中文前端模板；旧 Lexical 内容保留 |
| D-025 | 简历隐私 | 不公开照片、婚姻、私人联系方式、院校、培训机构、公司、医院或客户名称；联系方式只读 SiteSettings 邮箱 |
| D-026 | 简历时间 | 匿名职业项目和治理案例只记录年份 |
| D-027 | 阅读背景 | 博客正文使用低干扰蓝色 Side Rays；小说章节使用默认交互 Galaxy，并提供减少动态效果与 WebGL 降级 |
| D-028 | 全站色彩 | 内页采用暖黑、Klein Blue 和浅蓝焦点体系；首页 Three.js 场景继续纯黑 |
| D-029 | Globals 消费 | 首页 Footer 保持场景叠层，内页 Footer 使用文档流；邮箱优先 Footer 并回退 SiteSettings |

### 明确不做

- 不把 Payload 改造成 Obsidian 的替代品。
- 不在 Payload Admin 中编辑或回写 Git Markdown。
- 不为尚未出现的多实例、协作编辑、自动回滚和复杂审批流程预先设计。
- 不为文章正文建立 Git 与 SQLite 双份真源。
- 不在第一阶段实现搜索、标签体系、RSS、完整 SEO、评论、订阅或会员。
- 不改变 `ProjectScene.tsx` 的相机表、几何、纹理生命周期、`768px` 断点和 Raycaster。

## 3. 当前实际状态

### 3.1 已完成

- [x] Payload 3.86.0、Next.js 16.2.12、React 19.2.6、Node.js 24 基线。
- [x] SQLite、Lexical、本地媒体与 Payload Admin。
- [x] Collections：`users`、`media`、`projects`、`writings`、`series`、`photography`。
- [x] Globals：`resume`、`site-settings`、`header`、`footer`。
- [x] Payload 数据驱动的首页 Manifest。
- [x] Three.js/WebGL 首页场景。
- [x] 项目列表与消费现有字段的结构化详情。
- [x] 摄影模型与直接路由保留，首页、Header、Footer 和 Manifest 入口过滤。
- [x] 独立私有发布仓库、目录契约、测试博客和两章短篇样例。
- [x] 发布仓库目录扫描、YAML Frontmatter 校验、路径派生元数据和符号链接拒绝。
- [x] `writings` 与 `series` 只读元数据模型、关系、类型和差异 migration。
- [x] 手动 `content:sync` 命令及新增、更新、删除、非法内容不写入测试。
- [x] 隔离运行时发布测试：站点启动后新增、修改正文和删除文章均无需重新构建。
- [x] 安全 Markdown 文件读取、GFM/HTML 清理渲染器和受控图片路由。
- [x] 博客列表/正文与小说列表/作品目录/章节阅读页面。
- [x] 博客 Side Rays、小说 Galaxy、减少动态效果、页面隐藏暂停和 WebGL 静态降级。
- [x] 公共内容 Access allow/deny 集成测试。
- [x] 15 项 Playwright 回归覆盖，包括 WebGL 卡片点击、无 WebGL 降级和 `390x844` 阅读布局。
- [x] 首页 React Effect 重挂载时的 WebGL context 崩溃修复及可点击项目降级导航。
- [x] TypeScript 实现的 Commit SHA 检测、成功状态记录与失败自动重试编排。
- [x] 简体中文/英语公共 UI、语言 Cookie、非法值回退。
- [x] 现有 Resume Lexical 字段的官方 JSX 渲染器、数据校验和双语空状态。
- [x] 结构化 Resume Global、Projects 关系、固定中文模板和数据保留 migration。
- [x] SiteSettings/Header/Footer 的站名、描述、URL、邮箱、导航、版权和社交链接消费。
- [x] Payload Admin 自有字段与导航标签的中英文适配。
- [x] Dockerfile、Compose、GitHub Actions CI 和部署原则文档。
- [x] 桌面与 `390x844` WebGL 浏览器基线测试。

### 3.2 尚未完成

- [ ] 在服务器验证每分钟拉取、TypeScript SHA 检测和工具容器元数据同步。
- [ ] 简历真实内容录入与公开 GitHub 产品人工整理。
- [ ] 当前代码部署到服务器。
- [ ] 生产服务器安全整改。

### 3.3 当前成熟度判断

| 目标 | 当前判断 |
| --- | --- |
| WebGL + Payload 技术演示 | 基线完成 |
| 第一阶段移植任务 | 完成 |
| 可阅读的个人出版站 | 本地页面与结构完成；简历真实内容待录入 |
| 可正式公开运营的个人站 | 未完成 |
| 服务器生产就绪 | 未完成 |

## 4. 目标内容架构

```text
Obsidian
  └─ 作者筛选并整理待发布 Markdown
       └─ GitHub 私有发布仓库
            └─ 服务器 Git 工作目录
                 ├─ 同步程序解析 Frontmatter 并更新 Payload 元数据
                 └─ Next.js 页面按相对路径只读 Markdown
                      └─ MarkdownRenderer 渲染为统一站点样式
```

### 4.1 内容真源

- GitHub 私有发布仓库是文章正文的唯一真源。
- 仓库内 `content/` 目录只保存准备公开的内容。
- Git 提供历史、人工修改和人工回滚。
- SQLite 丢失后，文章正文仍可从 Git 仓库恢复。
- Payload 只负责索引、关系、路由查询、首页数据和其他站点内容。

### 4.2 简化同步流程

1. 作者在 Obsidian 中完成内容。
2. 作者将待发布内容提交并推送到发布仓库默认分支。
3. 服务器收到同步触发。
4. 内容目录执行 `git pull --ff-only`。
5. 同步程序扫描 `content/`。
6. 同步程序解析 Frontmatter 和目录结构。
7. 在一次同步中新增、更新或删除 Payload 元数据。
8. 动态页面在后续请求中读取最新元数据和 Markdown；当前阶段不另设页面缓存。
9. 同步失败时报告错误，由作者人工修正 Git 内容并重新触发。

第一阶段不实现：

- Worktree 或 `releases/<sha>`。
- 自动回滚。
- 多版本工作目录。
- 多分支预览。
- Payload Jobs 工作流。
- 内容审批和定时发布。

### 4.3 运行时文件读取

- 环境变量 `CONTENT_REPO_ROOT` 指向容器内只读内容根目录。
- SQLite 只保存仓库相对路径，不保存服务器绝对路径。
- 页面先按 slug 查询 Payload 元数据，再从 `CONTENT_REPO_ROOT` 下读取 Markdown。
- 路径必须经过规范化，并确认最终路径仍位于允许的 `content/` 根目录内。
- 公开请求不得直接把用户输入转换成文件系统路径。
- 文件不存在或解析失败时返回受控错误，不暴露服务器路径。

建议的生产挂载：

```yaml
volumes:
  - payload_data:/app/data
  - payload_media:/app/media
  - /srv/waitforit-content:/content:ro
```

## 5. 发布仓库约定

### 5.1 目录

```text
content/
├─ blog/
│  └─ <article-slug>/
│     ├─ index.md
│     └─ assets/
└─ novels/
   └─ <series-slug>/
      ├─ index.md
      ├─ 01-<chapter-slug>.md
      ├─ 02-<chapter-slug>.md
      └─ assets/
```

约定：

- 博客 slug 由文章目录名确定。
- 小说 slug 由作品目录名确定。
- 章节顺序由两位数字文件名前缀确定。
- 章节 slug 由去掉顺序前缀后的文件名确定。
- `index.md` 用于博客正文或小说作品简介。
- 相对图片和附件放在同级 `assets/`。
- `.obsidian/`、`.github/`、仓库 `README.md` 和 `content/` 外文件不参与发布。

### 5.2 最小 Frontmatter

博客：

```yaml
---
title: Payload 内容模型设计
language: zh-CN
summary: 记录个人站内容模型的设计过程。
publishedAt: 2026-08-01T08:00:00+08:00
cover: ./assets/cover.webp
---
```

小说作品 `index.md`：

```yaml
---
title: 最后一班列车
language: zh-CN
summary: 一篇分章节的短篇小说。
cover: ./assets/cover.webp
---
```

小说章节：

```yaml
---
title: 抵达
---
```

说明：

- `title` 必填。
- `language` 用于正文 `lang` 属性，不触发内容翻译；小说章节默认继承作品语言。
- `summary`、`publishedAt`、`cover` 按页面需要选填。
- slug、内容类型、所属小说和章节顺序由目录结构推导，避免重复配置。

## 6. Payload 目标模型

### 6.1 `writings`

职责：保存博客和小说章节的可查询元数据。

建议字段：

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `title` | text | required |
| `slug` | text | required、unique、index |
| `kind` | select | `blog` 或 `novelChapter` |
| `language` | text/select | 原文语言 |
| `summary` | textarea | 可选 |
| `sourcePath` | text | required、unique、index、Admin 只读 |
| `series` | relationship | 小说章节必填，博客为空 |
| `chapterOrder` | number | 小说章节使用 |
| `coverPath` | text | 可选，相对资源路径 |
| `publishedAt` | date | 可选、index |
| `syncedAt` | date | 同步程序维护、Admin 只读 |

不包含：

- Markdown 正文。
- `_status` 草稿状态。
- Payload drafts/versions。
- localized 内容字段。

### 6.2 `series`

职责：表示一篇包含多个章节的短篇小说。

建议字段：

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `title` | text | required |
| `slug` | text | required、unique、index |
| `language` | text/select | 原文语言 |
| `summary` | textarea | 可选 |
| `sourcePath` | text | required、unique、index、Admin 只读 |
| `coverPath` | text | 可选 |
| `publishedAt` | date | 可选、index |
| `syncedAt` | date | 同步程序维护、Admin 只读 |

章节不在 `series` 中保存数组；前端按 `writings.series` 和 `chapterOrder` 查询，避免双向关系重复维护。

### 6.3 Access

- 匿名用户：允许读取 `writings` 和 `series`。
- 认证 Admin：允许读取。
- 浏览器和普通 API：不允许直接创建、更新和删除同步内容。
- 同步程序：通过受信任的服务端 Local API 写入。
- `users`、同步凭据和服务器路径不得公开。

### 6.4 现有模型迁移

- `posts` 和 `novels` 被 `writings`、`series` 取代。
- 当前仓库只有演示种子，远端服务器仍是更早的 `users/media` 基线。
- 实施前再次检查本地和服务器是否出现真实文章。
- 如存在真实文章，先导出；否则 migration 可以移除旧演示模型。
- `projects`、`photography` 保留，后续阶段继续使用。
- `resume` 保留为 Global。

## 7. Markdown 渲染设计

### 7.1 技术选择

第一阶段计划采用：

- `react-markdown`
- `remark-gfm`
- 必要时使用 `rehype-sanitize`
- 一个项目自有的 `MarkdownRenderer` Server Component
- 一个项目自有的 Markdown CSS Module

不采用：

- MDX
- `dangerouslySetInnerHTML`
- 文章内 React/JavaScript
- 未经约束的原生 HTML
- Obsidian 专有语法

### 7.2 组件映射

`MarkdownRenderer` 统一接管：

- 标题与标题锚点
- 段落
- 内部和外部链接
- 图片和图注
- 行内代码和代码块
- 引用
- 表格及移动端横向滚动
- 有序/无序列表和任务列表
- 分隔线
- 脚注

样式目标：

- 与当前主站字体、颜色、间距和焦点状态一致。
- 中文与英文都保持可读的行宽和行高。
- 代码、表格和长链接不得破坏 `390x844` 移动布局。
- 外部链接明确标识并安全打开。
- 正文渲染不引入 Client Component，除非后续出现明确交互需求。

## 8. 目标路由

```text
/                         WebGL 主视觉首页
/blog                     博客列表
/blog/[slug]              博客正文
/novel                    小说作品列表
/novel/[seriesSlug]       小说介绍与章节目录
/novel/[seriesSlug]/[chapterSlug]
                          章节正文
/resume                   简历
```

后续阶段：

```text
/photography
/photography/[slug]
/projects
/projects/[slug]
```

## 9. 分阶段实施路线

### M0：规划与证据基线

状态：**已完成**

- [x] 盘点当前代码、内容模型、路由和测试。
- [x] 核验本地依赖与构建。
- [x] 通过 SSH 只读核验服务器。
- [x] 与维护者确认产品目标和内容发布边界。
- [x] 归档第一阶段执行记录。
- [x] 建立本动态进度文档。

### M1：发布仓库契约与解析原型

状态：**已完成**

目标：先证明目录、Frontmatter 和 Markdown 可以稳定解析，不改生产 Schema。

主要工作：

- [x] 建立私有发布仓库和 `content/` 目录。
- [x] 在本站测试目录加入最小 Markdown fixture。
- [x] 定义 TypeScript 元数据类型和校验。
- [x] 实现博客、小说作品和章节的目录扫描。
- [x] 验证新增、修改、删除和非法 Frontmatter。
- [x] 明确相对图片 URL 的解析方式。

完成条件：

- 给定一个本地内容目录，可以生成确定性的博客、作品和章节元数据。
- 非法内容给出明确文件名和错误原因。
- 不读取 `content/` 外的文件。

项目技能：

- `payload-model-content`
- 模型稳定后再进入 `payload-manage-schema-change`

### M2：`writings` / `series` Schema

状态：**已完成**

目标：用统一模型替换现有博客和小说壳模型。

主要工作：

- [x] 新建 `src/collections/Writings.ts`。
- [x] 新建 `src/collections/Series.ts`。
- [x] 添加同步字段的 Admin 只读配置。
- [x] 注册新 Collection。
- [x] 增加 Access allow/deny 测试。
- [x] 生成并检查 Payload 类型。
- [x] 创建并审查 migration。
- [x] 移除已核实为种子数据的 `posts`、`novels` 演示记录和表。

完成条件：

- Local API 可以按类型、slug、series 和章节顺序查询。
- 匿名用户只能读取，不能写入。
- 迁移 `up`/`down` 已人工审查。
- `npm run check` 通过。

项目技能：

- `payload-model-content`
- `payload-manage-schema-change`
- 上线前使用 `payload-audit-access`

### M3：Markdown 读取和页面体验

状态：**已完成**

目标：完成博客、小说和章节的真实阅读页面。

主要工作：

- [x] 新建安全文件路径解析工具。
- [x] 新建 `MarkdownRenderer` 和对应 CSS Module。
- [x] 接入 GFM。
- [x] 完成博客列表和正文。
- [x] 完成小说列表、作品目录和章节正文。
- [x] 处理 404、文件缺失和 Markdown 解析错误。
- [x] 保持 UI 双语，正文原语言。
- [x] 增加桌面、移动端、键盘和控制台错误测试。

完成条件：

- 标准 Markdown/GFM 样例正确渲染。
- Markdown 样式与主站视觉一致。
- 外部输入不能读取内容根目录外文件。
- 小说章节顺序正确。
- `390x844` 下代码块、表格和图片不溢出页面。
- 首页 WebGL 回归通过。

### M4：自动同步

状态：**进行中**

目标：发布仓库推送后，服务器拉取并更新站点元数据，无需重新构建应用。

主要工作：

- [x] 在服务器建立专用内容仓库目录和只读部署凭据。
- [x] 以 systemd timer 作为等价触发机制，每 1 分钟执行一次。
- [x] 执行 `git pull --ff-only` 并用真实提交验证快进更新。
- [x] 在本地实现扫描内容并更新 Payload 元数据。
- [x] 删除仓库中已移除文件对应的元数据。
- [x] 提供可人工执行的 `npm run content:sync`。
- [x] 在隔离内容仓库和 SQLite 上验证运行中站点无需重建即可新增、修改和删除文章。
- [x] 通过 `CONTENT_REPO_HOST_PATH` 将宿主机发布仓库只读挂载到容器 `/content`。
- [x] 新增独立的 `content-sync` 工具镜像，避免扩充 Next.js standalone 运行镜像。
- [x] 用 TypeScript 实现 Commit SHA 比较、成功状态原子记录、未变化跳过和失败后下一分钟重试。
- [x] systemd unit 只保留直接 `git` 与 `docker compose` 命令，不承载 Shell 业务逻辑。
- [x] 为首次同步、未变化跳过、失败不推进状态和同 SHA 重试增加 4 项集成测试。
- [ ] 在服务器安装 unit/env 配置并将现有拉取与 `content-sync` 工具容器串联。
- [ ] 部署后验证无需重建即可新增、修改和删除文章。

由于当前页面均为动态渲染，第一阶段不另设页面缓存；因此本地实现不需要显式
revalidate。若后续引入 Next.js 数据缓存或静态生成，再增加受影响路由的缓存失效。

第一阶段错误策略：

- 同步失败即报告，不做自动回滚。
- 作者在 Git 中修复内容后重新推送或人工重试。
- 不自动改写 Markdown。
- 不在同步过程中自动创建新版本目录。

完成条件：

- 推送新文章后，无需重新构建 Next.js 即可访问。
- 修改文章后页面显示新内容。
- 删除文章后对应路由返回 404。
- 非法 Markdown/Frontmatter 不产生半套元数据。
- 未授权请求不能触发同步。

### M5：简历

状态：**进行中（结构与模板完成，内容待录入）**

目标：将 `/resume` 从空壳改为真实可维护页面。

主要工作：

- [x] 使用结构化 Resume Global、现有 Projects 关系和固定中文模板。
- [x] 为现有 Lexical `content` 建立官方 JSX 前台渲染器。
- [x] 处理空编辑器数据、畸形数据和中英文空状态。
- [x] 增加个人定位、核心能力、匿名职业项目、公开产品、工程治理、技术图谱和当前关注方向。
- [x] 联系邮箱读取 SiteSettings，不增加私人信息字段。
- [ ] 录入和复核真实内容。
- [ ] 增加结构化 Resume 的专用桌面、移动端和打印验证。

说明：2026-07-30 已按确认方案完成结构化 Schema 和固定模板。新增字段全部可选，旧
Lexical 内容保留为补充区；migration 不删除旧列或旧数据。具体履历内容和公开项目选择
仍需后续录入与复核。

### M6：服务器整改与首次正式部署

状态：**待开始**

目标：将当前项目安全部署到已确认服务器。

当前服务器事实：

- CentOS 7，已停止常规安全维护。
- 2 核 CPU、约 1.7 GiB 内存、2 GiB Swap、40 GiB 磁盘。
- Docker 25、Compose 2.24、1Panel/OpenResty。
- `waitforit.cn` 已反向代理到 `127.0.0.1:3000`。
- 远端 `/opt/payloadcms` 运行旧版空白 Payload 基线，不是当前仓库。
- 应用 `3000` 和 Redis `6379` 当前绑定公网地址。
- 主机 `iptables INPUT` 当前默认接受。
- HTTPS 当前未正常工作。

部署前置条件：

- 升级或迁移到仍受支持的 Linux 系统。
- 关闭 Redis 公网暴露；本站不需要时移除 Redis。
- 应用端口只允许回环或内部 Docker 网络访问。
- 配置主机防火墙和云安全组。
- 建立 SQLite、媒体、环境配置的备份与恢复流程。
- 通过 CI 构建不可变镜像，避免直接在服务器维护源码依赖目录。
- 运行 migration 前完成备份。

完成条件：

- 当前项目镜像在服务器运行。
- 首页、Admin、博客、小说、简历和媒体访问正常。
- 数据库与内容仓库挂载持久化。
- 容器健康检查通过。
- 公网不能直接访问应用和 Redis 端口。
- 备份能够实际恢复。

### M7：后续能力

状态：**暂缓**

- 摄影真实内容模型和大图体验。
- 项目案例详情。
- SEO、Open Graph、sitemap、robots、RSS。
- 标签、搜索和内容关联。
- 站点监控与访问统计。
- 经实际需求验证后的 Obsidian 扩展语法。

## 10. 当前验证记录

2026-07-29 本地内容发布链路复验：

### 聚焦集成测试

- `content-scanner.int.spec.ts`：4 项通过；覆盖确定性扫描、非法 Frontmatter、重复章节序号和符号链接。
- `content-paths.int.spec.ts`：11 项通过；覆盖路径穿越、绝对路径、反斜杠、符号链接、Markdown 读取、图片尺寸和受控 URL。
- `content-model.int.spec.ts`：2 项通过；覆盖匿名读取、普通 API 写入拒绝、可信 Local API 写入、关系和字段校验。
- `content-sync.int.spec.ts`：3 项通过；覆盖新增、更新、删除以及完整校验后再写入。
- `markdown-renderer.int.spec.tsx`：5 项通过；覆盖 GFM、脚本/HTML 清理、链接、相对图片和重复 H1。
- `rich-text-renderer.int.spec.tsx`：3 项通过；覆盖官方 Lexical 转换、空编辑器和畸形数据。
- `content-sync-if-changed.int.spec.ts`：4 项通过；覆盖首次同步、SHA 未变化跳过、失败不推进状态和同 SHA 重试。

### Schema migration

- migration：`20260729_035214_replace_posts_novels_with_writings_series`。
- 数据检查：旧 `posts/novels` 各只有一条 `seed.ts` 演示记录，没有真实文章。
- 在 `dev.db` 副本执行 `up`：成功创建 `writings/series`，保留 1 条项目和 5 条媒体数据。
- 在同一副本执行 `down`：成功恢复空的 `posts/novels` 表，项目和媒体数据保持不变。
- rollback 限制：旧演示记录不恢复；新 Markdown 元数据可由发布仓库重新同步。
- 本地 `dev.db` 已执行 `up` 并同步真实样例：1 篇博客、1 个作品、2 个章节。
- 对真实本地发布仓库再次执行 `npm run content:sync`：成功，新增、更新、删除的 6 个计数均为 `0`，确认同步幂等。
- 未对生产数据库执行 migration。

### `npm run check`

- lint：0 error、0 warning。
- `generate:types`：成功，生成类型由 `posts/novels` 更新为 `writings/series`。
- 集成测试：9 个测试文件、38 项测试通过。
- Next.js 生产构建：成功。
- 动态路由包括 `/blog/[slug]`、`/novel/[seriesSlug]`、章节路由和受控资源路由。

2026-07-30 前台收尾复验：

- `npm run lint`：通过，0 error、0 warning。
- `npm run generate:types`：通过；Resume 类型包含 7 个结构化模块和 Projects 关系。
- `npm run test:int`：11 个测试文件、43 项测试通过。
- `npm run build`：通过；生产类型检查和全部路由生成成功。
- Resume migration：`20260730_083430_structured_resume`。`up` 只增加结构化子表、
  Projects 关系表和定位字段；`down` 只移除这些新增结构，不修改旧 `content`、`cover`、
  `title` 或 `sortOrder`。
- 在 `data/migration-test-20260729-1.db` 的独立副本执行本次 `up/down`：`up` 后新增定位列，
  `down` 后移除；预先写入的旧标题和 Lexical JSON 在两个阶段均保持不变。
- 未对生产数据库运行 migration。

### Playwright

命令：`npm run test:e2e -- tests/e2e/scene.spec.ts --workers=1`

- 首页场景聚焦测试 4/4 通过：WebGL 初始化无控制台错误、真实 canvas 卡片点击跳转、无 WebGL 可访问链接和 `390x844` 移动端。
- Admin 聚焦复测 3/3 通过；冷启动初始化钩子预算由默认 30 秒调整为 120 秒。
- 最后一次全量运行 14/15 通过；唯一失败是首个场景用例在前序 Admin 冷启动后耗尽默认 30 秒测试预算。随后已把该用例预算调整为 60 秒，按要求未再次执行耗时全量。
- Admin dashboard/list/edit 通过；已修正允许 Payload 自动附加查询参数的 URL 断言。
- 简体中文默认值、英语切换、Cookie 持久化和非法 locale 回退通过。
- 博客 GFM、相对图片、正文原语言、UI 切换通过。
- 小说作品目录、章节顺序、前后章节导航通过。
- `390x844` 下表格、代码块和图片未造成页面横向溢出。
- 内置浏览器人工验收尝试：本地站点已监听 `3000`，但浏览器 WebView 两次在附着阶段超时；未将其记为页面验证通过。
- 章节路由复验：数据库中 `last-train/arrival` 元数据、关系和 Markdown 文件均存在；完全相同的 REST 查询成功。旧开发进程最初返回 404，触发路由树重新编译后，直接请求 `/novel/last-train/arrival` 返回 200，包含章节标题与正文。新增或移动 App Router 目录后应重启开发服务器，不把旧进程的路由清单作为代码结果。

2026-07-30 复验补充：

- 当前常规 E2E 已扩展为 19 项。
- 本地并行全量运行：16/19 通过；失败项为项目详情跳转、小说章节跳转和 WebGL 卡片点击。
- 使用单 worker 重跑三个失败项：两个普通页面跳转通过，WebGL 卡片点击仍未找到可
  Raycast 的卡片。
- 常规 E2E 目前读取开发数据库和相邻内容仓库，缺少显式 fixture 准备，不能把本机结果
  直接当作干净环境的可复现证明。
- WebGL 测试应等待场景明确完成纹理预载和入场动画，而不是在 `networkidle` 后立即扫描
  画布坐标。
- 测试层次、E2E 必要性和数据约束已整理至 `docs/TESTING.md`。

2026-07-30 前台收尾浏览器复验：

- i18n、发布阅读页和场景的聚焦运行先完成 16/17；唯一失败来自场景测试选择器把加载器
  当成悬浮标题，并非 Three.js 场景不可见。
- 修正选择器并等待纹理、可见实例和渲染帧后，Raycaster 点击单项通过。
- `tests/e2e/scene.spec.ts --workers=1`：9/9 通过，覆盖 WebGL、真实卡片点击、无 WebGL
  降级、`390x844`、`768px` 断点、Context 恢复、触控、键盘和摄影入口隐藏。
- 博客 Side Rays、小说 Galaxy、减少动态效果静态降级、项目详情封面与摘要在聚焦运行中
  通过。
- 内置浏览器两次创建本地标签时 WebView 附着超时，因此未把人工视觉检查记为通过。

### 运行时内容发布验收

命令：`npm run test:e2e:content-runtime`

- 2/2 通过，耗时约 2.7 分钟。
- 测试使用 `test-results/runtime-content` 下的临时内容仓库和 SQLite，以及独立的 `localhost:3100` 开发服务器。
- 站点启动后新增 Markdown 并执行同步：文章路由无需重新构建即可访问。
- 仅修改 Markdown 正文、不执行元数据同步：刷新后立即显示新正文。
- 删除 Markdown 并执行同步：元数据删除 1 条，对应路由返回 404 并显示受控未找到页面。
- `/resume` 在空内容时显示中英文固定 UI 文案，语言切换后正确更新。
- 测试不修改真实发布仓库、`dev.db` 或服务器。

2026-07-30 复验命令在 6 分钟预算内未结束并被终止；本次结果为不确定，不能用它覆盖
2026-07-29 的历史通过记录，也不能据此宣称当前运行时 E2E 已通过。

### Docker 内容挂载

- `docker compose config`：通过。
- 本地默认宿主机路径解析为相邻的 `waitforit-site-content` 仓库。
- 应用容器内 `CONTENT_REPO_ROOT=/content`，挂载属性为只读。
- 生产环境只需把 `CONTENT_REPO_HOST_PATH` 设置为服务器内容仓库路径；本轮未连接或修改服务器。
- `content-sync` 工具容器执行 TypeScript CLI；SHA 未变化时在初始化 Payload 前退出，只有新 Commit 才执行元数据同步。
- 按维护者决定，不在 Windows Docker Desktop 上执行容器运行测试；镜像、Compose、systemd 与私库拉取在服务器部署时验证。

## 11. 风险与约束

| 风险 | 当前处理 |
| --- | --- |
| Git 工作目录与 SQLite 元数据短暂不一致 | 第一阶段接受单机简化方案；同步按固定步骤执行，失败由人工修复 |
| 内容文件被路径穿越读取 | 只存相对路径；服务端规范化并限制在内容根目录 |
| 私有仓库资源无法直接公开 | 通过站点受控资源路径读取或后续同步到媒体，不使用私有 GitHub Raw URL |
| Markdown 样式破坏移动布局 | 渲染器和 E2E 覆盖代码、表格、图片、长链接 |
| 旧 `posts`/`novels` 数据丢失 | migration 前重新检查数据；真实数据存在时先导出 |
| 首页场景被内容改动带坏 | 保留场景冻结合同并持续运行 scene E2E |
| 常规 E2E 依赖开发机现有数据 | 增加独立数据库和内容 fixture；场景交互等待显式就绪状态 |
| 服务器资源有限 | 镜像优先在 CI/本地构建；服务器只运行和迁移 |
| standalone 运行镜像不能执行元数据同步 | 已增加独立 `content-sync` 工具镜像；主站 runner 保持最小化，服务器仍需验证共享 SQLite 和只读内容挂载 |
| 冷启动同步接近每分钟检查周期 | TypeScript CLI 先比较当前 SHA 与上次成功 SHA；未变化不初始化 Payload，失败不推进状态并在下一分钟重试 |
| 服务器系统与端口安全 | 列为正式部署硬门槛，不在应用发布时绕过 |
| 文档再次落后于代码 | 每个里程碑完成后必须同步更新本文 |

## 12. 进度维护规则

后续每次开发至少更新：

1. 对应里程碑的状态和复选项。
2. 新增或修改的架构决策。
3. 实际执行的验证命令与结果。
4. 未解决的风险和 blocker。
5. 若 Schema 改变，记录 migration 和数据保留策略。
6. 若部署改变，记录服务器、挂载、备份和回滚影响。

状态只允许使用：

- `待开始`
- `进行中`
- `受阻`
- `已完成`
- `暂缓`

“已完成”必须有代码/config 证据和实际验证结果，不能仅凭实现描述。

## 13. 下一步

当前继续完成本地内容与验收，不推进部署工作：

1. 录入并复核 Resume 的真实内容，人工整理首批公开 GitHub 产品关系。
2. 为常规 E2E 增加独立项目、媒体、博客、小说和 Resume fixture。
3. 增加结构化 Resume 的打印样式与专用浏览器回归。
4. 在内置浏览器可以正常附着后补一次人工视觉验收。

M4 的服务器验收和 M6 的部署整改保持未完成状态，待前台建设阶段结束后再恢复。
