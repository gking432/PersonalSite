#!/usr/bin/env node
// Renders resume/resume.html to public/Gunnar-Neuman-Resume.pdf, which is what the
// site's Resume button serves. Chromium's print pipeline produces real selectable
// text, so applicant tracking systems can parse it; edit the HTML and re-run.
//
//   node scripts/build-resume-pdf.mjs

import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { statSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
const source = resolve(here, '../resume/resume.html')
const output = resolve(here, '../public/Gunnar-Neuman-Resume.pdf')

const configuredBrowser = process.env.RESUME_CHROMIUM_PATH
const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const bundledBrowser = '/opt/pw-browsers/chromium'
const executablePath = configuredBrowser
  || (process.platform === 'darwin' ? localChrome : bundledBrowser)

const browser = await chromium.launch({ executablePath })
const page = await browser.newPage()
await page.goto(pathToFileURL(source).href, { waitUntil: 'load' })
await page.pdf({
  path: output,
  format: 'Letter',
  printBackground: true,
  scale: 0.9,
  margin: { top: '0.5in', bottom: '0.5in', left: '0.6in', right: '0.6in' },
})
await browser.close()

const { size } = statSync(output)
console.log(`Wrote ${output} (${(size / 1024).toFixed(0)} KB)`)
