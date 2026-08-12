import { createHash } from 'node:crypto'

const allowedOrigins = new Set([
  'https://www.gunnarneuman.com',
  'https://gunnarneuman.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

export function originAllowed(request) {
  const origin = String(request.headers.origin || '')
  if (!origin) return true
  const isPreview = /^https:\/\/personal-site-[a-z0-9-]+-gking432s-projects\.vercel\.app$/.test(origin)
  return allowedOrigins.has(origin) || isPreview
}

export function clientKey(request) {
  const forwarded = String(request.headers['x-forwarded-for'] || '').split(',')[0].trim()
  const address = forwarded || request.socket?.remoteAddress || 'anonymous'
  const agent = String(request.headers['user-agent'] || 'unknown')
  return createHash('sha256').update(`${address}|${agent}`).digest('hex')
}

export function consumeRateLimit(namespace, identifier, maximum, windowMs) {
  const storeKey = `__gunnarRateLimit_${namespace}`
  const store = globalThis[storeKey] || new Map()
  globalThis[storeKey] = store
  const threshold = Date.now() - windowMs
  const recent = (store.get(identifier) || []).filter((time) => time > threshold)
  if (recent.length >= maximum) return false
  recent.push(Date.now())
  store.set(identifier, recent)
  return true
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
