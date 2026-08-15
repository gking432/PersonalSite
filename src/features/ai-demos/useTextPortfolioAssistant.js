import { useCallback, useRef, useState } from 'react'

const initialNotes = {
  visitorName: '',
  organization: '',
  visitorRole: '',
  reasonForVisit: '',
  hiringContext: '',
  goal: 'Getting oriented',
  questions: [],
  interests: [],
  relevantProof: [],
  nextStep: 'Continue the conversation',
}

const openingMessage = {
  role: 'assistant',
  content: "Hi. I'm Gunnar's AI assistant. I can answer questions about his background, pull up the right work, or help you through one of his projects. What would you like to know?",
  destinations: [],
}

export default function useTextPortfolioAssistant() {
  const [messages, setMessages] = useState([openingMessage])
  const [suggestions, setSuggestions] = useState([
    'What is Gunnar best at?',
    'Why is the CRM case study relevant?',
    'Why is he moving into AI implementation?',
  ])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState(initialNotes)
  const [actions, setActions] = useState([])
  const actionCounter = useRef(0)

  const sendMessage = useCallback(async (value) => {
    const content = String(value || '').trim().slice(0, 1200)
    if (!content || sending) return false

    const userMessage = { role: 'user', content, destinations: [] }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setSuggestions([])
    setSending(true)
    setError('')
    const knowledgeActionId = `text-action-${++actionCounter.current}`
    setActions((current) => [...current.slice(-9), {
      id: knowledgeActionId,
      kind: 'read',
      label: 'Consult verified portfolio knowledge',
      detail: 'Matching the question to Gunnar’s verified background and project evidence.',
      status: 'running',
    }])

    try {
      const response = await fetch('/api/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'The assistant could not answer right now.')

      setMessages((current) => [...current, {
        role: 'assistant',
        content: payload.reply,
        destinations: Array.isArray(payload.destinations) ? payload.destinations : [],
      }])
      setSuggestions(Array.isArray(payload.suggestions) ? payload.suggestions : [])
      if (payload.notes) setNotes(payload.notes)
      setActions((current) => {
        const completed = current.map((action) => action.id === knowledgeActionId
          ? { ...action, status: 'ok', detail: 'Answer grounded in Gunnar’s verified public knowledge.' }
          : action)
        const additions = [{
          id: `text-action-${++actionCounter.current}`,
          kind: 'internal',
          label: 'Update conversation notes',
          detail: 'Captured the useful context, questions, relevant evidence, and next step.',
          status: 'ok',
        }]
        if (Array.isArray(payload.destinations) && payload.destinations.length) {
          additions.push({
            id: `text-action-${++actionCounter.current}`,
            kind: 'read',
            label: 'Offer relevant portfolio destination',
            detail: 'Displayed the most relevant page or project link without opening anything automatically.',
            status: 'ok',
          })
        }
        return [...completed, ...additions].slice(-12)
      })
      return true
    } catch (requestError) {
      setError(requestError?.message || 'The assistant could not answer right now.')
      setActions((current) => current.map((action) => action.id === knowledgeActionId
        ? { ...action, status: 'error', detail: 'The knowledge request did not complete.' }
        : action))
      return false
    } finally {
      setSending(false)
    }
  }, [messages, sending])

  return {
    messages,
    suggestions,
    sending,
    error,
    sendMessage,
    notes,
    actions,
    destination: null,
    emailOffered: false,
    calendarState: { status: 'idle' },
    bookingState: { status: 'idle' },
  }
}
