// Reads and saves the light/dark choice.
// The choice is kept in the browser (localStorage) and applied as data-theme on <html>.
const KEY = 'pulsecheck-theme'

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Storage can be blocked (private windows). The theme still changes for this visit.
  }
}
