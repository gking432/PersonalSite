import { clientKey, consumeRateLimit, escapeHtml, originAllowed } from '../src/server/requestSecurity.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const allowedTypes = new Set(['complaint', 'reputation', 'role'])
const clean = (value, max = 1200) => String(value || '').trim().slice(0, max)
const cleanList = (value, max = 6) => Array.isArray(value) ? value.slice(0, max).map((item) => clean(item, 600)).filter(Boolean) : []

function safeUrl(value) {
  try { const url = new URL(String(value)); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '' } catch { return '' }
}

function bullets(items) {
  if (!items.length) return ''
  return `<ul style="margin:10px 0 0;padding-left:20px">${items.map((item) => `<li style="margin:7px 0">${escapeHtml(item)}</li>`).join('')}</ul>`
}

function section(title, body) {
  if (!body) return ''
  return `<h2 style="font-size:15px;margin:26px 0 8px;color:#173e31">${escapeHtml(title)}</h2>${body}`
}

function complaintEmail(result) {
  const similarCases = Array.isArray(result.similarCases) ? result.similarCases.slice(0, 3).map((item) => `${clean(item.type, 120)} — Prior solution: ${clean(item.solution, 500)} Outcome: ${clean(item.outcome, 400)}`) : []
  return {
    subject: `Customer issue demo · ${clean(result.caseId, 40) || 'AI triage'}`,
    title: 'Inbound customer issue report',
    intro: clean(result.summary),
    body: [
      section('Initial request', `<div style="padding:16px;background:#f4f1ea;border-left:3px solid #a8823c">${escapeHtml(clean(result.originalRequest, 2400))}</div>`),
      section('Routing decision', `<p><strong>Urgency:</strong> ${escapeHtml(clean(result.urgency, 40))}<br><strong>Category:</strong> ${escapeHtml(clean(result.category, 120))}<br><strong>Owner:</strong> ${escapeHtml(clean(result.department, 160))}<br><strong>Why:</strong> ${escapeHtml(clean(result.routeReason, 900))}</p>`),
      section('Similar demonstration cases', bullets(similarCases)),
      section('Recommended action', `<p>${escapeHtml(clean(result.recommendedAction))}</p>`),
      section('Next steps', bullets(cleanList(result.nextSteps, 5))),
      section('Known facts', bullets(cleanList(result.facts))),
      section('Missing information', bullets(cleanList(result.missingInformation))),
      section('Internal note', `<p>${escapeHtml(clean(result.internalNote))}</p>`),
      section('Draft customer response', `<div style="padding:16px;background:#f4f1ea;border-left:3px solid #a8823c">${escapeHtml(clean(result.draftResponse, 2400))}</div>`),
      `<p style="margin-top:20px;color:#7d776c;font-size:12px">Similar cases shown above come from a fictional support-case library created for this demonstration.</p>`
    ].join('')
  }
}

function reputationEmail(result, schedule) {
  const themes = Array.isArray(result.themes) ? result.themes.slice(0, 6).map((item) => `${clean(item.theme, 120)} — ${clean(item.evidence, 500)}`) : []
  const actions = Array.isArray(result.recommendations) ? result.recommendations.slice(0, 6).map((item) => `${clean(item.action, 220)} (${clean(item.owner, 100)} · ${clean(item.timing, 80)})`) : []
  const sources = Array.isArray(result.sources) ? result.sources.slice(0, 8).map((item) => {
    const url = safeUrl(item.url)
    return url ? `<li style="margin:7px 0"><a href="${escapeHtml(url)}" style="color:#173e31">${escapeHtml(clean(item.title, 180) || url)}</a> — ${escapeHtml(clean(item.finding, 400))}</li>` : ''
  }).join('') : ''
  return {
    subject: `Reputation report demo · ${clean(result.businessName, 120) || 'Business report'}`,
    title: `${clean(result.businessName, 160) || 'Business'} reputation report`,
    intro: clean(result.executiveSummary),
    body: [
      `<div style="margin:18px 0;padding:14px;background:#e8efe9;color:#244b39"><strong>Demonstration schedule:</strong> ${escapeHtml(clean(schedule, 180) || clean(result.reportSchedule, 180))}<br><span style="font-size:12px">This is a one-time demo. No recurring report was activated.</span></div>`,
      section('Recurring themes', bullets(themes)),
      section('Recommended actions', bullets(actions)),
      section('Best next move', `<p>${escapeHtml(clean(result.nextMove))}</p>`),
      sources ? section('Public sources checked', `<ul style="margin:10px 0 0;padding-left:20px">${sources}</ul>`) : '',
      `<p style="margin-top:24px;color:#7d776c;font-size:12px">${escapeHtml(clean(result.evidenceNote, 1200))}</p>`
    ].join('')
  }
}

