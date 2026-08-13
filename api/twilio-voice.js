import { escapeXml, sendTwiml, validTwilioRequest } from '../src/server/twilio.js'

export default function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) return sendTwiml(response, '<Say>This channel is unavailable.</Say>', 405)
  if (!validTwilioRequest(request)) return sendTwiml(response, '<Say>This request could not be verified.</Say>', 403)
  const action = `${String(process.env.TWILIO_WEBHOOK_BASE_URL || '').replace(/\/$/, '')}/api/twilio-voice-result`
  const prompt = 'Welcome to Gunnar Neuman\'s customer issue workflow. After the tone, describe the problem, the product involved, and the outcome you need. Then stop speaking.'
  return sendTwiml(response, `<Gather input="speech" action="${escapeXml(action)}" method="POST" speechTimeout="auto" actionOnEmptyResult="true"><Say>${escapeXml(prompt)}</Say></Gather>`)
}
