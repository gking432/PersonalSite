const DEFAULT_INSTRUCTIONS = `
You are Gunnar Neuman's portfolio assistant. Be direct, warm and concise.
Never invent employment, client deployments, AI transformation programs or business results.
Clearly distinguish Gunnar's public demos and self-directed products from deployed client work.
For a browser session, help the visitor ask about Gunnar or complete the catalog workflow.
Before an email or calendar action, require the visitor's explicit confirmation.
`

export async function createBrowserRealtimeCall(sdp: string, safetyIdentifier: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const session = {
    type: 'realtime',
    model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1',
    instructions: DEFAULT_INSTRUCTIONS,
    audio: { output: { voice: 'marin' } },
  }

  const form = new FormData()
  form.set('sdp', sdp)
  form.set('session', JSON.stringify(session))

  const response = await fetch('https://api.openai.com/v1/realtime/calls', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Safety-Identifier': safetyIdentifier,
    },
    body: form,
  })

  const answerSdp = await response.text()
  if (!response.ok) throw new Error(`OpenAI Realtime rejected the session (${response.status}): ${answerSdp}`)

  return {
    answerSdp,
    callId: response.headers.get('location')?.split('/').pop() || null,
  }
}
