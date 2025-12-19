'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Name, Category } from '@/lib/types'
import { findHotkeyWinner } from '@/lib/hotkeys'

interface FullscreenPickerProps {
  names: Name[]
  category: Category | undefined
  duration: number
  onSelect: (id: string) => void
  isAllCategories?: boolean
  getCategoryById?: (id: string) => Category | undefined
  onExit: () => void
}

export default function FullscreenPicker({
  names,
  category,
  duration,
  onSelect,
  isAllCategories = false,
  getCategoryById,
  onExit,
}: FullscreenPickerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [finalName, setFinalName] = useState<Name | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const predeterminedWinnerRef = useRef<Name | null>(null)

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

  // Handle hotkey presses during picking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept Escape key
      if (e.key === 'Escape') return

      // Only respond during the picking animation
      if (!isRunning) return

      const winner = findHotkeyWinner(
        e.key,
        names,
        category?.id || null,
        getCategoryById
      )

      if (winner) {
        predeterminedWinnerRef.current = winner
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, names, category, getCategoryById])

  const startPicking = useCallback(() => {
    if (names.length === 0) return

    cleanup()
    setIsRunning(true)
    setFinalName(null)
    predeterminedWinnerRef.current = null
    startTimeRef.current = Date.now()

    let currentIndex = 0
    const shuffledNames = [...names].sort(() => Math.random() - 0.5)

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current

      currentIndex = (currentIndex + 1) % shuffledNames.length
      setDisplayName(shuffledNames[currentIndex].name)

      if (elapsed >= duration) {
        cleanup()
        // Use predetermined winner if set, otherwise random
        const winner = predeterminedWinnerRef.current || shuffledNames[Math.floor(Math.random() * shuffledNames.length)]
        setDisplayName(winner.name)
        setFinalName(winner)
        setIsRunning(false)
        onSelect(winner.id)
        predeterminedWinnerRef.current = null
      }
    }, 50)

    timeoutRef.current = setTimeout(() => {
      cleanup()
      if (names.length > 0) {
        // Use predetermined winner if set, otherwise random
        const winner = predeterminedWinnerRef.current || names[Math.floor(Math.random() * names.length)]
        setDisplayName(winner.name)
        setFinalName(winner)
        setIsRunning(false)
        onSelect(winner.id)
        predeterminedWinnerRef.current = null
      }
    }, duration + 100)
  }, [names, duration, onSelect, cleanup])

  const handleClick = () => {
    if (!isRunning && names.length > 0) {
      startPicking()
    }
  }

  const winnerCategory = finalName && getCategoryById ? getCategoryById(finalName.categoryId) : null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      {/* Exit hint */}
      <div className="absolute top-4 left-4 text-gray-400 text-sm flex items-center gap-2">
        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">ESC</kbd>
        <span>to exit fullscreen</span>
      </div>

      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        title="Exit fullscreen (ESC)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

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
            {/* Major Prize Banner */}
            {isAllCategories && !isRunning && !finalName && (
              <div className="mb-8 px-8 py-3 bg-blue-500 rounded-full">
                <span className="text-white font-bold text-xl">🏆 ALL CATEGORIES MODE 🏆</span>
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
                  {finalName && isAllCategories && winnerCategory && (
                    <div
                      className="mt-6 inline-block px-6 py-3 rounded-full text-white font-medium text-xl"
                      style={{ backgroundColor: winnerCategory.color }}
                    >
                      {winnerCategory.name}
                    </div>
                  )}
                  {finalName && (
                    <div className="mt-8 text-5xl">🎉 Winner! 🎉</div>
                  )}
                </>
              ) : (
                <p className="text-4xl text-gray-300">Click the button to pick a winner</p>
              )}
            </div>

            {/* Pick Button */}
            <button
              onClick={handleClick}
              disabled={isRunning || names.length === 0}
              className={`px-20 py-6 text-3xl font-bold rounded-full transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:hover:scale-100 ${
                isRunning
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              {isRunning ? (
                <span className="flex items-center gap-4">
                  <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Picking...
                </span>
              ) : finalName ? (
                isAllCategories ? '🏆 Pick Again' : '🎲 Pick Again'
              ) : isAllCategories ? (
                '🏆 Pick a Winner!'
              ) : (
                '🎲 Pick a Name!'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
