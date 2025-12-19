export interface Category {
  id: string
  name: string
  color: string
}

export interface Name {
  id: string
  name: string
  categoryId: string
}

export interface SelectedName {
  id: string
  name: string
  categoryId: string
  selectedAt: number
}

export interface AppState {
  categories: Category[]
  names: Name[]
  selectedNames: SelectedName[]
}
