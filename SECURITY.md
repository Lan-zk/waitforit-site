# Security Policy

## Reporting a vulnerability

请不要在公开 Issue 中披露漏洞、凭据或生产数据。优先使用 GitHub 仓库的
**Security → Report a vulnerability** 私密报告入口；如果该入口不可用，请通过维护者
GitHub 主页上的私密联系方式报告。

报告中请包含受影响版本、复现步骤、影响范围和必要的最小证据。不要附带真实用户数据、
生产数据库、访问令牌或服务器凭据。

## Repository hygiene

生产环境变量、SQLite 数据库、上传媒体、备份、证书和运维凭据不属于本仓库。若秘密
曾进入 Git 历史，应立即轮换秘密，并清理完整历史；只删除工作区文件并不足以消除泄露。
