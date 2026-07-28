# Hooks、Jobs 与事务

## 选择规则

| 需求 | 推荐位置 |
| --- | --- |
| 校验/规范化输入 | `beforeValidate` |
| 写入前计算字段 | `beforeChange` |
| 写入后短小副作用 | `afterChange` |
| API 返回前填充派生字段 | `afterRead`，但要控制性能 |
| 删除关联清理 | `beforeDelete` / `afterDelete` |
| 全局错误上报 | root `afterError` |
| 邮件、搜索重建、第三方同步 | Jobs Queue |
| 多步原子数据库写入 | 同一 `req` 事务 |

## 阻塞行为

- Hook 返回 Promise 时 Payload 会等待。
- 不影响请求结果的长任务不要在 Hook 中 await。
- “fire-and-forget” 在进程退出或 Serverless 环境可能丢失，可靠任务应进入 Jobs。
- 高频 `beforeRead`/`afterRead` 不执行昂贵查询。

## 防止递归

Hook 内再次调用 Payload update 可能重新触发同一个 Hook。使用 `context` 标记：

```ts
if (context.skipRevalidate) return doc

await req.payload.update({
  collection: 'posts',
  id: doc.id,
  data,
  context: {
    skipRevalidate: true,
  },
  req,
})
```

标记名称应描述具体行为，不使用一个全局 `skipHooks` 绕过全部逻辑。

## 事务

Payload 支持时会为写操作开启事务。Hook 中的后续数据库调用必须传递原 `req` 才能加入
同一事务：

```ts
await req.payload.update({
  collection: 'related',
  id,
  data,
  req,
})
```

不传 `req` 可能产生独立操作，破坏原子性。

## Jobs Queue

适合：

- 发送邮件
- 搜索或向量索引
- 图片/PDF 生成
- 第三方 API 同步
- 定时发布/取消发布
- 批量 Import/Export

必须同时配置：

1. Task/Workflow 定义
2. 入队位置
3. schedule handler（如有）
4. worker/runner
5. 重试与失败策略
6. 监控和访问控制

## Hook 测试

- create/update/delete 各操作是否正确触发
- 事务失败是否回滚
- context 是否阻止递归
- Job 是否只入队一次
- draft 保存是否误触发公开副作用
- Hook 重跑是否幂等

## 参考

- [Hooks](https://payloadcms.com/docs/hooks/overview)
- [Field Hooks](https://payloadcms.com/docs/hooks/fields)
- [Transactions](https://payloadcms.com/docs/database/transactions)
- [Jobs Queue](https://payloadcms.com/docs/jobs-queue/overview)
