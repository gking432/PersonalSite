import { useCallback, useState } from 'react'

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
  entries: [],
}

const openingMessage = {
  role: 'assistant',
  content: "Hi. I'm Gunnar's assistant. What brought you to his site today?",
  destinations: [],
}

let textNoteSequence = 0

function mergeList(current = [], incoming = [], limit = 20) {
  return [...current, ...incoming]
    .map((item) => String(item || '').trim())
    .filter((item, index, items) => item && items.indexOf(item) === index)
    .slice(-limit)
}

function mergeNotes(current, incoming) {
  return {
    visitorName: incoming.visitorName || current.visitorName,
    organization: incoming.organization || current.organization,
    visitorRole: incoming.visitorRole || current.visitorRole,
    reasonForVisit: incoming.reasonForVisit || current.reasonForVisit,
    hiringContext: incoming.hiringContext || current.hiringContext,
    goal: incoming.goal || current.goal,
    questions: mergeList(current.questions, incoming.questions),
    interests: mergeList(current.interests, incoming.interests),
    relevantProof: mergeList(current.relevantProof, incoming.relevantProof),
    nextStep: incoming.nextStep || current.nextStep,
    entries: current.entries,
  }
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

  const sendMessage = useCallback(async (value) => {
    const content = String(value || '').trim().slice(0, 1200)
    if (!content || sending) return false

    const userMessage = { role: 'user', content, destinations: [] }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setNotes((current) => {
      textNoteSequence += 1
      return {
        ...current,
        entries: [...current.entries, { id: `text-note-${textNoteSequence}`, text: content }].slice(-30),
      }
    })
    setSuggestions([])
    setSending(true)
    setError('')

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
      if (payload.notes) setNotes((current) => mergeNotes(current, payload.notes))
      return true
    } catch (requestError) {
      setError(requestError?.message || 'The assistant could not answer right now.')
      return false
    } finally {
      setSending(false)
    }
  }, [messages, sending])

  return {
    started: messages.some((message) => message.role === 'user'),
    messages,
    suggestions,
    sending,
    error,
    sendMessage,
    notes,
    destination: null,
    emailOffered: false,
    calendarState: { status: 'idle' },
    bookingState: { status: 'idle' },
  }
}
