'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AppState, Category, Name, SelectedName, Prize } from '@/lib/types'
import { loadState, saveState, generateId } from '@/lib/storage'

interface ImportResult {
  namesAdded: number
  categoriesCreated: number
  errors: string[]
}

interface PrizeImportResult {
  prizesAdded: number
  errors: string[]
}

interface AppContextType extends AppState {
  addCategory: (name: string, color: string) => void
  removeCategory: (id: string) => void
  updateCategory: (id: string, name: string, color: string) => void
  addName: (name: string, categoryId: string) => void
  removeName: (id: string) => void
  selectName: (id: string, prize?: Prize, isAbsent?: boolean) => void
  markLastWinnerAbsent: () => void
  restoreName: (selectedId: string) => void
  getNamesByCategory: (categoryId: string) => Name[]
  getSelectedByCategory: (categoryId: string) => SelectedName[]
  getCategoryById: (id: string) => Category | undefined
  getCategoryByName: (name: string) => Category | undefined
  importFromCSV: (csvContent: string) => ImportResult
  importPrizesFromCSV: (csvContent: string) => PrizeImportResult
  addPrize: (name: string, quantity: number) => void
  removePrize: (id: string) => void
  updatePrize: (id: string, name: string, quantity: number) => void
  addPrizeStock: (id: string, amount: number) => void
  getPrizeById: (id: string) => Prize | undefined
  getAvailablePrizes: () => Prize[]
  getWinnersByPrize: (prizeId: string) => SelectedName[]
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    categories: [],
    names: [],
    selectedNames: [],
    prizes: [],
  })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setState(loadState())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      saveState(state)
    }
  }, [state, isLoaded])

  // Listen for storage changes from other tabs (for dual-screen sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'random-picker-state' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue)
          setState(newState)
        } catch (err) {
          console.error('Failed to parse storage update:', err)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: generateId(),
      name,
      color,
    }
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }))
  }

  const removeCategory = (id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      names: prev.names.filter((n) => n.categoryId !== id),
      selectedNames: prev.selectedNames.filter((s) => s.categoryId !== id),
    }))
  }

  const updateCategory = (id: string, name: string, color: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, name, color } : c
      ),
    }))
  }

  const addName = (name: string, categoryId: string) => {
    const newName: Name = {
      id: generateId(),
      name,
      categoryId,
    }
    setState((prev) => ({
      ...prev,
      names: [...prev.names, newName],
    }))
  }

  const removeName = (id: string) => {
    setState((prev) => ({
      ...prev,
      names: prev.names.filter((n) => n.id !== id),
    }))
  }

  const selectName = (id: string, prize?: Prize, isAbsent?: boolean) => {
    const nameToSelect = state.names.find((n) => n.id === id)
    if (!nameToSelect) return

    const selected: SelectedName = {
      id: generateId(),
      name: nameToSelect.name,
      categoryId: nameToSelect.categoryId,
      selectedAt: Date.now(),
      prizeId: isAbsent ? undefined : prize?.id,
      prizeName: isAbsent ? undefined : prize?.name,
      isAbsent: isAbsent || false,
    }

    setState((prev) => ({
      ...prev,
      names: prev.names.filter((n) => n.id !== id),
      selectedNames: [...prev.selectedNames, selected],
      // Deduct prize quantity only if a prize was selected AND winner is NOT absent
      prizes: prize && !isAbsent
        ? prev.prizes.map((p) =>
            p.id === prize.id ? { ...p, quantity: Math.max(0, p.quantity - 1) } : p
          )
        : prev.prizes,
    }))
  }

  // Mark the most recent winner as absent (restores prize quantity if applicable)
  const markLastWinnerAbsent = () => {
    const lastWinner = state.selectedNames[state.selectedNames.length - 1]
    if (!lastWinner || lastWinner.isAbsent) return

    setState((prev) => ({
      ...prev,
      selectedNames: prev.selectedNames.map((s, idx) =>
        idx === prev.selectedNames.length - 1
          ? { ...s, isAbsent: true, prizeId: undefined, prizeName: undefined }
          : s
      ),
      // Restore prize quantity since winner is absent
      prizes: lastWinner.prizeId
        ? prev.prizes.map((p) =>
            p.id === lastWinner.prizeId ? { ...p, quantity: p.quantity + 1 } : p
          )
        : prev.prizes,
    }))
  }

  const restoreName = (selectedId: string) => {
    const selectedName = state.selectedNames.find((s) => s.id === selectedId)
    if (!selectedName) return

    const restoredName: Name = {
      id: generateId(),
      name: selectedName.name,
      categoryId: selectedName.categoryId,
    }

    setState((prev) => ({
      ...prev,
      names: [...prev.names, restoredName],
      selectedNames: prev.selectedNames.filter((s) => s.id !== selectedId),
      // Restore prize quantity if this winner had a prize (and was not absent)
      prizes: selectedName.prizeId && !selectedName.isAbsent
        ? prev.prizes.map((p) =>
            p.id === selectedName.prizeId ? { ...p, quantity: p.quantity + 1 } : p
          )
        : prev.prizes,
    }))
  }

  const getNamesByCategory = (categoryId: string) => {
    return state.names.filter((n) => n.categoryId === categoryId)
  }

  const getSelectedByCategory = (categoryId: string) => {
    return state.selectedNames.filter((s) => s.categoryId === categoryId)
  }

  const getCategoryById = (id: string) => {
    return state.categories.find((c) => c.id === id)
  }

  const getCategoryByName = (name: string) => {
    return state.categories.find((c) => c.name.toLowerCase() === name.toLowerCase())
  }

  const IMPORT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ]

  const importFromCSV = (csvContent: string): ImportResult => {
    const result: ImportResult = {
      namesAdded: 0,
      categoriesCreated: 0,
      errors: [],
    }

    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim())
    const newCategories: Category[] = [...state.categories]
    const newNames: Name[] = [...state.names]
    let colorIndex = state.categories.length

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse CSV line (handle quoted values)
      const parts = line.match(/("([^"]*)"|[^,]+)/g)?.map((p) => p.replace(/^"|"$/g, '').trim()) || []

      const name = parts[0]
      const categoryName = parts[1]

      if (!name) {
        result.errors.push(`Line ${i + 1}: Missing name`)
        continue
      }

      if (!categoryName) {
        result.errors.push(`Line ${i + 1}: Missing category for "${name}"`)
        continue
      }

      // Find or create category
      let category = newCategories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      )

      if (!category) {
        category = {
          id: generateId(),
          name: categoryName,
          color: IMPORT_COLORS[colorIndex % IMPORT_COLORS.length],
        }
        newCategories.push(category)
        colorIndex++
        result.categoriesCreated++
      }

      // Add name
      newNames.push({
        id: generateId(),
        name,
        categoryId: category.id,
      })
      result.namesAdded++
    }

    setState((prev) => ({
      ...prev,
      categories: newCategories,
      names: newNames,
    }))

    return result
  }

  const addPrize = (name: string, quantity: number) => {
    const newPrize: Prize = {
      id: generateId(),
      name,
      quantity,
      initialQuantity: quantity,
    }
    setState((prev) => ({
      ...prev,
      prizes: [...prev.prizes, newPrize],
    }))
  }

  const removePrize = (id: string) => {
    setState((prev) => ({
      ...prev,
      prizes: prev.prizes.filter((p) => p.id !== id),
    }))
  }

  const updatePrize = (id: string, name: string, quantity: number) => {
    setState((prev) => ({
      ...prev,
      prizes: prev.prizes.map((p) =>
        p.id === id ? { ...p, name, quantity, initialQuantity: quantity } : p
      ),
    }))
  }

  const addPrizeStock = (id: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      prizes: prev.prizes.map((p) =>
        p.id === id
          ? { ...p, quantity: p.quantity + amount, initialQuantity: p.initialQuantity + amount }
          : p
      ),
    }))
  }

  const getPrizeById = (id: string) => {
    return state.prizes.find((p) => p.id === id)
  }

  const getAvailablePrizes = () => {
    return state.prizes.filter((p) => p.quantity > 0)
  }

  const getWinnersByPrize = (prizeId: string) => {
    return state.selectedNames.filter((s) => s.prizeId === prizeId)
  }

  const importPrizesFromCSV = (csvContent: string): PrizeImportResult => {
    const result: PrizeImportResult = {
      prizesAdded: 0,
      errors: [],
    }

    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim())
    const newPrizes: Prize[] = [...state.prizes]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse CSV line (handle quoted values)
      const parts = line.match(/("([^"]*)"|[^,]+)/g)?.map((p) => p.replace(/^"|"$/g, '').trim()) || []

      const name = parts[0]
      const quantityStr = parts[1]

      if (!name) {
        result.errors.push(`Line ${i + 1}: Missing prize name`)
        continue
      }

      const quantity = parseInt(quantityStr, 10)
      if (isNaN(quantity) || quantity < 1) {
        result.errors.push(`Line ${i + 1}: Invalid quantity "${quantityStr}" for "${name}"`)
        continue
      }

      // Add prize
      newPrizes.push({
        id: generateId(),
        name,
        quantity,
        initialQuantity: quantity,
      })
      result.prizesAdded++
    }

    setState((prev) => ({
      ...prev,
      prizes: newPrizes,
    }))

    return result
  }

  if (!isLoaded) {
    return null
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        addCategory,
        removeCategory,
        updateCategory,
        addName,
        removeName,
        selectName,
        markLastWinnerAbsent,
        restoreName,
        getNamesByCategory,
        getSelectedByCategory,
        getCategoryById,
        getCategoryByName,
        importFromCSV,
        importPrizesFromCSV,
        addPrize,
        removePrize,
        updatePrize,
        addPrizeStock,
        getPrizeById,
        getAvailablePrizes,
        getWinnersByPrize,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
