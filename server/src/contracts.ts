import { z } from 'zod'

export const noteStateSchema = z.object({
  goal: z.string().max(500).default('Waiting for the conversation'),
  interests: z.array(z.string().max(160)).max(12).default([]),
  workflow: z.string().max(500).default('Not started'),
  selection: z.string().max(500).default('None yet'),
  nextStep: z.string().max(500).default('Choose a direction'),
})

export const browserEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('browser.ready') }),
  z.object({ type: z.literal('browser.state'), state: z.record(z.string(), z.unknown()) }),
  z.object({ type: z.literal('selection.changed'), productId: z.string().nullable(), fabricId: z.string().nullable() }),
])

export const serverEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('session.created'), sessionId: z.string(), code: z.string() }),
  z.object({ type: z.literal('call.connected'), callId: z.string(), method: z.enum(['browser', 'phone']) }),
  z.object({ type: z.literal('notes.updated'), notes: noteStateSchema }),
  z.object({ type: z.literal('browser.command'), command: z.enum(['open_catalog', 'open_page', 'highlight_product', 'show_fabrics', 'show_mockup', 'show_recap']), payload: z.record(z.string(), z.unknown()).default({}) }),
  z.object({ type: z.literal('session.error'), message: z.string() }),
])

export type NoteState = z.infer<typeof noteStateSchema>
export type BrowserEvent = z.infer<typeof browserEventSchema>
export type ServerEvent = z.infer<typeof serverEventSchema>

export const assistantTools = [
  'pair_browser_session',
  'search_profile',
  'open_catalog',
  'open_catalog_page',
  'highlight_product',
  'read_browser_state',
  'recommend_fabrics',
  'generate_product_mockup',
  'update_call_notes',
  'prepare_recap',
  'send_recap_email',
  'get_available_times',
  'book_meeting',
] as const
