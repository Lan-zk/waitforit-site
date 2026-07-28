# Media 与存储

## 当前模型

当前 `media` Collection 已启用上传并公开读取，只有一个必填 `alt` 字段。个人站建议补充：

- `caption`: richText 或 textarea
- `credit`
- `sourceURL`
- 可选 folder/prefix
- 受控 MIME 类型
- 响应式 image sizes

## 图片尺寸建议

按真实 UI 调整，不机械复制模板：

| 名称 | 用途 |
| --- | --- |
| `thumbnail` | Admin 和小卡片 |
| `small` | 移动端内容图 |
| `medium` | 列表/正文 |
| `large` | 桌面大图 |
| `og` | 1200×630 社交分享 |

只有界面实际使用的尺寸才生成，避免上传时间和存储量线性增加。

## 字段规则

- 内容图片必须有可用 alt；装饰图由前端显式使用空 alt。
- 原始文件名不能作为可信标题。
- UI 使用 Payload 返回的尺寸信息，而不是字符串拼接 URL。
- `next/image` 的远程域名或自定义 loader 与存储 Adapter 同步配置。
- 删除文档前评估是否仍被其他文档引用。

## 本地与云存储

当前 SQLite + 自托管场景可继续使用持久化本地目录，前提是：

- 数据库和媒体使用持久卷
- 一起备份和恢复
- 多实例不会各自写独立磁盘

以下情况使用 Storage Adapter：

- Serverless/无持久磁盘
- 多实例部署
- 需要 CDN 或跨区域访问
- 媒体量超出应用服务器磁盘策略

官方 Adapter 包括 S3、R2、Vercel Blob、Azure 和 GCS 等。

## 访问控制

Cloud Storage 默认可通过 Payload 代理保留 Access。只有媒体本来就完全公开时，才考虑
`disablePayloadAccessControl` 和直接公开桶 URL。

私有媒体需要验证：

- 未认证请求被拒绝
- 派生尺寸也受保护
- 原始桶对象不可绕过 Payload 读取
- 缓存不会把私有响应共享给其他用户

## 上传验证

- MIME allowlist
- 文件大小限制
- 图片解码失败
- 重复文件名
- 删除清理
- 外部 URL 上传 allowlist
- 备份恢复后的 URL

## 参考

- [Uploads](https://payloadcms.com/docs/upload/overview)
- [Storage Adapters](https://payloadcms.com/docs/upload/storage-adapters)
- `payload/templates/website/src/collections/Media.ts`
- `payload/packages/plugin-cloud-storage/src/plugin.ts`
