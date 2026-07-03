import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getToken, setToken, setUnauthorizedHandler, post } from '../api/client'
import type { AuthResponse, UserDto } from '../api/types'

const USER_KEY = 'quantforge.user'

interface AuthState {
  user: UserDto | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, displayName: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadStoredUser(): UserDto | null {
  if (!getToken()) return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserDto
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(loadStoredUser)
  const queryClient = useQueryClient()

  const applyAuth = useCallback(
    (response: AuthResponse) => {
      setToken(response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      setUser(response.user)
      queryClient.clear()
    },
    [queryClient],
  )

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  const value = useMemo<AuthState>(
    () => ({
      user,
      login: async (email, password) => {
        applyAuth(await post<AuthResponse>('/api/auth/login', { email, password }))
      },
      register: async (email, displayName, password) => {
        applyAuth(await post<AuthResponse>('/api/auth/register', { email, displayName, password }))
      },
      logout,
    }),
    [user, applyAuth, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
