import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { createHash, randomUUID } from 'node:crypto'
import { z } from 'zod'
import { browserEventSchema, noteStateSchema } from './contracts.js'
import { createBrowserRealtimeCall } from './realtime.js'
import { SessionStore } from './sessionStore.js'

const app = Fastify({ logger: true })
const sessions = new SessionStore()
const siteOrigin = process.env.SITE_ORIGIN || 'http://localhost:5173'
const allowedOrigins = [...new Set([siteOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'])]

await app.register(cors, {
  origin: allowedOrigins,
  exposedHeaders: ['x-realtime-call-id'],
})
await app.register(websocket)

app.addContentTypeParser('application/sdp', { parseAs: 'string' }, (_request, body, done) => done(null, body))

app.get('/health', async () => ({ ok: true, mode: process.env.OPENAI_API_KEY ? 'live-ready' : 'preview' }))

app.post('/v1/sessions', async (_request, reply) => {
  const session = sessions.create()
  return reply.code(201).send({
    sessionId: session.id,
    browserToken: session.browserToken,
    code: session.code,
    expiresAt: new Date(session.expiresAt).toISOString(),
  })
})

app.post('/v1/sessions/pair', async (request, reply) => {
  const body = z.object({ code: z.string().regex(/^\d{4}$/), callId: z.string().default(() => randomUUID()), method: z.enum(['browser', 'phone']).default('phone') }).safeParse(request.body)
  if (!body.success) return reply.code(400).send({ error: 'A valid four-digit code is required.' })
  const session = sessions.pair(body.data.code, body.data.callId, body.data.method)
  if (!session) return reply.code(404).send({ error: 'That code is invalid, expired or already paired.' })
  return { sessionId: session.id, connected: true }
})

app.patch('/v1/sessions/:id/notes', async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).safeParse(request.params)
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '') || ''
  if (!params.success) return reply.code(400).send({ error: 'Invalid session.' })
  const session = sessions.authenticate(params.data.id, token)
  if (!session) return reply.code(401).send({ error: 'Session authentication failed.' })
  const notes = noteStateSchema.safeParse(request.body)
  if (!notes.success) return reply.code(400).send({ error: 'Invalid note state.' })
  session.notes = notes.data
  sessions.broadcast(session, { type: 'notes.updated', notes: session.notes })
  return { ok: true }
})

// The browser token travels in the WebSocket URL because the browser WebSocket
// constructor cannot set an Authorization header. Silence access logs on this
// route so the token never lands in ordinary request logs.
app.get('/v1/sessions/:id/live', { websocket: true, logLevel: 'silent' }, (socket, request) => {
  const params = z.object({ id: z.string().uuid() }).safeParse(request.params)
  const query = z.object({ token: z.string().min(20) }).safeParse(request.query)
  if (!params.success || !query.success) return socket.close(1008, 'Invalid session')
  const session = sessions.authenticate(params.data.id, query.data.token)
  if (!session) return socket.close(1008, 'Session authentication failed')

  session.sockets.add(socket)
  socket.send(JSON.stringify({ type: 'session.created', sessionId: session.id, code: session.code }))
  if (session.pairedCallId && session.method) socket.send(JSON.stringify({ type: 'call.connected', callId: session.pairedCallId, method: session.method }))

  socket.on('message', (raw) => {
    try {
      browserEventSchema.parse(JSON.parse(raw.toString()))
    } catch {
      socket.send(JSON.stringify({ type: 'session.error', message: 'The browser sent an unsupported event.' }))
    }
  })
  socket.on('close', () => session.sockets.delete(socket))
})

app.post('/v1/realtime/browser-session', async (request, reply) => {
  if (!process.env.OPENAI_API_KEY) return reply.code(503).send({ error: 'Live browser voice is not configured yet.' })
  if (typeof request.body !== 'string' || !request.body.includes('v=0')) return reply.code(400).send({ error: 'A valid WebRTC SDP offer is required.' })
  const safetyIdentifier = createHash('sha256').update(request.ip).digest('hex')
  try {
    const realtime = await createBrowserRealtimeCall(request.body, safetyIdentifier)
    if (realtime.callId) reply.header('x-realtime-call-id', realtime.callId)
    return reply.type('application/sdp').send(realtime.answerSdp)
  } catch (error) {
    request.log.error(error)
    return reply.code(502).send({ error: 'The live voice session could not be created.' })
  }
})

const port = Number(process.env.PORT || 8787)
await app.listen({ host: '0.0.0.0', port })
