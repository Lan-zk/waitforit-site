---
total_score: 21
na_heuristics: 5,10
max_score: 32
p0_count: 0
target: 首页 WebGL 到博客/小说长期阅读的完整公共访问路径（含简历、项目、摄影一致性）
p1_count: 3
timestamp: 2026-07-29T07-54-38Z
slug: src-app-frontend
---
Method: dual-agent (A: independent design review · B: deterministic detector/browser evidence)

## Design Specificity Verdict

Wait For It 的首页具有清晰、不可互换的作者性：黑色展览舞台、空间化 WebGL 平面、克制胶囊导航、proofing chartreuse 和 FK Display/Mabry 组合共同形成 “The After-Hours Editorial Gallery”。它没有滑向 SaaS 后台或明亮卡片式模板。

进入内容层后，独特性下降。博客与小说索引保留了大标题和横向分隔的编辑感，但系列章节、项目、摄影和部分空状态仍像原始 HTML 列表；正文也没有兑现 DESIGN.md 约 60ch 的长期阅读宽度。

首页的 Three.js 数学契约基本忠实于参考实现：相机、几何、桌面/移动 placement tables、插值、滚轮推进、Raycaster 与 `768px` 运行时条件保持一致。当前视觉差距主要来自数据层：参考画面是十余个重叠平面的密集斜向队列，实时清单只有 5 个唯一目的地，原有 placement 系统无法单独补足这种深度与丰度。

纹理窗口仍以 20 张为上限，并包含异步加载、过期加载释放、缓存淘汰、材质/几何/渲染器清理及 context-loss 处理。相对参考实现，清理阶段删除了 `renderer.forceContextLoss()`；这需要以 React 生命周期和实际上下文恢复行为验证，而不是机械恢复。

自动扫描共报告 28 条：17 条字号、4 条颜色、6 条圆角、1 条 side-tab。其中 27 条是设计系统一致性建议，不自动升级为视觉缺陷；blockquote 的逻辑起始边框是语义引用样式，属于误报。浏览器覆盖因 Codex 内置浏览器控制超时未获得可靠截图/DOM/控制台证据，HTTP 仅证明 5 个代表路由可达且默认 `html lang` 为 `zh-CN`。

## Nielsen Heuristics

| # | Heuristic | Score | Evidence |
|---|---|---:|---|
| 1 | Visibility of system status | 2/4 | 桌面有 hover label，但无滚动/触摸提示、加载状态或当前卡片状态。 |
| 2 | Match system / real world | 3/4 | 标签、日期、返回和章节方向自然；移动端纯图像交互不够自解释。 |
| 3 | User control and freedom | 3/4 | 内容页退出路径稳定；场景仍主要依赖鼠标。 |
| 4 | Consistency and standards | 3/4 | 色彩、字体、focus 与主要索引一致；次要列表仍未进入同一编辑语言。 |
| 5 | Error prevention | n/a | 公共阅读路径没有输入或破坏性操作。 |
| 6 | Recognition rather than recall | 2/4 | 移动端移除了区段导航和卡片标题；隐藏链接可获得不可见焦点。 |
| 7 | Flexibility and efficiency | 2/4 | 直接路由与章节导航有效；没有可见键盘场景索引，也没有真实 touch-drag。 |
| 8 | Aesthetic and minimalist design | 3/4 | 视觉世界克制明确；场景稀疏与超宽正文削弱完成度。 |
| 9 | Error recognition and recovery | 3/4 | 404、空简历和无 WebGL fallback 可控；加载/读取失败没有页内解释。 |
| 10 | Help and documentation | n/a | 个人出版体验不需要帮助文档。 |
| **Total** |  | **21/32** | **65.6%，可用但存在关键路径缺口** |

## Cognitive Load

中等，8 项检查中 3 项失败：

- 选择过多：桌面首页同时提供区段导航、联系、双语切换、Index 与多个场景卡片。
- 工作记忆负担：移动端没有标题和主要区段导航，访客必须靠图片猜测目的地。
- 渐进披露不足：移动端不是逐步揭示卡片信息，而是直接删除了 hover 信息。

阅读路径本身线性、分块清楚；正文过宽增加的是视觉追踪负担，而非决策复杂度。

## Emotional Journey

- 进入峰值：黑色舞台与空间平面提供强烈的第一印象，但 5 项清单削弱了参考画面的丰度。
- 定向低谷：桌面导航和 hover label 能恢复方向；移动端同时失去两者。
- 阅读沉静段：大标题、弱化摘要和单一强调色适合长期阅读。
- 疲劳低谷：正文可扩展到 1040px，远宽于设计系统约 60ch 的目标。
- 结尾：上一篇/下一篇章节导航完整；系列目录和次要列表的收尾感不足。

