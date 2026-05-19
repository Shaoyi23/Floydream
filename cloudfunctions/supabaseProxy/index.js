const https = require('https')

function getConfig(event) {
  return {
    hostname: event.supabaseHostname || 'nyrjmolpdonkgmlhyghe.supabase.co',
    apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY || event.supabaseServiceRoleKey || '',
  }
}

function httpRequest(method, path, body, cfg) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null

    const options = {
      hostname: cfg.hostname,
      path: `/rest/v1${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': cfg.apiKey,
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      timeout: 15000,
    }

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload)
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json)
          } else {
            const msg = (json && json.message) || `HTTP ${res.statusCode}`
            reject(new Error(msg))
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`))
          }
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Supabase timeout'))
    })

    if (payload) req.write(payload)
    req.end()
  })
}

exports.main = async (event) => {
  const cfg = getConfig(event)
  if (!cfg.apiKey) {
    return { ok: false, error: '未配置 Supabase service_role key' }
  }

  const { action, data } = event

  try {
    switch (action) {

      case 'list': {
        const userId = data.userId || ''
        const rows = await httpRequest(
          'GET',
          `/dreams?select=*&user_id=eq.${userId}&order=updated_at.desc`,
          null,
          cfg,
        )
        return { ok: true, data: rows }
      }

      case 'get': {
        const { id, userId } = data
        const rows = await httpRequest(
          'GET',
          `/dreams?select=*&id=eq.${encodeURIComponent(id)}&user_id=eq.${userId}`,
          null,
          cfg,
        )
        return { ok: true, data: rows.length ? rows[0] : null }
      }

      case 'save': {
        const { dream } = data
        const updated = await httpRequest(
          'PATCH',
          `/dreams?id=eq.${encodeURIComponent(dream.id)}&user_id=eq.${dream.user_id}`,
          dream,
          cfg,
        )
        if (updated && updated.length) {
          return { ok: true, data: updated[0] }
        }
        const inserted = await httpRequest('POST', '/dreams', dream, cfg)
        return { ok: true, data: Array.isArray(inserted) ? inserted[0] : inserted }
      }

      case 'delete': {
        const { id, userId } = data
        await httpRequest(
          'DELETE',
          `/dreams?id=eq.${encodeURIComponent(id)}&user_id=eq.${userId}`,
          null,
          cfg,
        )
        return { ok: true }
      }

      default:
        return { ok: false, error: `Unknown action: ${action}` }
    }
  } catch (err) {
    console.error('[supabaseProxy]', action, err.message)
    return { ok: false, error: err.message }
  }
}
