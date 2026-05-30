import { parse } from 'node-html-parser'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { url } = getQuery(event)
  if (!url || typeof url !== 'string') {
    throw createError({ statusCode: 400, message: 'url query param is required' })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid URL' })
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw createError({ statusCode: 400, message: 'Only http/https URLs are supported' })
  }

  let html: string
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    })
    if (!response.ok) {
      throw createError({ statusCode: 502, message: `Upstream returned ${response.status}` })
    }
    html = await response.text()
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 502, message: 'Failed to fetch URL' })
  }

  const root = parse(html)

  // Try JSON-LD first — most structured and reliable
  let name = ''
  let image = ''
  let description = ''
  let price = ''
  let currency = ''

  const ldScripts = root.querySelectorAll('script[type="application/ld+json"]')
  for (const script of ldScripts) {
    try {
      const data = JSON.parse(script.text)
      const entries = Array.isArray(data) ? data : [data]
      for (const entry of entries) {
        if (entry['@type'] === 'Product') {
          name = entry.name || ''
          description = entry.description || ''
          const img = entry.image
          image = Array.isArray(img) ? img[0] : (img || '')
          const offers = Array.isArray(entry.offers) ? entry.offers[0] : entry.offers
          if (offers) {
            price = String(offers.price || '')
            currency = offers.priceCurrency || ''
          }
          break
        }
      }
      if (name) break
    } catch {
      // malformed JSON-LD — skip
    }
  }

  // Fall back to Open Graph meta tags
  const getMeta = (property: string) =>
    root.querySelector(`meta[property="${property}"]`)?.getAttribute('content') ||
    root.querySelector(`meta[name="${property}"]`)?.getAttribute('content') ||
    ''

  if (!name) name = getMeta('og:title') || getMeta('twitter:title') || root.querySelector('title')?.text.trim() || ''
  if (!image) image = getMeta('og:image') || getMeta('twitter:image') || ''
  if (!description) description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description') || ''
  if (!price) price = getMeta('og:price:amount') || getMeta('product:price:amount') || ''
  if (!currency) currency = getMeta('og:price:currency') || getMeta('product:price:currency') || ''

  if (!name) {
    throw createError({ statusCode: 422, message: 'Could not extract product data from this URL' })
  }

  return { name, image, description, price, currency, url }
})
