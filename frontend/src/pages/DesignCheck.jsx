import { useState } from 'react'
import { getTheme, setTheme } from '../theme/theme'

// Temporary check page for step 2. It proves the fonts, colours and theme switch work.
// We replace it with real pages and routes in the next steps.
export default function DesignCheck() {
  const [theme, setThemeState] = useState(getTheme())

  function choose(next) {
    setTheme(next)
    setThemeState(next)
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 16px' }}>
      <h1 style={{ fontSize: 52 }}>PulseCheck design check</h1>
      <p className="muted">If you can read this in Inter and the colours change below, step 2 works.</p>

      <div style={{ display: 'flex', gap: 8, margin: '24px 0' }}>
        <button className={theme === 'light' ? 'btn btn-dark' : 'btn btn-line'} onClick={() => choose('light')}>
          Light
        </button>
        <button className={theme === 'dark' ? 'btn btn-dark' : 'btn btn-line'} onClick={() => choose('dark')}>
          Dark
        </button>
      </div>

      <section className="card" style={{ padding: 24, display: 'grid', gap: 12 }}>
        <h2 style={{ fontSize: 40 }}>99.6%</h2>
        <span className="mono muted">https://api.example.com/health</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="pill pill-up">Up</span>
          <span className="pill pill-down">Down</span>
          <span className="pill pill-pend">Waiting</span>
        </div>
      </section>
    </main>
  )
}
