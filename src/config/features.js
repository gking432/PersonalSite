// Public production stays conservative by default. Local development is on so
// the assistant can be built and tested without exposing unfinished work.
export const aiAssistantEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_AI_ASSISTANT === 'true'

// The immersive gateway is staged separately from the assistant so it can be
// previewed without changing the production homepage experience.
export const aiGatewayEnabled = aiAssistantEnabled && (import.meta.env.DEV || import.meta.env.VITE_ENABLE_AI_GATE === 'true')
