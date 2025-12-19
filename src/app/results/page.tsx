'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'

const ALL_CATEGORIES_ID = '__all__'

export default function ResultsPage() {
  const { categories, selectedNames, getCategoryById, prizes } = useApp()
  const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES_ID)
  const [prizeSummarySearch, setPrizeSummarySearch] = useState('')
  const [winnersSearch, setWinnersSearch] = useState('')

  const filteredResults =
    filterCategory === ALL_CATEGORIES_ID
      ? selectedNames
      : selectedNames.filter((s) => s.categoryId === filterCategory)

  // Filtered prizes for summary table
  const filteredPrizes = useMemo(() => {
    if (!prizeSummarySearch.trim()) return prizes
    const search = prizeSummarySearch.toLowerCase()
    return prizes.filter((p) => p.name.toLowerCase().includes(search))
  }, [prizes, prizeSummarySearch])

  // Filtered winners for the winners table
  const filteredWinnersList = useMemo(() => {
    const search = winnersSearch.toLowerCase().trim()
    if (!search) return filteredResults
    return filteredResults.filter((w) => {
      const category = getCategoryById(w.categoryId)
      return (
        w.name.toLowerCase().includes(search) ||
        (w.prizeName && w.prizeName.toLowerCase().includes(search)) ||
        (category?.name && category.name.toLowerCase().includes(search)) ||
        (w.isAbsent && 'absent'.includes(search))
      )
    })
  }, [filteredResults, winnersSearch, getCategoryById])

  const exportCSV = () => {
    const rows: string[] = ['Name,Category,Prize,Status']

    filteredResults.forEach((selected) => {
      const category = getCategoryById(selected.categoryId)
      const categoryName = category?.name || 'Unknown'
      const prizeName = selected.prizeName || ''
      const status = selected.isAbsent ? 'Absent' : 'Present'
      // Escape quotes in names and wrap in quotes if contains comma
      const escapeName = (str: string) =>
        str.includes(',') || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      rows.push(`${escapeName(selected.name)},${escapeName(categoryName)},${escapeName(prizeName)},${status}`)
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

        {/* Prize Summary Table */}
        {prizes.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <h2 className="text-lg font-semibold text-gray-800">Prize Summary</h2>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  value={prizeSummarySearch}
                  onChange={(e) => setPrizeSummarySearch(e.target.value)}
                  placeholder="Search prizes..."
                  className="pl-10 pr-4 py-2 rounded-lg bg-white border border-purple-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 w-64"
                />
                {prizeSummarySearch && (
                  <button
                    onClick={() => setPrizeSummarySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-purple-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Prize Name</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-purple-800">Awarded</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-purple-800">Remaining</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-purple-800">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {filteredPrizes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        No prizes match &quot;{prizeSummarySearch}&quot;
                      </td>
                    </tr>
                  ) : (
                    filteredPrizes.map((prize) => {
                      const awarded = prize.initialQuantity - prize.quantity
                      const isDepleted = prize.quantity === 0
                      return (
                        <tr key={prize.id} className={isDepleted ? 'bg-gray-50' : 'hover:bg-purple-50'}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🎁</span>
                              <span className={`font-medium ${isDepleted ? 'text-gray-500' : 'text-gray-800'}`}>
                                {prize.name}
                              </span>
                              {isDepleted && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                  Depleted
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold">
                              {awarded}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                              isDepleted ? 'bg-gray-200 text-gray-500' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {prize.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {prize.initialQuantity}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {prizeSummarySearch && filteredPrizes.length > 0 && (
              <p className="mt-2 text-sm text-purple-600">
                Showing {filteredPrizes.length} of {prizes.length} prizes
              </p>
            )}
          </div>
        )}

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

        {/* Winners Table */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Winners ({filteredResults.length})
            </h2>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                value={winnersSearch}
                onChange={(e) => setWinnersSearch(e.target.value)}
                placeholder="Search winners, prizes, categories..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
              />
              {winnersSearch && (
                <button
                  onClick={() => setWinnersSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-lg">No winners yet</p>
              <p className="text-sm mt-1">
                Go to the picker and select some names to see results here
              </p>
            </div>
          ) : filteredWinnersList.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No winners match &quot;{winnersSearch}&quot;</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Winner Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prize</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWinnersList.map((winner, index) => {
                      const category = getCategoryById(winner.categoryId)
                      return (
                        <tr key={winner.id} className={`hover:bg-gray-50 ${winner.isAbsent ? 'bg-orange-50' : ''}`}>
                          <td className="px-4 py-3 text-gray-500 text-sm">{index + 1}</td>
                          <td className="px-4 py-3">
                            <span className={`font-medium ${winner.isAbsent ? 'text-gray-500' : 'text-gray-800'}`}>
                              {winner.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {category && (
                              <span
                                className="text-xs px-2 py-1 rounded-full text-white"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.name}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {winner.prizeName ? (
                              <span className="inline-flex items-center gap-1 text-sm text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                                <span>🎁</span>
                                {winner.prizeName}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {winner.isAbsent ? (
                              <span className="inline-flex items-center gap-1 text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                                Absent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                Present
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {winnersSearch && (
                <p className="mt-2 text-sm text-gray-500">
                  Showing {filteredWinnersList.length} of {filteredResults.length} winners
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
