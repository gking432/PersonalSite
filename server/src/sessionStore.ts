import { randomInt, randomUUID, timingSafeEqual } from 'node:crypto'
import type { WebSocket } from 'ws'
import type { NoteState, ServerEvent } from './contracts.js'

export type DemoSession = {
  id: string
  code: string
  browserToken: string
  createdAt: number
  expiresAt: number
  pairedCallId: string | null
  method: 'browser' | 'phone' | null
  notes: NoteState
  sockets: Set<WebSocket>
}

const SESSION_TTL_MS = 10 * 60 * 1000

function constantTimeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export class SessionStore {
  private sessions = new Map<string, DemoSession>()

  create(): DemoSession {
    this.removeExpired()
    let code = ''
    do code = String(randomInt(1000, 10000))
    while ([...this.sessions.values()].some((session) => session.code === code && !session.pairedCallId))

    const now = Date.now()
    const session: DemoSession = {
      id: randomUUID(),
      code,
      browserToken: randomUUID() + randomUUID(),
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
      pairedCallId: null,
      method: null,
      notes: {
        goal: 'Waiting for the conversation',
        interests: [],
        workflow: 'Not started',
        selection: 'None yet',
        nextStep: 'Choose a direction',
      },
      sockets: new Set(),
    }
    this.sessions.set(session.id, session)
    return session
  }

  get(id: string) {
    const session = this.sessions.get(id)
    if (!session || session.expiresAt <= Date.now()) {
      if (session) this.sessions.delete(id)
      return null
    }
    return session
  }

  authenticate(id: string, token: string) {
    const session = this.get(id)
    return session && constantTimeEqual(session.browserToken, token) ? session : null
  }

  pair(code: string, callId: string, method: 'browser' | 'phone') {
    this.removeExpired()
    const session = [...this.sessions.values()].find((candidate) => candidate.code === code && !candidate.pairedCallId)
    if (!session) return null
    session.pairedCallId = callId
    session.method = method
    this.broadcast(session, { type: 'call.connected', callId, method })
    return session
  }

  broadcast(session: DemoSession, event: ServerEvent) {
    const encoded = JSON.stringify(event)
    for (const socket of session.sockets) {
      if (socket.readyState === socket.OPEN) socket.send(encoded)
    }
  }

  removeExpired() {
    const now = Date.now()
    for (const [id, session] of this.sessions) {
      if (session.expiresAt <= now) {
        for (const socket of session.sockets) socket.close(1001, 'Session expired')
        this.sessions.delete(id)
      }
    }
  }
}
