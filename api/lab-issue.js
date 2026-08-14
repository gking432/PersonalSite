import { randomUUID } from 'node:crypto'
import { clientKey, consumeRateLimit, originAllowed } from '../src/server/requestSecurity.js'
import { demoSupportCases } from '../src/server/demoSupportCases.js'

const categories = ['Returns', 'Sales Inquiry', 'Product Issue', 'Billing', 'Account Access', 'Delivery', 'Appointment', 'Safety', 'General Support']
const routes = {
  Returns: 'Customer Support / Returns',
  'Sales Inquiry': 'Sales',
  'Product Issue': 'Product Support',
  Billing: 'Billing',
  'Account Access': 'Account Support',
  Delivery: 'Customer Support / Fulfillment',
  Appointment: 'Scheduling / Operations',
  Safety: 'Product Safety / Escalation',
  'General Support': 'Customer Support Main Line',
}

const classifySchema = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: categories },
    requestType: { type: 'string' },
    urgency: { type: 'string', enum: ['Low', 'Normal', 'High', 'Critical'] },
    sentiment: { type: 'string' },
    intent: { type: 'string' },
    summary: { type: 'string' },
    knownFacts: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string' } },
    followUpFields: {
      type: 'array', minItems: 0, maxItems: 5,
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          label: { type: 'string' },
          question: { type: 'string' },
          placeholder: { type: 'string' },
        },
        required: ['key', 'label', 'question', 'placeholder'],
        additionalProperties: false,
      },
    },
  },
  required: ['category', 'requestType', 'urgency', 'sentiment', 'intent', 'summary', 'knownFacts', 'followUpFields'],
  additionalProperties: false,
}

const reportSchema = {
  type: 'object',
  properties: {
    repNeedsToKnow: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'string' } },
    unresolvedContext: { type: 'array', minItems: 0, maxItems: 5, items: { type: 'string' } },
    recommendedAction: { type: 'string' },
    nextSteps: { type: 'array', minItems: 2, maxItems: 5, items: { type: 'string' } },
    draftResponse: { type: 'string' },
  },
  required: ['repNeedsToKnow', 'unresolvedContext', 'recommendedAction', 'nextSteps', 'draftResponse'],
  additionalProperties: false,
}

const clean = (value, maximum = 6000) => String(value || '').trim().slice(0, maximum)
const outputText = (payload) => (payload.output || []).filter((item) => item.type === 'message').flatMap((item) => item.content || []).filter((item) => item.type === 'output_text').map((item) => item.text || '').join('')

async function structuredResponse({ name, schema, instructions, input, safetyIdentifier }) {
  if (!process.env.OPENAI_API_KEY) throw Object.assign(new Error('The AI workflow is not configured yet.'), { status: 503 })
  const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_LAB_MODEL || 'gpt-5.6-sol',
      instructions,
      input,
      reasoning: { effort: 'low' },
      text: { verbosity: 'low', format: { type: 'json_schema', name, strict: true, schema } },
      max_output_tokens: 2200,
      safety_identifier: safetyIdentifier,
      store: false,
    }),
  })
  const payload = await openAIResponse.json().catch(() => ({}))
  if (!openAIResponse.ok) {
    console.error('Issue pipeline AI request rejected', name, openAIResponse.status, payload?.error?.code || '')
    throw Object.assign(new Error('The AI step could not finish right now.'), { status: 502 })
  }
  return JSON.parse(outputText(payload))
}

function routeRequest(classification) {
  const department = routes[classification.category] || routes['General Support']
  const critical = classification.urgency === 'Critical'
  const high = classification.urgency === 'High'
  return {
    department,
    reason: `${classification.requestType} belongs with ${department}${critical || high ? ` and is marked ${classification.urgency.toLowerCase()} priority` : ''}.`,
    escalation: { required: critical || (high && ['Safety', 'Billing', 'Returns'].includes(classification.category)), reason: critical ? 'Potential immediate harm or severe impact requires specialist review.' : high ? 'The request has elevated impact and should receive prioritized human review.' : 'No elevated escalation signal was detected.' },
  }
}

const retrievalStopWords = new Set(['customer', 'support', 'request', 'product', 'issue', 'needs', 'needed', 'wants', 'want', 'help', 'with', 'from', 'that', 'this', 'have', 'after', 'before', 'their', 'there', 'were', 'been'])

