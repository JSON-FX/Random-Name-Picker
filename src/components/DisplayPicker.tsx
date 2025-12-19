'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Name, Category, Prize } from '@/lib/types'

interface DisplayPickerProps {
  names: Name[]
  category: Category | undefined
  duration: number
  isAllCategories: boolean
  getCategoryById: (id: string) => Category | undefined
  startPick: boolean
  predeterminedWinner: Name | null
  selectedPrize: Prize | null
  onPickComplete: (winner: Name) => void
}

export default function DisplayPicker({
  names,
  category,
  duration,
  isAllCategories,
  getCategoryById,
  startPick,
  predeterminedWinner,
  selectedPrize,
  onPickComplete,
}: DisplayPickerProps) {
  const [displayName, setDisplayName] = useState('')
  const [finalName, setFinalName] = useState<Name | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const predeterminedRef = useRef<Name | null>(null)

  // Update predetermined winner ref when it changes
  useEffect(() => {
    predeterminedRef.current = predeterminedWinner
  }, [predeterminedWinner])

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Run animation when startPick becomes true
  useEffect(() => {
    if (startPick && names.length > 0 && !isRunning) {
      cleanup()
      setIsRunning(true)
      setFinalName(null)

      const shuffledNames = [...names].sort(() => Math.random() - 0.5)
      let currentIndex = 0
      const startTime = Date.now()

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        currentIndex = (currentIndex + 1) % shuffledNames.length
        setDisplayName(shuffledNames[currentIndex].name)

        if (elapsed >= duration) {
          cleanup()
          // Use predetermined winner if set, otherwise random
          const winner =
            predeterminedRef.current ||
            shuffledNames[Math.floor(Math.random() * shuffledNames.length)]
          setDisplayName(winner.name)
          setFinalName(winner)
          setIsRunning(false)
          onPickComplete(winner)
          predeterminedRef.current = null
        }
      }, 50)

      // Backup timeout in case interval misses
      timeoutRef.current = setTimeout(() => {
        cleanup()
        if (names.length > 0 && isRunning) {
          const winner =
            predeterminedRef.current ||
            names[Math.floor(Math.random() * names.length)]
          setDisplayName(winner.name)
          setFinalName(winner)
          setIsRunning(false)
          onPickComplete(winner)
          predeterminedRef.current = null
        }
      }, duration + 100)
    }
  }, [startPick, names, duration, isRunning, cleanup, onPickComplete])

  const winnerCategory =
    finalName && getCategoryById ? getCategoryById(finalName.categoryId) : null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      {/* Display mode indicator */}
      <div className="absolute top-4 left-4 text-gray-400 text-sm flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span>Display Mode</span>
      </div>

      {/* Names remaining */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
        {names.length} name{names.length !== 1 ? 's' : ''} remaining
        {isAllCategories && ' (all categories)'}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-8">
        {names.length === 0 ? (
          <div className="text-center">
            <div className="text-8xl mb-6">🎲</div>
            <p className="text-gray-400 text-2xl">No names available</p>
          </div>
        ) : (
          <>
            {/* Prize Banner */}
            {selectedPrize && !isRunning && !finalName && (
              <div className="mb-8 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <span className="text-white font-bold text-xl">
                  🎁 {selectedPrize.name} ({selectedPrize.quantity} remaining) 🎁
                </span>
              </div>
            )}

            {/* All Categories Mode Banner */}
            {isAllCategories && !selectedPrize && !isRunning && !finalName && (
              <div className="mb-8 px-8 py-3 bg-blue-500 rounded-full">
                <span className="text-white font-bold text-xl">
                  🏆 ALL CATEGORIES MODE 🏆
                </span>
              </div>
            )}

            {/* Name Display */}
            <div className="text-center mb-12">
              {displayName ? (
                <>
                  <h1
                    className={`font-bold transition-all ${
                      finalName
                        ? 'text-8xl sm:text-9xl md:text-[12rem] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600'
                        : 'text-7xl sm:text-8xl md:text-9xl text-gray-800'
                    }`}
                  >
                    {displayName}
                  </h1>
                  {finalName && selectedPrize && (
                    <div className="mt-6 flex items-center justify-center">
                      <span className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-xl">
                        🎁 {selectedPrize.name}
                      </span>
                    </div>
                  )}
                  {finalName && (
                    <div className="mt-8 text-5xl">🎉 Winner! 🎉</div>
                  )}
                </>
              ) : (
                <p className="text-4xl text-gray-300">
                  Waiting for control screen...
                </p>
              )}
            </div>

            {/* Status indicator instead of button */}
            <div
              className={`px-20 py-6 text-3xl font-bold rounded-full ${
                isRunning
                  ? 'bg-blue-400 text-white'
                  : finalName
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isRunning ? (
                <span className="flex items-center gap-4">
                  <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Picking...
                </span>
              ) : finalName ? (
                'Winner Selected!'
              ) : (
                'Ready'
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
