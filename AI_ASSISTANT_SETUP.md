# AI Assistant deployment and integration setup

The assistant is feature-gated. Production is off by default; local development is on, and Vercel Preview is enabled with `VITE_ENABLE_AI_ASSISTANT=true`.

## Current public/preview split

- Production: ordinary portfolio only. No assistant navigation, assistant route, catalog, or floating launcher.
- Preview: simplified voice assistant, structured notes, email-recap interface, and calendar-booking interface.
- The old catalog and product-mockup flow is no longer routed or presented.

## Existing OpenAI configuration

- `OPENAI_API_KEY`
- Optional: `OPENAI_REALTIME_MODEL` (defaults to `gpt-realtime-2.1`)
- Optional: `OPENAI_REALTIME_VOICE` (defaults to `marin`)
- Optional: `OPENAI_LAB_MODEL` (controls the structured AI Lab workflows)

The API project must have a positive credit balance. The UI keeps its complete sample results available when custom OpenAI requests cannot run.

## AI Lab workflows

The preview Lab contains three end-to-end demonstrations:

- Customer Issue Handler: accepts browser input now and exposes Twilio voice/SMS channels when configured. It classifies, routes, checks escalation, creates an internal case, and drafts a response for human approval.
- Automated Reputation Report: accepts a business name, website, or Google Business Profile link, researches public sources, creates the report, and sends one demonstration email. It never creates a recurring subscription.
- Role Match Brief: accepts a job link, company website, or pasted description, researches the public context, maps verified evidence, supports email delivery, and uses the real calendar handoff below.

Custom reputation and URL-based role runs use OpenAI web search. Public sources are shown in the result rather than hidden behind a generic summary.

## Email recap with Resend

Add these Vercel Preview variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` - verified sender, for example `Gunnar's AI Assistant <assistant@gunnarneuman.com>`
- Optional: `GUNNAR_PUBLIC_EMAIL` - reply-to address; defaults to the public Gmail address on the site

The server sends only structured notes, not an audio recording or full transcript. Anonymous notes remain in the visitor's browser session. The recap form includes an unchecked, explicit-consent option to share the visitor's recap and email with Gunnar; when selected, Gunnar receives a separate introduction brief. It rate-limits recap delivery by a privacy-preserving client hash.

## Google Calendar availability and booking

Create a Google Cloud OAuth client, enable the Google Calendar API, and authorize only the calendar account that should receive interviews. Store the resulting refresh token server-side.

Add these Vercel Preview variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID` - use the specific calendar ID, not a public URL
- Optional: `GUNNAR_TIMEZONE` (defaults to `America/Chicago`)
- Optional: `GUNNAR_MEETING_MINUTES` (defaults to `20`)
- Optional: `GUNNAR_AVAILABILITY_START_HOUR` (defaults to `9`)
- Optional: `GUNNAR_AVAILABILITY_END_HOUR` (defaults to `17`)
- Optional: `GUNNAR_MINIMUM_NOTICE_HOURS` (defaults to `24`)

The server checks free/busy data, returns real weekday slots, rechecks availability immediately before booking, creates the event only after explicit form confirmation, invites the visitor, and requests a Google Meet link.

## Twilio voice and SMS intake

Add these Vercel Preview variables:

- `TWILIO_PHONE_NUMBER` - the public number shown in the Lab
- `TWILIO_AUTH_TOKEN` - used server-side to verify every Twilio webhook signature
- Optional: `TWILIO_WEBHOOK_BASE_URL` - the exact deployed origin, without a trailing slash; useful when a proxy causes signature URL mismatches

Configure the Twilio number with:

- Incoming message webhook: `https://YOUR-PREVIEW-ORIGIN/api/twilio-sms` using `POST`
- Incoming voice webhook: `https://YOUR-PREVIEW-ORIGIN/api/twilio-voice` using `POST`

Voice gathers one spoken customer issue and routes it through the same structured case workflow as browser and SMS input. SMS returns a concise case/routing acknowledgement. The endpoints reject unsigned requests, impose channel-specific rate limits, and never promise an unverified refund or resolution.

## Launch checklist

1. Test at least 20 representative questions, including difficult truth-boundary questions.
2. Verify no private platform, employer-only information, invented metric, or unverified deployment is disclosed.
3. Send recaps to multiple email providers and confirm formatting and links.
4. Test calendar conflicts, time zones, stale slots, and duplicate booking attempts.
5. Verify mobile microphone, panel scrolling, form entry, and call termination.
6. Review Realtime usage limits and cost controls.
7. Only then add `VITE_ENABLE_AI_ASSISTANT=true` to Vercel Production and redeploy.
8. Keep all Lab, email, calendar, and Twilio variables Preview-only until the demonstrations have been tested with real credentials.
