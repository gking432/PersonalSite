import { clientKey, consumeRateLimit, escapeHtml, originAllowed } from '../src/server/requestSecurity.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanList(value) {
  return Array.isArray(value) ? value.slice(0, 4).map((item) => String(item).slice(0, 180)) : []
}

function listMarkup(title, items) {
  if (!items.length) return ''
  return `<h2 style="font-size:16px;margin:24px 0 8px;color:#173e31">${escapeHtml(title)}</h2><ul style="margin:0;padding-left:20px">${items.map((item) => `<li style="margin:6px 0">${escapeHtml(item)}</li>`).join('')}</ul>`
}

async function sendEmail(payload) {
  const resend = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await resend.json().catch(() => ({}))
  return { ok: resend.ok, status: resend.status, result }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }
  if (!originAllowed(request)) return response.status(403).json({ error: 'Origin not allowed.' })
  if (!consumeRateLimit('recap', clientKey(request), 4, 60 * 60 * 1000)) return response.status(429).json({ error: 'Too many recap requests. Please try again later.' })
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return response.status(503).json({ error: 'Email delivery is not configured yet.' })

  const email = String(request.body?.email || '').trim().toLowerCase()
  if (!emailPattern.test(email) || email.length > 254) return response.status(400).json({ error: 'Enter a valid email address.' })

  const notes = request.body?.notes || {}
  const shareWithGunnar = request.body?.shareWithGunnar === true
  const visitorName = String(notes.visitorName || '').slice(0, 120)
  const organization = String(notes.organization || '').slice(0, 160)
  const visitorRole = String(notes.visitorRole || '').slice(0, 160)
  const reasonForVisit = String(notes.reasonForVisit || '').slice(0, 300)
  const hiringContext = String(notes.hiringContext || '').slice(0, 500)
  const goal = String(notes.goal || 'Exploring Gunnar Neuman’s background and work').slice(0, 240)
  const questions = cleanList(notes.questions)
  const interests = cleanList(notes.interests)
  const relevantProof = cleanList(notes.relevantProof)
  const nextStep = String(notes.nextStep || 'Continue the conversation with Gunnar directly.').slice(0, 240)

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:32px;color:#26231f;line-height:1.6">
      <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#587568">Gunnar Neuman · AI Assistant</p>
      <h1 style="font-family:Georgia,serif;font-size:34px;line-height:1.05;font-weight:400;margin:12px 0 20px">Your conversation recap</h1>
      ${(visitorName || organization || visitorRole) ? `<p><strong>Conversation with:</strong> ${escapeHtml([visitorName, visitorRole, organization].filter(Boolean).join(' · '))}</p>` : ''}
      ${reasonForVisit ? `<p><strong>Reason for visiting:</strong> ${escapeHtml(reasonForVisit)}</p>` : ''}
      ${hiringContext ? `<p><strong>Opportunity context:</strong> ${escapeHtml(hiringContext)}</p>` : ''}
      <p><strong>Visitor goal:</strong> ${escapeHtml(goal)}</p>
      ${listMarkup('Questions discussed', questions)}
      ${listMarkup('Interests', interests)}
      ${listMarkup('Relevant experience and projects', relevantProof)}
      <h2 style="font-size:16px;margin:24px 0 8px;color:#173e31">Suggested next step</h2>
      <p>${escapeHtml(nextStep)}</p>
      <p style="margin-top:28px"><a href="https://www.gunnarneuman.com/projects" style="color:#173e31">View Gunnar's projects</a> · <a href="https://www.gunnarneuman.com/Gunnar-Neuman-Resume.pdf" style="color:#173e31">Open résumé</a> · <a href="https://www.gunnarneuman.com/contact" style="color:#173e31">Contact Gunnar</a></p>
      <p style="margin-top:30px;padding-top:18px;border-top:1px solid #e4ddcd;color:#7d776c;font-size:12px">These notes were generated from your conversation and may be incomplete. Reply directly if you would like to clarify anything with Gunnar.</p>
    </div>`

  try {
    const publicEmail = process.env.GUNNAR_PUBLIC_EMAIL || 'gunnarneuman14@gmail.com'
    const visitorDelivery = await sendEmail({
      from: process.env.RESEND_FROM_EMAIL,
      to: [email],
      reply_to: publicEmail,
      subject: 'Your conversation with Gunnar’s AI assistant',
      html,
    })
    if (!visitorDelivery.ok) {
      console.error('Recap email rejected', visitorDelivery.status, visitorDelivery.result?.message || '')
      return response.status(502).json({ error: 'The recap could not be sent.' })
    }

    let shared = false
    if (shareWithGunnar) {
      const leadHtml = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:32px;color:#26231f;line-height:1.6">
          <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#587568">AI assistant introduction brief</p>
          <h1 style="font-family:Georgia,serif;font-size:32px;line-height:1.1;font-weight:400;margin:12px 0 20px">A visitor approved sharing their conversation recap</h1>
          <p><strong>Name:</strong> ${escapeHtml(visitorName || 'Not provided')}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Organization:</strong> ${escapeHtml(organization || 'Not provided')}</p>
          <p><strong>Role:</strong> ${escapeHtml(visitorRole || 'Not provided')}</p>
          ${reasonForVisit ? `<p><strong>Reason for visiting:</strong> ${escapeHtml(reasonForVisit)}</p>` : ''}
          ${hiringContext ? `<p><strong>Opportunity context:</strong> ${escapeHtml(hiringContext)}</p>` : ''}
          <p><strong>Goal:</strong> ${escapeHtml(goal)}</p>
          ${listMarkup('Questions discussed', questions)}
          ${listMarkup('Interests', interests)}
          ${listMarkup('Relevant proof discussed', relevantProof)}
          <h2 style="font-size:16px;margin:24px 0 8px;color:#173e31">Likely next step</h2>
          <p>${escapeHtml(nextStep)}</p>
          <p style="margin-top:30px;padding-top:18px;border-top:1px solid #e4ddcd;color:#7d776c;font-size:12px">The visitor explicitly selected the option to share this recap and email address with Gunnar. This is a structured summary, not a full transcript.</p>
        </div>`
      const leadDelivery = await sendEmail({
        from: process.env.RESEND_FROM_EMAIL,
        to: [publicEmail],
        reply_to: email,
        subject: `AI assistant introduction: ${visitorName || organization || email}`,
        html: leadHtml,
      })
      shared = leadDelivery.ok
      if (!leadDelivery.ok) console.error('Introduction brief rejected', leadDelivery.status, leadDelivery.result?.message || '')
    }

    return response.status(200).json({ success: true, shared })
  } catch (error) {
    console.error('Recap email error', error)
    return response.status(500).json({ error: 'The recap could not be sent.' })
  }
}
