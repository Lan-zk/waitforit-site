# Gabriel Veres Homepage — Design Specification

> 本文档是当前复刻站的权威视觉规范，面向后续设计与实现 Agent。
> 它回答“页面必须呈现为什么样子”。技术原理、架构取舍和维护策略见
> [`DESIGN-PHILOSOPHY.md`](./DESIGN-PHILOSOPHY.md)。

## 1. 设计目标

这是一个单视口、全屏、深色的创意开发者作品集首页。它不是传统的纵向网页：

- 页面始终占满一个视口，不产生文档滚动。
- 作品以倾斜、重叠的三维纹理平面组成一条可循环队列。
- 左侧保留大面积纯黑负空间，作品视觉集中在中下部和右侧。
- Header、Footer 与渐变保护层固定在三维场景之上。
- 滚轮用于浏览作品队列，而不是移动页面。
- 界面装饰必须克制；作品截图才是主要色彩来源。

设计关键词：

`editorial`、`spatial index`、`black void`、`glass chrome`、`controlled motion`、
`portfolio as texture`。

## 2. 权威参考

### 2.1 视觉参考优先级

1. 本文档中的精确规格。
2. 当前组件代码及 CSS Modules。
3. 原站参考截图：
   - `research/design-references/original-desktop-1440.png`
   - `research/design-references/original-tablet-768.png`
   - `research/design-references/original-mobile-390.png`
4. 当前 Three.js 验收截图：
   - `research/design-references/clone-three-desktop-1440.png`
   - `research/design-references/clone-three-mobile-390.png`
5. `research/` 下的行为、拓扑与组件规格。

### 2.2 基准视口

| 模式 | 视口 | 布局规则 |
|---|---:|---|
| Desktop | `1440 × 1000` | 完整导航、Footer、桌面作品构图 |
| Tablet | `768 × 900` | 仍使用桌面模式，允许左右内容自然裁切 |
| Mobile | `390 × 844` | 精简 Header、隐藏 Footer、使用移动端作品构图 |

断点规则是严格的：

- `width >= 768px`：桌面模式。
- `width < 768px`：移动模式。
- 不得把 `768px` 误归入移动模式。

## 3. 页面层级

所有层均固定在一个 `100svh` 黑色视口内。

| 层级 | 元素 | z-index | 作用 |
|---:|---|---:|---|
| 1 | `ProjectScene` WebGL Canvas | `0` | 作品纹理、三维深度、交互主体 |
| 2 | 项目 Hover Label | 场景内 `2` | 显示当前 Raycaster 命中的作品名 |
| 3 | 顶部/底部渐变 | `1990` | 保护 Header/Footer 的文字可读性 |
| 4 | `SiteFooter` | `1991` | 邮箱、Overview、Index |
| 5 | `SiteHeader` | `2000` | 主导航、品牌、时间 |

Header、Footer 和渐变不得跟随三维场景移动，也不得被 Canvas 遮挡。

## 4. 全局设计令牌

### 4.1 颜色

| Token | 值 | 用途 |
|---|---|---|
| `--page-bg` | `#000000` | 页面和 Canvas 背景 |
| `--ink` | `#ffffff` | 主要文字和图标 |
| `--glass` | `rgb(255 255 255 / 10%)` | Header 胶囊背景 |
| `--glass-hover` | `#ddfa42` | 导航 Hover/Focus 背景 |
| `--lime` | `#ddfa42` | 强调色、文本选择背景 |
| `--edge` | `rgb(255 255 255 / 24%)` | 平面边缘参考色 |
| Hover Label 背景 | `rgb(8 8 8 / 70%)` | 浮动项目标题 |
| Hover Label 边框 | `rgb(255 255 255 / 18%)` | 浮动项目标题边缘 |

除作品纹理本身外，不增加额外主题色。所有控件默认保持黑、白、半透明灰；
荧光黄绿色只用于明确的交互反馈。

### 4.2 字体

