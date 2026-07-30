# waitforit-site

基于 [Payload](https://payloadcms.com/) 和 Next.js 的个人发布站。Payload 提供内容
模型、管理后台、认证、API、SQLite 元数据和本地媒体管理；Next.js 负责公开页面，
首页由 Payload 数据驱动的 Three.js/WebGL 场景呈现。

当前代码已经完成博客与多章节小说的 Git Markdown 发布链路、简体中文/英语公共 UI、
结构化项目详情、结构化简历模型与固定模板，以及由 Globals 驱动的全站导航和页脚。
摄影体验保留模型与直接路由，但不出现在当前首页、导航和页脚入口中。

## 当前功能

- Payload Collections：`users`、`media`、`projects`、`writings`、`series`、
  `photography`
- Payload Globals：`resume`、`site-settings`、`header`、`footer`
- Git Markdown 博客与小说：扫描、Frontmatter 校验、元数据同步和运行时正文读取
- 博客列表/正文、小说列表/作品目录/章节阅读与前后章节导航
- 博客正文 Side Rays 与小说章节 Galaxy 阅读背景；支持减少动态效果、页面隐藏暂停和
  WebGL 降级
- 项目详情消费现有封面、摘要、技术栈、外部链接和仓库链接，缺失链接自动隐藏
- Resume Global 的个人定位、核心能力、匿名职业项目、公开产品、工程治理、技术图谱和
  当前关注方向；保留原 Lexical 补充内容
- `site-settings` / `header` / `footer` 的站名、描述、URL、邮箱、导航、版权和社交链接
  前台消费
- 受控的相对图片路由、GFM 渲染、HTML 清理和内容路径边界
- Payload 数据驱动的 Three.js/WebGL 首页及无 WebGL 可访问降级
- 简体中文（默认）和英语公共 UI、语言 Cookie、非法值回退
- Payload Admin 自有字段和导航标签的中英文适配

## 技术基线

- Node.js 24
- npm 11
- Payload 3.86.0
- Next.js 16.2.12、React 19.2.6
- SQLite
- Lexical、Three.js、GSAP、OGL

## 本地开发

```bash
git clone https://github.com/Lan-zk/waitforit-site.git
cd waitforit-site
npm ci
cp .env.example .env
openssl rand -hex 32
```

把最后一条命令的输出填入 `.env` 的 `PAYLOAD_SECRET`，然后启动：

```bash
mkdir -p data media
npm run dev
```

默认 `.env.example` 假定 Markdown 发布仓库位于本站相邻目录
`../waitforit-site-content`，其中包含 `content/blog` 与 `content/novels`。若目录位置
不同，修改 `CONTENT_REPO_ROOT`。

- 前台：<http://localhost:3000>
- 管理后台：<http://localhost:3000/admin>

第一次打开管理后台时，只创建本地测试管理员。不要复制生产环境的 `.env`、数据库、
管理员账号或上传文件。

新增、删除或移动 `src/app/` 下的路由目录后，如果已有开发服务器仍对新路由返回
404，先停止并重新执行 `npm run dev`。内容或组件修改通常可热更新，但路由树变更
不应依赖旧进程中的路由清单。

## 验证

日常提交前：

```bash
npm run check
```

完整浏览器测试：

```bash
npx playwright install chromium
npm run test:e2e
```

隔离验证“运行中的站点无需重新构建即可新增、修改和删除 Markdown”：

```bash
npm run test:e2e:content-runtime
```

单项命令：

```bash
npm run lint
npm run generate:types
npm run test:int
npm run build
```

集成测试和 E2E 的职责、必要性、测试数据约束及当前测试目录说明见
[测试策略](docs/TESTING.md)。

## 数据库迁移

开发模式下，Payload 会将配置变化同步到本地 SQLite 沙箱。一个功能稳定后再生成迁移：

```bash
npm run payload -- migrate:create descriptive-name
```

迁移文件与 `src/payload-types.ts` 应提交到 Git；`data/`、`media/` 和 `.env` 不应提交。
生产部署前执行：

```bash
npm run payload -- migrate
```

## Docker 验证

本地日常开发优先使用 `npm run dev`。需要验证容器构建和生产启动时：

```bash
docker compose up --build
```

Compose 只将服务绑定到 `127.0.0.1:3000`，并使用独立命名卷保存数据库和媒体。

## 仓库边界

可以公开：源码、迁移、类型、测试、通用部署文件和占位环境示例。

不得提交：生产 `.env`、SQLite 数据库、媒体原件、备份、账号导出、Cookie、Token、
SSH 密钥、证书和含真实服务器信息的运维日志。

更多说明见 [架构文档](docs/ARCHITECTURE.md)、[建设进度](PROGRESS.md)、
[测试策略](docs/TESTING.md)、[部署说明](docs/DEPLOYMENT.md) 和
[安全政策](SECURITY.md)。

## License

[MIT](LICENSE)
