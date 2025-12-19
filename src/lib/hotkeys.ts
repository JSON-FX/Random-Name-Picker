export interface HotkeyConfig {
  key: string 
  name: string 
  category?: string 
}

export const HOTKEY_WINNERS: HotkeyConfig[] = [
  { key: 'A', name: 'JAYSON R. ALANANO', category: 'REGULAR-CASUAL' },
  { key: 'P', name: 'JAY LEO POL POMICPIC', category: 'JOB-ORDER' },
  { key: 'N', name: 'IVAN JOHN C. NACION', category: 'REGULAR-CASUAL' },
  { key: 'T', name: 'JOHN DAVE HERMOCILLA TAPAY', category: 'JOB-ORDER' },
  { key: 'M', name: 'GIDEON A. MAGBANUA', category: 'REGULAR-CASUAL' }, 
  { key: 'L', name: 'LITO ALONZO NACION', category: 'JOB-ORDER' }, 
]

export function findHotkeyWinner(
  key: string,
  availableNames: { id: string; name: string; categoryId: string }[],
  currentCategoryId: string | null,
  getCategoryById?: (id: string) => { name: string } | undefined
): { id: string; name: string; categoryId: string } | null {
  const config = HOTKEY_WINNERS.find((h) => h.key.toLowerCase() === key.toLowerCase())
  if (!config) return null

  const match = availableNames.find((n) => {
    const nameMatches = n.name.toLowerCase() === config.name.toLowerCase()
    if (!nameMatches) return false

    if (config.category && getCategoryById) {
      const category = getCategoryById(n.categoryId)
      if (!category) return false
      if (category.name.toLowerCase() !== config.category.toLowerCase()) return false
    }

    return true
  })

  return match || null
}
