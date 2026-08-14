import { clientKey, consumeRateLimit, originAllowed } from '../src/server/requestSecurity.js'
import { textAssistantInstructions } from '../src/server/textAssistantConfig.js'

const destinationIds = ['about', 'projects', 'client_work', 'contact', 'resume', 'prepme', 'crm', 'terralis', 'movemint']

const replySchema = {
  type: 'object',
  properties: {
    reply: {
      type: 'string',
      description: 'The concise conversational answer shown to the visitor.',
    },
    destinations: {
      type: 'array',
      description: 'Zero to two relevant portfolio destinations to display after the answer.',
      items: { type: 'string', enum: destinationIds },
    },
    suggestions: {
      type: 'array',
      description: 'Zero to three short, natural follow-up questions the visitor could ask.',
      items: { type: 'string' },
    },
  },
  required: ['reply', 'destinations', 'suggestions'],
  additionalProperties: false,
}

function cleanMessages(value) {
  if (!Array.isArray(value)) return []
  return value
    .slice(-10)
    .map((message) => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content: String(message?.content || '').trim().slice(0, 1200),
    }))
    .filter((message) => message.content)
}

function outputText(payload) {
  return (payload.output || [])
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text || '')
    .join('')
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }
  if (!originAllowed(request)) return response.status(403).json({ error: 'Origin not allowed.' })
  if (!consumeRateLimit('assistant-chat', clientKey(request), 24, 10 * 60 * 1000)) {
    return response.status(429).json({ error: 'Too many messages. Please try again shortly.' })
  }
  if (!process.env.OPENAI_API_KEY) return response.status(503).json({ error: 'Text chat is not configured yet.' })

  const messages = cleanMessages(request.body?.messages)
  if (!messages.length || messages.at(-1).role !== 'user') {
    return response.status(400).json({ error: 'A visitor message is required.' })
  }

  const identifier = clientKey(request)

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna',
        instructions: textAssistantInstructions,
        input: messages,
        reasoning: { effort: 'low' },
        text: {
          verbosity: 'low',
          format: {
            type: 'json_schema',
            name: 'portfolio_assistant_reply',
            strict: true,
            schema: replySchema,
          },
        },
        max_output_tokens: 700,
        safety_identifier: identifier,
        store: false,
      }),
    })

    const payload = await openAIResponse.json().catch(() => ({}))
    if (!openAIResponse.ok) {
      console.error('Assistant text response rejected', openAIResponse.status, payload?.error?.message || '')
      return response.status(502).json({ error: 'The assistant could not answer right now.' })
    }

    const raw = outputText(payload)
    const result = JSON.parse(raw)
    const destinations = Array.isArray(result.destinations)
      ? result.destinations.filter((item) => destinationIds.includes(item)).slice(0, 2)
      : []
    const suggestions = Array.isArray(result.suggestions)
      ? result.suggestions.map((item) => String(item).slice(0, 100)).slice(0, 3)
      : []

    response.setHeader('Cache-Control', 'no-store')
    return response.status(200).json({
      reply: String(result.reply || '').slice(0, 2400),
      destinations,
      suggestions,
    })
  } catch (error) {
    console.error('Assistant text response error', error)
    return response.status(500).json({ error: 'The assistant could not answer right now.' })
  }
}
