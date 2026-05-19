// 复制此文件为 config.js 并填入你的配置
// 敏感 Key 建议在微信云开发控制台设置为云函数环境变量，此处可留空
const config = {
  envId: 'your-env-id',

  deepseek: {
    // 在云开发控制台 → 云函数 → dreamInterpret → 环境变量 设置 DEEPSEEK_API_KEY
    // 如果未设置环境变量，可临时填在这里（仅开发阶段，不要提交到仓库）
    apiKey: '',
    model: 'deepseek-chat',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
  },

  supabase: {
    url: 'https://xxxxx.supabase.co',
    // 在云开发控制台 → 云函数 → supabaseProxy → 环境变量 设置 SUPABASE_SERVICE_ROLE_KEY
    // 如果未设置环境变量，可临时填在这里（仅开发阶段，不要提交到仓库）
    serviceRoleKey: '',
    anonKey: '',
  },
}

module.exports = config