| 字体 | 文件 | 字重 | 用途 |
|---|---|---:|---|
| `FK Display` | `/fonts/fk-display-400.woff2` | 400 | 页面默认、Header、Footer、Hover Label |
| `Mabry` | `/fonts/mabry-400.woff2` | 400 | 品牌相关备用字体 |
| `Mabry` | `/fonts/mabry-500.woff2` | 500 | 中等强调备用字体 |
| Fallback | `Arial, Helvetica, sans-serif` | — | 字体加载失败时 |

全局字体渲染：

```css
font-family: "FK Display", Arial, Helvetica, sans-serif;
-webkit-font-smoothing: antialiased;
```

### 4.3 字体层级

| 元素 | Font Size | Line Height | 其他 |
|---|---:|---:|---|
| 导航胶囊 | `14.062px` | `15.4682px` | 400 |
| 桌面品牌字标 | `19.3352px` | `19.3352px` | uppercase |
| 桌面时间 | `14.062px` | `15.4682px` | 单行 |
| Footer | `15.8197px` | `17.4017px` | 400 |
| 移动时间 | `17px` | `18px` | 单行 |
| Hover Label | `clamp(.82rem, 1.15vw, 1.1rem)` | `1` | 400 |

## 5. 全局页面行为

```css
html,
body {
  width: 100%;
  min-height: 100%;
  margin: 0;
  background: #000;
  overscroll-behavior: none;
}

body {
  overflow: hidden;
}
```

- 页面不得出现系统滚动条。
- 禁止 overscroll 回弹影响作品队列。
- 链接继承文字颜色且默认无下划线。
- 文本选择使用黑字、`#ddfa42` 背景。
- Canvas 和场景容器使用 `touch-action: none`。

## 6. 桌面构图

### 6.1 空间分配

在 `1440 × 1000` 下：

- 左侧约 35%–45% 保持纯黑负空间。
- 作品队列主要占据右侧约 72% 和下方约 88%。
- 初始核心平面为 XYLO 的绿色 `Vision` 画面。
- 近景平面从左下方进入并遮挡核心平面的局部。
- 远景平面向右上方延伸，超出视口时自然裁切。

### 6.2 初始作品层次

初始活动索引为 manifest `36`。显著可见的纹理顺序为：

| Manifest Index | 项目 | 视觉角色 |
|---:|---|---|
| 33 | Divino Harrogate | 左下深红近景 |
| 34 | A Touch Of Ink | 左下深灰近景 |
| 35 | Better Angels Ventures | 核心平面前方的深色卡片 |
| 36 | XYLO | 主导绿色 `Vision` 平面 |
| 37 | Society Studios | 后方黑色 `Discover` 平面 |
| 38 | The Lodge | 右上白色 `From Concept to Design` |
| 39 | Bark | 右侧白/绿色内容 |
| 40 | XYLO | 右上绿色 Sustainability |
| 41 | The Wild Hare | 最右上浅色 Team 平面 |

### 6.3 桌面场景位置

坐标是视觉校准值：`x`/`width` 为 `vw`，`y` 为 `vh`，`z` 为像素空间深度，
旋转为度数。`slot 0` 是初始主平面。

| Slot | x | y | width | z | rotateX | rotateY | rotateZ |
|---:|---:|---:|---:|---:|---:|---:|---:|
| -5 | -34 | 103 | 34 | 360 | 1.6 | -2.5 | 4.0 |
| -4 | -15 | 91 | 38 | 320 | 1.4 | -2.2 | 3.2 |
| -3 | 2.5 | 79 | 40 | 270 | 1.2 | -1.9 | 5.6 |
| -2 | 19.5 | 67 | 30 | 210 | 1.0 | -1.6 | 5.8 |
| -1 | 35 | 53 | 31 | 140 | 0.8 | -1.2 | 5.4 |
| 0 | 46 | 44.5 | 33.5 | 65 | 0.5 | -0.7 | 6.0 |
| 1 | 59 | 32.5 | 38 | -20 | 0.2 | 0.0 | 4.5 |
| 2 | 69.5 | 16.5 | 30 | -110 | -0.1 | 0.7 | 3.6 |
| 3 | 79 | 14 | 31 | -190 | -0.3 | 1.0 | 3.0 |
| 4 | 86 | 7 | 26 | -270 | -0.5 | 1.4 | -1.4 |
| 5 | 95 | 1 | 23 | -350 | -0.8 | 1.8 | -1.8 |
| 6 | 108 | -9 | 21 | -430 | -1.0 | 2.2 | -2.2 |

