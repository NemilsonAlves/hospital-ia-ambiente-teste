import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '@prisma/client'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  organization: {
    id: string
    name: string
    logo?: string
  }
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (user: User, accessToken: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  refreshAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User, accessToken: string) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: async () => {
        try {
          // Chamar API de logout
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${get().accessToken}`,
            },
          })
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      refreshAuth: async () => {
        try {
          set({ isLoading: true })
          
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          })

          if (response.ok) {
            const data = await response.json()
            set({
              user: data.user,
              accessToken: data.accessToken,
              isAuthenticated: true,
            })
          } else {
            // Token inválido, fazer logout
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
            })
          }
        } catch (error) {
          console.error('Refresh auth error:', error)
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)