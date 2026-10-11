import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { apiFetch, clearAuth, loadAuth, saveAuth, setUnauthorizedHandler } from '../api/client'

// Holds "who is logged in" for the whole app.
export default function AuthProvider({ children }) {
  // Start from whatever was saved, so a refresh does not log you out.
  const [auth, setAuth] = useState(() => loadAuth())

  const logout = useCallback(() => {
    clearAuth()
    setAuth(null)
  }, [])

  // If the server says "token expired" on any call, log out automatically.
  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password }, auth: false })
    saveAuth(data)
    setAuth(data)
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const data = await apiFetch('/api/auth/signup', { method: 'POST', body: { name, email, password }, auth: false })
    saveAuth(data)
    setAuth(data)
  }, [])

  const value = useMemo(
    () => ({ user: auth?.user ?? null, isLoggedIn: Boolean(auth?.token), login, signup, logout }),
    [auth, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