## 7. 移动端构图

### 7.1 空间分配

在 `390 × 844` 下：

- 顶部约 `315px` 保留纯黑空间。
- 绿色 XYLO 平面约从 `x: 58px; y: 316px` 进入。
- 主平面宽度约 `128vw`，必须超出右侧视口。
- `Discover` 文案从主平面上缘后方露出。
- Better Angels 与深灰平面在左下前景形成遮挡。
- 不显示桌面 Footer 和项目 Hover Label。

### 7.2 移动场景位置

| Slot | x | y | width | z | rotateX | rotateY | rotateZ |
|---:|---:|---:|---:|---:|---:|---:|---:|
| -5 | -170 | 100 | 90 | 280 | 1.3 | -1.8 | 2.6 |
| -4 | -130 | 92 | 90 | 245 | 1.1 | -1.5 | 2.1 |
| -3 | -100 | 85 | 95 | 205 | 0.9 | -1.2 | 6.4 |
| -2 | -55 | 71 | 90 | 160 | 0.7 | -0.9 | 6.2 |
| -1 | -18 | 54 | 82 | 105 | 0.5 | -0.6 | 6.0 |
| 0 | 15 | 40.5 | 128 | 35 | 0.2 | -0.2 | 6.0 |
| 1 | 55 | 28.5 | 110 | -45 | 0.0 | 0.4 | 4.8 |
| 2 | 100 | 22 | 95 | -125 | -0.2 | 0.7 | 3.8 |
| 3 | 140 | 14 | 90 | -200 | -0.4 | 1.0 | -1.2 |
| 4 | 178 | 8 | 82 | -275 | -0.6 | 1.4 | -1.6 |
| 5 | 214 | 1 | 74 | -350 | -0.8 | 1.8 | -2.0 |
| 6 | 248 | -8 | 68 | -425 | -1.0 | 2.1 | -2.4 |

## 8. ProjectScene 视觉规范

### 8.1 Canvas

- 固定铺满整个视口。
- 背景为不透明纯黑。
- 不显示 Canvas 自身边框。
- 纹理使用原始宽高比，不拉伸、不裁切。
- 平面使用无灯光材质，图片颜色不受虚拟灯光改变。
- 开启真实深度遮挡；近景必须自然覆盖远景。

视觉相机参数：

| 模式 | 等效相机距离 | 透视原点 |
|---|---:|---|
| Desktop/Tablet | `1500` | `64% 46%` |
| Mobile | `1150` | `65% 43%` |

可见窗口：`relativeSlot > -5.75 && relativeSlot < 7.15`。

边缘淡出：

```text
opacity = min(
  1,
  max(0, relativeSlot - visibleStart),
  max(0, visibleEnd - relativeSlot)
) × 1.75
```

### 8.2 Hover Label

- 仅桌面和平板显示。
- 跟随指针，并根据指针是否位于右侧 28% 自动切换左右方向。
- 与指针水平间距：`14px`。
- 最大宽度：`min(19rem, 80vw)`。
- Padding：`.32rem .58rem .38rem`。
- 圆角：`999px`。
- 背景：`rgb(8 8 8 / 70%)`。
- 边框：`1px solid rgb(255 255 255 / 18%)`。
- `backdrop-filter: blur(8px)`。
- 淡入时长：`140ms ease`。
- Hover 平面向前提升 `58` 个世界单位并缩放到 `1.012`。

