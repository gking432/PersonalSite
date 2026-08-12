// The assistant belongs in local development and Vercel branch previews while
// unfinished. Production remains off unless it is deliberately enabled there.
const vercelEnvironment = typeof __VERCEL_ENV__ === 'string' ? __VERCEL_ENV__ : ''
export const aiAssistantEnabled = import.meta.env.DEV ||
  vercelEnvironment === 'preview' ||
  import.meta.env.VITE_ENABLE_AI_ASSISTANT === 'true'

// The immersive gateway is staged separately from the assistant so it can be
// previewed without changing the production homepage experience.
export const aiGatewayEnabled = aiAssistantEnabled && (import.meta.env.DEV || import.meta.env.VITE_ENABLE_AI_GATE === 'true')
