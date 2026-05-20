const SYMBOL_LIBRARY = [
  { symbol: '飞行或漂浮', keywords: ['飞', '飞行', '漂浮', '升空'], meaning: '通常和想突破现实边界、追求自由感有关。' },
  { symbol: '坠落', keywords: ['坠落', '掉下去', '下坠'], meaning: '常见于压力偏高或对失控感比较敏感的时候。' },
  { symbol: '追逐', keywords: ['追', '逃跑', '躲避', '被追'], meaning: '像是在提醒你，现实里也许有一个问题正在被回避。' },
  { symbol: '水', keywords: ['海', '河', '雨', '水', '洪水'], meaning: '通常和情绪流动、潜意识感受以及安全感有关。' },
  { symbol: '房间与建筑', keywords: ['房间', '房子', '学校', '电梯', '楼梯'], meaning: '往往映射个人边界、成长阶段或熟悉环境里的变化。' },
  { symbol: '人物关系', keywords: ['妈妈', '爸爸', '朋友', '前任', '同学', '陌生人'], meaning: '更像是在处理关系、期待或未说出口的情绪。' },
]

const MOOD_GUIDE = {
  '开心': '这段梦可能在放大你对满足感和被认可的期待。',
  '紧张': '梦里的冲突感和现实压力可能存在呼应。',
  '害怕': '潜意识更像是在用画面提醒你关注安全感和边界。',
  '悲伤': '这类梦往往和失落、告别或尚未整理完的情绪有关。',
  '平静': '梦整体更接近自我整理，说明你正在把零散感受拼起来。',
  '奇妙': '这说明你的联想力很活跃，适合记录意象和重复出现的细节。',
}

function buildLocalInterpretation(dream) {
  const text = `${dream.title || ''} ${dream.content || ''} ${(dream.tags || []).join(' ')}`
  const symbols = SYMBOL_LIBRARY
    .filter((item) => item.keywords.some((keyword) => text.includes(keyword)))
    .slice(0, 3)
  const moodInsight = MOOD_GUIDE[dream.mood] || MOOD_GUIDE['平静']
  const focus = symbols.length
    ? `这次梦里最明显的意象是${symbols.map((item) => item.symbol).join('、')}。`
    : '这次梦更像是情绪片段的拼贴，重点可以放在让你印象最深的场景和人物上。'

  return {
    summary: `这段梦整体呈现出"${dream.mood}"的情绪底色。${focus}`,
    symbols: symbols.length
      ? symbols.map((item) => ({ name: item.symbol, meaning: item.meaning }))
      : [{ name: '核心场景', meaning: '先关注最反复出现的地点、动作和人物，它们通常比情节顺序更重要。' }],
    insight: moodInsight,
    suggestion: '醒来后可以补记三个细节：最强烈的画面、出现的人、醒来后的第一感受。连续记录 7 天后会更容易看见模式。',
    source: 'local-fallback',
  }
}

function interpretDream(dream) {
  if (!wx.cloud || !wx.cloud.callFunction) {
    return Promise.resolve(buildLocalInterpretation(dream))
  }

  return wx.cloud
    .callFunction({
      name: 'dreamInterpret',
      data: {
        title: dream.title,
        content: dream.content,
        mood: dream.mood,
        tags: dream.tags,
      },
    })
    .then((res) => {
      const analysis = res.result && res.result.analysis ? res.result.analysis : null
      if (!analysis || !analysis.summary) {
        return buildLocalInterpretation(dream)
      }
      return analysis
    })
    .catch((err) => {
      console.warn('云函数调用失败，使用本地解析:', err)
      return buildLocalInterpretation(dream)
    })
}

module.exports = {
  buildLocalInterpretation,
  interpretDream,
}