function roleEmail(result) {
  const matches = Array.isArray(result.strongestMatches) ? result.strongestMatches.slice(0, 5).map((item) => `${clean(item.title, 140)} — ${clean(item.evidence, 500)}`) : []
  const questions = cleanList(result.interviewQuestions, 5)
  const projects = Array.isArray(result.relevantProjects) ? result.relevantProjects.slice(0, 3).map((item) => {
    const url = safeUrl(item.href)
    return url ? `<li style="margin:7px 0"><a href="${escapeHtml(url)}" style="color:#173e31">${escapeHtml(clean(item.name, 120))}</a> — ${escapeHtml(clean(item.reason, 500))}</li>` : ''
  }).join('') : ''
  return {
    subject: `Role match brief · ${clean(result.role, 150) || 'Gunnar Neuman'}`,
    title: clean(result.role, 180) || 'Role match brief',
    intro: clean(result.interviewCase),
    body: [
      section('Strongest verified matches', bullets(matches)),
      projects ? section('Best proof to inspect', `<ul style="margin:10px 0 0;padding-left:20px">${projects}</ul>`) : '',
      section('Questions worth asking', bullets(questions)),
      `<p style="margin-top:24px"><a href="https://www.gunnarneuman.com/projects" style="color:#173e31">Projects</a> · <a href="https://www.gunnarneuman.com/Gunnar-Neuman-Resume.pdf" style="color:#173e31">Résumé</a> · <a href="https://www.gunnarneuman.com/contact" style="color:#173e31">Contact</a></p>`,
      `<p style="margin-top:24px;color:#7d776c;font-size:12px">${escapeHtml(clean(result.truthBoundary, 1200))}</p>`
    ].join('')
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return response.status(405).json({ error: 'Method not allowed.' }) }
  if (!originAllowed(request)) return response.status(403).json({ error: 'Origin not allowed.' })
  if (!consumeRateLimit('lab-email', clientKey(request), 5, 60 * 60 * 1000)) return response.status(429).json({ error: 'Too many report emails. Please try again later.' })
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return response.status(503).json({ error: 'Email delivery is built but still needs the email service connected in Vercel.' })

  const type = clean(request.body?.type, 30)
  const email = clean(request.body?.email, 254).toLowerCase()
  const result = request.body?.result
  const schedule = clean(request.body?.schedule, 180)
  if (!allowedTypes.has(type) || !emailPattern.test(email) || !result || typeof result !== 'object') return response.status(400).json({ error: 'A valid report and email address are required.' })
  if (JSON.stringify(result).length > 60000) return response.status(413).json({ error: 'That report is too large to email.' })

  const content = type === 'complaint' ? complaintEmail(result) : type === 'reputation' ? reputationEmail(result, schedule) : roleEmail(result)
  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:680px;margin:0 auto;padding:34px;color:#262b27;line-height:1.6"><p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#587568">Gunnar Neuman · AI Lab</p><h1 style="font-family:Georgia,serif;font-size:34px;line-height:1.08;font-weight:400;margin:10px 0 18px">${escapeHtml(content.title)}</h1><p>${escapeHtml(content.intro)}</p>${content.body}<p style="margin-top:30px;padding-top:18px;border-top:1px solid #e4ddcd;color:#7d776c;font-size:11px">Generated as a one-time AI Lab demonstration. Automated systems should be validated against the underlying source information and keep appropriate human approval.</p></div>`

  try {
    const resend = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [email], reply_to: process.env.GUNNAR_PUBLIC_EMAIL || 'gunnarneuman14@gmail.com', subject: content.subject, html }) })
    const payload = await resend.json().catch(() => ({}))
    if (!resend.ok) { console.error('Lab email rejected', type, resend.status, payload?.message || ''); return response.status(502).json({ error: 'The report was created, but the email could not be delivered.' }) }
    return response.status(200).json({ success: true, message: 'One-time demo report sent. No recurring schedule was created.' })
  } catch (error) {
    console.error('Lab email error', type, error)
    return response.status(500).json({ error: 'The report was created, but the email could not be delivered.' })
  }
}
