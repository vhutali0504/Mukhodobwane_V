// Fails if the entry chunk, or any chunk it imports statically, contains three.js.
// Run after `vite build` (build.manifest is on). Dynamic imports are allowed: the
// room and the error-logging SDK live in lazy chunks.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(import.meta.dirname, '..', 'dist')
const manifest = JSON.parse(readFileSync(join(dist, '.vite', 'manifest.json'), 'utf8'))

const entry = Object.values(manifest).find((c) => c.isEntry)
if (!entry) {
  console.error('check:bundle: no entry chunk in manifest')
  process.exit(1)
}

const seen = new Set()
const bad = []
function visit(key) {
  if (seen.has(key)) return
  seen.add(key)
  const chunk = manifest[key]
  const code = readFileSync(join(dist, chunk.file), 'utf8')
  // three.js markers that survive minification: its global revision flag and renderer messages.
  if (/__THREE__|THREE\.WebGLRenderer/.test(code)) bad.push(chunk.file)
  for (const dep of chunk.imports ?? []) visit(dep)
}
visit(Object.keys(manifest).find((k) => manifest[k] === entry))

if (bad.length) {
  console.error(`check:bundle: three.js found in static entry chunks: ${[...new Set(bad)].join(', ')}`)
  process.exit(1)
}
console.log(`entry chunk free of three.js (${seen.size} static chunk${seen.size === 1 ? '' : 's'} checked)`)
