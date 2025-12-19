'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
]

export default function ManagePage() {
  const {
    categories,
    addCategory,
    removeCategory,
    addName,
    removeName,
    restoreName,
    getNamesByCategory,
    getSelectedByCategory,
    importFromCSV,
    importPrizesFromCSV,
    prizes,
    addPrize,
    removePrize,
    updatePrize,
    addPrizeStock,
  } = useApp()

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0])
  const [newNames, setNewNames] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prizeFileInputRef = useRef<HTMLInputElement>(null)
  const [prizeImportResult, setPrizeImportResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [newPrizeName, setNewPrizeName] = useState('')
  const [newPrizeQuantity, setNewPrizeQuantity] = useState(1)
  const [editingPrize, setEditingPrize] = useState<string | null>(null)
  const [editPrizeName, setEditPrizeName] = useState('')
  const [editPrizeQuantity, setEditPrizeQuantity] = useState(1)

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), newCategoryColor)
      setNewCategoryName('')
      setNewCategoryColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)])
    }
  }

  const handleAddName = (categoryId: string) => {
    const name = newNames[categoryId]?.trim()
    if (name) {
      addName(name, categoryId)
      setNewNames((prev) => ({ ...prev, [categoryId]: '' }))
    }
  }

  const handleAddPrize = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPrizeName.trim() && newPrizeQuantity > 0) {
      addPrize(newPrizeName.trim(), newPrizeQuantity)
      setNewPrizeName('')
      setNewPrizeQuantity(1)
    }
  }

  const handleStartEditPrize = (prize: { id: string; name: string; quantity: number }) => {
    setEditingPrize(prize.id)
    setEditPrizeName(prize.name)
    setEditPrizeQuantity(prize.quantity)
  }

  const handleSaveEditPrize = (id: string) => {
    if (editPrizeName.trim() && editPrizeQuantity >= 0) {
      updatePrize(id, editPrizeName.trim(), editPrizeQuantity)
      setEditingPrize(null)
    }
  }

  const handlePrizeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const result = importPrizesFromCSV(content)

        if (result.prizesAdded > 0) {
          setPrizeImportResult({
            success: true,
            message: `Successfully imported ${result.prizesAdded} prize${result.prizesAdded !== 1 ? 's' : ''}.${
              result.errors.length > 0 ? ` (${result.errors.length} errors)` : ''
            }`,
          })
        } else {
          setPrizeImportResult({
            success: false,
            message: `Import failed. ${result.errors.join(', ')}`,
          })
        }

        setTimeout(() => setPrizeImportResult(null), 5000)
      }
    }
    reader.readAsText(file)

    if (prizeFileInputRef.current) {
      prizeFileInputRef.current.value = ''
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const result = importFromCSV(content)

        if (result.namesAdded > 0) {
          setImportResult({
            success: true,
            message: `Successfully imported ${result.namesAdded} names${
              result.categoriesCreated > 0
                ? ` and created ${result.categoriesCreated} new categories`
                : ''
            }.${result.errors.length > 0 ? ` (${result.errors.length} errors)` : ''}`,
          })
        } else {
          setImportResult({
            success: false,
            message: `Import failed. ${result.errors.join(', ')}`,
          })
        }

        setTimeout(() => setImportResult(null), 5000)
      }
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Names</h1>
            <p className="text-gray-500">Add categories and names for the random picker</p>
          </div>
          <div className="flex gap-3">
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
              Print Results
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Back to Picker
            </Link>
          </div>
        </div>

        {/* Import Result Message */}
        {importResult && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              importResult.success
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {importResult.message}
          </div>
        )}

        {/* Import CSV */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Import from CSV</h2>
          <p className="text-gray-500 text-sm mb-4">
            Upload a CSV file with names in Column A and category names in Column B.
            Categories will be created automatically if they don&apos;t exist.
          </p>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Upload CSV
            </label>
            <span className="text-gray-400 text-sm">
              Format: Name, Category (one per line)
            </span>
          </div>
        </div>

        {/* Raffle Prizes */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Raffle Prizes</h2>
          <p className="text-gray-500 text-sm mb-4">
            Add prizes with quantities. Select a prize before picking winners.
          </p>

          {/* Prize Import Result Message */}
          {prizeImportResult && (
            <div
              className={`mb-4 p-4 rounded-xl border ${
                prizeImportResult.success
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {prizeImportResult.message}
            </div>
          )}

          {/* Import Prizes from CSV */}
          <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-gray-800 font-medium">Import from CSV</h3>
                <p className="text-gray-500 text-sm">
                  Column A: Prize Name, Column B: Quantity
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={prizeFileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handlePrizeFileUpload}
                  className="hidden"
                  id="prize-csv-upload"
                />
                <label
                  htmlFor="prize-csv-upload"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all cursor-pointer flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Upload CSV
                </label>
              </div>
            </div>
          </div>

          {/* Add Prize Form */}
          <form onSubmit={handleAddPrize} className="flex gap-4 items-end flex-wrap mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-500 text-sm mb-2">Prize Name</label>
              <input
                type="text"
                value={newPrizeName}
                onChange={(e) => setNewPrizeName(e.target.value)}
                placeholder="e.g., Grand Prize TV"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>
            <div className="w-32">
              <label className="block text-gray-500 text-sm mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={newPrizeQuantity}
                onChange={(e) => setNewPrizeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={!newPrizeName.trim() || newPrizeQuantity < 1}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              Add Prize
            </button>
          </form>

          {/* Prizes List */}
          {prizes.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No prizes added yet</p>
          ) : (
            <div className="space-y-2">
              {prizes.map((prize) => {
                const isDepleted = prize.quantity === 0
                return (
                  <div
                    key={prize.id}
                    className={`flex items-center justify-between p-4 rounded-lg border group ${
                      isDepleted
                        ? 'bg-gray-100 border-gray-300'
                        : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                    }`}
                  >
                    {editingPrize === prize.id ? (
                      <>
                        <div className="flex gap-3 flex-1">
                          <input
                            type="text"
                            value={editPrizeName}
                            onChange={(e) => setEditPrizeName(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <input
                            type="number"
                            min="0"
                            value={editPrizeQuantity}
                            onChange={(e) => setEditPrizeQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => handleSaveEditPrize(prize.id)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPrize(null)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                              isDepleted
                                ? 'bg-gray-200 text-gray-500'
                                : 'bg-purple-100 text-purple-600'
                            }`}
                          >
                            {prize.quantity}
                          </div>
                          <div>
                            <span className={`font-medium ${isDepleted ? 'text-gray-500' : 'text-gray-800'}`}>
                              {prize.name}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({prize.initialQuantity - prize.quantity} awarded)
                            </span>
                            {isDepleted && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                Depleted
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`flex gap-2 ${isDepleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`}>
                          <button
                            onClick={() => addPrizeStock(prize.id, 1)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition-all"
                            title="Add 1 more to stock"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => {
                              const amount = prompt(`Add stock for "${prize.name}"\nEnter quantity to add:`, '5')
                              if (amount) {
                                const qty = parseInt(amount, 10)
                                if (!isNaN(qty) && qty > 0) {
                                  addPrizeStock(prize.id, qty)
                                }
                              }
                            }}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition-all"
                            title="Add custom amount to stock"
                          >
                            +N
                          </button>
                          <button
                            onClick={() => handleStartEditPrize(prize)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete prize "${prize.name}"?`)) {
                                removePrize(prize.id)
                              }
                            }}
                            className="px-3 py-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Category */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Category</h2>
          <form onSubmit={handleAddCategory} className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-500 text-sm mb-2">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Team Alpha"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-2">Color</label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      newCategoryColor === color ? 'ring-2 ring-gray-800 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === category.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: activeTab === category.id ? category.color : undefined,
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Category Content */}
        {categories.map((category) => {
          if (category.id !== activeTab) return null

          const names = getNamesByCategory(category.id)
          const selectedNames = getSelectedByCategory(category.id)
          const currentSearch = searchQuery[category.id] || ''
          const filteredNames = currentSearch
            ? names.filter((n) =>
                n.name.toLowerCase().includes(currentSearch.toLowerCase())
              )
            : names

          return (
            <div key={category.id} className="space-y-6">
              {/* Category Header with Delete */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
                    <span className="text-gray-400 text-sm">({names.length} available)</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete category "${category.name}" and all its names?`)) {
                        removeCategory(category.id)
                        setActiveTab(categories[0]?.id || '')
                      }
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Delete Category
                  </button>
                </div>

                {/* Add Name Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNames[category.id] || ''}
                    onChange={(e) =>
                      setNewNames((prev) => ({ ...prev, [category.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddName(category.id)
                      }
                    }}
                    placeholder="Enter a name..."
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    onClick={() => handleAddName(category.id)}
                    disabled={!newNames[category.id]?.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                {/* Search Names */}
                {names.length > 0 && (
                  <div className="mt-4 relative">
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
                      value={currentSearch}
                      onChange={(e) =>
                        setSearchQuery((prev) => ({ ...prev, [category.id]: e.target.value }))
                      }
                      placeholder="Search names..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    {currentSearch && (
                      <button
                        onClick={() =>
                          setSearchQuery((prev) => ({ ...prev, [category.id]: '' }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {/* Names List */}
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {names.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No names in this category yet</p>
                  ) : filteredNames.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No names match &quot;{currentSearch}&quot;</p>
                  ) : (
                    <>
                      {currentSearch && (
                        <p className="text-gray-400 text-sm mb-2">
                          Showing {filteredNames.length} of {names.length} names
                        </p>
                      )}
                      {filteredNames.map((name) => (
                        <div
                          key={name.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 group"
                        >
                          <span className="text-gray-800">{name.name}</span>
                          <button
                            onClick={() => removeName(name.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Selected Names (Undo Section) */}
              {selectedNames.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Selected Names ({selectedNames.length})
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    These names have been picked. Click undo to restore them to the available list.
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedNames.map((selected) => (
                      <div
                        key={selected.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-800">{selected.name}</span>
                          <span className="text-gray-400 text-xs">
                            {new Date(selected.selectedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <button
                          onClick={() => restoreName(selected.id)}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded transition-all"
                        >
                          Undo
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No categories yet</p>
            <p className="text-sm mt-1">Create a category above or import from CSV to get started</p>
          </div>
        )}
      </div>
    </main>
  )
}
