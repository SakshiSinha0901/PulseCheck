import { useContext } from 'react'
import { AuthContext } from './authContext'

// Any page calls useAuth() to get { user, login, signup, logout }.
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
