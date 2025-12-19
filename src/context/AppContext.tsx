'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AppState, Category, Name, SelectedName } from '@/lib/types'
import { loadState, saveState, generateId } from '@/lib/storage'

interface ImportResult {
  namesAdded: number
  categoriesCreated: number
  errors: string[]
}

interface AppContextType extends AppState {
  addCategory: (name: string, color: string) => void
  removeCategory: (id: string) => void
  updateCategory: (id: string, name: string, color: string) => void
  addName: (name: string, categoryId: string) => void
  removeName: (id: string) => void
  selectName: (id: string) => void
  restoreName: (selectedId: string) => void
  getNamesByCategory: (categoryId: string) => Name[]
  getSelectedByCategory: (categoryId: string) => SelectedName[]
  getCategoryById: (id: string) => Category | undefined
  getCategoryByName: (name: string) => Category | undefined
  importFromCSV: (csvContent: string) => ImportResult
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    categories: [],
    names: [],
    selectedNames: [],
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

  const selectName = (id: string) => {
    const nameToSelect = state.names.find((n) => n.id === id)
    if (!nameToSelect) return

    const selected: SelectedName = {
      id: generateId(),
      name: nameToSelect.name,
      categoryId: nameToSelect.categoryId,
      selectedAt: Date.now(),
    }

    setState((prev) => ({
      ...prev,
      names: prev.names.filter((n) => n.id !== id),
      selectedNames: [...prev.selectedNames, selected],
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
        restoreName,
        getNamesByCategory,
        getSelectedByCategory,
        getCategoryById,
        getCategoryByName,
        importFromCSV,
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
