import { createHmac, timingSafeEqual } from 'node:crypto'

export function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function signatureUrl(request) {
  const base = String(process.env.TWILIO_WEBHOOK_BASE_URL || '').replace(/\/$/, '')
  if (base) return `${base}${request.url?.split('?')[0] || ''}`
  const protocol = String(request.headers['x-forwarded-proto'] || 'https').split(',')[0]
  const host = String(request.headers['x-forwarded-host'] || request.headers.host || '').split(',')[0]
  return `${protocol}://${host}${request.url || ''}`
}

export function validTwilioRequest(request) {
  const token = process.env.TWILIO_AUTH_TOKEN
  const supplied = String(request.headers['x-twilio-signature'] || '')
  if (!token || !supplied) return false
  const parameters = request.body && typeof request.body === 'object' ? request.body : {}
  const signed = Object.keys(parameters).sort().reduce((value, key) => `${value}${key}${parameters[key]}`, signatureUrl(request))
  const expected = createHmac('sha1', token).update(signed).digest('base64')
  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer)
}

export function sendTwiml(response, body, status = 200) {
  response.setHeader('Content-Type', 'text/xml; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  return response.status(status).send(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`)
}

export function shortPhoneSummary(result) {
  return `I created case ${result.caseId}. It was classified as ${result.urgency.toLowerCase()} priority ${result.category}, and routed to ${result.department}. A person should review the proposed response before anything is sent.`
}
