import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../auth/useAuth'

// TEMPORARY protected page, only to test step 3. It proves the token is sent and sites come back.
export default function TempMonitors() {
  const { user, logout } = useAuth()
  const [sites, setSites] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/sites')
      .then(setSites)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 16px' }}>
      <h1 style={{ fontSize: 40 }}>Monitors (temporary)</h1>
      <p className="muted">Logged in as {user?.name} ({user?.email})</p>
      <button className="btn btn-line" onClick={logout} style={{ margin: '16px 0' }}>Log out</button>

      {error && <p style={{ color: 'var(--down)' }}>{error}</p>}
      {!sites && !error && <p className="muted">Loading your sites...</p>}
      {sites && (
        <pre className="card mono" style={{ padding: 16, overflow: 'auto', fontSize: 12 }}>
          {JSON.stringify(sites, null, 2)}
        </pre>
      )}
    </main>
  )
}
