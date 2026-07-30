# 首页 3D 场景可调参数手册

本手册列出首页 3D 项目队列中所有可手动调整的参数。所有参数集中在 `src/components/ProjectScene.tsx`，配套样式在 `src/components/ProjectScene.module.css` 与 `src/components/GradientOverlays.module.css`。

> 调整前请先通读「场景工作原理」一节，理解 progress、slot、placement 三者的关系，避免改出非预期效果。

## 目录

- [场景工作原理](#场景工作原理)
- [参数速查表](#参数速查表)
- [一、槽位与可见窗口](#一槽位与可见窗口)
- [二、卡片尺寸](#二卡片尺寸)
- [三、入场动画起始](#三入场动画起始)
- [四、轨迹重定位（Refra​me）](#四轨迹重定位reframe)
- [五、缎带倾斜（Ribbon Tilt）](#五缎带倾斜ribbon-tilt)
- [六、玻璃质感](#六玻璃质感)
- [七、槽位关键帧表](#七槽位关键帧表)
- [八、超出关键帧的外推](#八超出关键帧的外推)
- [九、相机](#九相机)
- [十、渲染器](#十渲染器)
- [十一、材质与玻璃着色器](#十一材质与玻璃着色器)
- [十二、滚动与指针交互](#十二滚动与指针交互)
- [十三、入场时间线（GSAP）](#十三入场时间线gsap)
- [十四、CSS 样式参数](#十四css-样式参数)
- [调整工作流建议](#调整工作流建议)

---

## 场景工作原理

理解以下几个核心概念，才能准确判断每个参数的影响：

1. **progress（进度）**：一个浮点数，代表当前「聚焦」到第几个项目。滚轮 / 拖拽改变 `targetProgress`，每帧用 lerp 平滑到 `currentProgress`。
2. **relativeSlot（相对槽位）**：每个项目相对当前焦点的偏移量。`slot = 0` 是当前居中卡片，负值在一侧、正值在另一侧。项目列表会环绕（wrap）成无限队列。
3. **placement（位置）**：每个整数 slot 对应一组 `{ x, y, width, z, rotateX, rotateY, rotateZ }` 关键帧。非整数 slot 用 Catmull-Rom 样条在关键帧之间平滑插值，再经 `adjustPlacement` 二次重定位。
4. **z 轴 = 透视深度**：相机在 `z = +1500`（桌面）看向原点。**z 值越大（正）= 离相机越近 = 显得越大**；z 值越小（负）= 离相机越远 = 显得越小。整条缎带的 z 从一端到另一端单调递减，形成「远去」的纵深。
5. **可见窗口**：只有 `relativeSlot` 落在 `[VISIBLE_SLOT_START, VISIBLE_SLOT_END]` 内的卡片才渲染；纹理加载窗口 `[TEXTURE_SLOT_START, TEXTURE_SLOT_END]` 更宽，用于预加载。

数据流：`progress` → `wrappedRelativeSlot` → `placementAt`（样条插值）→ `adjustPlacement`（重定位 + 倾斜重置）→ `worldPositionForPlacement`（加透视）→ 设置 mesh 的 position / rotation / scale / opacity。

---

## 参数速查表

| 参数 | 当前值 | 位置 | 一句话作用 |
|---|---|---|---|
| `INITIAL_PROJECT_INDEX` | 36 | L11 | 入场时聚焦到第几个项目 |
| `MOBILE_BREAKPOINT` | 768 | L12 | 桌面 / 移动布局切换阈值（px） |
| `VISIBLE_SLOT_START` | -5.75 | L13 | 可见槽位下界 |
| `VISIBLE_SLOT_END` | 7.15 | L14 | 可见槽位上界 |
| `TEXTURE_SLOT_START` | -8.25 | L15 | 纹理预加载槽位下界 |
| `TEXTURE_SLOT_END` | 10.25 | L16 | 纹理预加载槽位上界 |
| `MAX_TEXTURES` | 20 | L17 | 同时驻留 GPU 的纹理上限 |
| `MIN_RENDER_INSTANCES` | 20 | L18 | 项目不足时复制的最小实例数 |
| `DESKTOP_CARD_WIDTH` | 27 | L23 | 桌面端每张卡片统一宽度（%） |
| `MOBILE_CARD_WIDTH` | 88 | L24 | 移动端每张卡片统一宽度（%） |
| `INTRO_START_PROGRESS` | -7 | L28 | 入场动画起始进度偏移 |
| `HORIZONTAL_CENTER` | 50 | L34 | 缎带水平居中基准（%） |
| `DESKTOP/MOBILE_TRAJECTORY_PIVOT_X` | 58 / 70 | L35-36 | 轨迹缩放 X 轴心 |
| `DESKTOP/MOBILE_TRAJECTORY_SCALE_X` | 0.8 / 1.08 | L37-38 | 轨迹 X 缩放（展宽 / 收窄） |
| `DESKTOP/MOBILE_TRAJECTORY_PIVOT_Y` | 44 / 44 | L39-40 | 轨迹缩放 Y 轴心 |
| `DESKTOP/MOBILE_TRAJECTORY_SCALE_Y` | 0.8 / 1.08 | L41-42 | 轨迹 Y 缩放（压扁 / 拉开） |
| `DESKTOP/MOBILE_VERTICAL_LIFT` | 7 / 4 | L43-44 | 整条缎带向上抬升量 |
| `RIBBON_YAW_Y` | -30 | L50 | 缎带统一偏航角（度） |
| `RIBBON_LEAN_X` | -5 | L51 | 缎带统一后仰角（度） |
| `TILT_VARIATION` | 0.35 | L52 | 保留原姿态的倾斜混合系数 |
| `SCATTER_SCALE` | 0.3 | L53 | 原始 rotateZ 散布的缩放 |
| `GLASS_MAX_OPACITY` | 0.85 | L56 | 卡片最大不透明度 |
| `cameraDistance` | 1500 / 1150 | L421-423 | 相机距原点距离 |
| `camera.far` | 4000 | L447 | 远裁剪面 |
| 像素比上限 | 1.75 | L903 | DPR 上限，限性能开销 |
| `maxTextureAnisotropy` | min(4, max) | L559-562 | 纹理各向异性过滤等级 |

下面逐项详解。

---

## 一、槽位与可见窗口

文件：`ProjectScene.tsx` L11–L18

```ts
const INITIAL_PROJECT_INDEX = 36;
const MOBILE_BREAKPOINT = 768;
const VISIBLE_SLOT_START = -5.75;
const VISIBLE_SLOT_END = 7.15;
const TEXTURE_SLOT_START = -8.25;
const TEXTURE_SLOT_END = 10.25;
const MAX_TEXTURES = 20;
const MIN_RENDER_INSTANCES = 20;
```

### `INITIAL_PROJECT_INDEX` = 36
- **作用**：入场动画结束时聚焦到的项目索引（`wrappedRelativeSlot` 中 `index - INITIAL_PROJECT_INDEX - progress`，progress=0 时该项目位于 slot 0）。
- **调整效果**：改大 / 改小会让首屏停在另一个项目上。
- **影响范围**：仅首屏初始焦点；用户滚动后即被 `targetProgress` 覆盖。
- **注意**：若值超过项目总数会自动环绕，不会越界。

### `MOBILE_BREAKPOINT` = 768
- **作用**：视口宽度小于此值（px）时切换到移动布局（不同的 placements、相机距离、卡片宽度）。
- **调整效果**：改小 → 更窄的屏幕才走移动布局；改大 → 平板也走移动布局。
- **影响范围**：影响 `mobile` 标志，进而影响 placements 表、`cameraDistance`、`DESKTOP/MOBILE_CARD_WIDTH`、拖拽灵敏度等所有分端参数的选择。

### `VISIBLE_SLOT_START` / `VISIBLE_SLOT_END` = -5.75 / 7.15
- **作用**：决定哪些 slot 的卡片参与渲染与可见。`updateMeshes` 中 `relativeSlot > START && relativeSlot < END` 才设 `mesh.visible = true`。
- **调整效果**：扩大区间 → 屏幕上同时出现更多卡片（更拥挤、更长的队列）；缩小区间 → 只画中心几张。
- **影响范围**：可见卡片数量、边缘淡出（`edgeFade` 也用这两个值计算）、性能（更多 mesh 渲染）。
- **注意**：这两个值同时决定 `edgeFade` 的过渡区间，改了会让边缘淡出节奏变化。

### `TEXTURE_SLOT_START` / `TEXTURE_SLOT_END` = -8.25 / 10.25
- **作用**：纹理加载窗口，比可见窗口更宽，提前加载即将进入视野的卡片纹理。
- **调整效果**：拉宽 → 更早预加载、滚动时纹理已就绪（更顺滑、更耗内存）；收窄 → 滚动快时可能看到纹理「弹入」。
- **影响范围**：`syncTextureWindow` 决定加载 / 卸载哪些纹理，直接影响显存占用与滚动流畅度。
- **注意**：必须比 `VISIBLE_*` 区间宽，否则可见卡片可能没纹理。

### `MAX_TEXTURES` = 20
- **作用**：同时缓存在 GPU 的纹理数量上限。超出时按距离优先淘汰最远且不再需要的纹理。
- **调整效果**：调大 → 更多纹理常驻、滚动更顺滑、显存占用更高；调小 → 更频繁卸载重载、可能卡顿。
- **影响范围**：`requestTexture` 的淘汰逻辑（L734）、显存占用。
- **注意**：低端设备显存有限，过大可能触发 WebGL 上下文丢失。

### `MIN_RENDER_INSTANCES` = 20
- **作用**：当项目总数少于该值时，把项目列表循环复制到该数量，保证缎带两端不会「空」。
- **调整效果**：改大 → 队列更长、环绕时重复更不明显；改小 → 项目少时两端可能看到空缺。
- **影响范围**：`buildRenderProjects`（L425）。
- **注意**：仅当项目数 < 该值时生效；项目数 ≥ 该值时原样使用。

---

## 二、卡片尺寸

文件：`ProjectScene.tsx` L23–L24

```ts
const DESKTOP_CARD_WIDTH = 27;
const MOBILE_CARD_WIDTH = 88;
```

### `DESKTOP_CARD_WIDTH` / `MOBILE_CARD_WIDTH` = 27 / 88
- **作用**：每张卡片在 `adjustPlacement` 中被强制统一为此宽度（百分比，相对视口宽度）。高度由图片自身宽高比推导，所以不同卡片高度略有差异。
- **调整效果**：增大 → 卡片更大、相邻卡片更可能重叠；减小 → 卡片更小、队列更稀疏。
- **影响范围**：`adjustPlacement` 中 `width` 字段被覆盖（L380），进而影响 `worldPositionForPlacement` 的 `planeWidth / planeHeight`。
- **注意**：原始 placements 表里每个 slot 的 `width` 只影响轨迹中心位置，**不**决定最终卡片大小——最终大小由这两个常量统一。要让某张卡片更大，得改这里的常量。

---

## 三、入场动画起始

文件：`ProjectScene.tsx` L28

```ts
const INTRO_START_PROGRESS = -7;
```

### `INTRO_START_PROGRESS` = -7
- **作用**：入场开始时整条缎带从这里出发，GSAP 把它 tween 到 0（resting 位置）。负值表示队列从一侧涌入。
- **调整效果**：绝对值越大 → 入场位移越长、卡片「飞入」距离更远、耗时感更强；改为 0 → 入场几乎不动。
- **影响范围**：`introProgress` / `targetProgress` / `currentProgress` 的初值（L627、L631-632），以及预加载纹理范围 `textureKeysAt(INTRO_START_PROGRESS)`（L768）。
- **注意**：改大绝对值会扩大预加载纹理集合，首次加载更慢。

---

## 四、轨迹重定位（Reframe）

文件：`ProjectScene.tsx` L34–L44

```ts
const HORIZONTAL_CENTER = 50;
const DESKTOP_TRAJECTORY_PIVOT_X = 58;
const MOBILE_TRAJECTORY_PIVOT_X = 70;
const DESKTOP_TRAJECTORY_SCALE_X = 0.8;
const MOBILE_TRAJECTORY_SCALE_X = 1.08;
const DESKTOP_TRAJECTORY_PIVOT_Y = 44;
const MOBILE_TRAJECTORY_PIVOT_Y = 44;
const DESKTOP_TRAJECTORY_SCALE_Y = 0.8;
const MOBILE_TRAJECTORY_SCALE_Y = 1.08;
const DESKTOP_VERTICAL_LIFT = 7;
const MOBILE_VERTICAL_LIFT = 4;
```

这些常量在 `adjustPlacement`（L358–L387）中把原始关键帧重定位到最终位置。公式：

```ts
x = HORIZONTAL_CENTER + (centerX - pivotX) * scaleX - width / 2;
y = pivotY + (placement.y - pivotY) * scaleY - lift;
```

### `HORIZONTAL_CENTER` = 50
- **作用**：缎带水平居中的目标位置（%）。所有卡片的 X 都以此为基准重排。
- **调整效果**：增大 → 整条缎带右移；减小 → 左移。
- **影响范围**：所有卡片的最终 x 坐标。

### `*_TRAJECTORY_PIVOT_X` = 58 / 70（桌面 / 移动）
- **作用**：X 方向缩放的中心点。缩放围绕此点进行，`scaleX > 1` 时远离此点的卡片被推开，`scaleX < 1` 时被拉拢。
- **调整效果**：移动 pivot → 改变缩放的「不动点」，整条缎带的疏密分布相对屏幕的位置会偏移。
- **影响范围**：与 `scaleX` 共同决定最终 x 分布。

### `*_TRAJECTORY_SCALE_X` = 0.8 / 1.08（桌面 / 移动）
- **作用**：X 方向缩放系数。桌面 0.8 = 收窄（卡片更聚拢），移动 1.08 = 略微展宽。
- **调整效果**：增大 → 卡片在水平方向更分散；减小 → 更聚拢、可能重叠。
- **影响范围**：所有卡片最终 x 坐标的间距。
- **注意**：桌面 < 1 而移动 > 1 是为了适配两种屏幕的宽度差异。

### `*_TRAJECTORY_PIVOT_Y` = 44 / 44
- **作用**：Y 方向缩放中心点（垂直）。
- **调整效果**：移动 → 改变垂直缩放不动点，影响缎带上下分布。
- **影响范围**：与 `scaleY` 共同决定最终 y 分布。

### `*_TRAJECTORY_SCALE_Y` = 0.8 / 1.08
- **作用**：Y 方向缩放系数。控制缎带在垂直方向的展开程度。
- **调整效果**：增大 → 缎带在垂直方向更拉长；减小 → 更扁平。
- **影响范围**：所有卡片最终 y 坐标的间距。

### `*_VERTICAL_LIFT` = 7 / 4
- **作用**：整条缎带向上抬升的量（在 y 公式里减去）。
- **调整效果**：增大 → 缎带整体上移；减小 → 下移。
- **影响范围**：所有卡片最终 y 坐标。
- **常用场景**：配合 `SiteHeader / SiteFooter` 的位置，避免卡片被遮挡。

---

## 五、缎带倾斜（Ribbon Tilt）

文件：`ProjectScene.tsx` L50–L53

```ts
const RIBBON_YAW_Y = -30;
const RIBBON_LEAN_X = -5;
const TILT_VARIATION = 0.35;
const SCATTER_SCALE = 0.3;
```

在 `adjustPlacement`（L383–L385）中应用：

```ts
rotateX: RIBBON_LEAN_X + placement.rotateX * TILT_VARIATION;
rotateY: RIBBON_YAW_Y + placement.rotateY * TILT_VARIATION;
rotateZ: placement.rotateZ * SCATTER_SCALE;
```

### `RIBBON_YAW_Y` = -30
- **作用**：给所有卡片统一叠加的 Y 轴旋转（偏航，度），让整条缎带看起来像转向远去。
- **调整效果**：绝对值越大 → 卡片侧转越明显、3D 纵深感越强；改为 0 → 卡片正对相机、变回平面排列。
- **影响范围**：所有卡片的 `rotateY`。
- **注意**：值过大时卡片几乎侧面对着相机，会严重变形。

### `RIBBON_LEAN_X` = -5
- **作用**：统一叠加的 X 轴旋转（后仰 / 前倾，度），让卡片微微仰起或俯下。
- **调整效果**：负值更大 → 卡片更后仰（像向后倒）；正值 → 前倾。
- **影响范围**：所有卡片的 `rotateX`。

### `TILT_VARIATION` = 0.35
- **作用**：原始关键帧里每张卡片自带的 `rotateX / rotateY` 微小差异，按此系数混入统一倾斜。0 = 完全统一姿态，1 = 完全保留原姿态。
- **调整效果**：增大 → 每张卡片姿态差异更明显、更「散乱」；减小 → 更整齐划一。
- **影响范围**：所有卡片的 `rotateX / rotateY`。

### `SCATTER_SCALE` = 0.3
- **作用**：原始 `rotateZ`（平面内旋转 / 散布）的缩放系数。把关键帧里的 rotateZ 压缩到原来的 30%。
- **调整效果**：增大 → 卡片平面内歪斜更明显、更活泼；减小 → 更端正。
- **影响范围**：所有卡片的 `rotateZ`。

---

## 六、玻璃质感

文件：`ProjectScene.tsx` L56

```ts
const GLASS_MAX_OPACITY = 0.85;
```

### `GLASS_MAX_OPACITY` = 0.85
- **作用**：卡片完全不透明时的上限值（`updateMeshes` 中 `material.opacity = min(1, edgeFade * 1.75) * GLASS_MAX_OPACITY * runtime.appear`，L974）。
- **调整效果**：增大（接近 1）→ 卡片更实、图像更清晰、通透感弱；减小 → 更通透、背后卡片更可见、图像更淡。
- **影响范围**：所有可见卡片的最终透明度。
- **注意**：配合 `depthWrite: false` 与 `FrontSide` 才能实现玻璃叠加效果；调到 1 会失去通透感。

---

## 七、槽位关键帧表

文件：`ProjectScene.tsx`
- 桌面：`desktopPlacements` L79–L188（slot -5 ~ 6）
- 移动：`mobilePlacements` L190–L299（slot -5 ~ 6）

每条记录结构：

```ts
{ x, y, width, z, rotateX, rotateY, rotateZ }
```

这些是缎带形状的「骨架关键帧」，非整数 slot 由 Catmull-Rom 样条在相邻 4 帧之间平滑插值（`placementAt`，L389–L411）。

### 各字段含义

| 字段 | 单位 | 作用 |
|---|---|---|
| `x` | % 视口宽 | 卡片左上角水平位置（经 `adjustPlacement` 重定位） |
| `y` | % 视口高 | 卡片垂直位置（经 `adjustPlacement` 重定位） |
| `width` | % 视口宽 | 仅影响轨迹中心，最终卡片宽度被 `*_CARD_WIDTH` 覆盖 |
| `z` | 世界单位 | **透视深度**：正=近=大，负=远=小。整条缎带 z 单调递减 |
| `rotateX` | 度 | 后仰 / 前倾（经 `TILT_VARIATION` 混入 `RIBBON_LEAN_X`） |
| `rotateY` | 度 | 偏航（经 `TILT_VARIATION` 混入 `RIBBON_YAW_Y`） |
| `rotateZ` | 度 | 平面内旋转（经 `SCATTER_SCALE` 缩放） |

### 调整方式

- **改某张卡片位置**：直接改对应 slot 的 `x / y / z`。例如想让 slot 0 更居中，改 `desktopPlacements[0].x`。
- **改纵深强弱**：放大 `z` 的绝对值差距（如把 slot -5 的 z 从 360 改到 500，slot 6 从 -430 改到 -600）→ 透视更夸张。
- **改某段弧度**：连续几个 slot 的 x/y 构成曲线形状，调整中间几个点能改变缎带弯曲方向。
- **影响范围**：仅影响对应 slot 附近（样条插值会平滑过渡到相邻 slot）。

### 注意

- `width` 字段**不**决定最终卡片大小，只影响 `adjustPlacement` 中 `centerX = placement.x + placement.width / 2` 的轨迹中心。要改卡片大小用 `*_CARD_WIDTH`。
- 改关键帧后建议同步检查外推逻辑（见下节），保证超出 slot -5 / 6 的卡片形状连贯。

---

## 八、超出关键帧的外推

文件：`ProjectScene.tsx` L309–L336（`placementForSlot` 内）

当 slot < -5 或 slot > 6 时，没有关键帧，按线性外推：

```ts
// slot < -5
x: edge.x - distance * (mobile ? 48 : 18);
y: edge.y + distance * (mobile ? 10 : 13);
z: edge.z + distance * 45;
rotateY: edge.rotateY - distance * 0.25;
rotateZ: edge.rotateZ + distance * 0.45;

// slot > 6
x: edge.x + distance * (mobile ? 34 : 14);
y: edge.y - distance * (mobile ? 9 : 11);
width: Math.max(mobile ? 54 : 15, edge.width - distance * 1.8);
z: edge.z - distance * 70;
rotateX: edge.rotateX - distance * 0.15;
rotateY: edge.rotateY + distance * 0.25;
rotateZ: edge.rotateZ - distance * 0.35;
```

### 可调乘数

- **x/y 乘数**（如桌面 `18 / 13`，移动 `48 / 10`）：外推卡片在屏幕外的间距。增大 → 外推卡片更分散；减小 → 更紧凑。
- **z 乘数**（`45` / `70`）：外推卡片的深度递增速度。增大 → 远离视野的卡片纵深变化更快。
- **rotateY/rotateZ 乘数**（`0.25 / 0.45 / 0.15 / 0.35`）：外推卡片姿态的渐变速率。
- **width 下限与递减**（`Math.max(15, edge.width - distance * 1.8)`）：外推卡片轨迹中心的宽度衰减下限。

### 影响

通常这些卡片在屏幕外（超出 `VISIBLE_SLOT_*`），但快速滚动时可能一闪而过。调整影响滚动到队列两端的视觉连续性。

---

## 九、相机

文件：`ProjectScene.tsx`

### `cameraDistance` = 1500 / 1150（桌面 / 移动）— L421–L423

```ts
function cameraDistance(mobile: boolean) {
  return mobile ? 1150 : 1500;
}
```

- **作用**：相机在 z 轴上的位置。`configureCamera`（L436–L451）用它计算 FOV：`fov = radToDeg(2 * atan(height / (2 * distance)))`。
- **调整效果**：增大 → FOV 变窄、透视变弱（更像正交、纵深压缩）；减小 → FOV 变宽、透视更夸张。
- **影响范围**：透视强度、`perspectiveScale`（L465）、所有卡片在屏幕上的投影大小。

### `camera.near` / `camera.far` = 0.1 / 4000 — L446–L447

- **作用**：近 / 远裁剪面。超出 `[near, far]` 的物体会被裁掉不渲染。
- **调整效果**：`far` 太小 → 远处卡片被裁切消失；`near` 太大 → 近处卡片被裁。
- **影响范围**：可见性。缎带 z 范围约 -430 ~ +360，加上外推可能到 -1000 以下，`far = 4000` 留了充足余量。

### 透视原点 — L466–L467

```ts
const perspectiveOriginX = width * (mobile ? 0.65 : 0.64);
const perspectiveOriginY = height * (mobile ? 0.43 : 0.46);
```

- **作用**：`worldPositionForPlacement` 中透视缩放的消失点（屏幕坐标比例）。
- **调整效果**：移动消失点 → 改变「远去」方向的视觉焦点。例如改 `perspectiveOriginX` 会让纵深汇聚方向偏左 / 右。
- **影响范围**：所有卡片的最终世界坐标（L470–L477）。

---

## 十、渲染器

文件：`ProjectScene.tsx`

### WebGL 上下文选项 — L534–L538

```ts
canvas.getContext("webgl2", {
  alpha: false,
  antialias: true,
  powerPreference: "high-performance",
});
```

- `alpha: false`：画布不透明，背景纯黑。改 `true` 会让画布透明（需配合 CSS 背景）。
- `antialias: true`：抗锯齿。关掉省性能但边缘锯齿明显。
- `powerPreference: "high-performance"`：优先独显。

### 清屏色 — L558

```ts
renderer.setClearColor(0x000000, 1);
```

- **作用**：场景背景色。改十六进制值即可换背景色（如 `0x0a0a12`）。
- **影响范围**：整个画布背景。注意 `alpha: false` 时才完全生效。

### 像素比上限 — L903

```ts
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
```

- **作用**：限制设备像素比上限，平衡清晰度与性能。
- **调整效果**：增大 → 高 DPR 屏幕更清晰但更耗 GPU；减小 → 更省电但略糊。
- **影响范围**：渲染分辨率、GPU 负载。

### 各向异性过滤 — L559–L562

```ts
const maxTextureAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
```

- **作用**：纹理在斜视角下的清晰度。`4` 是上限。
- **调整效果**：增大 → 倾斜卡片纹理更清晰；减小 → 省显存但斜面纹理模糊。
- **影响范围**：所有卡片纹理的斜视清晰度。

---

## 十一、材质与玻璃着色器

文件：`ProjectScene.tsx` L570–L605

### `MeshBasicMaterial` 选项 — L571–L583

```ts
new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.FrontSide,
  transparent: true,
  opacity: 0,
  depthTest: true,
  depthWrite: false,
});
```

| 选项 | 作用 | 调整效果 |
|---|---|---|
| `color` | 基色乘子 | 改非白会偏色，一般不动 |
| `side: FrontSide` | 只渲染正面 | 改 `DoubleSide` 会让半透明两面叠加，玻璃变浑浊（注释 L573-575 已说明） |
| `transparent` | 开启透明 | 关掉则 `opacity` 失效 |
| `depthWrite: false` | 不写深度缓冲 | 改 `true` 会导致近处卡片挡住远处卡片，失去通透叠加（注释 L580-582） |
| `depthTest` | 深度测试 | 关掉则渲染顺序决定遮挡 |

### 玻璃着色器注入 — L587–L602

```glsl
float glassTopGlow = smoothstep(0.35, 1.0, vMapUv.y) * 0.035;
float glassDiag = vMapUv.x + (1.0 - vMapUv.y);
float glassBand =
  smoothstep(0.15, 0.75, glassDiag) *
  smoothstep(1.35, 0.75, glassDiag);
float glassStreak = pow(glassBand, 2.0) * 0.1;
outgoingLight += vec3(glassTopGlow + glassStreak);
```

| 参数 | 作用 | 调整效果 |
|---|---|---|
| `smoothstep(0.35, 1.0, vMapUv.y)` | 顶部发光的起始 / 结束 UV.y | 改阈值 → 发光区域上移 / 下移 |
| `* 0.035` | 顶部发光强度 | 增大 → 顶部更亮；减小 → 更弱 |
| `glassDiag = vMapUv.x + (1.0 - vMapUv.y)` | 对角线方向坐标 | 控制斜向光带方向 |
| `smoothstep(0.15, 0.75, ...) * smoothstep(1.35, 0.75, ...)` | 光带的起止边界 | 改这四个值 → 光带位置 / 宽度变化 |
| `pow(glassBand, 2.0)` | 光带锐度 | 指数越大 → 光带越锐利聚焦；越小 → 越弥散 |
| `* 0.1` | 光带强度 | 增大 → 斜向高光更亮；减小 → 更淡 |

- **影响范围**：所有卡片的视觉光泽。改动后需重新构建（`onBeforeCompile` 在材质首次编译时注入）。
- **注意**：`outgoingLight +=` 是加法叠加，值过大会让卡片局部过曝发白。

---

## 十二、滚动与指针交互

文件：`ProjectScene.tsx`

### 滚轮灵敏度 — L1079–L1084

```ts
const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  const delta = Math.max(-140, Math.min(140, event.deltaY));
  targetProgress.value += delta / 430;
  interactionHint.dataset.hidden = "true";
};
```

| 参数 | 位置 | 作用 |
|---|---|---|
| `delta / 430` | L1082 | 滚轮每 tick 推进的进度。**减小分母 → 更灵敏**；增大 → 更慢 |
| `±140` clamp | L1081 | 单次滚轮增量上限，防止触控板大幅滑动跳太远 |

### 拖拽灵敏度 — L1115–L1119

```ts
if (dragging) {
  const primaryDelta = Math.abs(deltaY) >= Math.abs(deltaX) ? -deltaY : -deltaX;
  targetProgress.value += primaryDelta / (mobile ? 145 : 240);
}
```

| 参数 | 作用 |
|---|---|
| `/ 240`（桌面）/ `/ 145`（移动） | 拖拽每像素推进的进度。减小 → 更灵敏；增大 → 更黏 |
| 拖拽方向判定 `Math.abs(deltaY) >= Math.abs(deltaX)` | 主导轴判断：垂直拖拽用 deltaY，水平用 deltaX |

### 拖拽阈值 — L1111

```ts
if (totalDistance > 7) { dragging = true; }
```

- **作用**：指针移动超过 7px 才判定为拖拽（否则视为点击）。
- **调整效果**：增大 → 需要拖更远才进入拖拽模式（点击更容易触发）；减小 → 更容易误判为拖拽。

### 点击跳转 — L1208–L1214

```ts
if (!mobile && !wasDragging) {
  const selectedIndex = projectIndexAt(event.clientX, event.clientY);
  if (selectedIndex !== null) {
    window.location.assign(renderProjects[selectedIndex].slug);
  }
}
```

- 桌面端非拖拽点击 = 跳转到该项目详情页。移动端走 `selectMobileProject`（L1180–L1193）弹出卡片链接。

### 进度 / 指针平滑系数 — L1050–L1053

```ts
currentProgress.value += (targetProgress.value - currentProgress.value) * 0.075;
pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.055;
pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.055;
```

| 参数 | 作用 |
|---|---|
| `0.075`（progress lerp） | 进度平滑系数。增大 → 滚动响应更快、更跟手但更抖；减小 → 更丝滑但有滞后感 |
| `0.055`（pointer lerp） | 指针视差平滑系数。同上 |

### 指针视差（鼠标移动时的整体偏移与旋转） — L1056–L1065

```ts
projectGroup.position.set(
  pointerCurrent.x * 14,
  -pointerCurrent.y * 10,
  0,
);
projectGroup.rotation.set(
  THREE.MathUtils.degToRad(-pointerCurrent.y * 0.7),
  THREE.MathUtils.degToRad(pointerCurrent.x * 0.9),
  0,
);
```

| 参数 | 作用 |
|---|---|
| `* 14`（x 平移） | 鼠标左右移动时整组左右偏移幅度（世界单位） |
| `* 10`（y 平移） | 鼠标上下移动时整组上下偏移幅度 |
| `* 0.7`（x 旋转，度） | 鼠标上下时整组绕 X 轴旋转幅度 |
| `* 0.9`（y 旋转，度） | 鼠标左右时整组绕 Y 轴旋转幅度 |
- **调整效果**：增大这些系数 → 鼠标移动时场景晃动更剧烈；设为 0 → 完全无视鼠标视差。

### 卡片入场淡入 — L962–L964

```ts
runtime.appear = reducedMotion
  ? 1
  : runtime.appear + (1 - runtime.appear) * 0.08;
```

- **作用**：每张卡片从 0 淡入到 1 的 lerp 系数。
- **调整效果**：增大 → 卡片更快出现；减小 → 更慢的渐显。

### 边缘淡出 — L951–L955、L974

```ts
const edgeFade = Math.min(
  1,
  Math.max(0, relativeSlot - VISIBLE_SLOT_START),
  Math.max(0, VISIBLE_SLOT_END - relativeSlot),
);
material.opacity = Math.min(1, edgeFade * 1.75) * GLASS_MAX_OPACITY * runtime.appear;
```

| 参数 | 作用 |
|---|---|
| `edgeFade` | 靠近可见窗口边缘时从 1 衰减到 0 |
| `* 1.75` | 衰减加速倍数。增大 → 边缘更快变透明（淡出区更窄）；减小 → 淡出区更宽更柔和 |

### 悬停效果 — L1015–L1038

```ts
const targetLift = hovered ? 58 : 0;
const targetScale = hovered ? 1.012 : 1;

runtime.hoverLift += (targetLift - runtime.hoverLift) * 0.14;
runtime.hoverScale += (targetScale - runtime.hoverScale) * 0.14;

mesh.position.z = runtime.baseZ + runtime.hoverLift;
mesh.scale.set(
  runtime.baseWidth * runtime.hoverScale,
  runtime.baseHeight * runtime.hoverScale,
  1,
);
```

| 参数 | 作用 |
|---|---|
| `58`（hover lift） | 悬停时卡片向相机靠近的 z 位移。增大 → 悬停时卡片更突出 / 更大；减小 → 更轻微 |
| `1.012`（hover scale） | 悬停时缩放倍数。增大 → 悬停卡片更明显放大 |
| `0.14`（hover lerp） | 悬停过渡平滑系数。增大 → 悬停反应更快；减小 → 更迟缓丝滑 |

### 悬停标签位置 — L1092–L1098

```ts
const rightSide = event.clientX > viewportWidth * 0.72;
hoverLabel.style.left = `${event.clientX + (rightSide ? -14 : 14)}px`;
```

- `0.72`：判定鼠标在右侧 72% 位置时，标签显示在指针左侧（避免超出右边界）。
- `±14`：标签距指针的偏移量（px）。

### 入场门控（slotGate） — L925–L929

```ts
const slotGate =
  ((VISIBLE_SLOT_END - relativeSlot) /
    (VISIBLE_SLOT_END - VISIBLE_SLOT_START)) *
  0.85;
const introOpen = introComplete || introT.value >= slotGate;
```

- **作用**：入场时卡片从一端到另一端依次显现的门控阈值。`0.85` 控制在 introT 到 0.85 之前所有卡片就已全部打开。
- **调整效果**：增大（接近 1）→ 入场末尾才全部打开；减小 → 更早全部打开、末段更平。

---

## 十三、入场时间线（GSAP）

文件：`ProjectScene.tsx` L809–L848

```ts
introTimeline
  .to(loader, {
    autoAlpha: 0, duration: 0.7, ease: "power2.out", delay: 0.3,
  })
  .set(loader, { display: "none" })
  .to(introProgress, {
    value: 0, duration: 2.2, ease: "power2.inOut",
    onUpdate: () => { ... },
  })
  .to(introT, { value: 1, duration: 2.2, ease: "none" }, "<");

const introFallbackTimer = window.setTimeout(startIntro, 9000);
```

| 参数 | 位置 | 作用 |
|---|---|---|
| loader `duration: 0.7` | L823 | 加载器淡出时长（秒） |
| loader `delay: 0.3` | L825 | 加载完成后等 0.3s 再开始淡出 |
| loader `ease: "power2.out"` | L824 | 淡出缓动曲线 |
| ribbon `duration: 2.2` | L830 | 缎带从 `INTRO_START_PROGRESS` 滑到 0 的时长（秒） |
| ribbon `ease: "power2.inOut"` | L831 | 缎带滑动缓动曲线 |
| introT `duration: 2.2` | L840 | 卡片渐显门控动画时长，`"<"` 表示与上一段同步开始 |
| introT `ease: "none"` | L842 | 门控线性推进 |
| `9000`（fallback） | L848 | 纹理加载超过 9s 仍强制启动入场的兜底超时 |

- **调整效果**：改 `duration` → 入场快 / 慢；改 `ease` → 入场节奏（如 `power4.out` 更有冲击力）；改 fallback → 等待纹理的耐心阈值。
- **影响范围**：仅入场动画。`prefers-reduced-motion` 用户直接跳过（L798–L807）。

---

## 十四、CSS 样式参数

### 加载器字体 — `ProjectScene.module.css` L34–L41

```css
.sceneLoaderValue {
  font-size: clamp(42px, 8vw, 112px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 0.94;
}
```

- `clamp(42px, 8vw, 112px)`：加载百分比字号。改三个值调整最小 / 响应式 / 最大字号。

### 悬停标签 — `ProjectScene.module.css` L43–L71

```css
.hoverLabel {
  max-width: min(19rem, 80vw);
  padding: 0.32rem 0.58rem 0.38rem;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
  background: rgb(8 8 8 / 70%);
  font-size: clamp(0.82rem, 1.15vw, 1.1rem);
  transition: opacity 140ms ease;
  backdrop-filter: blur(8px);
}
```

可调：标签最大宽度、内边距、边框透明度、圆角、背景透明度、字号、过渡时长、模糊量。

### 移动端交互提示 / 卡片链接 — `ProjectScene.module.css` L162–L223

`interactionHint`（底部「探索」提示）与 `mobileCardLink`（点击后弹出的项目链接胶囊）的位置、样式、过渡时长均可调。

### 渐变遮罩 — `GradientOverlays.module.css`

```css
.topOverlay, .bottomOverlay {
  height: 15%;          /* 遮罩高度占视口比例 */
}
.topOverlay {
  background: linear-gradient(0deg,
    rgba(1,1,1,0) 15.2%,
    rgba(1,1,1,0.5) 51%,
    rgba(0,0,0,0.85) 84.8%);
}
.bottomOverlay { ... }
.overlays { transition: opacity 600ms ease; }   /* 入场显隐过渡 */
```

- `height: 15%`：上下遮罩高度。增大 → 遮挡更多卡片上下边缘。
- 三个 rgba 色标：渐变的透明度过渡点。调整让边缘更硬 / 更柔。
- `opacity 600ms`：入场后遮罩淡入时长。
- `z-index: 1990`：遮罩层级，确保在卡片之上、Header 之下。

---

## 调整工作流建议

1. **先备份**：调整前 `git checkout -b tweak/scene-params` 开分支，便于对比回滚。
2. **小步快改**：一次只改一组相关参数（如只改缎带倾斜），观察效果再继续。
3. **双端检查**：桌面 / 移动有独立参数（placements、`CARD_WIDTH`、`cameraDistance`、拖拽灵敏度等），改完两端都要测。
4. **性能意识**：`MAX_TEXTURES`、`VISIBLE_*`、像素比上限直接影响 GPU 负载，低端设备上验证不卡顿、不丢上下文。
5. **无障碍**：`prefers-reduced-motion` 分支会跳过所有动画（L798–L807、L1045–L1048），调整时确认该模式下场景仍可读。
6. **验证清单**：
   - [ ] 入场动画从起点流畅滑到 resting 位置
   - [ ] 滚轮 / 拖拽灵敏度跟手
   - [ ] 快速滚动时无纹理弹入（`TEXTURE_*` 区间够宽）
   - [ ] 卡片不重叠或遮挡 Header / Footer
   - [ ] 悬停抬升与标签位置正常
   - [ ] 移动端点击跳转正确
   - [ ] WebGL 不可用时降级链接列表正常（`[data-webgl-unavailable]` 分支）

---

## 参数 → 想要的效果 速查

| 想要的效果 | 改哪里 |
|---|---|
| 卡片更大 / 更小 | `DESKTOP/MOBILE_CARD_WIDTH`（L23-24） |
| 卡片更通透 / 更实 | `GLASS_MAX_OPACITY`（L56） |
| 缎带纵深感更强 / 弱 | `RIBBON_YAW_Y`（L50）+ 各 slot `z` 值 + `cameraDistance`（L421） |
| 缎带整体上移 / 下移 | `*_VERTICAL_LIFT`（L43-44） |
| 缎带水平居中偏移 | `HORIZONTAL_CENTER`（L34） |
| 卡片间距更疏 / 更密 | `*_TRAJECTORY_SCALE_X/Y`（L37-38、L41-42） |
| 卡片更端正 / 更散乱 | `TILT_VARIATION`、`SCATTER_SCALE`（L52-53） |
| 滚轮更灵敏 / 更慢 | `delta / 430`（L1082） |
| 拖拽更灵敏 / 更慢 | `/ 240` 或 `/ 145`（L1119） |
| 鼠标视差更剧烈 | `* 14 / * 10 / * 0.7 / * 0.9`（L1057-1063） |
| 悬停抬升更高 | `58`（L1020） |
| 入场更快 / 更慢 | GSAP `duration`（L823、L830、L840） |
| 背景换色 | `setClearColor`（L558） |
| 上下渐变遮罩范围 | `GradientOverlays.module.css` `height: 15%` |
```