function tokens(value) {
  const words = clean(value).toLowerCase().match(/[a-z0-9]+/g) || []
  return new Set(words.filter((token) => token.length > 3 && !retrievalStopWords.has(token)).map((token) => token.length > 4 && token.endsWith('s') ? token.slice(0, -1) : token))
}

function retrieveCases(request, classification, context) {
  const query = tokens(`${request} ${classification.category} ${classification.requestType} ${classification.summary} ${JSON.stringify(context)}`)
  return demoSupportCases.map((item) => {
    const document = tokens(`${item.type} ${item.issue} ${item.solution} ${item.outcome}`)
    let score = 0
    query.forEach((token) => { if (document.has(token)) score += 1 })
    if (item.type.toLowerCase().includes(classification.category.toLowerCase().split(' ')[0])) score += 3
    return { ...item, score }
  }).filter((item) => item.score >= 2).sort((a, b) => b.score - a.score).slice(0, 3).map(({ score, ...item }) => item)
}

async function handleAction(action, body, identifier) {
  const request = clean(body.request)
  if (request.length < 8) throw Object.assign(new Error('Enter a customer complaint or request.'), { status: 400 })

  if (action === 'classify') {
    return structuredResponse({
      name: 'customer_request_classification',
      schema: classifySchema,
      safetyIdentifier: identifier,
      instructions: 'You classify inbound customer requests for an internal service operation. Extract only supplied facts. Ask for missing context through compact, specific form fields. Do not ask for information that is already present. Never request payment-card data, passwords, government identifiers, or other sensitive information.',
      input: `Classify this request and identify up to five pieces of context a representative would need to resolve it. A short request like "I need to return a product" should normally ask for customer name, order or purchase number, purchase date, item, and return reason or condition. A safety report should prioritize immediate safe handling and ask only what a safety specialist needs. Use short field labels and direct questions.\n\nCustomer request:\n${request}`,
    })
  }

  const classification = body.classification
  if (!classification || !categories.includes(classification.category)) throw Object.assign(new Error('The request must be identified before this step can run.'), { status: 400 })
  const context = body.context && typeof body.context === 'object' ? body.context : {}

  if (action === 'route') return routeRequest(classification)
  if (action === 'match') return { matches: retrieveCases(request, classification, context) }
  if (action === 'report') {
    const route = body.route
    const matches = Array.isArray(body.matches) ? body.matches.slice(0, 3) : []
    const suppliedContext = Object.entries(context).filter(([, value]) => clean(value)).map(([key, value]) => `${key}: ${clean(value, 500)}`)
    const unanswered = (classification.followUpFields || []).filter((field) => !clean(context[field.key])).map((field) => field.label)
    const report = await structuredResponse({
      name: 'representative_action_report',
      schema: reportSchema,
      safetyIdentifier: identifier,
      instructions: 'You create a compact internal action report for the human representative receiving a customer request. Be specific, operational, and concise. Do not invent facts, policy, refunds, deadlines, or outcomes. Keep consequential decisions human-controlled.',
      input: `Create the final representative report from the completed pipeline.\n\nOriginal request: ${request}\nClassification: ${JSON.stringify(classification)}\nRouting: ${JSON.stringify(route)}\nContext supplied: ${suppliedContext.length ? suppliedContext.join('; ') : 'None'}\nStill unanswered: ${unanswered.join(', ') || 'None'}\nRetrieved fictional demo cases: ${JSON.stringify(matches)}\n\nUse prior case solutions only as patterns, never as proof that the same outcome applies. The draft reply should acknowledge the request and ask only for still-missing information.`,
    })
    return { caseId: `LAB-${randomUUID().slice(0, 6).toUpperCase()}`, ...report }
  }
  throw Object.assign(new Error('Choose a valid workflow step.'), { status: 400 })
}

export default async function handler(request, response) {
  if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return response.status(405).json({ error: 'Method not allowed.' }) }
  if (!originAllowed(request)) return response.status(403).json({ error: 'Origin not allowed.' })
  const identifier = clientKey(request)
  if (!consumeRateLimit('lab-issue', identifier, 30, 30 * 60 * 1000)) return response.status(429).json({ error: 'Too many workflow actions. Please try again later.' })
  try {
    const action = clean(request.body?.action, 30)
    const result = await handleAction(action, request.body || {}, identifier)
    response.setHeader('Cache-Control', 'no-store')
    return response.status(200).json({ result })
  } catch (error) {
    console.error('Issue pipeline error', error)
    return response.status(error?.status || 500).json({ error: error?.message || 'The workflow step could not finish.' })
  }
}
