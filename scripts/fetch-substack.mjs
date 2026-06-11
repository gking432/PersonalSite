// Build-time Substack sync.
// Fetches the publication's RSS feed and writes a normalized list of posts to
// src/data/writing-posts.json. Designed to NEVER break the build: on any
// failure (no network, CORS, bad feed) it leaves the existing JSON in place.
//
// Configure the publication via the SUBSTACK_URL env var, or the default below.
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/writing-posts.json')

// TODO: confirm this is the correct Substack publication URL.
const SUBSTACK_URL = (process.env.SUBSTACK_URL || 'https://gunnarneuman.substack.com').replace(/\/$/, '')
const FEED_URL = `${SUBSTACK_URL}/feed`
const MAX_POSTS = 12

function decode(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? decode(m[1]) : ''
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim()
}

function excerptFrom(html, max = 200) {
  const text = stripHtml(html)
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

function firstImage(html = '') {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return m ? m[1] : ''
}

function parseFeed(xml) {  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || []
  return items.slice(0, MAX_POSTS).map((block) => {
    const content = pick(block, 'content:encoded') || pick(block, 'description')
    const pub = pick(block, 'pubDate')
    const date = pub ? new Date(pub) : null
    const enclosure = (block.match(/<enclosure[^>]+url=["']([^"']+)["']/i) || [])[1] || ''
    return {
      title: pick(block, 'title'),
      url: pick(block, 'link'),
      date: date && !isNaN(date) ? date.toISOString() : '',
      dateLabel:
        date && !isNaN(date)
          ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : '',
      excerpt: excerptFrom(content),
      image: enclosure || firstImage(content),
    }
  })
}

async function main() {
  try {
    const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'portfolio-build' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    const posts = parseFeed(xml).filter((p) => p.title && p.url)
    if (!posts.length) throw new Error('No items parsed from feed')

    if (!existsSync(dirname(OUT))) await mkdir(dirname(OUT), { recursive: true })
    await writeFile(OUT, JSON.stringify(posts, null, 2) + '\n')
    console.log(`[substack] wrote ${posts.length} posts from ${FEED_URL}`)
  } catch (err) {
    // Never fail the build — keep whatever is already committed.
    if (!existsSync(OUT)) {
      await writeFile(OUT, '[]\n')
      console.warn(`[substack] ${err.message}; wrote empty list (no existing file)`)
    } else {
      console.warn(`[substack] ${err.message}; keeping existing writing-posts.json`)
    }
  }
}

export { parseFeed }

// Only fetch when run directly (so the parser can be imported in tests)
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
