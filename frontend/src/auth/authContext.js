import { createContext } from 'react'

// A "context" is a shared box any page can read from, so we don't pass the
// logged-in user down through every component by hand.
export const AuthContext = createContext(null)
