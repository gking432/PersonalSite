import { analyzeLabDemo } from './lab-analyze.js'
import { clientKey, consumeRateLimit } from '../src/server/requestSecurity.js'
import { escapeXml, sendTwiml, shortPhoneSummary, validTwilioRequest } from '../src/server/twilio.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendTwiml(response, '<Message>That channel only accepts incoming text messages.</Message>', 405)
  if (!validTwilioRequest(request)) return sendTwiml(response, '<Message>This request could not be verified.</Message>', 403)
  const identifier = clientKey(request)
  if (!consumeRateLimit('twilio-sms', identifier, 8, 60 * 60 * 1000)) return sendTwiml(response, '<Message>This demonstration has reached its temporary message limit.</Message>', 429)

  const complaint = String(request.body?.Body || '').trim().slice(0, 6000)
  if (complaint.length < 30) return sendTwiml(response, '<Message>Please include a little more detail about the issue, product, and what outcome you need.</Message>')

  try {
    const result = await analyzeLabDemo({ demo: 'complaint', input: { channel: 'SMS', customerName: '', product: '', orderReference: '', complaint }, safetyIdentifier: identifier })
    return sendTwiml(response, `<Message>${escapeXml(shortPhoneSummary(result))}</Message>`)
  } catch (error) {
    console.error('Twilio SMS Lab error', error)
    return sendTwiml(response, '<Message>Your message was received, but the AI workflow could not finish right now. Please try the browser demonstration instead.</Message>', 503)
  }
}
