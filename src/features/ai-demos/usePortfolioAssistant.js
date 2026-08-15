import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useRealtimeVoice from './useRealtimeVoice'

export const initialAssistantNotes = {
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

export const assistantDestinations = {
  about: { href: '/about', label: 'Open my story' },
  projects: { href: '/projects', label: 'See my projects' },
  client_work: { href: '/client-work', label: 'See earlier client work' },
  contact: { href: '/contact', label: 'Contact Gunnar' },
  resume: { href: '/Gunnar-Neuman-Resume.pdf', label: 'Open my résumé', external: true },
  prepme: { href: 'https://prep-me-wheat.vercel.app/', label: 'Open PrepMe', external: true },
  crm: { href: 'https://new-teal-delta.vercel.app/app', label: 'Open the CRM demo', external: true },
  terralis: { href: 'https://cartoprint.vercel.app/', label: 'Open Terralis', external: true },
  movemint: { href: 'https://www.movemint.fun/', label: 'Open MoveMint', external: true },
}

export const assistantSiteTargets = {
  home_overview: { href: '/', selector: '[data-assistant-section="home-overview"]', label: 'Homepage overview' },
  home_approach: { href: '/', selector: '[data-assistant-section="home-approach"]', label: 'How Gunnar approaches the work' },
  home_projects: { href: '/', selector: '[data-assistant-section="home-projects"]', label: 'Working product proof' },
  home_experience: { href: '/', selector: '[data-assistant-section="home-experience"]', label: 'Gunnar’s experience' },
  about_overview: { href: '/about', selector: '[data-assistant-section="about-overview"]', label: 'About Gunnar' },
  about_working_style: { href: '/about', selector: '[data-assistant-section="about-working-style"]', label: 'How Gunnar works' },
  about_story: { href: '/about', selector: '#my-story', label: 'Gunnar’s story' },
  about_capabilities: { href: '/about', selector: '[data-assistant-section="about-capabilities"]', label: 'Gunnar’s capabilities' },
  projects_overview: { href: '/projects', selector: '[data-assistant-section="projects-overview"]', label: 'Project overview' },
  projects_crm: { href: '/projects', selector: '#project-crm', label: 'Home-Services AI CRM' },
  projects_prepme: { href: '/projects', selector: '#project-prepme', label: 'PrepMe' },
  projects_terralis: { href: '/projects', selector: '#project-terralis', label: 'Terralis Print Studio' },
  projects_movemint: { href: '/projects', selector: '#project-movemint', label: 'MoveMint' },
  client_work_overview: { href: '/client-work', selector: '[data-assistant-section="client-work-overview"]', label: 'Earlier client work' },
  contact_overview: { href: '/contact', selector: '[data-assistant-section="contact-overview"]', label: 'Contact Gunnar' },
  contact_form: { href: '/contact', selector: '[data-assistant-section="contact-form"]', label: 'Contact form' },
}

const pageLabels = {
  '/': 'the homepage',
  '/about': 'the About page',
  '/projects': 'the Projects page',
  '/client-work': 'the Client Work page',
  '/contact': 'the Contact page',
}

export function currentPortfolioScreen(pathname = window.location.pathname) {
  const sections = [...document.querySelectorAll('[data-assistant-section]')]
  const focusLine = Math.min(window.innerHeight * 0.32, 240)
  const visible = sections.find((element) => {
    const rect = element.getBoundingClientRect()
    return rect.top <= focusLine && rect.bottom > focusLine
  }) || sections
    .map((element) => ({ element, distance: Math.abs(element.getBoundingClientRect().top - focusLine) }))
    .sort((a, b) => a.distance - b.distance)[0]?.element

  return {
    page: pageLabels[pathname] || pathname,
    section: visible?.dataset?.assistantSection || 'page overview',
  }
}

// ─── Action log ──────────────────────────────────────────────────────────────
// Every tool call the model makes is recorded and shown to the visitor. Reads
// run automatically; anything that leaves the site is recorded as held until a
// person confirms it in the page. This is the difference between a chatbot and
// a system with an audit trail, so the log is deliberately not collapsible.
const actionLabels = {
  update_notes: { label: 'Update conversation notes', kind: 'internal' },
  navigate_site: { label: 'Navigate the site', kind: 'read' },
  show_site_destination: { label: 'Offer a destination link', kind: 'read' },
  offer_email_recap: { label: 'Open the recap form', kind: 'read' },
  check_calendar_availability: { label: "Check Gunnar's calendar", kind: 'read' },
}

let actionSequence = 0

function describeResult(name, args, result) {
  if (!result?.success) return result?.error || 'Failed'
  if (name === 'navigate_site') return result.label ? `${result.label} in view` : 'Section in view'
  if (name === 'show_site_destination') return 'Link shown'
  if (name === 'check_calendar_availability') {
    const count = result.slots?.length || 0
    return count ? `${count} open ${count === 1 ? 'slot' : 'slots'}` : 'No open slots'
  }
  if (name === 'offer_email_recap') return 'Form shown, waiting on you'
  if (name === 'update_notes') return 'Notes updated'
  return 'Done'
}

function cleanList(value) {
  return Array.isArray(value) ? value.slice(0, 4).map((item) => String(item).slice(0, 180)) : []
}

function cleanNotes(args) {
  return {
    visitorName: String(args.visitorName || '').slice(0, 120),
    organization: String(args.organization || '').slice(0, 160),
    visitorRole: String(args.visitorRole || '').slice(0, 160),
    reasonForVisit: String(args.reasonForVisit || '').slice(0, 300),
    hiringContext: String(args.hiringContext || '').slice(0, 500),
    goal: String(args.goal || 'Exploring Gunnar’s background and work').slice(0, 240),
    questions: cleanList(args.questions),
    interests: cleanList(args.interests),
    relevantProof: cleanList(args.relevantProof),
    nextStep: String(args.nextStep || 'Continue the conversation').slice(0, 240),
  }
}

export default function usePortfolioAssistant() {
  const location = useLocation()
  const navigate = useNavigate()
  const realtime = useRealtimeVoice()
  const [active, setActive] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [notes, setNotes] = useState(initialAssistantNotes)
  const [destination, setDestination] = useState(null)
  const [emailOffered, setEmailOffered] = useState(false)
  const [emailState, setEmailState] = useState({ status: 'idle', message: '' })
  const [calendarState, setCalendarState] = useState({ status: 'idle', slots: [], message: '' })
  const [bookingState, setBookingState] = useState({ status: 'idle', message: '', event: null })
  const [duration, setDuration] = useState(0)
  const [actions, setActions] = useState([])
  const durationRef = useRef(null)
  // When armed, the next calendar check is forced to fail so a visitor can watch
  // the system degrade to a human path instead of guessing at a time.
  const failNextCalendarRef = useRef(false)

  const logAction = useCallback((entry) => {
    actionSequence += 1
    setActions((current) => [...current.slice(-11), { id: actionSequence, ...entry }])
  }, [])

  const armCalendarFailure = useCallback(() => {
    failNextCalendarRef.current = true
    logAction({
      label: 'Simulated failure armed',
      kind: 'internal',
      status: 'ok',
      detail: 'The next calendar check will be forced to return an error',
      simulated: true,
    })
  }, [logAction])

  useEffect(() => {
    if (!active) return undefined
    durationRef.current = window.setInterval(() => setDuration((value) => value + 1), 1000)
    return () => window.clearInterval(durationRef.current)
  }, [active])

  const checkAvailability = useCallback(async () => {
    setCalendarState({ status: 'checking', slots: [], message: '' })
    if (failNextCalendarRef.current) {
      failNextCalendarRef.current = false
      const message = 'Simulated failure: the calendar service did not respond.'
      setCalendarState({ status: 'unavailable', slots: [], message })
      return { success: false, error: message }
    }
    try {
      const response = await fetch('/api/calendar-availability', { headers: { Accept: 'application/json' } })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Gunnar’s calendar could not be checked.')
      const slots = Array.isArray(payload.slots) ? payload.slots.slice(0, 8) : []
      setCalendarState({ status: slots.length ? 'ready' : 'empty', slots, message: slots.length ? '' : 'No open times were found in the current window.' })
      return { success: true, slots: slots.map(({ start, label }) => ({ start, label })) }
    } catch (error) {
      const message = error?.message || 'Gunnar’s calendar could not be checked.'
      setCalendarState({ status: 'unavailable', slots: [], message })
      return { success: false, error: message }
    }
  }, [])

  const navigateSite = useCallback(async (destinationId) => {
    const target = assistantSiteTargets[destinationId]
    if (!target) return { success: false, error: 'That part of the site is not available.' }

    setDestination(null)
    if (location.pathname !== target.href) navigate(target.href)

    const element = await new Promise((resolve) => {
      let attempts = 0
      const find = () => {
        const match = document.querySelector(target.selector)
        if (match || attempts >= 20) return resolve(match)
        attempts += 1
        window.setTimeout(find, 75)
      }
      window.setTimeout(find, location.pathname === target.href ? 0 : 80)
    })

    if (!element) return { success: false, error: 'The page opened, but that section could not be located.' }

    const top = element.getBoundingClientRect().top + window.scrollY - 82
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    return {
      success: true,
      page: target.href,
      section: destinationId,
      label: target.label,
      visibleOnScreen: true,
    }
  }, [location.pathname, navigate])

  const connect = useCallback(async (options = {}) => {
    setConnecting(true)
    setTranscript('')
    setNotes(initialAssistantNotes)
    setDestination(null)
    setEmailOffered(false)
    setEmailState({ status: 'idle', message: '' })
    setCalendarState({ status: 'idle', slots: [], message: '' })
    setBookingState({ status: 'idle', message: '', event: null })
    setDuration(0)
    setActions([])
    failNextCalendarRef.current = false

    try {
      await realtime.connect({
        initialContext: (() => {
          const screen = currentPortfolioScreen(location.pathname)
          const applicationContext = String(options.additionalContext || '').slice(0, 1500)
          return `The visitor currently has ${screen.page} open at the section "${screen.section}". You may navigate and scroll this portfolio through the navigate_site tool.${applicationContext ? ` Trusted workflow context: ${applicationContext}` : ''}`
        })(),
        openingInstructions: String(options.openingInstructions || '').slice(0, 900),
        onAssistantTranscript: (text) => setTranscript(text || ''),
        onToolCall: async (name, args) => {
          const run = async () => {
            if (name === 'update_notes') {
              setNotes(cleanNotes(args))
              return { success: true }
            }
            if (name === 'show_site_destination') {
              const next = assistantDestinations[args.destination]
              if (!next) return { success: false, error: 'That destination is not available.' }
              setDestination(next)
              return { success: true, buttonVisible: true, destination: next.href }
            }
            if (name === 'navigate_site') return navigateSite(args.destination)
            if (name === 'offer_email_recap') {
              setEmailOffered(true)
              return { success: true, secureEmailFormVisible: true }
            }
            if (name === 'check_calendar_availability') return checkAvailability()
            if (name === 'wait_for_user') return { success: true, suppressResponse: true }
            return { success: false, error: 'That action is not available.' }
          }

          const result = await run()

          // wait_for_user fires on silence and background noise; logging it would
          // bury the actions that actually mean something.
          if (name !== 'wait_for_user') {
            const meta = actionLabels[name] || { label: name, kind: 'read' }
            logAction({
              label: meta.label,
              kind: meta.kind,
              status: result?.success ? 'ok' : 'error',
              detail: describeResult(name, args, result),
              simulated: name === 'check_calendar_availability' && !result?.success
                && String(result?.error || '').startsWith('Simulated'),
            })
          }

          return result
        },
      })
      setActive(true)
      return true
    } catch {
      setActive(false)
      return false
    } finally {
      setConnecting(false)
    }
  }, [checkAvailability, location.pathname, navigateSite, realtime.connect])

  const end = useCallback(() => {
    realtime.disconnect()
    window.clearInterval(durationRef.current)
    setActive(false)
  }, [realtime.disconnect])

  const sendRecap = useCallback(async ({ email, shareWithGunnar }) => {
    setEmailState({ status: 'sending', message: '' })
    logAction({
      label: 'Send conversation recap',
      kind: 'write',
      status: 'running',
      detail: 'You confirmed in the form; sending now',
    })
    try {
      const response = await fetch('/api/send-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, notes, shareWithGunnar }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'The recap could not be sent.')
      const message = payload.shared
        ? 'Recap sent. Gunnar also received the approved introduction brief.'
        : 'Recap sent. Check your inbox.'
      setEmailState({ status: 'sent', message })
      logAction({ label: 'Send conversation recap', kind: 'write', status: 'ok', detail: 'Recap sent' })
      realtime.sendApplicationEvent(payload.shared
        ? 'The requested recap was sent and the visitor explicitly approved sharing the introduction brief with Gunnar. Acknowledge both briefly without repeating the email address.'
        : 'The requested recap email was sent successfully. Acknowledge it briefly without repeating the email address.')
      return true
    } catch (error) {
      setEmailState({ status: 'error', message: error?.message || 'The recap could not be sent.' })
      logAction({ label: 'Send conversation recap', kind: 'write', status: 'error', detail: 'Could not send' })
      realtime.sendApplicationEvent('The recap email could not be sent. Explain that briefly and offer the Contact page instead.')
      return false
    }
  }, [logAction, notes, realtime.sendApplicationEvent])

  const bookInterview = useCallback(async ({ start, name, email }) => {
    setBookingState({ status: 'booking', message: '', event: null })
    logAction({
      label: 'Book a meeting',
      kind: 'write',
      status: 'running',
      detail: 'You selected a time and confirmed; creating the event',
    })
    try {
      const response = await fetch('/api/book-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, name, email }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'The interview could not be scheduled.')
      setBookingState({ status: 'booked', message: 'Interview scheduled. A calendar invitation is on its way.', event: payload.event })
      logAction({ label: 'Book a meeting', kind: 'write', status: 'ok', detail: payload.event?.label || 'Meeting created' })
      realtime.sendApplicationEvent(`The visitor explicitly confirmed and successfully booked the interview time ${payload.event?.label || start}. Confirm completion briefly.`)
      return true
    } catch (error) {
      const message = error?.message || 'The interview could not be scheduled.'
      setBookingState({ status: 'error', message, event: null })
      logAction({ label: 'Book a meeting', kind: 'write', status: 'error', detail: 'Could not create the event' })
      realtime.sendApplicationEvent('The requested interview could not be booked. Explain that briefly and offer the Contact page instead.')
      return false
    }
  }, [logAction, realtime.sendApplicationEvent])

  useEffect(() => end, [end])

  useEffect(() => {
    if (realtime.status === 'error') setActive(false)
  }, [realtime.status])

  const sendContextEvent = useCallback((description) => {
    return realtime.sendApplicationEvent(description, { respond: false })
  }, [realtime.sendApplicationEvent])

  return {
    active,
    connecting,
    transcript,
    notes,
    destination,
    emailOffered,
    emailState,
    calendarState,
    bookingState,
    duration,
    actions,
    armCalendarFailure,
    error: realtime.error,
    userSpeaking: realtime.userSpeaking,
    assistantSpeaking: realtime.assistantSpeaking,
    connect,
    end,
    sendRecap,
    bookInterview,
    sendApplicationEvent: realtime.sendApplicationEvent,
    sendContextEvent,
  }
}
