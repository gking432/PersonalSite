import { createHash } from 'node:crypto'
import { realtimeSession } from '../src/server/aiAssistantConfig.js'

export const config = { api: { bodyParser: false } }

const allowedOrigins = new Set([
  'https://www.gunnarneuman.com',
  'https://gunnarneuman.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

const rateLimit = globalThis.__gunnarRealtimeRateLimit || new Map()
globalThis.__gunnarRealtimeRateLimit = rateLimit

async function readRawBody(request) {
  if (typeof request.body === 'string') return request.body
  if (Buffer.isBuffer(request.body)) return request.body.toString('utf8')
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 250_000) throw new Error('SDP offer is too large')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function clientIdentifier(request) {
  const forwarded = String(request.headers['x-forwarded-for'] || '').split(',')[0].trim()
  const address = forwarded || request.socket?.remoteAddress || 'anonymous'
  const agent = String(request.headers['user-agent'] || 'unknown')
  return createHash('sha256').update(`${address}|${agent}`).digest('hex')
}

function withinRateLimit(identifier) {
  const now = Date.now()
  const windowStart = now - (10 * 60 * 1000)
  const recent = (rateLimit.get(identifier) || []).filter((time) => time > windowStart)
  if (recent.length >= 8) return false
  recent.push(now)
  rateLimit.set(identifier, recent)
  return true
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const origin = String(request.headers.origin || '')
  const isVercelPreview = /^https:\/\/personal-site-[a-z0-9-]+-gking432s-projects\.vercel\.app$/.test(origin)
  if (origin && !allowedOrigins.has(origin) && !isVercelPreview) {
    return response.status(403).json({ error: 'Origin not allowed.' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({ error: 'Live voice is not configured.' })
  }

  const identifier = clientIdentifier(request)
  if (!withinRateLimit(identifier)) {
    return response.status(429).json({ error: 'Too many voice sessions. Please try again shortly.' })
  }

  try {
    const sdp = await readRawBody(request)
    if (!sdp.includes('v=0') || !sdp.includes('m=audio')) {
      return response.status(400).json({ error: 'A valid audio session offer is required.' })
    }

    const form = new FormData()
    form.set('sdp', sdp)
    form.set('session', JSON.stringify(realtimeSession))

    const openAIResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Safety-Identifier': identifier,
      },
      body: form,
    })

    const answer = await openAIResponse.text()
    if (!openAIResponse.ok) {
      console.error('Realtime session rejected', openAIResponse.status, answer.slice(0, 500))
      return response.status(502).json({ error: 'The live voice session could not be created.' })
    }

    const location = openAIResponse.headers.get('location')
    if (location) response.setHeader('x-realtime-call-id', location.split('/').pop())
    response.setHeader('Content-Type', 'application/sdp')
    response.setHeader('Cache-Control', 'no-store')
    return response.status(201).send(answer)
  } catch (error) {
    console.error('Realtime session error', error)
    return response.status(500).json({ error: 'The live voice session could not be created.' })
  }
}
