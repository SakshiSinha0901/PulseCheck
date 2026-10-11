import { useEffect, useState } from 'react'

// Shows a small message when the server is slow (the free host "sleeps" and takes ~30s to wake).
export default function WakingBanner() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const on = () => setSlow(true)
    const off = () => setSlow(false)
    window.addEventListener('pulsecheck:slow', on)
    window.addEventListener('pulsecheck:fast', off)
    return () => {
      window.removeEventListener('pulsecheck:slow', on)
      window.removeEventListener('pulsecheck:fast', off)
    }
  }, [])

  if (!slow) return null

  return (
    <div
      role="status"
      style={{
        position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 50,
        maxWidth: 420, margin: '0 auto', padding: '12px 16px',
        background: 'var(--pend-bg)', color: 'var(--pend)',
        border: '1px solid var(--line)', borderRadius: 'var(--radius-lg, 10px)',
        fontSize: 14,
      }}
    >
      Waking the server up. The first request can take up to 30 seconds.
    </div>
  )
}
