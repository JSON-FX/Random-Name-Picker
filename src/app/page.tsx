'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import RandomNamePicker from '@/components/RandomNamePicker'
import FullscreenPicker from '@/components/FullscreenPicker'

const DURATION_OPTIONS = [
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
]

const ALL_CATEGORIES_ID = '__all__'

export default function Home() {
  const { categories, names, getNamesByCategory, getCategoryById, selectName } = useApp()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_CATEGORIES_ID)
  const [duration, setDuration] = useState(3000)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const isAllCategories = selectedCategoryId === ALL_CATEGORIES_ID
  const selectedCategory = isAllCategories ? undefined : getCategoryById(selectedCategoryId)

  // Get names based on selection - all names or category-specific
  const displayNames = isAllCategories ? names : getNamesByCategory(selectedCategoryId)

  // Total count across all categories
  const totalNamesCount = names.length

  const handleSelectName = (id: string) => {
    selectName(id)
  }

  const handleEscKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [handleEscKey])

  if (isFullscreen) {
    return (
      <FullscreenPicker
        names={displayNames}
        category={selectedCategory}
        duration={duration}
        onSelect={handleSelectName}
        isAllCategories={isAllCategories}
        getCategoryById={getCategoryById}
        onExit={() => setIsFullscreen(false)}
      />
    )
  }

  return (
    <main className="min-h-screen py-8 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Random Name Picker
            </h1>
            <p className="text-gray-500 mt-1">Select a category and pick a random name</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
              title="Enter fullscreen mode (ESC to exit)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Fullscreen
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

        {/* Main Picker Area */}
        <div className="flex-1 flex flex-col">
          {categories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-6xl mb-6">📝</div>
              <p className="text-gray-500 text-xl text-center">No categories yet</p>
              <p className="text-gray-400 mt-2 mb-6">Create categories and add names to get started</p>
              <Link
                href="/manage"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <RandomNamePicker
              names={displayNames}
              category={selectedCategory}
              isAllCategories={isAllCategories}
            />
          )}
        </div>

        {/* Bottom Controls */}
        {categories.length > 0 && (
          <div className="mt-8 space-y-6">
            {/* Duration Control */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-gray-800 font-medium">Selection Duration</h3>
                  <p className="text-gray-400 text-sm">How long to shuffle before picking</p>
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

            {/* Category Toggle */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
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
          </div>
        )}
      </div>
    </main>
  )
}
