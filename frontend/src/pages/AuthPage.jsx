import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Logo from '../components/Logo'
import PasswordField from '../components/PasswordField'
import './Auth.css'

// Sample rows for the dark panel. "d" = a failed check, "u" = a good one.
const SAMPLE = [
  { name: 'Main website', ticks: 'uuuuuuuuuuuuuuuuuuuu', down: false },
  { name: 'Checkout API', ticks: 'uuuuuuuuuuuuuuuuuudd', down: true },
  { name: 'Docs', ticks: 'uuuuuuuuuuuuuuuuuuuu', down: false },
]

function SidePanel() {
  return (
    <aside className="auth-side">
      <Logo onDark />
      <div>
        <h2>Your sites, checked every 5 minutes.</h2>
        <div className="mini" aria-hidden="true">
          {SAMPLE.map((s) => (
            <div className="mrow" key={s.name}>
              <span>{s.name}</span>
              <span className="ticks">
                {s.ticks.split('').map((c, i) => (
                  <b key={i} className={c === 'd' ? 'd' : ''} />
                ))}
              </span>
              <span className={s.down ? 'dpill dn' : 'dpill'}>
                <i />
                {s.down ? 'Down' : 'Up'}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="cap">Sample data. You get one email when a site goes down and one when it’s back.</p>
    </aside>
  )
}

const EMAIL_OK = /^\S+@\S+\.\S+$/

// One component for both pages: kind is 'login' or 'signup'.
export default function AuthPage({ kind }) {
  const isSignup = kind === 'signup'
  const { login, signup, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState(null) // { status, message }
  const [busy, setBusy] = useState(false)
  const [slow, setSlow] = useState(false)

  // Already logged in? Skip this page.
  if (isLoggedIn) return <Navigate to="/monitors" replace />

  // The gate sends people here with a note about where they were going.
  const cameFromGate = !isSignup && Boolean(location.state?.from)

  async function submit(e) {
    e.preventDefault()
    if (busy) return

    // Check the form in the browser first, so obvious mistakes never reach the server.
    const errors = {
      name: isSignup && !name.trim(),
      email: !EMAIL_OK.test(email.trim()),
      password: isSignup ? password.length < 8 : !password,
    }
    setFieldErrors(errors)
    if (errors.name || errors.email || errors.password) return

    setServerError(null)
    setBusy(true)
    // If the server has not answered in 1.5s, explain why (free hosts go to sleep).
    const slowTimer = setTimeout(() => setSlow(true), 1500)

    try {
      if (isSignup) await signup(name.trim(), email.trim(), password)
      else await login(email.trim(), password)
      navigate(location.state?.from || '/monitors', { replace: true })
    } catch (err) {
      setServerError({ status: err.status, message: err.message })
      setBusy(false)
    } finally {
      clearTimeout(slowTimer)
      setSlow(false)
    }
  }

  function serverMessage() {
    if (!serverError) return null
    if (isSignup && serverError.status === 409) {
      return (
        <>
          An account with this email already exists. <Link to="/login" style={{ color: 'var(--down)' }}>Log in instead</Link>
        </>
      )
    }
    if (!isSignup && serverError.status === 401) {
      return (
        <>
          Invalid email or password. Check both and try again, or <Link to="/signup" style={{ color: 'var(--down)' }}>create an account</Link>.
        </>
      )
    }
    return serverError.message
  }

  return (
    <div className="split">
      <SidePanel />
      <main className="auth-main">
        <div className="auth-box">
          <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {isSignup ? 'Alert emails go to the email address you sign up with.' : 'Log in to see how your sites are doing.'}
          </p>

          <form className="auth-form" onSubmit={submit} noValidate>
            {cameFromGate && !serverError && (
              <div className="notice" role="status">
                Log in to see your monitors.
              </div>
            )}
            {serverError && (
              <div className="banner" role="alert">
                {serverMessage()}
              </div>
            )}

            {isSignup && (
              <div className="field">
                <label htmlFor="f-name">Name</label>
                <input
                  id="f-name"
                  className={fieldErrors.name ? 'input bad' : 'input'}
                  autoComplete="name"
                  placeholder="Sakshi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {fieldErrors.name && <span className="err">Enter your name</span>}
              </div>
            )}

            <div className="field">
              <label htmlFor="f-email">Email</label>
              <input
                id="f-email"
                className={fieldErrors.email ? 'input bad' : 'input'}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && <span className="err">Enter a full email address, like name@example.com</span>}
            </div>

            <PasswordField
              id="f-pw"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
              error={fieldErrors.password ? (isSignup ? 'Use at least 8 characters' : 'Enter your password') : ''}
            />

            <button className="btn btn-dark" type="submit" disabled={busy}>
              {busy ? (isSignup ? 'Creating account…' : 'Logging in…') : isSignup ? 'Create account' : 'Log in'}
            </button>

            {slow && (
              <div className="wake" role="status">
                <i aria-hidden="true" />
                <span>
                  <b style={{ fontWeight: 500 }}>Waking up the server…</b>
                  <br />
                  <span className="muted">The first request after a quiet spell can take up to 30 seconds. Please keep this page open.</span>
                </span>
              </div>
            )}

            <p className="muted" style={{ margin: 0, fontSize: 14, textAlign: 'center' }}>
              {isSignup ? (
                <>Already have an account? <Link to="/login">Log in</Link></>
              ) : (
                <>New to PulseCheck? <Link to="/signup">Create an account</Link></>
              )}
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
