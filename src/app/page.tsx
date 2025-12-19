'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { usePickerSync } from '@/hooks/usePickerSync'
import { ControlState, SyncMessage, Name, Prize } from '@/lib/types'
import { findHotkeyWinner } from '@/lib/hotkeys'

const DURATION_OPTIONS = [
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
]

const ALL_CATEGORIES_ID = '__all__'

export default function ControlPage() {
  const { categories, names, getNamesByCategory, getCategoryById, selectName, markLastWinnerAbsent, prizes, getAvailablePrizes } =
    useApp()
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(ALL_CATEGORIES_ID)
  const [duration, setDuration] = useState(3000)
  const [isPicking, setIsPicking] = useState(false)
  const [lastWinner, setLastWinner] = useState<Name | null>(null)
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null)
  const [lastPrize, setLastPrize] = useState<Prize | null>(null)
  const [prizeSearch, setPrizeSearch] = useState('')
  const [lastWinnerMarkedAbsent, setLastWinnerMarkedAbsent] = useState(false)
  const predeterminedWinnerRef = useRef<Name | null>(null)
  const availablePrizes = getAvailablePrizes()

  // Filtered prizes for the selector table
  const filteredPrizes = useMemo(() => {
    if (!prizeSearch.trim()) return prizes
    const search = prizeSearch.toLowerCase()
    return prizes.filter((p) => p.name.toLowerCase().includes(search))
  }, [prizes, prizeSearch])

  const isAllCategories = selectedCategoryId === ALL_CATEGORIES_ID
  const selectedCategory = isAllCategories
    ? undefined
    : getCategoryById(selectedCategoryId)
  const displayNames = isAllCategories
    ? names
    : getNamesByCategory(selectedCategoryId)
  const totalNamesCount = names.length

  // Build control state
  const controlState: ControlState = {
    selectedCategoryId,
    duration,
    names: displayNames,
    category: selectedCategory,
    isAllCategories,
    selectedPrize,
  }

  const handleMessage = useCallback(
    (message: SyncMessage) => {
      if (message.type === 'PICK_COMPLETE') {
        const { winner, prize } = message.payload as { winner: Name; prize?: Prize }
        setLastWinner(winner)
        setLastPrize(prize || null)
        setIsPicking(false)
        // Clear selected prize if it ran out of quantity
        if (selectedPrize && prize?.id === selectedPrize.id) {
          // Check if this prize still has quantity (it will be decremented in context)
          const updatedPrize = availablePrizes.find(p => p.id === selectedPrize.id)
          if (!updatedPrize || updatedPrize.quantity <= 1) {
            setSelectedPrize(null)
          }
        }
      }
      if (message.type === 'DISPLAY_READY') {
        // Display is ready, ensure we send current state
        sendControlState(controlState)
      }
    },
    [controlState, selectedPrize, availablePrizes]
  )

  const {
    sendControlState,
    triggerPick,
    sendPredeterminedWinner,
    announceControlReady,
    displayReady,
    isConnected,
  } = usePickerSync({
    role: 'control',
    onMessage: handleMessage,
  })

  // Broadcast state changes
  useEffect(() => {
    sendControlState(controlState)
  }, [selectedCategoryId, duration, displayNames.length, selectedPrize, sendControlState])

  // Announce ready on mount
  useEffect(() => {
    announceControlReady(controlState)
  }, []) // Only on mount

  // Handle hotkey presses during picking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond during the picking animation
      if (!isPicking) return

      const winner = findHotkeyWinner(
        e.key,
        displayNames,
        selectedCategory?.id || null,
        getCategoryById
      )

      if (winner) {
        predeterminedWinnerRef.current = winner
        sendPredeterminedWinner(winner)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPicking, displayNames, selectedCategory, getCategoryById, sendPredeterminedWinner])

  // Auto-deselect prize if it becomes depleted (e.g., from another tab or after a pick)
  useEffect(() => {
    if (selectedPrize) {
      // Find the current state of this prize from the prizes array
      const currentPrize = prizes.find(p => p.id === selectedPrize.id)
      if (!currentPrize || currentPrize.quantity === 0) {
        setSelectedPrize(null)
      } else if (currentPrize.quantity !== selectedPrize.quantity) {
        // Update the selected prize with the latest quantity
        setSelectedPrize(currentPrize)
      }
    }
  }, [prizes, selectedPrize])

  const canPick = displayNames.length > 0 && !isPicking && displayReady && (prizes.length === 0 || selectedPrize !== null)

  const handlePick = () => {
    if (!canPick) return
    setIsPicking(true)
    setLastWinner(null)
    setLastPrize(null)
    setLastWinnerMarkedAbsent(false)
    predeterminedWinnerRef.current = null
    triggerPick()
  }

  const openDisplayScreen = () => {
    window.open('/display', 'picker-display', 'width=1920,height=1080')
  }

  const winnerCategory =
    lastWinner && getCategoryById
      ? getCategoryById(lastWinner.categoryId)
      : null

  return (
    <main className="min-h-screen py-8 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Control Panel
            </h1>
            <p className="text-gray-500 mt-1">
              Control the random name picker display
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openDisplayScreen}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm2 1v4h10v-4H5z"
                  clipRule="evenodd"
                />
              </svg>
              Open Display
            </button>
            <Link
              href="/results"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                  clipRule="evenodd"
                />
              </svg>
              Results
            </Link>
            <Link
              href="/manage"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Manage Names
            </Link>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  displayReady ? 'bg-green-500' : 'bg-yellow-500'
                } ${!displayReady && 'animate-pulse'}`}
              />
              <span className="text-gray-600">
                {displayReady
                  ? 'Display screen connected'
                  : 'Waiting for display screen...'}
              </span>
            </div>
            {!displayReady && (
              <button
                onClick={openDisplayScreen}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Open display screen
              </button>
            )}
          </div>
        </div>

        {/* Main Picker Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {categories.length === 0 ? (
            <div className="text-center">
              <div className="text-6xl mb-6">📝</div>
              <p className="text-gray-500 text-xl">No categories yet</p>
              <p className="text-gray-400 mt-2 mb-6">
                Create categories and add names to get started
              </p>
              <Link
                href="/manage"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full hover:from-blue-600 hover:to-blue-700 transition-all inline-block"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <>
              {/* Category Selector - moved here for easy access */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-8 w-full max-w-2xl">
                <h3 className="text-gray-800 font-medium mb-3">Select Category</h3>
                <div className="flex gap-2 flex-wrap">
                  {/* All Categories (Major Prize) Toggle */}
                  <button
                    onClick={() => setSelectedCategoryId(ALL_CATEGORIES_ID)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      isAllCategories
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <span>🏆</span>
                    <span>All Categories</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isAllCategories ? 'bg-white/20' : 'bg-blue-200'
                      }`}
                    >
                      {totalNamesCount}
                    </span>
                  </button>

                  {/* Individual Categories */}
                  {categories.map((category) => {
                    const count = getNamesByCategory(category.id).length
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          selectedCategoryId === category.id
                            ? 'text-white ring-2 ring-offset-2'
                            : 'text-gray-700 hover:opacity-80'
                        }`}
                        style={{
                          backgroundColor:
                            selectedCategoryId === category.id
                              ? category.color
                              : `${category.color}30`,
                        }}
                      >
                        <span>{category.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            selectedCategoryId === category.id
                              ? 'bg-white/20'
                              : 'bg-black/10'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Last Winner Display */}
              {lastWinner && (
                <div className="mb-8 text-center">
                  <div className="text-gray-400 text-sm mb-2">Last Winner</div>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                    {lastWinner.name}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                    {winnerCategory && (
                      <span
                        className="inline-block px-4 py-1 rounded-full text-white text-sm"
                        style={{ backgroundColor: winnerCategory.color }}
                      >
                        {winnerCategory.name}
                      </span>
                    )}
                    {lastPrize && (
                      <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                        {lastPrize.name}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Pick Button */}
              <button
                onClick={handlePick}
                disabled={!canPick}
                className={`px-20 py-8 text-4xl font-bold rounded-full transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:hover:scale-100 ${
                  isPicking
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : !canPick
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                {isPicking ? (
                  <span className="flex items-center gap-4">
                    <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Picking...
                  </span>
                ) : displayNames.length === 0 ? (
                  'No Names Available'
                ) : !displayReady ? (
                  'Open Display First'
                ) : prizes.length > 0 && !selectedPrize ? (
                  'Select a Prize First'
                ) : selectedPrize ? (
                  `🎁 Pick Winner for ${selectedPrize.name}!`
                ) : isAllCategories ? (
                  '🏆 Pick a Winner!'
                ) : (
                  '🎲 Pick a Name!'
                )}
              </button>

              {/* Mark as Absent Button - appears after winner is selected */}
              {lastWinner && !isPicking && !lastWinnerMarkedAbsent && (
                <button
                  onClick={() => {
                    markLastWinnerAbsent()
                    setLastWinnerMarkedAbsent(true)
                  }}
                  className="mt-4 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Mark as Absent
                </button>
              )}

              {/* Absent confirmation message */}
              {lastWinnerMarkedAbsent && lastWinner && (
                <div className="mt-4 px-6 py-3 bg-orange-100 border border-orange-300 rounded-lg text-orange-700 font-medium">
                  {lastWinner.name} marked as absent - prize restored
                </div>
              )}

              {/* Names count */}
              <p className="mt-6 text-gray-500 text-lg">
                {displayNames.length} name
                {displayNames.length !== 1 ? 's' : ''} available
                {isAllCategories && ' (all categories)'}
              </p>

              {/* Hotkey hint */}
              {isPicking && (
                <p className="mt-2 text-gray-400 text-sm">
                  Press a hotkey to select a specific winner...
                </p>
              )}
            </>
          )}
        </div>

        {/* Bottom Controls */}
        {categories.length > 0 && (
          <div className="mt-8 space-y-6">
            {/* Prize Selector Table */}
            {prizes.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <h3 className="text-gray-800 font-medium">Select Raffle Prize</h3>
                    <p className="text-gray-400 text-sm">
                      Choose which prize to raffle
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <input
                        type="text"
                        value={prizeSearch}
                        onChange={(e) => setPrizeSearch(e.target.value)}
                        placeholder="Search prizes..."
                        className="pl-9 pr-8 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 w-48"
                      />
                      {prizeSearch && (
                        <button
                          onClick={() => setPrizeSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <Link
                      href="/manage"
                      className="text-purple-500 hover:text-purple-600 text-sm"
                    >
                      Manage Prizes
                    </Link>
                  </div>
                </div>

                {/* Selected Prize Banner */}
                {selectedPrize && (
                  <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300">
                    <div className="flex items-center justify-between">
                      <p className="text-purple-700 font-medium flex items-center gap-2">
                        <span>🎁</span>
                        <span>Selected: {selectedPrize.name}</span>
                        <span className="text-sm font-normal">({selectedPrize.quantity} remaining)</span>
                      </p>
                      <button
                        onClick={() => setSelectedPrize(null)}
                        className="text-purple-500 hover:text-purple-700 text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Prize Table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-purple-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-purple-800">Prize Name</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-purple-800 w-20">Left</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-purple-800 w-24">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPrizes.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-4 text-center text-gray-400 text-sm">
                            No prizes match &quot;{prizeSearch}&quot;
                          </td>
                        </tr>
                      ) : (
                        filteredPrizes.map((prize) => {
                          const isAvailable = prize.quantity > 0
                          const isSelected = selectedPrize?.id === prize.id
                          return (
                            <tr
                              key={prize.id}
                              className={`${
                                isSelected
                                  ? 'bg-purple-50'
                                  : isAvailable
                                  ? 'hover:bg-gray-50 cursor-pointer'
                                  : 'bg-gray-50'
                              }`}
                              onClick={() => isAvailable && !isSelected && setSelectedPrize(prize)}
                            >
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span>🎁</span>
                                  <span className={`text-sm ${isAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {prize.name}
                                  </span>
                                  {!isAvailable && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                                      Depleted
                                    </span>
                                  )}
                                  {isSelected && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-200 text-purple-700">
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                                  isAvailable ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'
                                }`}>
                                  {prize.quantity}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isSelected ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedPrize(null)
                                    }}
                                    className="px-2 py-1 text-xs bg-gray-200 text-gray-600 hover:bg-gray-300 rounded transition-all"
                                  >
                                    Deselect
                                  </button>
                                ) : isAvailable ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedPrize(prize)
                                    }}
                                    className="px-2 py-1 text-xs bg-purple-500 text-white hover:bg-purple-600 rounded transition-all"
                                  >
                                    Select
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {prizeSearch && filteredPrizes.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Showing {filteredPrizes.length} of {prizes.length} prizes
                  </p>
                )}
              </div>
            )}

            {/* Duration Control */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-gray-800 font-medium">
                    Selection Duration
                  </h3>
                  <p className="text-gray-400 text-sm">
                    How long to shuffle before picking
                  </p>
                </div>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDuration(option.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        duration === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}
