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
  prizeId?: string
  prizeName?: string
}

export interface Prize {
  id: string
  name: string
  quantity: number
  initialQuantity: number
}

export interface AppState {
  categories: Category[]
  names: Name[]
  selectedNames: SelectedName[]
  prizes: Prize[]
}

// Sync types for dual-screen setup
export interface ControlState {
  selectedCategoryId: string
  duration: number
  names: Name[]
  category: Category | undefined
  isAllCategories: boolean
  selectedPrize: Prize | null
}

export type SyncMessageType =
  | 'CONTROL_STATE'
  | 'START_PICK'
  | 'ANIMATION_UPDATE'
  | 'PICK_COMPLETE'
  | 'DISPLAY_READY'
  | 'CONTROL_READY'
  | 'SET_PREDETERMINED_WINNER'

export interface SyncMessage {
  type: SyncMessageType
  payload: unknown
  timestamp: number
}

export interface AnimationState {
  isRunning: boolean
  displayName: string
  finalName: Name | null
}
