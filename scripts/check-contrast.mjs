// Checks WCAG 2.x contrast ratios for the colour pairs the site relies on.
// Reads the colour tokens straight from client/src/styles/tokens.css so the
// check always tests the values the site actually ships.
// Exits 1 if the file is missing, a token is missing, or any pair falls short.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const tokensPath = resolve(here, '..', 'client', 'src', 'styles', 'tokens.css')

// [label, foreground token, background token, minimum ratio]
const PAIRS = [
  ['ink/bg', 'ink', 'bg', 7],
  ['muted/bg', 'muted', 'bg', 4.5],
  ['navy/bg', 'navy', 'bg', 7],
  ['white/ink', 'white', 'ink', 7],
  ['room dim green/screen', 'room-green-dim', 'room-screen', 4.5],
  ['room green/screen', 'room-green', 'room-screen', 7],
]

function parseTokens(css) {
  const tokens = {}
  const pattern = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g
  let match
  while ((match = pattern.exec(css)) !== null) {
    tokens[match[1]] = match[2]
  }
  return tokens
}

function channelToLinear(value) {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  )
}

export function contrastRatio(hexA, hexB) {
  const la = relativeLuminance(hexA)
  const lb = relativeLuminance(hexB)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

function main() {
  let css
  try {
    css = readFileSync(tokensPath, 'utf8')
  } catch (error) {
    console.error(`Cannot read ${tokensPath}: ${error.message}`)
    return 1
  }

  const tokens = parseTokens(css)
  let failures = 0

  for (const [label, fgName, bgName, minimum] of PAIRS) {
    const fg = tokens[fgName]
    const bg = tokens[bgName]
    if (!fg || !bg) {
      console.error(`FAIL ${label}: missing token --${!fg ? fgName : bgName}`)
      failures += 1
      continue
    }
    const ratio = contrastRatio(fg, bg)
    const ok = ratio >= minimum
    if (!ok) failures += 1
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${label}: ${ratio.toFixed(2)}:1 (needs ${minimum}:1)`,
    )
  }

  if (failures > 0) {
    console.error(`\n${failures} contrast pair(s) failed.`)
    return 1
  }
  console.log('\nAll contrast pairs pass.')
  return 0
}

// Run only when executed directly, so the helpers can be imported in tests.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main()
}
