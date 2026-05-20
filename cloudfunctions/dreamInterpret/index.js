const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const SYSTEM_PROMPT = `你是一位资深的梦境分析师，融合荣格心理学、意象对话和现代睡眠科学来解读梦境。你的解读温柔、有洞察力，从不武断下结论。

请根据用户提供的梦境信息，返回严格符合以下格式的 JSON（不要包含 markdown 代码块标记）：

{
  "summary": "一段 2-3 句话的整体感受概述，点出梦的情绪底色和核心意象",
  "symbols": [
    { "name": "意象名称", "meaning": "该意象在梦中的可能含义，1-2 句话，语气温和，使用'可能''往往''有时'等开放表述" }
  ],
  "insight": "基于该梦境的心理映射，1-2 句话，关联到梦者可能的现实情绪或议题",
  "suggestion": "1-2 条具体的记录或自我观察建议，实用且温暖"
}

要求：
- symbols 数组返回 2-4 个最突出的意象
- 全文使用中文
- 语气温暖、专业、不武断
- 避免过度解读或下诊断性结论
- 如果梦境信息很少，就聚焦在已有的片段上，不要编造`

function buildPrompt(dream) {
  const parts = []
  const title = (dream.title || '').slice(0, 80)
  const content = (dream.content || '').slice(0, 1200)
  const tags = Array.isArray(dream.tags) ? dream.tags.slice(0, 8) : []

  if (title) parts.push(`标题：${title}`)
  if (dream.mood) parts.push(`醒来情绪：${dream.mood}`)
  if (content) parts.push(`梦境内容：${content}`)
  if (tags.length) parts.push(`关键词：${tags.join('、')}`)
  return parts.join('\n\n')
}

function parseAIResponse(text) {
  let cleaned = (text || '').trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }
  try {
    const parsed = JSON.parse(cleaned)
    return {
      summary: parsed.summary || '',
      symbols: Array.isArray(parsed.symbols) ? parsed.symbols : [],
      insight: parsed.insight || '',
      suggestion: parsed.suggestion || '',
      source: 'deepseek',
    }
  } catch (_) {
    return null
  }
}

function buildFallback(dream) {
  const moodMap = {
    '开心': '潜意识正在放大轻松、满足或被认可的体验',
    '紧张': '梦里的卡顿感可能和现实中的推进压力存在映射',
    '害怕': '潜意识借画面提醒你关注边界、安全感和未处理的担忧',
    '悲伤': '这类梦常出现在情绪需要被看见、告别尚未完成的时候',
    '平静': '这是一次温和的自我整理，你在消化最近的经历',
    '奇妙': '你的联想系统很活跃，适合长期记录积累重复主题',
  }
  const mood = dream.mood || '平静'

  return {
    summary: `这段梦整体呈现出"${mood}"的情绪底色。建议后续记录中多关注反复出现的人物、地点和情绪变化。`,
    symbols: [
      { name: '核心场景', meaning: '先关注最反复出现的地点、动作和人物，它们通常比情节顺序更重要。' },
    ],
    insight: moodMap[mood] || moodMap['平静'],
    suggestion: '醒来后补记三个细节：最强烈的画面、出现的人、醒来后的第一感受。连续记录 7 天后会更容易看见模式。',
    source: 'local-fallback',
  }
}

function httpPost(body, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(body) },
      ],
      temperature: 0.7,
      max_tokens: 700,
    })

    const req = https.request(
      {
        hostname: 'api.deepseek.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 20000,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.error) {
              reject(new Error(json.error.message || 'API error'))
            } else {
              resolve(json)
            }
          } catch (e) {
            reject(new Error('Response parse error: ' + data.slice(0, 200)))
          }
        })
      },
    )

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('DeepSeek API timeout'))
    })
    req.write(payload)
    req.end()
  })
}

exports.main = async (event) => {
  const dream = {
    title: (event.title || '').trim(),
    content: (event.content || '').trim(),
    mood: event.mood || '平静',
    tags: Array.isArray(event.tags) ? event.tags : [],
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || ''

  if (!apiKey) {
    console.warn('[dreamInterpret] 未配置 API Key，使用本地解析')
    return { ok: true, analysis: buildFallback(dream) }
  }

  try {
    console.log('[dreamInterpret] 调用 DeepSeek API…')
    const result = await httpPost(dream, apiKey)
    const aiText = result && result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content

    if (aiText) {
      const analysis = parseAIResponse(aiText)
      if (analysis) {
        console.log('[dreamInterpret] DeepSeek 解析成功')
        return { ok: true, analysis }
      }
      // 返回原始文本
      console.warn('[dreamInterpret] JSON 解析失败，返回原始文本')
      return {
        ok: true,
        analysis: {
          summary: aiText.slice(0, 400),
          symbols: [],
          insight: '',
          suggestion: '',
          source: 'deepseek-raw',
        },
      }
    }

    console.warn('[dreamInterpret] AI 返回为空，回退本地解析')
    return { ok: true, analysis: buildFallback(dream) }
  } catch (error) {
    console.error('[dreamInterpret] 调用失败:', error.message)
    return { ok: true, analysis: buildFallback(dream) }
  }
}
