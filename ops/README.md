# 内容仓库自动同步

M4 使用 systemd timer 每分钟触发一次检查，不使用 Shell/Python 业务脚本。

执行边界：

1. systemd 直接在宿主机内容仓库执行 `git pull --ff-only`。
2. systemd 启动一次 Compose `content-sync` 工具容器。
3. 容器内 TypeScript CLI 读取当前 Commit SHA。
4. SHA 与上次成功值相同时直接退出，不初始化 Payload。
5. SHA 变化时扫描 Markdown，并在一个 Payload 事务中更新 SQLite 元数据。
6. 只有同步成功后才原子更新成功 SHA；失败时下一分钟重试同一 Commit。

主站和工具容器都只读挂载发布仓库。Git 拉取只发生在宿主机，私有仓库 Deploy
Key 不进入应用容器。

## 文件

- `content-sync.env.example`：宿主机路径示例。
- `systemd/waitforit-content-sync.service`：一次拉取和同步。
- `systemd/waitforit-content-sync.timer`：每分钟触发。
- `scripts/sync-content-if-changed.ts`：跨平台 TypeScript 入口。
- `src/content/syncContentIfChanged.ts`：SHA 状态与失败重试逻辑。

成功 SHA 保存在 Compose `payload_data` 卷内：

```text
/app/data/content-sync-last-successful-sha
```

删除该文件会使下一次检查重新执行一次幂等元数据同步，不会删除 Markdown。

## 服务器部署检查表

以下步骤只在维护者明确授权服务器变更后执行：

1. 确认运行 unit 的宿主机账户能够使用只读 Deploy Key 执行内容仓库
   `git pull --ff-only`，并有权限使用 Docker Compose。
2. 将 `ops/content-sync.env.example` 复制为
   `/etc/waitforit/content-sync.env`，填写服务器绝对路径。
3. 将 service 和 timer 安装到 `/etc/systemd/system/`。
4. 构建或拉取 `content-sync` 工具镜像。
5. 先手动启动 service，分别验证首次同步、相同 SHA 跳过和失败重试。
6. 验证通过后再启用 timer。
7. 推送一组可撤销的新增、修改、删除测试文档，确认站点无需重建即可更新。

服务器侧验收命令和结果必须回写 `PROGRESS.md`。在完成这些检查前，M4 保持
“进行中”。
