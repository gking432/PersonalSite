import { randomUUID } from 'node:crypto'

const timeZone = process.env.GUNNAR_TIMEZONE || 'America/Chicago'
const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
const slotMinutes = Math.max(15, Math.min(60, Number(process.env.GUNNAR_MEETING_MINUTES || 20)))
const startHour = Math.max(0, Math.min(23, Number(process.env.GUNNAR_AVAILABILITY_START_HOUR || 9)))
const endHour = Math.max(startHour + 1, Math.min(24, Number(process.env.GUNNAR_AVAILABILITY_END_HOUR || 17)))
const minimumNoticeHours = Math.max(1, Number(process.env.GUNNAR_MINIMUM_NOTICE_HOURS || 24))

export function googleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID
    && process.env.GOOGLE_CLIENT_SECRET
    && process.env.GOOGLE_REFRESH_TOKEN
    && process.env.GOOGLE_CALENDAR_ID,
  )
}

async function accessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) throw new Error('Google Calendar authorization failed.')
  return payload.access_token
}

function partsInZone(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  return Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]))
}

function offsetAt(date) {
  const parts = partsInZone(date)
  const representedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return representedAsUtc - date.getTime()
}

function zonedDateTimeToUtc(year, month, day, hour, minute) {
  const target = Date.UTC(year, month - 1, day, hour, minute, 0)
  let guess = new Date(target)
  guess = new Date(target - offsetAt(guess))
  return new Date(target - offsetAt(guess))
}

function candidateSlots(now = new Date()) {
  const today = partsInZone(now)
  const minimumStart = now.getTime() + minimumNoticeHours * 60 * 60 * 1000
  const results = []

  for (let offset = 1; offset <= 21; offset += 1) {
    const calendarDate = new Date(Date.UTC(today.year, today.month - 1, today.day + offset))
    const weekday = calendarDate.getUTCDay()
    if (weekday === 0 || weekday === 6) continue

    const year = calendarDate.getUTCFullYear()
    const month = calendarDate.getUTCMonth() + 1
    const day = calendarDate.getUTCDate()
    for (let minutes = startHour * 60; minutes + slotMinutes <= endHour * 60; minutes += slotMinutes) {
      const start = zonedDateTimeToUtc(year, month, day, Math.floor(minutes / 60), minutes % 60)
      if (start.getTime() < minimumStart) continue
      const end = new Date(start.getTime() + slotMinutes * 60 * 1000)
      results.push({ start, end })
    }
  }
  return results
}

function formatSlot(slot) {
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(slot.start)
  return { start: slot.start.toISOString(), end: slot.end.toISOString(), label, timeZone }
}

async function busyPeriods(token, timeMin, timeMax) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeMin, timeMax, timeZone, items: [{ id: calendarId }] }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error('Google Calendar availability could not be read.')
  return payload.calendars?.[calendarId]?.busy || []
}

function overlapsBusy(slot, busy) {
  return busy.some((period) => slot.start < new Date(period.end) && slot.end > new Date(period.start))
}

export async function getAvailableSlots(limit = 8) {
  if (!googleCalendarConfigured()) throw new Error('Google Calendar is not configured.')
  const candidates = candidateSlots()
  if (!candidates.length) return []
  const token = await accessToken()
  const busy = await busyPeriods(token, candidates[0].start.toISOString(), candidates[candidates.length - 1].end.toISOString())
  return candidates.filter((slot) => !overlapsBusy(slot, busy)).slice(0, limit).map(formatSlot)
}

export async function createInterview({ start, name, email }) {
  if (!googleCalendarConfigured()) throw new Error('Google Calendar is not configured.')
  const available = await getAvailableSlots(40)
  const chosen = available.find((slot) => slot.start === start)
  if (!chosen) throw new Error('That time is no longer available.')

  const token = await accessToken()
  const endpoint = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: `Conversation with ${name} and Gunnar Neuman`,
      description: 'Scheduled through the AI assistant on GunnarNeuman.com.',
      start: { dateTime: chosen.start, timeZone },
      end: { dateTime: chosen.end, timeZone },
      attendees: [{ email, displayName: name }],
      conferenceData: {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    }),
  })
  const event = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error('The calendar event could not be created.')
  return { id: event.id, htmlLink: event.htmlLink, meetLink: event.hangoutLink || null, start: chosen.start, label: chosen.label }
}
