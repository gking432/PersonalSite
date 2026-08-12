import { getAvailableSlots, googleCalendarConfigured } from '../src/server/googleCalendar.js'
import { clientKey, consumeRateLimit, originAllowed } from '../src/server/requestSecurity.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed.' })
  }
  if (!originAllowed(request)) return response.status(403).json({ error: 'Origin not allowed.' })
  if (!consumeRateLimit('availability', clientKey(request), 12, 30 * 60 * 1000)) return response.status(429).json({ error: 'Too many calendar checks. Please try again later.' })
  if (!googleCalendarConfigured()) return response.status(503).json({ error: 'Calendar availability is not configured yet.', configured: false })

  try {
    const slots = await getAvailableSlots(8)
    response.setHeader('Cache-Control', 'private, no-store')
    return response.status(200).json({ configured: true, slots })
  } catch (error) {
    console.error('Calendar availability error', error)
    return response.status(502).json({ error: 'Gunnar’s calendar could not be checked.' })
  }
}
