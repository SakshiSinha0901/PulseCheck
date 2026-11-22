import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Logo from '../components/Logo'
import './Landing.css'

// TODO before launch: put your real contact email here (it is shown in the footer).
const CONTACT_EMAIL = '[contact email]'

const STEPS = [
  { title: 'Add your website', text: 'Paste your web address. That is all we need.' },
  { title: 'We check it every 5 minutes', text: 'PulseCheck opens your site on a schedule and records if it answered, and how fast.' },
  { title: 'You get an email', text: 'The moment a check fails you get an email, and another when the site is back.' },
]

const FAQ = [
  { q: 'How often do you check my website?', a: 'Every 5 minutes, all day. If a check fails, we mark the site as down.' },
  { q: 'How will I know if it goes down?', a: 'We send an email to the address you choose, when your site goes down and again when it comes back up.' },
  { q: 'Does it cost anything?', a: 'No. PulseCheck is free to start and you do not need a credit card.' },
  { q: 'What do you do with my email address?', a: 'We use it only to send you alerts about your websites. You can read the full policy on the Privacy page.' },
  { q: 'Can I delete my account?', a: 'Yes, at any time from Settings. Your websites and their check history are deleted with it.' },
]

// Sample data for the example card in the hero. "d" = a failed check, "u" = a good one.
// The two numbers on each site are when its part of the card builds up while you scroll (0 = start, 1 = end).
const UP = 'u'.repeat(20)
const SAMPLE = [
  { name: 'Main website', url: 'example.com', down: false, ticks: UP, uptime: '99.9%', row: [0.1, 0.3], bar: [0.2, 0.45] },
  { name: 'Checkout API', url: 'api.example.com/health', down: true, ticks: 'u'.repeat(15) + 'd'.repeat(5), uptime: '94.2%', row: [0.35, 0.55], bar: [0.45, 0.7] },
  { name: 'Docs', url: 'docs.example.com', down: false, ticks: UP, uptime: '100%', row: [0.6, 0.8], bar: [0.7, 0.9] },
]

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </svg>
  )
}

// The example Monitors card. As the visitor scrolls, it builds itself:
// the sites appear one by one, the check bars fill in, and the red "down" alert arrives last.
// Only fading and sliding are used (cheap for the browser). It is switched off on phones
// and for people whose device is set to "reduce motion".
function usePreviewMotion(cardRef) {
  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return undefined
    const parts = [...card.querySelectorAll('[data-a]')]
    const bars = [...card.querySelectorAll('[data-s]')]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const phone = window.matchMedia('(max-width: 520px)')
    let frame = 0

    const range = (el, key) => el.getAttribute(key).split(',').map(Number)
    const part = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)))
    const ease = (x) => 1 - Math.pow(1 - x, 3)

    function showAll() {
      parts.forEach((el) => el.removeAttribute('style'))
      bars.forEach((el) => el.removeAttribute('style'))
    }

    function update() {
      frame = 0
      if (reduce.matches || phone.matches) {
        showAll()
        return
      }
      const box = card.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = Math.min(1, Math.max(0, (vh - box.top) / (vh * 0.95)))
      parts.forEach((el) => {
        const [from, to] = range(el, 'data-a')
        const x = ease(part(progress, from, to))
        const dir = el.hasAttribute('data-drop') ? -16 : 16
        el.style.opacity = String(x)
        el.style.transform = `translateY(${dir * (1 - x)}px)`
      })
      bars.forEach((el) => {
        const [from, to] = range(el, 'data-s')
        const x = ease(part(progress, from, to))
        el.style.transformOrigin = 'left center'
        el.style.transform = `scaleX(${x})`
        el.style.opacity = x ? '1' : '0'
      })
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [cardRef])
}

