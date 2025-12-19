'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'

const ALL_CATEGORIES_ID = '__all__'

export default function ResultsPage() {
  const { categories, selectedNames, getCategoryById } = useApp()
  const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES_ID)

  const filteredResults =
    filterCategory === ALL_CATEGORIES_ID
      ? selectedNames
      : selectedNames.filter((s) => s.categoryId === filterCategory)

  const resultsByCategory = filteredResults.reduce((acc, selected) => {
    const category = getCategoryById(selected.categoryId)
    const categoryName = category?.name || 'Unknown'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(selected.name)
    return acc
  }, {} as Record<string, string[]>)

  const exportCSV = () => {
    const rows: string[] = ['Name,Category']

    filteredResults.forEach((selected) => {
      const category = getCategoryById(selected.categoryId)
      const categoryName = category?.name || 'Unknown'
      // Escape quotes in names and wrap in quotes if contains comma
      const escapedName = selected.name.includes(',') || selected.name.includes('"')
        ? `"${selected.name.replace(/"/g, '""')}"`
        : selected.name
      rows.push(`${escapedName},${categoryName}`)
    })

    const csvContent = rows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `results-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Results</h1>
            <p className="text-gray-500">Selected winners</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/manage"
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all"
            >
              Manage Names
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Back to Picker
            </Link>
          </div>
        </div>

        {/* Filter and Export */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Filter by Category</h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterCategory(ALL_CATEGORIES_ID)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterCategory === ALL_CATEGORIES_ID
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilterCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterCategory === category.id
                        ? 'text-white'
                        : 'text-gray-600 hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor:
                        filterCategory === category.id
                          ? category.color
                          : `${category.color}30`,
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={exportCSV}
              disabled={filteredResults.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-lg">No winners yet</p>
            <p className="text-sm mt-1">
              Go to the picker and select some names to see results here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(resultsByCategory).map(([categoryName, names]) => (
              <div
                key={categoryName}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{categoryName}</h3>
                  <span className="text-gray-400 text-sm">
                    ({names.length} winner{names.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {names.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
