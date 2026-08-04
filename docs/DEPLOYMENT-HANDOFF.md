# 部署交接文档：waitforit-site -> 服务器部署

> 交接时间：2026-08-04  
> 下一环境：macOS  
> 目标：在 macOS 上完成本地构建并部署到服务器

---

## 1. 服务器环境

通过 SSH MCP 连接的服务器（`ssh-47-119-172-164`，主机 `47.119.172.164`）：

| 项目 | 值 |
|------|-----|
| OS | CentOS 7 (Core) — **已 EOL**，不迁移 |
| Kernel | 3.10.0-1160.119.1.el7.x86_64 |
| CPU | 2 核 Intel Xeon Platinum |
| 内存 | 1.7GB 总 / ~1GB 可用 + 2GB swap |
| 磁盘 | 40GB，24GB 可用 |
| Docker | 25.0.4 + Compose v2.24.7 |
| Git | 1.8.3.1（极旧，不支持 `-C` 参数） |
| 反向代理 | 1Panel 管理的 OpenResty 1.21.4.3 |
| 域名 | `waitforit.cn`，已配 SSL 证书 |
| 运行中容器 | `payloadcms`(3000)、`redis`(6379)、OpenResty(80/443) |

**关键约束：1.7GB 内存，`next build` 会 OOM，不能在服务器上构建。**

---

## 2. 当前部署状态（截至 2026-08-04）

### 2.1 运行中的容器

容器名 `payloadcms`，手动 `docker run` 启动（非 docker-compose）：

- 镜像：`node:24-bookworm-slim`（基础镜像，**非项目 Dockerfile 的 standalone 构建**）
- 命令：`npm run start`（`next start`）
- Bind-mount：`/opt/payloadcms:/app`（源码 + node_modules + .next 全部挂载）
- 端口：`0.0.0.0:3000 -> 3000`
- 重启策略：`unless-stopped`
- 创建时间：2026-07-27（**运行的是旧代码**）

### 2.2 服务器上的两个项目目录

| 目录 | 内容 | 状态 |
|------|------|------|
| `/opt/waitforit-site` | 源码副本（7月31日），有 `.deploy-commit = 6a75a4f` | **不是 git 仓库**，无 `.next`、无 `node_modules`、无 `.env`、无 `docker-compose.yml` |
| `/opt/payloadcms` | 源码（7月25日）+ `.next` + `node_modules` + `.env` | **实际运行的目录**，更旧；残留 Payload CMS 模板原始文件（旧 Dockerfile/docker-compose） |

### 2.3 内容同步

- systemd timer `waitforit-content-sync.timer` 每分钟触发
- service 只执行 `git pull --ff-only origin main`（内容仓库 `/srv/waitforit-site-content`）
- **未运行 Payload 同步工具**（`content-sync` 容器），Markdown 不会同步到 SQLite
- `waitforit-site-tools:6a75a4f` 镜像已存在但未被 service 调用
- 内容仓库 remote：`git@github-waitforit-content:Lan-zk/waitforit-site-content.git`（SSH deploy key）

### 2.4 反向代理

- 1Panel 管理 OpenResty，域名 `waitforit.cn`
- 代理配置：`/opt/1panel/apps/openresty/openresty/www/sites/waitforit.cn/proxy/root.conf`
- **502 已由用户修复**（原配置 `proxy_pass https://...` 改为 `http://`）

---

## 3. 已发现的问题清单

| # | 优先级 | 问题 | 状态 |
|---|--------|------|------|
| 1 | P0 | OpenResty 代理 `proxy_pass https://` 导致 502 | ✅ 用户已修复 |
| 2 | P0 | 容器运行 7月27日旧代码，Docker 日志报 `Failed to find Server Action` | ❌ 待修复 |
| 3 | P0 | `NEXT_PUBLIC_SERVER_URL` 未设置 | ❌ 待修复 |
| 4 | P0 | `PAYLOAD_SECRET` 仅 12 字节（应 32 字节） | ❌ 待修复 |
| 5 | P1 | 未使用 docker-compose.yml 管理容器 | ❌ 待修复 |
| 6 | P1 | content-sync service 未运行 Payload 同步 | ❌ 待修复 |
| 7 | P1 | 两个不一致的项目目录 | ❌ 待修复 |
| 8 | P2 | CentOS 7 EOL / Git 1.8.3.1 过旧 | 不迁移（用户决定） |

---

## 4. 部署策略决定

### 4.1 构建方式：本地构建 + 传输镜像

