# Floydream

一个用于记录梦境并生成温和解读的微信小程序 MVP。

## 当前能力

- 首页浏览最近梦境和记录概览
- 记录页支持标题、情绪、内容、关键词标签
- 详情页展示梦境内容和 AI 解读
- 个人中心展示基础统计
- AI 解读支持云函数优先、本地规则回退

## 项目结构

```text
miniprogram/
  pages/
  utils/
  app.js
  app.json
cloudfunctions/
  dreamInterpret/
```

## 本地运行

1. 使用[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)打开项目根目录。
2. 确认 `project.config.json` 中的 `miniprogramRoot` 为 `miniprogram/`。
3. 如需使用云函数，先在微信开发者工具中开通并选中一个云开发环境。
4. 在 `miniprogram/config.js` 中将 `envId` 留空，默认使用当前选中的云环境；或者填写一个真实存在的 `envId`。
5. 在云开发控制台为云函数设置环境变量：
   `dreamInterpret`: `DEEPSEEK_API_KEY`
   `supabaseProxy`: `SUPABASE_SERVICE_ROLE_KEY`
6. 在开发者工具中分别上传并部署 `cloudfunctions/dreamInterpret` 和 `cloudfunctions/supabaseProxy`。

## 密钥安全

- 不要把 `DeepSeek API Key` 或 `Supabase service_role key` 放进 `miniprogram/config.js`，小程序打包后这些内容会进入客户端。
- `miniprogram/config.js` 已被 `.gitignore` 忽略，但“被忽略”不等于“安全”；如果文件里有密钥，仍然可能在打包、截图、共享工程目录时泄露。
- 正确做法是把真正敏感的密钥只放到云函数环境变量中，由 `cloudfunctions/dreamInterpret` 和 `cloudfunctions/supabaseProxy` 在服务端读取。
- 如果密钥曾经出现在前端代码、聊天记录、截图或仓库历史中，请立刻轮换：
  `DEEPSEEK_API_KEY`
  `SUPABASE_SERVICE_ROLE_KEY`
- `Supabase anon key` 不是高权限私钥，理论上可以公开，但当前项目并没有直接在前端使用它，所以也不需要继续放在本地配置里。

## 后续迭代方向

- 接入真实大模型做更细的梦境追问与解析
- 增加云端同步和账号体系
- 增加梦境标签统计、连续记录和搜索能力
