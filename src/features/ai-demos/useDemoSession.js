import { useCallback, useEffect, useRef, useState } from 'react'

const apiUrl = (import.meta.env.VITE_AI_DEMO_API_URL || '').replace(/\/$/, '')

const localCode = () => {
  if (window.crypto?.getRandomValues) {
    const values = new Uint16Array(1)
    window.crypto.getRandomValues(values)
    return String(1000 + (values[0] % 9000))
  }
  return String(Math.floor(1000 + Math.random() * 9000))
}

export default function useDemoSession() {
  const [session, setSession] = useState(() => ({ code: localCode(), status: 'local-preview' }))
  const socketRef = useRef(null)

  const createSession = useCallback(async () => {
    socketRef.current?.close?.()
    if (!apiUrl) {
      setSession({ code: localCode(), status: 'local-preview' })
      return
    }

    setSession((current) => ({ ...current, status: 'connecting' }))
    try {
      const response = await fetch(`${apiUrl}/v1/sessions`, { method: 'POST' })
      if (!response.ok) throw new Error('Session service unavailable')
      const created = await response.json()
      const next = { ...created, status: 'waiting' }
      setSession(next)

      const socketUrl = apiUrl.replace(/^http/, 'ws')
      const socket = new WebSocket(`${socketUrl}/v1/sessions/${created.sessionId}/live?token=${encodeURIComponent(created.browserToken)}`)
      socketRef.current = socket
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === 'call.connected') setSession((current) => ({ ...current, status: 'paired', callId: message.callId, method: message.method }))
      }
      socket.onerror = () => setSession((current) => ({ ...current, status: 'service-error' }))
    } catch {
      setSession({ code: localCode(), status: 'local-preview' })
    }
  }, [])

  useEffect(() => {
    createSession()
    return () => socketRef.current?.close?.()
  }, [createSession])

  const pairPreview = useCallback(async (method) => {
    if (!apiUrl || !session.sessionId) return { connected: true, local: true }
    const response = await fetch(`${apiUrl}/v1/sessions/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: session.code, method }),
    })
    if (!response.ok) throw new Error('The preview session could not be paired.')
    return response.json()
  }, [session])

  return {
    sessionCode: session.code,
    sessionStatus: session.status,
    usingSessionService: Boolean(apiUrl && session.sessionId),
    pairPreview,
    refreshSession: createSession,
  }
}
