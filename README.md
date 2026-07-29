# waitforit-site

基于 [Payload](https://payloadcms.com/) 和 Next.js 的个人内容站。仓库从 Payload
Blank Template 起步，使用 SQLite；Payload 提供内容模型、管理后台、认证和 API，
Next.js 负责访客看到的前台页面。

当前阶段只建立可靠的开发与部署基线。文章、项目、标签、站点设置和最终视觉设计将在
后续功能迭代中加入。

## 技术基线

- Node.js 24
- npm 11
- Payload 3.86
- Next.js 16.2
- SQLite（本地、测试和当前自托管环境）

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

单项命令：

```bash
npm run lint
npm run generate:types
npm run test:int
npm run build
```

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

更多说明见 [架构文档](docs/ARCHITECTURE.md)、[部署说明](docs/DEPLOYMENT.md) 和
[安全政策](SECURITY.md)。

## License

[MIT](LICENSE)
