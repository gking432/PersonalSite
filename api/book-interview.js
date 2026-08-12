import { createInterview, googleCalendarConfigured } from '../src/server/googleCalendar.js'
import { clientKey, consumeRateLimit, originAllowed } from '../src/server/requestSecurity.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }
  if (!originAllowed(request)) return response.status(403).json({ error: 'Origin not allowed.' })
  if (!consumeRateLimit('booking', clientKey(request), 3, 24 * 60 * 60 * 1000)) return response.status(429).json({ error: 'Too many booking attempts. Please contact Gunnar directly.' })
  if (!googleCalendarConfigured()) return response.status(503).json({ error: 'Interview scheduling is not configured yet.' })

  const name = String(request.body?.name || '').trim().slice(0, 100)
  const email = String(request.body?.email || '').trim().toLowerCase()
  const start = String(request.body?.start || '')
  if (name.length < 2) return response.status(400).json({ error: 'Enter your name.' })
  if (!emailPattern.test(email) || email.length > 254) return response.status(400).json({ error: 'Enter a valid email address.' })
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(start)) return response.status(400).json({ error: 'Select a valid available time.' })

  try {
    const event = await createInterview({ start, name, email })
    return response.status(201).json({ success: true, event })
  } catch (error) {
    const unavailable = error?.message === 'That time is no longer available.'
    console.error('Interview booking error', unavailable ? 'slot unavailable' : error)
    return response.status(unavailable ? 409 : 502).json({ error: unavailable ? 'That time is no longer available. Please select another.' : 'The interview could not be scheduled.' })
  }
}