## 9. SiteHeader

### 9.1 桌面

Header 固定在 `top: 36px`，左右内边距：

```css
padding-inline: clamp(27px, 3.784vw, 72px);
```

横向结构：

```text
[Starburst] [Work] [About] [Blog]    GABRIEL VERES    [Contact] [Time + Globe]
```

所有相邻控件间距为 `5.27324px`。

#### Starburst

- 外框：`31.625 × 32.5px`。
- 圆形玻璃背景。
- 图标：`18.45 × 18.45px`，`opacity: .7`。
- Hover/Focus：背景变为 `#ddfa42`，图标旋转 `45deg`。

#### 导航胶囊

- 背景：`rgb(255 255 255 / 10%)`。
- 圆角：`87.8873px`。
- Padding：`9.22817px 15.8197px 8.78873px`。
- Hover/Focus：黑色文字、`#ddfa42` 背景。
- 文本有上下两份，交互时整体向上交换一行。
- 时长：`350ms cubic-bezier(.4, 0, .2, 1)`。

#### 品牌字标

- 必须位于视口的绝对水平中心，不跟随左右控件宽度变化。
- 文本：`GABRIEL VERES`。
- `19.3352px`，全大写，单行。

#### 时间胶囊

- 最小宽度：`114px`。
- 高度：`32.5px`。
- 左右 Padding：`0 12px 0 15px`。
- 时间区最小宽度：`74px`。
- 时间格式：`HH:MM AM/PM`，每分钟更新。
- Globe：`15 × 15px`，`opacity: .75`。

### 9.2 移动端

桌面导航、品牌字标、Contact 和时间胶囊隐藏，仅保留：

- 时间：`left: 27px; top: 46px; font-size: 17px`。
- Starburst：
  - `left: 62.5vw; top: 27px`。
  - `54 × 54px`。
  - 通过 `translateX(-50%)` 水平定位。
  - 内部图标 `32 × 32px`。

## 10. GradientOverlays

顶部和底部均为固定的 `15vh` 保护层，`pointer-events: none`。

顶部：

```css
linear-gradient(
  0deg,
  rgba(1, 1, 1, 0) 15.2%,
  rgba(1, 1, 1, 0.5) 51%,
  rgba(0, 0, 0, 0.85) 84.8%
)
```

底部：

```css
linear-gradient(
  0deg,
  rgba(0, 0, 0, 0.85) 9.5%,
  rgba(1, 1, 1, 0.5) 51%,
  rgba(1, 1, 1, 0) 84.8%
)
```

渐变不是独立装饰，而是确保白色导航在明亮项目纹理上始终可读。

## 11. SiteFooter

仅在 `width >= 768px` 显示。

- 固定在 `bottom: 44px`。
- 左右内边距：`3.784vw`。
- 字体：`15.8197px / 17.4017px`。
- 左：`office@humanist.ro`。
- 中：`Overview`，绝对位于视口水平中心。
- 右：`Index`。

交互：

- Email Hover/Focus：`1px` 下划线从左向右展开，`250ms ease`。
- Index Hover/Focus：上下复制文本交换，`350ms cubic-bezier(.4,0,.2,1)`。

## 12. 文案与链接合同

界面固定文案：

```text
Work
About
Blog
GABRIEL VERES
Contact
office@humanist.ro
Overview
Index
```

链接：

| 元素 | 目标 |
|---|---|
| Starburst / Wordmark | `/` |
| Work / Index | `/projects` |
| About | `/about` |
| Blog | `/blog` |
| Contact | `/contact` |
| Email | `mailto:office@humanist.ro` |
| 项目平面 | `https://www.gabrielveres.com/projects/<slug>` |

项目标题、slug、纹理路径和宽高比必须来自
`public/assets/manifest.json`，不得在组件中复制维护。

## 13. 交互状态

### 13.1 滚轮

