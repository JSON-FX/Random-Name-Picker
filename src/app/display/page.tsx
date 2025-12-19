'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { usePickerSync } from '@/hooks/usePickerSync'
import DisplayPicker from '@/components/DisplayPicker'
import { ControlState, SyncMessage, Name, Prize } from '@/lib/types'
import { loadControlState } from '@/lib/sync'

export default function DisplayPage() {
  const { selectName, getCategoryById } = useApp()

  // Synced state from control screen
  const [controlState, setControlState] = useState<ControlState | null>(null)
  const [shouldStartPick, setShouldStartPick] = useState(false)
  const [predeterminedWinner, setPredeterminedWinner] = useState<Name | null>(
    null
  )

  const handleMessage = useCallback((message: SyncMessage) => {
    switch (message.type) {
      case 'CONTROL_STATE':
      case 'CONTROL_READY':
        setControlState(message.payload as ControlState)
        // Reset pick state when control state changes
        setShouldStartPick(false)
        break
      case 'START_PICK': {
        const payload = message.payload as {
          timestamp: number
          predeterminedWinner: Name | null
        }
        setPredeterminedWinner(payload.predeterminedWinner)
        setShouldStartPick(true)
        break
      }
      case 'SET_PREDETERMINED_WINNER': {
        const payload = message.payload as { winner: Name }
        setPredeterminedWinner(payload.winner)
        break
      }
    }
  }, [])

  const { announceDisplayReady, sendPickComplete, isConnected } = usePickerSync(
    {
      role: 'display',
      onMessage: handleMessage,
    }
  )

  // On mount, load initial state and announce ready
  useEffect(() => {
    const savedState = loadControlState()
    if (savedState) {
      setControlState(savedState)
    }
    announceDisplayReady()
  }, [announceDisplayReady])

  // Reset pick trigger after processing
  useEffect(() => {
    if (shouldStartPick) {
      // Reset after a short delay to allow the DisplayPicker to catch it
      const timer = setTimeout(() => {
        setShouldStartPick(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [shouldStartPick])

  const handlePickComplete = useCallback(
    (winner: Name) => {
      const prize = controlState?.selectedPrize || undefined
      // Persist the selection with prize
      selectName(winner.id, prize)
      // Notify control screen
      const remainingCount = (controlState?.names.length || 1) - 1
      sendPickComplete(winner, remainingCount, prize)
      // Clear predetermined winner
      setPredeterminedWinner(null)
    },
    [selectName, sendPickComplete, controlState?.names.length, controlState?.selectedPrize]
  )

  // Derive display data
  const displayNames = controlState?.names || []
  const selectedCategory = controlState?.category
  const isAllCategories = controlState?.isAllCategories || false
  const duration = controlState?.duration || 3000
  const selectedPrize = controlState?.selectedPrize || null

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-6">📡</div>
        <p className="text-gray-400 text-2xl">Connecting...</p>
        <p className="text-gray-300 text-sm mt-2">
          BroadcastChannel not supported in this browser
        </p>
      </div>
    )
  }

  if (!controlState) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-6">⏳</div>
        <p className="text-gray-400 text-2xl">Waiting for control screen...</p>
        <p className="text-gray-300 text-sm mt-2">
          Open the control page (/) in another window
        </p>
      </div>
    )
  }

  return (
    <DisplayPicker
      names={displayNames}
      category={selectedCategory}
      duration={duration}
      isAllCategories={isAllCategories}
      getCategoryById={getCategoryById}
      startPick={shouldStartPick}
      predeterminedWinner={predeterminedWinner}
      selectedPrize={selectedPrize}
      onPickComplete={handlePickComplete}
    />
  )
}
