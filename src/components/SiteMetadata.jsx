import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteMetadata, siteOrigin } from '../siteMetadata'

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value))
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

export default function SiteMetadata() {
  const { pathname } = useLocation()

  useEffect(() => {
    const metadata = siteMetadata[pathname]
    if (!metadata) return

    const canonical = `${siteOrigin}${pathname === '/' ? '/' : pathname}`
    document.title = metadata.title
    upsertMeta('meta[name="description"]', { name: 'description', content: metadata.description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: metadata.title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: metadata.description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    upsertCanonical(canonical)
  }, [pathname])

  return null
}
