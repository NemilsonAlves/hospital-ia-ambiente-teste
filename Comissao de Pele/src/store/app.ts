import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // Theme
  theme: 'light' | 'dark'
  
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Notifications
  notifications: Notification[]
  
  // AI Settings
  aiConfidenceThreshold: number
  aiModel: string
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setAiConfidenceThreshold: (threshold: number) => void
  setAiModel: (model: string) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'light',
      sidebarOpen: true,
      sidebarCollapsed: false,
      notifications: [],
      aiConfidenceThreshold: 75,
      aiModel: 'gpt-4o-vision',

      // Theme actions
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),

      // Sidebar actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),

      // Notification actions
      addNotification: (notification) => {
        const id = Date.now().toString()
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date(),
          read: false,
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }))
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

      clearNotifications: () => set({ notifications: [] }),

      // AI settings actions
      setAiConfidenceThreshold: (threshold) => set({ aiConfidenceThreshold: threshold }),
      setAiModel: (model) => set({ aiModel: model }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        aiConfidenceThreshold: state.aiConfidenceThreshold,
        aiModel: state.aiModel,
      }),
    }
  )
)