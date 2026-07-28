# PROGRESS.md

## 开工回执（任务 0）
- 目标：把 gabrielveres 三维空间队列移植到 Payload 个人站，首页装 5 种内容（产品/博客/小说/摄影/简历）
- 顺序：T0 核验 -> T1 内容模型 -> T2 getManifest -> T3 移植场景+首页 -> T4 种子+空壳路由
- 最大风险：ProjectScene.tsx 859 行 1:1 移植，只许改 manifest 输入和链接两处
- 环境：node v24.14.0 / npm 11.9.0（D:\WorkLocal\HuanJ\nodejs）

## 配置偏差（whitelist 外的必要改动，记录给领导）
1. **tsconfig.json** 加 `"docs"` 到 exclude：原 include `**/*.tsx` 把 docs/gabrielveres/ 参考源码拉进类型检查导致 build 挂。未动冻结文件，未改运行时行为。
2. **eslint.config.mjs** globalIgnores 加 `'docs/**'`：docs/gabrielveres/ 的原版源码 + .next/ 构建产物被 lint（几百个 error）。同理必要。
3. **src/types/project.ts** 新建：ProjectScene 的 `@/types/project` import 要用，1:1 拷源码类型，保持移植只改两处。
4. **.env** 新建：DATABASE_URL / PAYLOAD_SECRET / NEXT_PUBLIC_SERVER_URL（新克隆没有）。

## T0 完成
- [x] npm install（744 包）+ .env + tsconfig 修复 + 基线 build 绿 + 装 three@0.185.1/@types/three@0.185.1 + 开工回执

## T1 内容模型 ✓
- 4 Collection：projects/posts/novels/photography（title/slug/summary/cover/sortOrder/publishedAt；projects 加 externalURL/repositoryURL/technologies）
- 4 Global：resume/site-settings/header/footer
- Media 增强：caption + imageSizes（thumbnail/small/medium/large/og）
- 验证：generate:types 无错；payload-types.ts 出现 4 collection（72-75 行）+ 4 global（99-102 行）类型；Local API 种子脚本成功创建文档（等价 Admin 可建）

## T2 getManifest ✓
- src/utilities/getManifest.ts：Local API 查 4 collection + resume global，select 最小字段（无 richText），depth 1，按 sortOrder 合并映射成 ProjectTexture
- 验证：首页 HTML 含 5 个种子标题（XYLO/First Post/The Lodge/Divino/Resume）-> 返回 5 条且 cover 填充成功（无封面的会被跳过）
- **反向验证**（verify-manifest.ts）：改 projects/xylo title 为 XYLO-VERIFY -> getManifest 返回 XYLO-VERIFY（旧的消失）-> 还原后 XYLO 回来。铁证真查库非写死。

## T3 移植场景+首页 ✓
- 拷 5 组件 + CSS modules + globals.css + 3 字体到 src/components、src/app/(frontend)、public/fonts
- ProjectScene 改动：manifest 输入（删 import json、projects 改 props、wrappedRelativeSlot 加 projects 参数）+ 链接（763/851 行去 gabrielveres.com 前缀）
- SiteHeader/SiteFooter 改 props（nav/brandName/contactHref、email/indexHref 从 global 来）
- page.tsx 改 Server Component（force-dynamic）：getManifest + 3 global，装配 4 组件
- layout.tsx 引 globals.css
- **防作弊 diff**（git diff --no-index）：5 增 7 删，只有 manifest-input + link-target 两类，相机/位置表/纹理缓存/768 断点/Raycaster 一行没动
- 验证：lint+build 过；首页 200，canvas 在，5 标题+5 路由+wordmark 全在

## T4 种子+空壳路由 ✓
- 种子脚本 src/utilities/seed.ts：上传 5 张 WebP 封面、4 collection 各 1 条、4 global 全设置（幂等）
- 空壳路由：4 详情 [slug] + 4 顶级列表 + /resume，各渲染标题+"内容待补"，无结果 notFound()
- 验证：5 详情+4 列表+/resume 全 200；/projects/nonexistent -> 404（反向验证 notFound 生效）

## 最终验证（lint 修复后）
- lint：EXIT 0，0 errors，1 warning（ProjectScene useEffect 缺 projects 依赖--场景故意只初始化一次，合理权衡）
- generate:types：无错
- build：通过，13 路由全编译（/ + 4 列表 + 4 详情 + /resume + admin + api）
- 冒烟：首页 200（canvas+5 标题+wordmark+路由）、/projects/xylo 200、/projects 200、/projects/nonexistent 404

## 待人工浏览器验证（HTTP 测不了）
- 滚轮驱动队列画面变化、Hover 显示标题、点击 plane 跳转的视觉交互
- 390×844 移动端位置表构图
- WebGL context loss 后 Header/Footer 仍在
- 代码是 1:1 移植（diff 已证），gabrielveres 原站这些交互都工作，移植未改场景逻辑
- **Playwright e2e 补充验证**（tests/e2e/scene.spec.ts，2 passed）：
  - 桌面：canvas 可见 + 有 WebGL 上下文 + 滚轮/hover 交互无 JS 错误
  - 390×844 移动端：canvas 可见 + 滚轮交互无 JS 错误（移动位置表代码路径跑通）
  - 字体 3 个 woff2 全 200 加载；唯一 404 是 /favicon.ico（装饰性，不影响场景）

## 进度
- [x] T0 [x] T1 [x] T2 [x] T3 [x] T4
