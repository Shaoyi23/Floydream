// 复制此文件为 config.js 并填入你的配置
// 注意：不要把 DeepSeek / Supabase service_role 之类的敏感 Key 放进小程序前端配置
const config = {
  // 推荐开发阶段直接使用微信开发者工具里当前选中的云环境：
  // 1. 设为空字符串，配合 miniprogram/app.js 自动走 DYNAMIC_CURRENT_ENV
  // 2. 或显式填写真实存在的 envId
  envId: '',

  supabase: {
    url: 'https://xxxxx.supabase.co',
  },
}

module.exports = config
