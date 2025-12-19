import { AppState, Category, Name, SelectedName } from './types'

const STORAGE_KEY = 'random-picker-state'

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Team A', color: '#FF6B6B' },
  { id: '2', name: 'Team B', color: '#4ECDC4' },
  { id: '3', name: 'General', color: '#45B7D1' },
]

const DEFAULT_STATE: AppState = {
  categories: DEFAULT_CATEGORIES,
  names: [],
  selectedNames: [],
  prizes: [],
}

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        categories: parsed.categories || DEFAULT_CATEGORIES,
        names: parsed.names || [],
        selectedNames: parsed.selectedNames || [],
        prizes: parsed.prizes || [],
      }
    }
  } catch (e) {
    console.error('Failed to load state:', e)
  }

  return DEFAULT_STATE
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
