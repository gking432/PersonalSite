import { analyzeLabDemo } from './lab-analyze.js'
import { clientKey, consumeRateLimit } from '../src/server/requestSecurity.js'
import { escapeXml, sendTwiml, shortPhoneSummary, validTwilioRequest } from '../src/server/twilio.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendTwiml(response, '<Say>This channel is unavailable.</Say>', 405)
  if (!validTwilioRequest(request)) return sendTwiml(response, '<Say>This request could not be verified.</Say>', 403)
  const identifier = clientKey(request)
  if (!consumeRateLimit('twilio-voice', identifier, 5, 60 * 60 * 1000)) return sendTwiml(response, '<Say>This demonstration has reached its temporary call limit.</Say>', 429)
  const complaint = String(request.body?.SpeechResult || '').trim().slice(0, 6000)
  if (complaint.length < 30) return sendTwiml(response, '<Say>I did not catch enough detail to create the case. Please use the browser form and try again.</Say>')

  try {
    const result = await analyzeLabDemo({ demo: 'complaint', input: { channel: 'Phone call', customerName: '', product: '', orderReference: '', complaint }, safetyIdentifier: identifier })
    return sendTwiml(response, `<Say>${escapeXml(shortPhoneSummary(result))}</Say>`)
  } catch (error) {
    console.error('Twilio voice Lab error', error)
    return sendTwiml(response, '<Say>Your message was received, but the AI workflow could not finish right now. Please try the browser demonstration instead.</Say>', 503)
  }
}
