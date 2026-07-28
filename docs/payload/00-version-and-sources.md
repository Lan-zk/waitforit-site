# 版本与资料来源

## 执行基线

本项目的实现基线是 `package.json` 中固定的 Payload `3.86.0`，而不是本地 Payload
仓库的 `main` 分支。

| 来源 | 当前状态 | 用途 |
| --- | --- | --- |
| `waitforit-site/package.json` | Payload `3.86.0` | 最终依赖事实 |
| `payload/origin/3.x` | Payload `3.86.0` | 匹配当前项目的源码依据 |
| Payload 官方文档 | 持续更新 | 概念、公开 API 和配置说明 |
| `payload/main` | Payload 4 canary | 前瞻观察，不能直接复制 API |

2026-07-28 检查结果：

- npm `latest`：`3.86.0`
- npm `canary`：`4.0.0-canary.17`
- 本地 `payload/origin/3.x`：`0c2e9a8519a82ad3aef7313cded7db27fb8a98ac`
- 本地 `payload/main`：`e2157e28f961e5bd8d064fa158303100bf62ba2e`

## 证据优先级

发生冲突时按以下顺序判断：

1. 当前项目 `package.json` 和 lockfile
2. 当前安装包导出的 TypeScript 类型
3. `payload/origin/3.x` 对应源码和测试
4. Payload 官方文档
5. Payload `main`/canary 源码
6. 博客、社区插件和第三方示例

官方文档可能提前出现 Payload 4 的说明。例如 Storage Adapter 文档已明确提到部分
默认值会在 v4 改变。因此任何新配置都要先核对 3.86 类型。

## 版本约束

- 所有 `payload`、`@payloadcms/*` 核心包和官方插件应使用相同版本。
- 不单独升级 `@payloadcms/ui`、`@payloadcms/next` 或富文本包。
- 不从 `main` 复制带有实验标记的 API。
- 插件安装后必须重新生成 types 和 import map。
- 升级前先阅读官方升级指南和 `origin/3.x` 到目标 tag 的变更。

## 关键源码入口

相对于 `E:/File/self/github/payload`：

- `packages/payload/src/config/types.ts`：根 Config 类型
- `packages/payload/src/collections/config/types.ts`：Collection 配置
- `packages/payload/src/globals/config/types.ts`：Global 配置
- `packages/payload/src/fields/config/types.ts`：Field 联合类型
- `packages/payload/src/access/`：访问控制
- `packages/payload/src/collections/operations/`：Collection 操作
- `packages/payload/src/globals/operations/`：Global 操作
- `templates/website/src/`：完整内容站参考实现
- `examples/`：单项功能示例
- `packages/plugin-*/src/`：官方插件实现

## 官方入口

- [What is Payload](https://payloadcms.com/docs/getting-started/what-is-payload)
- [Payload Concepts](https://payloadcms.com/docs/getting-started/concepts)
- [Payload Config](https://payloadcms.com/docs/configuration/overview)
- [Installation](https://payloadcms.com/docs/getting-started/installation)
- [Plugins](https://payloadcms.com/docs/plugins/overview)
