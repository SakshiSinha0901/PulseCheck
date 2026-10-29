import { Link } from 'react-router-dom'

// The PulseCheck mark: a small square with a heartbeat line, plus the name.
export function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  )
}

export default function Logo({ to = '/', onDark = false }) {
  return (
    <Link to={to} className={onDark ? 'brand brand-on-dark' : 'brand'}>
      <span className="brand-mark">
        <PulseIcon />
      </span>
      PulseCheck
    </Link>
  )
}
