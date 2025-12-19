'use client'

import { Name, Category } from '@/lib/types'

interface RandomNamePickerProps {
  names: Name[]
  category: Category | undefined
  isAllCategories?: boolean
}

export default function RandomNamePicker({
  names,
  category,
  isAllCategories = false,
}: RandomNamePickerProps) {
  if (names.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="text-8xl mb-6">🎲</div>
        <p className="text-gray-500 text-2xl text-center">
          {isAllCategories ? 'No names available' : 'No names available in this category'}
        </p>
        <p className="text-gray-400 mt-2 text-lg">
          Add some names in the manage page
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      {/* Major Prize Banner */}
      {isAllCategories && (
        <div className="mb-6 px-6 py-2 bg-blue-500 rounded-full">
          <span className="text-white font-bold text-lg">🏆 ALL CATEGORIES MODE 🏆</span>
        </div>
      )}

      {/* Display Area */}
      <div
        className="relative w-full max-w-4xl aspect-video flex items-center justify-center rounded-3xl border-4 transition-all border-gray-200 bg-white"
      >
        {/* Name Display */}
        <div className="relative z-10 text-center px-8">
          <p className="text-3xl text-gray-400">Enter fullscreen mode to pick a winner</p>
        </div>
      </div>

      {/* Names available indicator */}
      <p className="mt-8 text-gray-500 text-lg">
        {names.length} name{names.length !== 1 ? 's' : ''} available
        {isAllCategories && ' (all categories)'}
      </p>
    </div>
  )
}
