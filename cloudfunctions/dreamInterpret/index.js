const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const SYMBOL_LIBRARY = [
  {
    symbol: '飞行或漂浮',
    keywords: ['飞', '飞行', '漂浮', '升空'],
    meaning: '通常与摆脱限制、追求自由、或想快速离开某种处境有关。',
  },
  {
    symbol: '坠落',
    keywords: ['坠落', '掉下去', '下坠'],
    meaning: '常和失控感、现实压力或对结果的不确定性连接在一起。',
  },
  {
    symbol: '追逐',
    keywords: ['追', '逃跑', '躲避', '被追'],
    meaning: '像是在提醒你，有一个现实议题正在等待你正面回应。',
  },
  {
    symbol: '房间与建筑',
    keywords: ['房间', '房子', '学校', '电梯', '楼梯'],
    meaning: '往往反映个人边界、熟悉环境变化，以及对成长阶段的感受。',
  },
  {
    symbol: '水',
    keywords: ['海', '河', '雨', '水', '洪水'],
    meaning: '更偏向情绪波动、潜意识活动和安全感议题。',
  },
  {
    symbol: '人物关系',
    keywords: ['妈妈', '爸爸', '朋友', '前任', '同学', '陌生人'],
    meaning: '通常和关系中的期待、牵挂、遗憾或角色压力有关。',
  },
]

const MOOD_GUIDE = {
  开心: '这说明你的潜意识正在放大轻松、满足或被认可的体验。',
  紧张: '梦里的卡顿感可能和现实里的推进压力、时间压力存在映射。',
  害怕: '潜意识更像是在借画面提醒你关注边界、安全感和未处理的担忧。',
  悲伤: '这类梦常出现在情绪需要被看见、告别尚未完成的时候。',
  平静: '这更像一次温和的自我整理，说明你在消化最近经历的情绪碎片。',
  奇妙: '你的联想系统很活跃，这类梦很适合长期记录，容易积累重复主题。',
}

function matchSymbols(text) {
  return SYMBOL_LIBRARY.filter((item) => item.keywords.some((keyword) => text.includes(keyword))).slice(0, 3)
}

exports.main = async (event) => {
  const title = (event.title || '').trim()
  const content = (event.content || '').trim()
  const mood = event.mood || '平静'
  const tags = Array.isArray(event.tags) ? event.tags : []
  const text = `${title} ${content} ${tags.join(' ')}`
  const symbols = matchSymbols(text)

  return {
    ok: true,
    analysis: {
      summary: `这段梦整体呈现出“${mood}”的情绪底色。${symbols.length ? `其中最突出的意象是${symbols.map((item) => item.symbol).join('、')}。` : '它更像一段需要从场景和感受切入的潜意识片段。'}`,
      symbols: symbols.length
        ? symbols.map((item) => ({
            name: item.symbol,
            meaning: item.meaning,
          }))
        : [
            {
              name: '核心场景',
              meaning: '如果暂时没有特别明显的符号，先观察反复出现的地点、动作和人物。',
            },
          ],
      insight: MOOD_GUIDE[mood] || MOOD_GUIDE.平静,
      suggestion: '下次醒来后，优先补记情绪变化、重复出现的人和地点，以及最突然中断的那个瞬间。',
      source: 'cloud-rule-engine',
    },
  }
}
