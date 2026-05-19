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
3. 如需使用云函数，在 `miniprogram/config.js` 中填写自己的云开发环境 `envId`。
4. 在开发者工具中上传并部署 `cloudfunctions/dreamInterpret`。

## 后续迭代方向

- 接入真实大模型做更细的梦境追问与解析
- 增加云端同步和账号体系
- 增加梦境标签统计、连续记录和搜索能力
