# 个人站第一阶段任务书

> 由 `/leader` skill 于 2026-07-28 产出。用法：在执行 agent 那边输 `/goal `，粘贴下面分割线之间的整段，发出去。
>
> 导读：领导只看三处--开头「这活为什么干」两行、「我替领导拍的板」、末尾「完成条件」两条硬指标。

---

你是一个人干活的执行者，这份文档是唯一任务来源；中途没人可问，拿不准写进 BLOCKED.md，跳过做别的，最后随交付提交。断了换会话：先读 PROGRESS.md 接着做，别重做，每做完一项立刻更新。
这活为什么干：把 gabrielveres 的单视口三维空间队列视觉，嫁接到 Payload 个人站，首页当五种内容（产品/博客/小说/摄影/简历）的统一作品入口，内容在 Admin 编辑、首页从 Payload 动态取数。
让步顺序：视觉合同不可破 > 内容真能从 Admin 改 > 其余路由不 404 > 代码整洁。
「不许」违反算失败；「建议」有更好的路就走，PROGRESS.md 记一句。

## 我替领导拍的板
- 简历单例，建 Global resume（cover+sortOrder+content），并进 manifest 合并。猜的：payload 02 文档规定单例用 Global。
- 第一阶段五种都手动上传封面当纹理；"HTML 卡片自动生成封面"延到第二阶段。猜的：Q4 选了最小范围。
- tags/草稿/版本/SEO 第一阶段不做；空壳路由只放标题+"待补"。
- 装包用 npm，three@0.185.1 + @types/three@0.185.1，版本锁死和源码一致。
- 路由：/projects/<slug> /blog/<slug> /novel/<slug> /photography/<slug> /resume。

## 界限
- 只许改/新建：src/collections/ src/globals/ src/utilities/ src/components/ src/app/(frontend)/，加 src/payload.config.ts、src/collections/Media.ts、package.json。
- 冻结区：docs/gabrielveres/（源码参考）、docs/payload/（规格）、src/app/(payload)/（Admin/API）、src/payload-types.ts（只许 generate:types 重生成，禁手改）。
- ProjectScene.tsx 移植只许改两处：manifest 输入（fetch 改 props）、链接目标（原站 URL 改本站路由）。相机/位置表/纹理缓存/768 断点/Raycaster 一行不许动，改了算失败。

## 现状与任务 0
基线：Payload 3.86 / Next 16.2.12 / React 19.2.6 / TS 5.7.3 / SQLite / Lexical；只有 users+media（media 仅 alt，无 sizes）；前端占位 page.tsx；无 three。源码在 docs/gabrielveres/src/（ProjectScene 等 5 组件 + types/project.ts + public/assets/manifest.json 71 项 35KB），依赖 three@0.185.1。
任务 0：npm run build 确认基线绿；读 types/project.ts + manifest.json 头部确认形状；npm install three@0.185.1 @types/three@0.185.1；≤10 行开工回执（理解的目标/顺序/最大风险）写进 PROGRESS.md 再动工。命令不存在/数字对不上就停，写 BLOCKED.md。

## 任务 1 内容模型
建 4 Collection：projects posts novels photography；4 Global：resume site-settings header footer。每个 Collection：title(必填) slug(唯一索引) summary cover(upload->media，必填) sortOrder(number) publishedAt；projects 加 externalURL/repositoryURL/technologies。Media 加 caption + sizes(thumbnail/small/medium/large/og，按 docs/payload/07)。resume Global：title/cover/sortOrder/content(richText)。注册进 payload.config.ts，npm run generate:types。
验收：generate:types 无错；payload-types.ts 出现 4 collection+4 global 类型；Admin 能新建每种。

## 任务 2 manifest 查询
建 src/utilities/getManifest.ts：Local API 查 4 collection + resume global，select 最小字段，映射成 ManifestItem（形状对齐 docs/gabrielveres/src/types/project.ts 的 ProjectTexture），按 sortOrder 合并排序返回。cover 的 width/height/aspectRatio 从 media 取。
验收：返回 5 条；select 无 richText；depth≤1。
反向验证：改一条种子 title -> 返回值里那条变了（证明真查库非写死）。

## 任务 3 移植场景+首页装配
拷 docs/gabrielveres/src/components/ 下 5 组件 + 对应 .module.css、globals.css token、types/project.ts 进 src/components/ + src/app/(frontend)/。ProjectScene 改收 manifest props（删 fetch /assets/manifest.json）。SiteHeader/SiteFooter 文案链接从 header/footer/site-settings global 取（换掉硬编码 GABRIEL VERES/office@humanist.ro 等）。page.tsx 改 Server Component：调 getManifest() 传给 ProjectScene(Client Component)，装配 Header/Footer/Overlays。
验收：lint+build 过；1440×1000 截图接近 docs/gabrielveres/research/design-references/ 参考（主平面位置/倾角/黑负空间）；滚轮后 canvas 画面变；Hover 出标题；点击进路由。
反向验证：传一个 cover 缺失项 -> 场景不崩；触发 webglcontextlost -> Header/Footer 仍在。

## 任务 4 种子+空壳路由
每种内容 1 条种子（带真实封面，可用 docs/gabrielveres/public/ 下图或自备）。空壳路由 /projects/[slug] /blog/[slug] /novel/[slug] /photography/[slug] /resume：Local API 取文档，渲染标题+"待补"，无结果 notFound()。
验收：首页 5 平面分别点进 5 路由不 404，各显对应标题。
反向验证：访问不存在的 slug -> notFound() 404，不是空壳。

## 规矩
- 防作弊：getManifest 必须真调 payload.find，禁写死数组/读静态 json；ProjectScene 与源码 diff 只许 manifest-input+link-target 两处不同；禁删 dispose()/放宽 768 断点。
- 不新增 three+@types/three 以外依赖。
- 同一验收连败 3 次换项；结果比开工差就回滚如实报告。
- 每次改完 npm run lint && npm run generate:types && npm run build。

## 完成条件
1. 1440×1000 首页显示 3D 队列、5 条种子（每种 1 条）、滚轮变画面、Hover 出标题、点击进对应路由；390×844 用移动位置表（顶留白约 315px、主平面 128vw）。
2. 改 Payload 任一条种子 title，刷新首页对应平面标题变了；lint/generate:types/build 全绿；ProjectScene.tsx 与源码 diff 只有 manifest-input+link-target 两处。
- 每条验收都要在对话里贴实际命令输出（含反向验证的红->绿证据），只说做完了不算。
- BLOCKED.md 随交付提交，空的写"无"。
- 或已跑满 6 轮--满轮即停，如实汇报卡在哪、还差什么。
