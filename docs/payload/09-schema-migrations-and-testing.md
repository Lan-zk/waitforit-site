# Schema、迁移与测试

## Schema 变更闭环

每次修改 Collection、Global、Field 或插件配置后：

1. 核对 Payload 3.86 类型。
2. 修改 Config。
3. 运行 `npm run generate:types`。
4. 检查 `src/payload-types.ts` diff。
5. 在开发数据库验证读写。
6. 生成迁移。
7. 审查 migration 的 `up` 和 `down`。
8. 补充集成和 E2E 测试。
9. 运行 `npm run check`。

## SQLite 迁移

开发环境可以使用 schema push 快速迭代，但稳定功能必须提交显式 migration：

```bash
npm run payload -- migrate:create descriptive-name
```

生产发布前：

```bash
npm run payload -- migrate
```

迁移前同时备份 SQLite 文件和媒体。数据库回滚而媒体未回滚，或反过来，都会形成不一致。

## 安全迁移规则

- 重命名字段不要直接按“删除旧列 + 新增列”接受生成结果。
- 增加 required 字段时先提供默认值或分阶段回填。
- 删除字段前确认 API、前端、SEO、搜索和导出不再使用。
- 关系变更前统计孤立记录。
- 插件引入时检查新增 Collection 和表。
- migration 必须可在生产数据副本上演练。

## 测试层次

### 集成测试

覆盖：

- Local API create/find/update/delete
- Access 允许和拒绝
- Hook 结果
- drafts/published
- relationship 和 select/depth
- 插件新增 Collection

### Admin E2E

覆盖：

- 登录
- Collection 列表和编辑
- 必填校验
- 上传
- 草稿/发布
- Preview/Live Preview
- 插件 Admin UI

### Frontend E2E

覆盖：

- 首页和列表
- 详情和 404
- draft 不公开
- metadata
- redirect
- 搜索/表单
- 响应式关键路径

## 最小命令

```bash
npm run lint
npm run generate:types
npm run test:int
npm run build
npm run test:e2e
```

日常提交前使用项目已有的：

```bash
npm run check
```

## 参考

- [Database](https://payloadcms.com/docs/database/overview)
- [Migrations](https://payloadcms.com/docs/database/migrations)
- [Transactions](https://payloadcms.com/docs/database/transactions)
- `payload/templates/website/tests/`
- `waitforit-site/tests/`