## What Works

1. 视觉世界具有明确作者性，且克制、冷静、编辑感与产品目标一致。
2. 阅读语义基础可靠：作者语言、外链属性、懒加载图片、宽表格/代码 containment、章节顺序和前后导航均已建立。
3. 失败状态不是空白：404、空简历、无 WebGL fallback 均能给出受控结果。

## Priority Issues

### [P1] 实时场景无法复现参考画面的构图密度

首页身份依赖深层斜向平面队列。只有 5 个实时内容项时，即便相机和 placement 数学正确，感知结果仍与原版根本不同。

修复：建立低内容量策略。以唯一内容作为可访问导航，以 16–20 个渲染实例循环填充场景；纹理缓存按资源去重，链接语义保持去重。增加参考视口最小可见平面密度断言。

### [P1] 移动端与键盘场景路径不可发现

移动端隐藏桌面导航和 hover label，却没有 touch-drag；正常 WebGL 下，语义链接被裁剪但仍可获得焦点。

修复：增加 pointer/touch drag 推进、点按后持久显示所选卡片标题，并提供紧凑的移动/键盘可见场景索引。增加真实触摸与键盘 E2E。

### [P1] 长文正文过宽

内容容器上限为 1040px，但 Markdown 没有 `ch` 阅读宽度，违背长期阅读目标。

修复：把正文限制在约 66ch；代码、表格与媒体使用受控 breakout。分别验证中文、英文及 390px。

### [P2] 场景可访问语义仍为英文

`Selected projects` 与 `Project links` 在中文 UI 中仍为英文。

修复：从解析后的 locale 传入场景和链接导航标签；外链的新窗口语义也使用本地化的视觉隐藏文本。

### [P2] 次要列表失去已建立的编辑语言

系列章节、项目、摄影是原始列表，与博客/小说的 ruled rows 不一致。

修复：复用 PublishingList 的结构节奏或新增 ChapterList；移动端保留紧凑日期，不直接删除元数据。

## Persona Red Flags

### Jordan — 首次访问者

- 首页没有说明滚动会推进空间队列，场景卡片是可进入目的地。
- 移动端无卡片标题与主要区段导航。
- “Index” 实际仅指向项目，语义比产品使命暗示的站点索引更窄。

### Sam — 键盘/读屏访问者

- WebGL 正常时，项目链接可被 focus，但视觉上被裁剪。
- canvas 与项目导航的可访问标签写死为英文。
- 无 WebGL fallback 有用，但正常状态下没有等价可见键盘入口。

### Casey — 移动端分心访问者

- 主要区段导航消失。
- 没有 touch-drag；现有移动测试仍使用 mouse wheel。
- 场景卡片无持久标题，索引日期也被完全隐藏。

### Lin — 长文读者

- 正文可达到 1040px，而不是约 60–70ch。
- 章节前后导航完成度好，但系列目录缺乏进度与编辑节奏。

### Morgan — 简历评估者

- 空简历状态只声明内容准备中，没有导向项目、写作或联系入口。
- 首页营造了完成度，简历死路因此产生更明显的信任落差。

## Minor Observations

- `MAX_TEXTURES = 20` 合理；当前瓶颈是清单项数量，不是缓存上限。
- `768px` 运行时阈值与 `767px` CSS 边界符合文档契约。
- `renderer.forceContextLoss()` 的删除是生命周期清理的主要差异，需要行为验证。
- 外链已有 `noopener noreferrer`，但视觉隐藏语义仍可补强。
- 项目与摄影详情应继续标注为 phase-one shells，不应被描述为完成内容。
- 自动扫描的 blockquote side-tab 是误报；极大胶囊圆角属于刻意几何，不应机械改成常规圆角。

## Questions to Consider

- “首页忠实度”究竟是保留原版数学，还是保留原版感知上的深度与丰度？本轮按后者修复，同时不破坏前者。
- 移动端没有 hover 时，卡片名称应该在点按、选中还是底部常驻出现？本轮采用“触摸探索时明确、静止时克制”的选中标签。
- “Index” 应继续代表项目，还是升级为站点级阅读/作品索引？本轮不改变信息架构，只修复已确认路径。
- 长期阅读是核心结果时，正文为什么允许超过设计系统阅读宽度？本轮直接收窄。

Questions skipped: 用户已经明确确认优先级、完整公共访问路径和 “shape → critique → polish → live” 连续执行范围。
