// Cookie-free page counting with GoatCounter. A no-op unless a site code is given.
const SCRIPT_SRC = 'https://gc.zgo.at/count.js'

let ready = false
let pending = null

function flush() {
  if (pending !== null && typeof window.goatcounter?.count === 'function') {
    window.goatcounter.count({ path: pending })
    pending = null
  }
}

export function initAnalytics(code) {
  if (!code || typeof document === 'undefined') return
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return
  // no_onload: the SPA reports its own page views (trackPageview) on every route change.
  window.goatcounter = { no_onload: true }
  const s = document.createElement('script')
  s.async = true
  s.src = SCRIPT_SRC
  s.dataset.goatcounter = `https://${code}.goatcounter.com/count`
  s.addEventListener('load', () => {
    ready = true
    flush()
  })
  document.head.appendChild(s)
}

// Safe to call before init or when analytics is off: it then does nothing.
export function trackPageview(path) {
  if (!window.goatcounter) return
  pending = path
  if (ready) flush()
}
