import { useCallback, useState } from 'react'

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

  const sendMessage = useCallback(async (value) => {
    const content = String(value || '').trim().slice(0, 1200)
    if (!content || sending) return false

    const userMessage = { role: 'user', content, destinations: [] }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
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
      return true
    } catch (requestError) {
      setError(requestError?.message || 'The assistant could not answer right now.')
      return false
    } finally {
      setSending(false)
    }
  }, [messages, sending])

  return { messages, suggestions, sending, error, sendMessage }
}
