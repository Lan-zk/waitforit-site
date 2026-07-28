# 发布、版本与预览

## 推荐发布模型

Posts、Projects 和可编辑 Pages 使用：

```ts
versions: {
  drafts: {
    autosave: {
      interval: 375,
    },
    schedulePublish: true,
  },
  maxPerDoc: 50,
}
```

间隔根据编辑体验和数据库写入压力调整。官方 Website Template 为 Live Preview 使用更短
间隔，但不应无条件复制。

## 公开读取

匿名请求只能读取 `_status: published`。预览请求必须：

- 经过受保护的 Preview Route
- 验证当前用户
- 开启 Next.js draft mode
- 查询时传递 `draft: true`
- 不把预览 token 放入公开缓存

## Preview 与 Live Preview

两种能力不同：

- Preview：保存草稿后打开前台 URL。
- Live Preview：Admin iframe 通过 `postMessage` 推送尚未保存的字段变化。

推荐顺序：

1. 先完成安全 Preview Route。
2. 再接入 Server-side Live Preview。
3. 只有确实需要客户端状态合并时才安装 `@payloadcms/live-preview-react`。

Live Preview URL 应由服务端可信配置和 slug 构造，不能直接接受任意外部 URL。

## 发布时间

`publishedAt` 可在第一次进入 published 状态时自动填写。避免每次更新已发布文档都覆盖
原发布时间。

定时发布需要：

- `schedulePublish: true`
- 正确配置 Jobs Queue
- 实际运行 schedule handler 和 job worker

只定义 schedule 不会自动执行任务。

## 缓存失效

Collection Hook 建议：

- `afterChange`：文档 published 时 revalidate 新路径和列表
- slug 改动：同时失效旧路径，并创建/提醒创建 redirect
- `afterDelete`：失效详情和列表
- draft 保存：避免污染公开缓存

## 验证

- 匿名访问草稿返回 404
- 编辑者可预览草稿
- 发布后前台更新
- 删除后详情消失
- slug 变化后旧地址正确跳转
- 定时发布在 worker 执行后生效

## 参考

- [Versions](https://payloadcms.com/docs/versions/overview)
- [Live Preview](https://payloadcms.com/docs/live-preview)
- [Live Preview Frontend](https://payloadcms.com/docs/live-preview/frontend)
- [Jobs Queue](https://payloadcms.com/docs/jobs-queue/overview)
- `payload/templates/website/src/utilities/generatePreviewPath.ts`
- `payload/templates/website/src/collections/Posts/hooks/revalidatePost.ts`
