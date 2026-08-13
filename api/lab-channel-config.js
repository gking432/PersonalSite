import { originAllowed } from '../src/server/requestSecurity.js'

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed.' })
  }
  if (!originAllowed(request)) return response.status(403).json({ error: 'Origin not allowed.' })

  const phoneNumber = String(process.env.TWILIO_PHONE_NUMBER || '').trim()
  const configured = Boolean(phoneNumber && process.env.TWILIO_AUTH_TOKEN)
  response.setHeader('Cache-Control', 'private, no-store')
  return response.status(200).json({ configured, phoneNumber: configured ? phoneNumber : '' })
}