服务器 1.7GB 内存 `next build` 必 OOM（已实测确认，构建期间服务器 SSH 完全无响应）。决定：

```
macOS 本地构建 Docker 镜像 -> docker save | gzip | ssh docker load -> 服务器 docker compose up -d
```

不用镜像仓库（用户决定）。

### 4.2 更新频率区分

- **内容更新**（博客、小说等）：不需要 rebuild。content-sync systemd timer 自动拉取并同步。
- **代码更新**（UI、功能、依赖）：需要 rebuild。流程为本地构建 -> 传输 -> 重启。
- `NEXT_PUBLIC_*` 环境变量变更也需要 rebuild（构建时注入）。

### 4.3 macOS 上需要做的步骤

1. **确保 Docker Desktop 运行**（macOS 上 Docker Hub 访问应该没有中国大陆网络问题）
2. **本地构建镜像**：
   ```bash
   docker build -t waitforit-site:prod .
   ```
3. **传输到服务器**：
   ```bash
   docker save waitforit-site:prod | gzip | ssh root@47.119.172.164 "docker load"
   # 或通过 SSH MCP 执行远程命令
   ```
4. **服务器上部署**：
   - 需要先清理 `/opt/payloadcms` 旧目录和手动启动的 `payloadcms` 容器
   - 将 `/opt/waitforit-site` 设置为 git 仓库（`git clone https://github.com/Lan-zk/waitforit-site.git`）
   - 创建正确的 `.env`（参考 `.env.example`，设置 `NEXT_PUBLIC_SERVER_URL=https://waitforit.cn`）
   - 调整 `docker-compose.yml`：将 `build: context: .` 改为 `image: waitforit-site:prod`
   - `docker compose up -d`
5. **补全 content-sync**：按 `ops/systemd/` 配置，service 需加入 `docker compose run --rm content-sync`
6. **验证**：HTTPS 访问、Admin 后台、语言切换、内容同步

### 4.4 关键环境变量

服务器 `.env` 应包含（值需重新生成，不要使用旧值）：

```env
DATABASE_URL=file:./data/payload.db
PAYLOAD_SECRET=<重新生成：openssl rand -hex 32>
NEXT_PUBLIC_SERVER_URL=https://waitforit.cn
CONTENT_REPO_ROOT=/content
CONTENT_REPO_HOST_PATH=/srv/waitforit-site-content
```

---

## 5. 本地仓库关键文件参考

| 文件 | 说明 |
|------|------|
| `Dockerfile` | 多阶段构建：deps -> builder(standalone) -> content-sync -> runner |
| `docker-compose.yml` | payload 服务 + content-sync 工具，volume 持久化 |
| `next.config.ts` | `output: 'standalone'` |
| `ops/` | systemd service/timer + content-sync env 示例 |
| `ops/README.md` | 内容同步架构说明（注意：文件为 UTF-8 中文） |
| `.env.example` | 环境变量模板 |
| `scripts/sync-content-if-changed.ts` | 内容同步 CLI 入口 |
| `src/content/syncContentIfChanged.ts` | SHA 状态与同步逻辑 |

本地仓库 remote：`https://github.com/Lan-zk/waitforit-site.git`  
本地 HEAD：`3fedb1d`（比服务器部署的 `6a75a4f` 多 1 个 commit）

---

## 6. 本次会话中尝试过但未完成的操作

1. **服务器上 `docker build` 测试** — 触发 OOM，服务器 SSH 无响应约 10+ 分钟
2. **本地 Docker Desktop 启动 + 构建** — Docker Hub 不可达（中国大陆网络），尝试配置镜像源和代理未成功
3. **从服务器传回基础镜像** — 服务器因 OOM 未恢复，SSH 超时

以上问题在 macOS 上应该不存在（网络可直连 Docker Hub）。

---

## 7. 服务器恢复注意事项

上次操作中服务器 OOM 可能导致：
- `payloadcms` 容器可能被 OOM killer 杀掉或仍在运行
- Docker build 进程可能残留
- 可能需要 `systemctl restart docker` 清理
- 建议先 SSH 检查 `docker ps`、`free -m`、`dmesg | grep oom`

---

## 8. 建议的技能（Suggested Skills）

- `skills/payload-check-upgrade/SKILL.md` — 如需升级 Payload/Next.js 版本
- `skills/payload-integrate-plugin/SKILL.md` — 如需调整存储适配器
- `skills/payload-manage-schema-change/SKILL.md` — 如需修改 Collection/Global
- `docker-expert` — Docker 构建和部署问题排查
- `windows-process-triage` — 参考思路，服务器进程排查类似
