#!/usr/bin/env node

/**
 * Image Compression Script
 * 
 * This script compresses PNG images in the public folder to reduce file sizes.
 * It uses sharp for compression (install with: npm install --save-dev sharp)
 * 
 * Usage: node scripts/compress-images.js [options]
 * Options:
 *   --quality <number>  Compression quality (0-100, default: 80)
 *   --format <format>   Output format: png, webp, or both (default: png)
 *   --dry-run          Show what would be compressed without actually doing it
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const qualityArg = args.find(arg => arg.startsWith('--quality='))
const formatArg = args.find(arg => arg.startsWith('--format='))

const quality = qualityArg ? parseInt(qualityArg.split('=')[1]) : 80
const format = formatArg ? formatArg.split('=')[1] : 'png'

let sharp
try {
  sharp = (await import('sharp')).default
} catch (e) {
  console.error('❌ Error: sharp is not installed.')
  console.log('\n📦 Install it with: npm install --save-dev sharp')
  console.log('   Or use an alternative:')
  console.log('   - ImageOptim (macOS): https://imageoptim.com/')
  console.log('   - TinyPNG CLI: npm install -g tinypng-cli')
  process.exit(1)
}

function getAllPngFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllPngFiles(filePath, fileList)
      }
    } else if (file.endsWith('.png')) {
      fileList.push(filePath)
    }
  })
  
  return fileList
}

async function compressImage(filePath, quality, format) {
  const originalSize = fs.statSync(filePath).size
  const ext = path.extname(filePath)
  const dir = path.dirname(filePath)
  const name = path.basename(filePath, ext)

  try {
    let image = sharp(filePath)

    // Decide output target
    let outputPath = filePath

    if (format === 'webp' || format === 'both') {
      outputPath = path.join(dir, `${name}.webp`)
      image = image.webp({ quality })
    } else {
      image = image.png({ 
        quality,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
    }
    
    if (dryRun) {
      console.log(`📋 Would compress: ${filePath}`)
      return { originalSize, newSize: originalSize, saved: 0 }
    }

    let newSize = originalSize

    if (format === 'png') {
      // In-place overwrite for PNG: write to a buffer, then back to the same file.
      const buffer = await image.toBuffer()
      fs.writeFileSync(filePath, buffer)
      newSize = fs.statSync(filePath).size
      const saved = originalSize - newSize
      const percent = ((saved / originalSize) * 100).toFixed(1)

      console.log(`✅ Compressed: ${filePath} (${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB, saved ${percent}%)`)
      return { originalSize, newSize, saved }
    }

    // For webp / both: write to a new file
    await image.toFile(outputPath)
    newSize = fs.statSync(outputPath).size
    const saved = originalSize - newSize
    const percent = ((saved / originalSize) * 100).toFixed(1)

    console.log(`✅ Compressed (new file): ${outputPath} (${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB, saved ${percent}%)`)
    return { originalSize, newSize, saved }
  } catch (error) {
    console.error(`❌ Error compressing ${filePath}:`, error.message)
    return { originalSize, newSize: originalSize, saved: 0 }
  }
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public')
  
  if (!fs.existsSync(publicDir)) {
    console.error('❌ public directory not found')
    process.exit(1)
  }
  
  console.log('🔍 Scanning for PNG images...')
  const pngFiles = getAllPngFiles(publicDir)
  
  if (pngFiles.length === 0) {
    console.log('ℹ️  No PNG files found')
    return
  }
  
  console.log(`📦 Found ${pngFiles.length} PNG files`)
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n')
  }
  console.log('')
  
  let totalOriginal = 0
  let totalNew = 0
  
  for (const file of pngFiles) {
    const result = await compressImage(file, quality, format)
    totalOriginal += result.originalSize
    totalNew += result.newSize
  }
  
  if (!dryRun) {
    const totalSaved = totalOriginal - totalNew
    const totalPercent = ((totalSaved / totalOriginal) * 100).toFixed(1)
    console.log('')
    console.log('📊 Summary:')
    console.log(`   Original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   New size: ${(totalNew / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   Saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${totalPercent}%)`)
  }
}

main().catch(console.error)