- 任何 `wheel` 输入都由作品场景消费。
- 文档本身保持不动。
- 队列运动必须带惯性，而不是直接跳格。
- 前后滚轮方向可逆，71 个项目无限循环。

### 13.2 指针视差

- 指针坐标归一化到 `[-1, 1]`。
- 整组平面产生小幅平移和 X/Y 旋转。
- 视差必须微弱，不能让用户失去构图方向。

### 13.3 项目命中

- 只对当前可见平面进行命中检测。
- 桌面命中后显示标题、指针变为 `pointer`、平面轻微前移。
- 点击打开对应原站项目页。
- 移动端不显示 Hover Label，但轻点仍执行命中与跳转。

### 13.4 Reduced Motion

当 `prefers-reduced-motion: reduce`：

- 队列进度直接追上目标值，不保留惯性尾随。
- 指针视差归零。
- 控件和 Hover Label 的过渡时长接近零。
- 页面构图、滚轮和项目访问能力仍保留。

## 14. 响应式矩阵

| 元素 | Desktop `>768` | Tablet `768` | Mobile `<768` |
|---|---|---|---|
| 完整 Header | 显示 | 显示，可裁切 | 隐藏 |
| 移动 Header | 隐藏 | 隐藏 | 显示 |
| Footer | 显示 | 显示 | 隐藏 |
| Hover Label | 显示 | 显示 | 隐藏 |
| 相机距离 | 1500 | 1500 | 1150 |
| 主平面宽度 | 33.5vw | 33.5vw | 128vw |
| 构图策略 | 右下聚集 | 桌面构图裁切 | 顶部留白、超大裁切 |

移动端不是桌面版的等比缩小，而是独立的艺术指导构图。

## 15. 可访问性与语义

- Header、Footer 使用语义化 `header`、`nav`、`footer` 和链接。
- 时间胶囊提供本地时间的可访问名称。
- Canvas 设为 `aria-hidden="true"`，避免读屏器读取无意义的绘图表面。
- 71 个项目链接另有视觉隐藏的语义导航。
- Hover 与 Focus 必须共享导航控件状态。
- 颜色交互不能作为唯一文本含义；标签文本始终存在。

## 16. Agent 实施规则

### 必须保持

- 单视口、无文档滚动。
- 黑色负空间比例。
- `768px` 的严格断点。
- Header/Footer 相对场景的独立固定层。
- 本地真实项目纹理和原始宽高比。
- 初始活动索引 `36`。
- 滚轮、视差、Raycaster、Reduced Motion。

### 禁止

- 把页面改成常规纵向 Section 布局。
- 在移动端显示完整桌面导航。
- 一次性把 71 张纹理全部常驻 GPU。
- 使用卡片阴影、圆角卡片或额外霓虹色“美化”项目平面。
- 用模拟图片、渐变占位图或生成式素材替换真实资源。
- 让 Header 或 Footer 随 WebGL 场景旋转。
- 将 `768px` 归入移动端。

## 17. 视觉验收清单

- [ ] `1440 × 1000` 下主绿色平面位置、尺寸和倾角接近参考。
- [ ] 桌面左侧保留显著纯黑负空间。
- [ ] `Discover` 文案从绿色平面后方露出。
- [ ] 近景深灰/深红平面正确遮挡核心平面。
- [ ] Header 胶囊没有第二行文字泄漏。
- [ ] 品牌字标严格位于视口中心。
- [ ] Footer 固定于底部 `44px`。
- [ ] `390 × 844` 下顶部留白约 `315px`。
- [ ] 移动时间和 Starburst 坐标正确。
- [ ] `768px` 仍显示桌面 Header/Footer。
- [ ] 滚轮后 Canvas 画面实际变化且无文档位移。
- [ ] Hover 命中显示正确项目标题。
- [ ] 浏览器控制台无错误或 WebGL 资源警告。
- [ ] `pnpm run typecheck` 和 `pnpm run build` 通过。
