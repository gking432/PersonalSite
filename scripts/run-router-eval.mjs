#!/usr/bin/env node
// Runs the Customer Request Router against the evaluation set and writes the
// results the AI Lab renders. Nothing about the published score is hand-written:
// if this has not been run, the Lab says so instead of showing a number.
//
//   OPENAI_API_KEY=… node scripts/run-router-eval.mjs
//
// Re-run it after changing the classifier prompt or the category list, and
// commit the regenerated JSON so the published number matches the live build.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { classifyRequest } from '../api/lab-issue.js'
import { routerEvalCases } from '../src/data/routerEvalCases.js'

const here = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(here, '../src/data/routerEvalResults.json')

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is required to run the evaluation.')
  process.exit(1)
}

const results = []

for (const testCase of routerEvalCases) {
  process.stdout.write(`${testCase.id} … `)
  try {
    const classification = await classifyRequest({
      request: testCase.request,
      safetyIdentifier: 'router-eval',
    })
    const actual = classification.category
    const pass = actual === testCase.expected
    results.push({
      id: testCase.id,
      request: testCase.request,
      expected: testCase.expected,
      actual,
      pass,
      note: testCase.note,
      urgency: classification.urgency,
    })
    console.log(pass ? 'pass' : `FAIL (got ${actual})`)
  } catch (error) {
    results.push({
      id: testCase.id,
      request: testCase.request,
      expected: testCase.expected,
      actual: null,
      pass: false,
      note: testCase.note,
      error: error?.message || 'Request failed',
    })
    console.log(`ERROR (${error?.message || 'request failed'})`)
  }
}

const passed = results.filter((row) => row.pass).length
const payload = {
  runAt: new Date().toISOString(),
  model: process.env.OPENAI_LAB_MODEL || 'gpt-5.6-sol',
  total: results.length,
  passed,
  results,
}

writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`\n${passed}/${results.length} correct. Written to ${outputPath}`)
console.log('Write the failure analysis by hand in AILab.jsx; do not guess at it.')
