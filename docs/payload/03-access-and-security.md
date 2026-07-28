# Access 与安全边界

## 默认立场

- 未明确开放的数据保持认证后访问。
- 公开内容只允许匿名 `read`。
- 公开表单只允许受限 `create`，不允许匿名读取提交记录。
- `users`、Jobs、MCP Keys、Import/Export 数据不公开。
- Access 是服务端安全边界，Admin UI 隐藏不是安全控制。

## 推荐 Access 函数

```ts
export const anyone = () => true

export const authenticated = ({ req: { user } }) => Boolean(user)

export const authenticatedOrPublished = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

实际类型应从当前 `payload` 包导入。公开内容 Collection 建议：

```ts
access: {
  create: authenticated,
  delete: authenticated,
  read: authenticatedOrPublished,
  update: authenticated,
}
```

## Local API 高风险默认值

Local API 默认 `overrideAccess: true`。以下代码不能用于带用户身份的公开请求：

```ts
await payload.find({ collection: 'posts' })
```

当结果应受当前用户权限约束时：

```ts
await payload.find({
  collection: 'posts',
  overrideAccess: false,
  user,
})
```

在 Hook、Endpoint、MCP Tool 中优先传递原始 `req`，以继承事务、locale 和用户。

## Field Access

Field Access 用于：

- 隐藏用户邮箱、内部备注和成本数据
- 禁止客户端修改计算字段
- 公开文档只暴露安全字段

Field `read` 返回 false 时字段会从 API 响应中移除；不要只依赖 `admin.hidden`。

## 上传安全

- `media.read: () => true` 意味着所有文件公开。
- 私有文件必须保留 Payload 静态处理和 Access，不能直接暴露公开桶 URL。
- 限制 MIME、文件大小和外部 URL 上传范围。
- 表单上传单独评估恶意文件、文件数量和存储成本。

## MCP

启用 MCP 时采用双重授权：

1. Config 中只启用必要 Collection/Global 和操作。
2. API Key 中再次允许具体 capability。

从只读 `find` 开始；自定义 MCP Tool 内调用 Local API 时仍需 `overrideAccess: false` 并传
`req`。Key 只显示一次，不能进入仓库、日志或文档。

## 测试要求

每个 Access 规则至少测试：

- 匿名允许路径
- 匿名拒绝路径
- 已认证允许路径
- 受条件限制的文档
- Local API 未绕过规则
- Field 不出现在响应中

## 官方参考

- [Access Control](https://payloadcms.com/docs/access-control/overview)
- [Field Access](https://payloadcms.com/docs/access-control/fields)
- [Authentication](https://payloadcms.com/docs/authentication/overview)
- [Local API](https://payloadcms.com/docs/local-api/overview)
- [MCP Plugin](https://payloadcms.com/docs/plugins/mcp)
