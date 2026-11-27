import { createClient } from '@supabase/supabase-js'

let supabase

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase server configuration is missing')
  }

  if (!supabase) {
    supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }

  return supabase
}

export async function authenticate(req, res, next) {
  const authorization = req.get('authorization') || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)

  if (!match) {
    return res.status(401).json({
      error: 'Authentication required'
    })
  }

  try {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.getUser(match[1])

    if (error || !data?.user) {
      return res.status(401).json({
        error: 'Invalid or expired access token'
      })
    }

    req.user = {
      id: data.user.id,
      email: data.user.email ?? null
    }

    return next()
  } catch (error) {
    if (error.message.includes('configuration is missing')) {
      return res.status(503).json({
        error: 'Authentication service is not configured'
      })
    }

    return res.status(503).json({
      error: 'Authentication service temporarily unavailable'
    })
  }
}
