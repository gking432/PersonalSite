import { useCallback, useEffect, useRef, useState } from 'react'

const initialState = {
  status: 'idle',
  error: '',
  userSpeaking: false,
  assistantSpeaking: false,
}

function parseArguments(value) {
  try { return JSON.parse(value || '{}') } catch { return {} }
}

function microphoneErrorMessage(error) {
  if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
    return 'No microphone was found on this device. Connect or enable a microphone, then try voice again. You can also use text instead.'
  }
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
    return 'Microphone access is blocked. Allow microphone access for this site, then try voice again. You can also use text instead.'
  }
  if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
    return 'The browser found a microphone but could not use it. Check whether another application is using it, then try again. You can also use text instead.'
  }
  if (error?.name === 'AbortError') {
    return 'The microphone could not be started. Check the device connection and try voice again. You can also use text instead.'
  }
  return error?.message || 'The live voice session could not be started.'
}

export default function useRealtimeVoice() {
  const [state, setState] = useState(initialState)
  const peerRef = useRef(null)
  const channelRef = useRef(null)
  const streamRef = useRef(null)
  const audioRef = useRef(null)
  const handlersRef = useRef({})
  const transcriptRef = useRef('')
  const failureRef = useRef('')

  const send = useCallback((event) => {
    const channel = channelRef.current
    if (!channel || channel.readyState !== 'open') return false
    channel.send(JSON.stringify(event))
    return true
  }, [])

  const disconnect = useCallback(() => {
    const channel = channelRef.current
    const peer = peerRef.current
    const stream = streamRef.current
    channelRef.current = null
    peerRef.current = null
    streamRef.current = null
    channel?.close?.()
    peer?.close?.()
    stream?.getTracks?.().forEach((track) => track.stop())
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.srcObject = null
    }
    audioRef.current = null
    transcriptRef.current = ''
    failureRef.current = ''
    setState(initialState)
  }, [])

  const completeToolCall = useCallback(async (item) => {
    let output
    try {
      output = await handlersRef.current.onToolCall?.(item.name, parseArguments(item.arguments))
      if (output === undefined) output = { success: false, error: 'This tool is not available.' }
    } catch {
      output = { success: false, error: 'The interface could not complete that action.' }
    }

    const suppressResponse = output?.suppressResponse === true
    if (output && typeof output === 'object') delete output.suppressResponse

    send({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: item.call_id,
        output: JSON.stringify(output),
      },
    })
    return !suppressResponse
  }, [send])

  const handleServerEvent = useCallback((rawEvent) => {
    let event
    try { event = JSON.parse(rawEvent.data) } catch { return }

    handlersRef.current.onEvent?.(event)

    if (event.type === 'input_audio_buffer.speech_started') {
      setState((current) => ({ ...current, userSpeaking: true, assistantSpeaking: false }))
    }
    if (event.type === 'input_audio_buffer.speech_stopped') {
      setState((current) => ({ ...current, userSpeaking: false }))
    }
    if (event.type === 'response.created') {
      transcriptRef.current = ''
      setState((current) => ({ ...current, assistantSpeaking: true }))
    }
    if (event.type === 'response.output_audio_transcript.delta') {
      transcriptRef.current += event.delta || ''
      handlersRef.current.onAssistantTranscript?.(transcriptRef.current, false)
    }
    if (event.type === 'response.output_audio_transcript.done') {
      transcriptRef.current = event.transcript || transcriptRef.current
      handlersRef.current.onAssistantTranscript?.(transcriptRef.current, true)
    }
    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      handlersRef.current.onUserTranscript?.(event.transcript || '')
    }
    if (event.type === 'response.output_audio.done') {
      setState((current) => ({ ...current, assistantSpeaking: false }))
    }
    if (event.type === 'response.done') {
      const calls = (event.response?.output || []).filter((item) => item.type === 'function_call' && item.call_id)
      if (calls.length) Promise.all(calls.map((item) => completeToolCall(item))).then((shouldRespond) => {
        if (shouldRespond.some(Boolean)) send({ type: 'response.create' })
        else setState((current) => ({ ...current, assistantSpeaking: false }))
      })
      if (!calls.length) setState((current) => ({ ...current, assistantSpeaking: false }))
    }
    if (event.type === 'error') {
      const message = event.error?.message || 'The voice session encountered an error.'
      failureRef.current = message
      setState((current) => ({ ...current, error: message, assistantSpeaking: false }))
      handlersRef.current.onError?.(message)
    }
  }, [completeToolCall, send])

  const connect = useCallback(async (handlers = {}) => {
    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('This browser does not support the required live-audio connection.')
    }

    disconnect()
    handlersRef.current = handlers
    failureRef.current = ''
    setState({ ...initialState, status: 'connecting' })

    try {
      const peer = new RTCPeerConnection()
      const channel = peer.createDataChannel('oai-events')
      const audio = document.createElement('audio')
      audio.autoplay = true
      audio.playsInline = true

      peerRef.current = peer
      channelRef.current = channel
      audioRef.current = audio

      peer.ontrack = (event) => {
        audio.srcObject = event.streams[0]
        audio.play().catch(() => {})
      }
      peer.onconnectionstatechange = () => {
        if (peerRef.current !== peer || !['failed', 'disconnected'].includes(peer.connectionState)) return
        const message = failureRef.current || 'The live connection was interrupted. Tap the assistant bubble to reconnect.'
        failureRef.current = message
        setState((current) => ({ ...current, status: 'error', error: message, assistantSpeaking: false, userSpeaking: false }))
        handlersRef.current.onError?.(message)
      }
      channel.addEventListener('message', handleServerEvent)
      channel.addEventListener('close', () => {
        if (channelRef.current !== channel) return
        const message = failureRef.current || 'The voice connection ended. Tap the assistant bubble to reconnect.'
        failureRef.current = message
        setState((current) => ({ ...current, status: 'error', error: message, assistantSpeaking: false, userSpeaking: false }))
        handlersRef.current.onError?.(message)
      })
      channel.addEventListener('error', () => {
        if (channelRef.current !== channel) return
        const message = failureRef.current || 'The voice connection encountered a problem. Tap the assistant bubble to reconnect.'
        failureRef.current = message
        setState((current) => ({ ...current, status: 'error', error: message, assistantSpeaking: false, userSpeaking: false }))
        handlersRef.current.onError?.(message)
      })

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream
      stream.getTracks().forEach((track) => peer.addTrack(track, stream))

      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)

      const sessionResponse = await fetch('/api/realtime-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offer.sdp,
      })
      if (!sessionResponse.ok) {
        const body = await sessionResponse.json().catch(() => ({}))
        throw new Error(body.error || 'The live voice session could not be started.')
      }

      await peer.setRemoteDescription({ type: 'answer', sdp: await sessionResponse.text() })

      if (channel.readyState !== 'open') {
        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('The live voice connection timed out.')), 12_000)
          channel.addEventListener('open', () => {
            window.clearTimeout(timeout)
            resolve()
          }, { once: true })
        })
      }

      if (handlers.initialContext) {
        send({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: `[Trusted application context] ${String(handlers.initialContext).slice(0, 2400)}` }],
          },
        })
      }

      setState({ ...initialState, status: 'connected', assistantSpeaking: true })
      send({
        type: 'response.create',
        response: {
          output_modalities: ['audio'],
          instructions: handlers.openingInstructions || 'Begin now with the exact opening greeting in your session instructions. Do not identify yourself as ChatGPT or OpenAI. Say nothing else after the greeting and wait for the visitor.',
        },
      })
    } catch (error) {
      const message = microphoneErrorMessage(error)
      failureRef.current = message
      channelRef.current?.close?.()
      peerRef.current?.close?.()
      streamRef.current?.getTracks?.().forEach((track) => track.stop())
      setState({ ...initialState, status: 'error', error: message })
      throw new Error(message)
    }
  }, [disconnect, handleServerEvent, send])

  const sendApplicationEvent = useCallback((description, { respond = true } = {}) => {
    const created = send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: `[Application event] ${description}` }],
      },
    })
    if (created && respond) send({ type: 'response.create' })
    return created
  }, [send])

  useEffect(() => disconnect, [disconnect])

  return {
    ...state,
    connect,
    disconnect,
    sendApplicationEvent,
  }
}
