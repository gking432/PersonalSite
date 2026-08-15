// The assistant is public. It can still be switched off everywhere by setting
// VITE_ENABLE_AI_ASSISTANT=false, which is the escape hatch if the realtime
// quota runs out or an API key needs rotating.
export const aiAssistantEnabled = import.meta.env.VITE_ENABLE_AI_ASSISTANT !== 'false'

// The immersive gateway is staged separately from the assistant so it can be
// previewed without changing the production homepage experience.
export const aiGatewayEnabled = aiAssistantEnabled && import.meta.env.VITE_ENABLE_AI_GATE === 'true'
