const STORAGE_KEY = 'floydream-dreams'

function readDreams() {
  const dreams = wx.getStorageSync(STORAGE_KEY)

  if (!Array.isArray(dreams)) {
    return []
  }

  return dreams
    .filter((dream) => dream && dream.id)
    .map((dream) => ({
      ...dream,
      tags: Array.isArray(dream.tags) ? dream.tags : [],
      status: dream.status || 'draft',
    }))
    .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0))
}

function writeDreams(dreams) {
  wx.setStorageSync(STORAGE_KEY, dreams)
}

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

function upsertDream(dream) {
  const dreams = readDreams()
  const index = dreams.findIndex((item) => item.id === dream.id)
  const nextDream = {
    ...dream,
    updatedAt: Date.now(),
  }

  if (index > -1) {
    dreams[index] = {
      ...dreams[index],
      ...nextDream,
    }
  } else {
    dreams.unshift(nextDream)
  }

  dreams.sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0))
  writeDreams(dreams)
  return nextDream
}

function getDreamById(id) {
  return readDreams().find((dream) => dream.id === id) || null
}

function parseTags(input) {
  return (input || '')
    .split(/[\s,，#]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6)
}

function formatDateTime(timestamp) {
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')

  return `${month}/${day} ${hour}:${minute}`
}

function formatRelativeDate(timestamp) {
  if (!timestamp) {
    return ''
  }

  const diff = Date.now() - timestamp
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  if (diff < hour) {
    return '刚刚记录'
  }

  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))} 小时前`
  }

  if (diff < day * 7) {
    return `${Math.floor(diff / day)} 天前`
  }

  return formatDateTime(timestamp)
}

function decorateDream(dream) {
  if (!dream) {
    return null
  }

  return {
    ...dream,
    createdAtText: formatDateTime(dream.createdAt),
    relativeText: formatRelativeDate(dream.createdAt),
    preview: (dream.content || '').replace(/\s+/g, ' ').slice(0, 66),
  }
}

function getStats(dreams) {
  const total = dreams.length
  const interpreted = dreams.filter((dream) => dream.analysis).length
  const streakBase = dreams
    .map((dream) => new Date(dream.createdAt).toDateString())
    .filter((value, index, list) => list.indexOf(value) === index)

  return {
    total,
    interpreted,
    streak: streakBase.length,
  }
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
