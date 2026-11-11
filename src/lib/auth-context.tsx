import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { apiRequest, getAccessToken, setAccessToken, type Role, type User } from "@/lib/api"

type AuthResponse = { user: User; accessToken: string; tokenType: "Bearer" }
type AuthContextValue = {
  user: User | null
  ready: boolean
  signIn: (email: string, password: string) => Promise<void>
  register: (input: { email: string; password: string; role: Exclude<Role, "ADMIN">; displayName: string }) => Promise<void>
  signOut: () => void
  refreshUser: () => Promise<void>
}
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(!getAccessToken())
  const queryClient = useQueryClient()

  const refreshUser = useCallback(async () => {
    const account = await apiRequest<User>("/auth/me")
    setUser(account)
  }, [])

  useEffect(() => {
    if (!getAccessToken()) return
    let active = true
    refreshUser()
      .then(() => { if (active) setReady(true) })
      .catch(() => { if (active) setAccessToken(null) })
      .finally(() => { if (active) setReady(true) })
    return () => { active = false }
  }, [refreshUser])

  const acceptAuth = useCallback((response: AuthResponse) => {
    setAccessToken(response.accessToken)
    setUser(response.user)
    setReady(true)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    })
    acceptAuth(response)
    if (!response.user.profile) void refreshUser()
  }, [acceptAuth, refreshUser])

  const register = useCallback(async (input: { email: string; password: string; role: Exclude<Role, "ADMIN">; displayName: string }) => {
    const response = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST", body: JSON.stringify(input),
    })
    acceptAuth(response)
  }, [acceptAuth])

  const signOut = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const value = useMemo(() => ({ user, ready, signIn, register, signOut, refreshUser }), [user, ready, signIn, register, signOut, refreshUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
