import { ControlState, SyncMessage } from './types'

const PICKER_CHANNEL = 'random-picker-sync'
const CONTROL_STATE_KEY = 'random-picker-control-state'

export function createPickerChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!('BroadcastChannel' in window)) return null
  return new BroadcastChannel(PICKER_CHANNEL)
}

export function broadcastMessage(
  channel: BroadcastChannel | null,
  message: SyncMessage
): void {
  if (!channel) return
  channel.postMessage(message)
}

export function saveControlState(state: ControlState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    CONTROL_STATE_KEY,
    JSON.stringify({
      ...state,
      timestamp: Date.now(),
    })
  )
}

export function loadControlState(): (ControlState & { timestamp: number }) | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(CONTROL_STATE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}