function PreviewCard() {
  const ref = useRef(null)
  usePreviewMotion(ref)
  return (
    <div className="card lp-card" ref={ref} aria-label="Example of the Monitors page">
      <div className="lp-card-head" data-a="0,0.15">
        <b>Monitors</b>
        <span className="lp-hint">Example data</span>
      </div>
      <div className="lp-alert" role="presentation" data-a="0.75,0.95" data-drop="1">
        <AlertIcon />
        <b>1 site is down</b>
      </div>
      {SAMPLE.map((s) => (
        <div className="lp-site" key={s.name} data-a={s.row.join(',')}>
          <div className="lp-site-top">
            <div>
              <div className="lp-site-name">{s.name}</div>
              <div className="mono lp-site-url">{s.url}</div>
            </div>
            <span className={s.down ? 'pill pill-down' : 'pill pill-up'}>{s.down ? 'Down' : 'Up'}</span>
          </div>
          <div className="lp-ticks" role="img" aria-label="Last 20 checks" data-s={s.bar.join(',')}>
            {s.ticks.split('').map((c, i) => (
              <span key={i} className={c === 'd' ? 'd' : ''} />
            ))}
          </div>
          <div className="lp-hint">Uptime {s.uptime}</div>
        </div>
      ))}
    </div>
  )
}

export default function Landing() {
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    document.title = 'PulseCheck – Website uptime monitor with email alerts'
  }, [])

  return (
    <div className="lp">
      <section className="lp-hero">
        <header className="lp-nav">
          <Logo />
          <nav aria-label="Main">
            <a className="lp-link lp-hide-phone" href="#how">How it works</a>
            <a className="lp-link lp-hide-phone" href="#faq">FAQ</a>
            {isLoggedIn ? (
              <Link className="btn btn-dark" to="/monitors">Open Monitors</Link>
            ) : (
              <>
                <Link className="lp-link" to="/login">Log in</Link>
                <Link className="btn btn-dark lp-hide-phone" to="/signup">Start free</Link>
              </>
            )}
          </nav>
        </header>

        <div className="lp-hero-text">
          <span className="lp-eyebrow">For developers and small teams</span>
          <h1>Know the moment your site goes down.</h1>
          <p className="lp-sub">
            PulseCheck checks your website every 5 minutes and emails you when it stops working, so you hear it from us and
            not from a customer.
          </p>
          <div className="lp-buttons">
            <Link className="btn btn-dark lp-big" to={isLoggedIn ? '/monitors' : '/signup'}>
              {isLoggedIn ? 'Open your Monitors' : 'Start monitoring free'}
            </Link>
            <a className="btn btn-line lp-big" href="#how">See how it works</a>
          </div>
          <p className="lp-hint">No credit card needed.</p>
          <ul className="lp-proof">
            <li><Check /> Checks every 5 minutes</li>
            <li><Check /> Email when it’s down and when it’s back</li>
            <li><Check /> Free to start</li>
          </ul>
        </div>

        <div className="lp-preview">
          <PreviewCard />
        </div>
      </section>

      <section className="lp-how" id="how">
        <div className="lp-head">
          <span className="lp-eyebrow">How it works</span>
          <h2>Three steps, then you can forget about it</h2>
        </div>
        <ol className="lp-steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="lp-num">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p className="muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="lp-center">
          <Link className="btn btn-dark lp-big" to="/signup">Start monitoring free</Link>
        </div>
      </section>

      <section className="lp-faq" id="faq">
        <div className="lp-faq-grid">
          <div className="lp-head lp-head-left">
            <span className="lp-eyebrow">Questions</span>
            <h2>Things people ask before signing up</h2>
          </div>
          <div className="lp-qa-list">
            {FAQ.map((f) => (
              <div className="lp-qa" key={f.q}>
                <h3>{f.q}</h3>
                <p className="muted">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-final">
        <h2>Stop finding out from your customers.</h2>
        <p className="muted">Add your first website in under a minute.</p>
        <Link className="btn btn-dark lp-big" to="/signup">Start monitoring free</Link>
        <p className="lp-hint">No credit card needed.</p>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-about">
            <Logo onDark />
            <p>A simple, honest website monitor. Built by Sakshi, a final-year computer science student in India.</p>
          </div>
          <div className="lp-footer-links">
            <div>
              <span className="lp-eyebrow">Company</span>
              <Link to="/about">About</Link>
              {CONTACT_EMAIL.includes('@') ? (
                <a href={`mailto:${CONTACT_EMAIL}`}>Contact: {CONTACT_EMAIL}</a>
              ) : (
                <span className="lp-plain">Contact: {CONTACT_EMAIL}</span>
              )}
            </div>
            <div>
              <span className="lp-eyebrow">Legal</span>
              <Link to="/privacy">Privacy policy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <p className="lp-copy">© 2026 PulseCheck</p>
      </footer>
    </div>
  )
}
