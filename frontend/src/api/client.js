// The "messenger": every request from the website to the PulseCheck server goes through here.
// Keeping it in ONE place means the token, the server address and error handling are written once.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const AUTH_KEY = 'pulsecheck-auth'

// If the server takes longer than this, we tell the user it is "waking up" (Render free plan sleeps).
const SLOW_AFTER_MS = 4000

// ---- saved login (token + user) in the browser's localStorage ----
export function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveAuth(auth) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
  } catch {
    // storage blocked: login still works until the page is closed
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(AUTH_KEY)
  } catch {
    // nothing to do
  }
}

// AuthProvider registers a function here, so a 401 (expired token) anywhere logs the user out.
let onUnauthorized = null
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

// A custom error that carries the HTTP status and the server's message.
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// apiFetch('/api/sites')                                  -> GET with the token
// apiFetch('/api/auth/login', { method:'POST', body:{...}, auth:false })
export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const saved = loadAuth()
    if (saved?.token) headers.Authorization = `Bearer ${saved.token}`
  }

  // Tell the page "this is taking long" so it can show the waking-up banner.
  const slowTimer = setTimeout(() => {
    window.dispatchEvent(new CustomEvent('pulsecheck:slow'))
  }, SLOW_AFTER_MS)

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Check your internet and try again.', 0)
  } finally {
    clearTimeout(slowTimer)
    window.dispatchEvent(new CustomEvent('pulsecheck:fast'))
  }

  // Some responses (like DELETE) may have no body, so parsing is wrapped.
  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    // 401 on a protected call = token expired/invalid -> log out. (Login/signup pass auth:false.)
    if (response.status === 401 && auth && onUnauthorized) onUnauthorized()
    throw new ApiError(data?.error || 'Something went wrong.', response.status)
  }

  return data
}
