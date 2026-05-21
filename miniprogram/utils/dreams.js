const supabase = require('./supabase')

function createDream(payload) {
  const now = Date.now()
  return {
    id: `dream_${now}_${Math.random().toString(36).slice(2, 8)}`,
    title: payload.title || '',
    content: payload.content || '',
    mood: payload.mood || '平静',
    tags: payload.tags || [],
    analysis: payload.analysis || null,
    status: payload.status || 'draft',
    createdAt: now,
    updatedAt: now,
    analyzedAt: payload.analyzedAt || null,
  }
}

async function readDreams() {
  try {
    return await supabase.fetchAllDreams()
  } catch (err) {
    console.warn('Supabase 读取失败，降级到本地:', err.message)
    return fallbackRead()
  }
}

async function getDreamById(id) {
  try {
    return await supabase.fetchDreamById(id)
  } catch (err) {
    console.warn('Supabase 读取详情失败，降级到本地:', err.message)
    return fallbackRead().find((d) => d.id === id) || null
  }
}

async function upsertDream(dream) {
  dream.updatedAt = Date.now()
  try {
    return await supabase.saveDream(dream)
  } catch (err) {
    console.warn('Supabase 保存失败，降级到本地:', err.message)
    return fallbackUpsert(dream)
  }
}

// 降级：Supabase 不可用时使用本地存储
const STORAGE_KEY = 'floydream-dreams-fallback'

function fallbackUpsert(dream) {
  const dreams = fallbackRead()
  const idx = dreams.findIndex((d) => d.id === dream.id)
  if (idx > -1) {
    dreams[idx] = { ...dreams[idx], ...dream, updatedAt: Date.now() }
  } else {
    dreams.unshift(dream)
  }
  dreams.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  wx.setStorageSync(STORAGE_KEY, dreams)
  return dream
}

function fallbackRead() {
  const raw = wx.getStorageSync(STORAGE_KEY)
  return Array.isArray(raw) ? raw : []
}

function parseTags(input) {
  return (input || '')
    .split(/[\s,，#]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6)
}

function formatDateTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  const h = `${date.getHours()}`.padStart(2, '0')
  const min = `${date.getMinutes()}`.padStart(2, '0')
  return `${m}/${d} ${h}:${min}`
}

function formatRelativeDate(timestamp) {
  if (!timestamp) return ''
  const diff = Date.now() - timestamp
  const hour = 60 * 60 * 1000
  const day = 24 * hour
  if (diff < hour) return '刚刚记录'
  if (diff < day) return `${Math.max(1, Math.floor(diff / hour))} 小时前`
  if (diff < day * 7) return `${Math.floor(diff / day)} 天前`
  return formatDateTime(timestamp)
}

function decorateDream(dream) {
  if (!dream) return null
  const tags = Array.isArray(dream.tags) ? dream.tags : []
  return {
    ...dream,
    tags,
    createdAtText: formatDateTime(dream.createdAt),
    relativeText: formatRelativeDate(dream.createdAt),
    preview: (dream.content || '').replace(/\s+/g, ' ').slice(0, 66),
    tagsText: tags.join('、'),
    tagSummary: tags.length ? `🏷️ ${tags.length} 个关键词` : '💤 只记下了片段',
  }
}

function getStats(dreams) {
  const total = dreams.length
  const tagged = dreams.filter((d) => Array.isArray(d.tags) && d.tags.length).length
  const dates = dreams
    .map((d) => new Date(d.createdAt).toDateString())
    .filter((v, i, list) => list.indexOf(v) === i)
  return { total, tagged, streak: dates.length }
}

module.exports = {
  createDream,
  decorateDream,
  formatDateTime,
  getDreamById,
  getStats,
  parseTags,
  readDreams,
  upsertDream,
}
