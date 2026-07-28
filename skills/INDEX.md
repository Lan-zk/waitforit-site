# 项目级 Payload Skills 索引

本目录包含供 Agent 在 `waitforit-site` 中使用的项目级 Skill。它们不是 npm 包，也不会被
Payload 在运行时加载；它们用于约束 Agent 的开发、审查和验证流程。

## 使用规则

1. 调用 Skill 前先确认当前工作目录是本仓库。
2. Skill 会按需读取 `docs/payload/`，不重复保存 Payload 文档。
3. 所有实现以 `package.json` 中的 Payload 版本为准。
4. 修改 Schema 的 Skill 必须生成类型、评估迁移并运行测试。
5. 审计类 Skill 默认只读，不自动修复。

## Skill 清单

| Skill | 位置 | 作用 | 示例触发 |
| --- | --- | --- | --- |
| `payload-model-content` | [`skills/payload-model-content/SKILL.md`](./payload-model-content/SKILL.md) | 新建或调整 Posts、Projects、Tags、Pages、Globals 等完整内容模型 | “增加 Projects 内容模型” |
| `payload-scaffold-block` | [`skills/payload-scaffold-block/SKILL.md`](./payload-scaffold-block/SKILL.md) | 成对生成 Payload Block、Lexical 注册和前端 Renderer | “新增项目画廊 Block” |
| `payload-wire-publishing` | [`skills/payload-wire-publishing/SKILL.md`](./payload-wire-publishing/SKILL.md) | 接入 drafts、preview、live preview、发布和缓存失效 | “给 Posts 加草稿预览” |
| `payload-integrate-plugin` | [`skills/payload-integrate-plugin/SKILL.md`](./payload-integrate-plugin/SKILL.md) | 安全接入官方插件、前端消费、迁移和测试 | “接入 SEO 插件” |
| `payload-audit-access` | [`skills/payload-audit-access/SKILL.md`](./payload-audit-access/SKILL.md) | 只读审计 Access、Local API、媒体、表单、Jobs 和 MCP | “检查公开 API 是否泄露草稿” |
| `payload-manage-schema-change` | [`skills/payload-manage-schema-change/SKILL.md`](./payload-manage-schema-change/SKILL.md) | 管理类型、SQLite migration、数据保留和部署顺序 | “把 post.slug 改成唯一字段” |
| `payload-check-upgrade` | [`skills/payload-check-upgrade/SKILL.md`](./payload-check-upgrade/SKILL.md) | 检查 Payload/Next/插件版本兼容和升级风险 | “评估升级 Payload 4” |

## 推荐组合

### 新增内容类型

1. `$payload-model-content`
2. `$payload-manage-schema-change`
3. 若可发布，再用 `$payload-wire-publishing`

### 新增编辑模块

1. `$payload-scaffold-block`
2. `$payload-manage-schema-change`

### 引入官方插件

1. `$payload-integrate-plugin`
2. `$payload-manage-schema-change`
3. 上线前 `$payload-audit-access`

### 升级框架

1. `$payload-check-upgrade`
2. 用户确认执行后再修改依赖
3. `$payload-manage-schema-change`
4. `$payload-audit-access`

## 目录结构

```text
skills/
  INDEX.md
  <skill-name>/
    SKILL.md
    agents/
      openai.yaml
```

Skill 的详细领域依据位于 [`docs/payload/INDEX.md`](../docs/payload/INDEX.md)。
