import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp']

function getImages(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const fullPath = path.join(dir, e.name)
    const relPath = basePath ? path.join(basePath, e.name) : e.name
    if (e.isDirectory()) {
      files.push(...getImages(fullPath, relPath))
    } else if (imageExtensions.some(ext => e.name.toLowerCase().endsWith(ext))) {
      files.push(relPath)
    }
  }
  return files.sort((a, b) => {
    const numA = parseInt(path.basename(a).replace(/\D/g, ''), 10) || 0
    const numB = parseInt(path.basename(b).replace(/\D/g, ''), 10) || 0
    return numA - numB || a.localeCompare(b)
  })
}

const petunisAdsOrder = ['1.png', '2.png', '3.png', 'Primetime Discounts (Presentation).png', '4.png', '5.png', '7.png', '8.png', '13.png']

function writeImageList(folderName) {
  const folder = path.join(__dirname, `../public/pdfs/${folderName}`)
  if (!fs.existsSync(folder)) return
  let files = getImages(folder)
  if (folderName === 'petunis-ads' && petunisAdsOrder.length) {
    const orderMap = new Map(petunisAdsOrder.map((name, i) => [name, i]))
    files = [...files].sort((a, b) => {
      const idxA = orderMap.has(a) ? orderMap.get(a) : 999
      const idxB = orderMap.has(b) ? orderMap.get(b) : 999
      return idxA !== idxB ? idxA - idxB : a.localeCompare(b)
    })
  }
  const output = path.join(__dirname, `../src/data/${folderName}.json`)
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, JSON.stringify(files, null, 0))
  console.log(`Found ${files.length} images in ${folderName}:`, files)
}

writeImageList('petunis-teams')
writeImageList('petunis-ads')
writeImageList('petunis-designfiles')
