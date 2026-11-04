import { useEffect } from 'react'
import { useLocation } from 'react-router'

export const SITE_URL = 'https://mukhodobwanevhutalihandivho.netlify.app'

function setMeta(selector, attr, key, content) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!href) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Per-page head tags. `noindex` pages (thanks, 404) get robots noindex and no
// canonical; every other page gets a canonical link and no robots tag.
export function useDocumentMeta({ title, description, noindex = false }) {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    const robots = document.head.querySelector('meta[name="robots"]')
    if (noindex) {
      setMeta('meta[name="robots"]', 'name', 'robots', 'noindex')
      setCanonical(null)
    } else {
      robots?.remove()
      setCanonical(`${SITE_URL}${pathname}`)
    }
  }, [title, description, noindex, pathname])
}
