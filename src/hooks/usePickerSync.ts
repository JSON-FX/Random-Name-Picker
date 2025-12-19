'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  createPickerChannel,
  broadcastMessage,
  saveControlState,
  loadControlState,
} from '@/lib/sync'
import {
  ControlState,
  SyncMessage,
  SyncMessageType,
  Name,
  AnimationState,
  Prize,
} from '@/lib/types'

interface UsePickerSyncOptions {
  role: 'control' | 'display'
  onMessage?: (message: SyncMessage) => void
}

export function usePickerSync({ role, onMessage }: UsePickerSyncOptions) {
  const channelRef = useRef<BroadcastChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [displayReady, setDisplayReady] = useState(false)
  const onMessageRef = useRef(onMessage)

  // Keep onMessage ref updated
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    channelRef.current = createPickerChannel()
    setIsConnected(channelRef.current !== null)

    if (channelRef.current) {
      channelRef.current.onmessage = (event) => {
        const message = event.data as SyncMessage

        // Track display readiness on control screen
        if (role === 'control' && message.type === 'DISPLAY_READY') {
          setDisplayReady(true)
        }

        onMessageRef.current?.(message)
      }
    }

    return () => {
      channelRef.current?.close()
    }
  }, [role])

  const sendMessage = useCallback(
    (type: SyncMessageType, payload: unknown) => {
      const message: SyncMessage = { type, payload, timestamp: Date.now() }
      broadcastMessage(channelRef.current, message)
    },
    []
  )

  const sendControlState = useCallback(
    (state: ControlState) => {
      saveControlState(state) // Persist for display screen that opens later
      sendMessage('CONTROL_STATE', state)
    },
    [sendMessage]
  )

  const triggerPick = useCallback(
    (predeterminedWinner?: Name) => {
      sendMessage('START_PICK', {
        timestamp: Date.now(),
        predeterminedWinner: predeterminedWinner || null,
      })
    },
    [sendMessage]
  )

  const sendAnimationUpdate = useCallback(
    (animState: AnimationState) => {
      sendMessage('ANIMATION_UPDATE', animState)
    },
    [sendMessage]
  )

  const sendPickComplete = useCallback(
    (winner: Name, remainingCount: number, prize?: Prize) => {
      sendMessage('PICK_COMPLETE', { winner, remainingCount, prize })
    },
    [sendMessage]
  )

  const sendPredeterminedWinner = useCallback(
    (winner: Name) => {
      sendMessage('SET_PREDETERMINED_WINNER', { winner })
    },
    [sendMessage]
  )

  const announceDisplayReady = useCallback(() => {
    sendMessage('DISPLAY_READY', { timestamp: Date.now() })
  }, [sendMessage])

  const announceControlReady = useCallback(
    (state: ControlState) => {
      sendControlState(state)
      sendMessage('CONTROL_READY', state)
    },
    [sendControlState, sendMessage]
  )

  return {
    isConnected,
    displayReady,
    sendControlState,
    triggerPick,
    sendAnimationUpdate,
    sendPickComplete,
    sendPredeterminedWinner,
    announceDisplayReady,
    announceControlReady,
    loadControlState,
  }
}
