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

## Launch checklist

1. Test at least 20 representative questions, including difficult truth-boundary questions.
2. Verify no private platform, employer-only information, invented metric, or unverified deployment is disclosed.
3. Send recaps to multiple email providers and confirm formatting and links.
4. Test calendar conflicts, time zones, stale slots, and duplicate booking attempts.
5. Verify mobile microphone, panel scrolling, form entry, and call termination.
6. Review Realtime usage limits and cost controls.
7. Only then add `VITE_ENABLE_AI_ASSISTANT=true` to Vercel Production and redeploy.
