const config = require('../config')

function getUserId() {
  let userId = wx.getStorageSync('floydream-user-id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    wx.setStorageSync('floydream-user-id', userId)
  }
  return userId
}

function getHostname() {
  try {
    return new URL(config.supabase.url).hostname
  } catch (_) {
    return ''
  }
}

function callCloud(action, data) {
  return wx.cloud.callFunction({
    name: 'supabaseProxy',
    data: {
      action,
      data,
      supabaseHostname: getHostname(),
      supabaseServiceRoleKey: config.supabase.serviceRoleKey || '',
    },
  })
}

function rowToDream(row) {
  return {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    mood: row.mood || '平静',
    tags: Array.isArray(row.tags) ? row.tags : [],
    analysis: row.analysis || null,
    status: row.status || 'draft',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    analyzedAt: row.analyzed_at ? new Date(row.analyzed_at).getTime() : null,
  }
}

async function fetchAllDreams() {
  const res = await callCloud('list', { userId: getUserId() })
  if (!res.result || !res.result.ok) {
    throw new Error(res.result?.error || '云函数调用失败')
  }
  return (res.result.data || []).map(rowToDream)
}

async function fetchDreamById(id) {
  const res = await callCloud('get', { id, userId: getUserId() })
  if (!res.result || !res.result.ok) {
    throw new Error(res.result?.error || '云函数调用失败')
  }
  return res.result.data ? rowToDream(res.result.data) : null
}

async function saveDream(dream) {
  const row = {
    id: dream.id,
    user_id: getUserId(),
    title: dream.title,
    content: dream.content,
    mood: dream.mood,
    tags: dream.tags,
    analysis: dream.analysis,
    status: dream.status,
    created_at: dream.createdAt ? new Date(dream.createdAt).toISOString() : new Date().toISOString(),
    analyzed_at: dream.analyzedAt ? new Date(dream.analyzedAt).toISOString() : null,
  }
  const res = await callCloud('save', { dream: row })
  if (!res.result || !res.result.ok) {
    throw new Error(res.result?.error || '云函数调用失败')
  }
  return rowToDream(res.result.data)
}

async function deleteDreamById(id) {
  const res = await callCloud('delete', { id, userId: getUserId() })
  if (!res.result || !res.result.ok) {
    throw new Error(res.result?.error || '云函数调用失败')
  }
}

module.exports = {
  fetchAllDreams,
  fetchDreamById,
  saveDream,
  deleteDreamById,
  getUserId,
}
