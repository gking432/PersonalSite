import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { publicRoutes, siteOrigin } from '../src/siteMetadata.js'

const projectRoot = resolve(import.meta.dirname, '..')
const distRoot = join(projectRoot, 'dist')
const serverEntry = join(distRoot, 'server', 'entry-server.js')
const template = await readFile(join(distRoot, 'index.html'), 'utf8')
const { render } = await import(pathToFileURL(serverEntry).href)

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function pageFile(pathname) {
  if (pathname === '/') return join(distRoot, 'index.html')
  return join(distRoot, `${pathname.slice(1)}.html`)
}

for (const route of publicRoutes) {
  const canonical = `${siteOrigin}${route.path === '/' ? '/' : route.path}`
  const appHtml = render(route.path)
  const socialMetadata = [
    `    <link rel="canonical" href="${escapeHtml(canonical)}" />`,
    '    <meta property="og:type" content="website" />',
    `    <meta property="og:title" content="${escapeHtml(route.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(route.description)}" />`,
    `    <meta property="og:url" content="${escapeHtml(canonical)}" />`,
    '    <meta name="twitter:card" content="summary" />',
  ].join('\n')

  const html = template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace('  </head>', `${socialMetadata}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)

  const destination = pageFile(route.path)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, html)
}

await rm(join(distRoot, 'server'), { recursive: true, force: true })
console.log(`Prerendered ${publicRoutes.length} public routes.`)
