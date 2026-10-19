/**
 * Design-contract tests for the PEEK Cybercore theme.
 *
 * The theme's observable behavior lives in styles, canvas paint config and
 * decorative markup, so the contract is asserted against those sources. Each
 * test maps to an acceptance criterion in design-spec.md. Run: `npm test`
 * (Node's built-in runner — no test dependencies).
 */

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = new URL('..', import.meta.url)
const read = (path) => readFile(fileURLToPath(new URL(path, root)), 'utf8')

const exists = async (path) => {
  try {
    return await read(path)
  } catch {
    return null
  }
}

test('cream stays the primary surface (spec AC 4)', async () => {
  const css = await read('src/index.css')
  assert.match(css, /--paper:\s*#faf5ec/, '--paper token must remain cream #faf5ec')
  const grid = await read('src/config/workspace.ts')
  assert.match(grid, /background:\s*'#faf5ec'/, 'canvas background must remain cream')
  const html = await read('index.html')
  assert.match(
    html,
    /name="theme-color"\s+content="#faf5ec"/i,
    'theme-color meta must stay cream',
  )
})

test('cybercore tokens: amber phosphor + status-only green + project font (spec AC 2/3)', async () => {
  const css = await read('src/index.css')
  assert.match(css, /--accent:\s*#c2560f/, 'amber phosphor accent token')
  assert.match(css, /--signal:\s*#2e7d54/, 'phosphor green status token')
  const allCss = (
    await Promise.all([
      read('src/index.css'),
      read('src/components/HudFrame.css'),
      read('src/components/BrandMark.css'),
    ])
  ).join('\n')
  assert.match(
    allCss,
    /var\(--accent-glow\)/,
    'accent glow token is referenced (no orphans)',
  )
  assert.match(
    css,
    /--font:\s*'Orbitron Variable'[^;]*'JetBrains Mono Variable'/,
    'project font token leads with Orbitron, JetBrains Mono retained as fallback',
  )
})

test('CRT overlay + accessibility hooks (spec AC 2/8)', async () => {
  const css = await read('src/index.css')
  assert.match(css, /repeating-linear-gradient/, 'scanline layer present')
  assert.match(css, /prefers-reduced-transparency/, 'reduced-transparency honoured')
  assert.match(css, /prefers-reduced-motion/, 'reduced-motion honoured')
  assert.match(css, /@keyframes hud-pulse/, 'LED pulse keyframe')
  assert.match(css, /@keyframes hud-blink/, 'caret blink keyframe')
})

test('grid config carries crosshair + edge-coordinate paint (spec AC 5)', async () => {
  const grid = await read('src/config/workspace.ts')
  assert.match(grid, /crosshair:\s*'#c9a06a'/, 'crosshair tick colour')
  assert.match(grid, /crosshairSize:\s*\d/, 'crosshair arm size')
  assert.match(grid, /coordColor:\s*'#a8916f'/, 'edge coordinate colour')
  assert.match(grid, /coordFont:[^]*Orbitron/, 'coordinate font uses the project font')
  assert.match(grid, /coordFont:[^]*monospace/, 'coordinate font has mono fallback')
  assert.match(grid, /coordInset:\s*\d/, 'coordinate inset from edges')
})

test('canvas paints crosshairs, padded coordinates, redraws after fonts load (spec AC 5)', async () => {
  const canvas = await read('src/components/WorkspaceCanvas.tsx')
  assert.match(canvas, /strokeCrosshairs/, 'crosshair painting at major intersections')
  assert.match(canvas, /paintEdgeCoords/, 'edge coordinate painting')
  assert.match(canvas, /padStart\(4/, 'coordinates zero-padded to 4 digits')
  assert.match(canvas, /fonts[^]*ready/, 're-render once webfonts are ready')
})

test('HUD chrome: brackets, readouts, status bar, live coords (spec AC 6/9)', async () => {
  const tsx = await exists('src/components/HudFrame.tsx')
  assert.ok(tsx, 'HudFrame.tsx exists')
  for (const corner of ['tl', 'tr', 'bl', 'br']) {
    assert.match(tsx, new RegExp(`hud__corner--${corner}`), `corner bracket ${corner}`)
  }
  assert.match(tsx, /aria-hidden/, 'HUD is decorative: aria-hidden')
  assert.match(tsx, /SCAN:IDLE/, 'top-right scan readout (spec AC 6)')
  assert.match(tsx, /hud__caret/, 'terminal caret element (spec AC 6)')
  assert.match(tsx, /PEEK:\/\/WORKSPACE/, 'workspace tag in status bar')
  assert.match(tsx, /GRID 20\/100/, 'grid pitch readout')
  assert.match(tsx, /LINK:LOCAL/, 'offline link readout')
  assert.match(tsx, /LIVE/, 'live status readout')
  assert.match(tsx, /requestAnimationFrame/, 'coords update via rAF (no re-render per move)')
  const css = await exists('src/components/HudFrame.css')
  assert.ok(css, 'HudFrame.css exists')
  assert.match(css, /pointer-events:\s*none/, 'HUD never intercepts canvas gestures')
  assert.match(css, /font-family:\s*var\(--font\)/, 'HUD set in the project font')
  assert.doesNotMatch(css, /var\(--mono\)/, 'retired mono token is gone')
  assert.match(css, /prefers-reduced-transparency/, 'status bar survives reduced transparency')
})

test('brand lockup: project font, // descriptor, status LED (spec AC 7)', async () => {
  const tsx = await read('src/components/BrandMark.tsx')
  assert.match(tsx, /\/\//, 'descriptor carries the // comment-marker motif')
  assert.match(tsx, /SYS\.NOMINAL/, 'status row present')
  assert.match(tsx, /brand__led/, 'status LED present')
  const css = await read('src/components/BrandMark.css')
  assert.doesNotMatch(css, /var\(--mono\)/, 'retired mono token is gone')
  assert.match(css, /font-family:\s*var\(--font\)/, 'lockup set in the project font')
})

test('type wiring: Orbitron project font in, serif out (spec AC 3/7)', async () => {
  const main = await read('src/main.tsx')
  assert.match(main, /@fontsource-variable\/orbitron/, 'Orbitron (project font) imported')
  assert.match(main, /@fontsource-variable\/jetbrains-mono/, 'JetBrains Mono retained as fallback')
  assert.doesNotMatch(main, /@fontsource-variable\/fraunces/, 'serif no longer imported')
})

test('favicon: cream tile with amber reticle (spec AC 10)', async () => {
  const svg = await read('public/favicon.svg')
  assert.match(svg, /#faf5ec/, 'cream tile background')
  assert.match(svg, /#c2560f/, 'amber reticle strokes/fill')
  assert.match(svg, /opacity="0\.\d+"/, 'layered reticle like the brand glyph')
})

test('design.md documents the system with cream as primary (spec AC 1/3)', async () => {
  const doc = await read('design.md')
  assert.match(doc, /Cybercore/i, 'names the theme')
  assert.match(doc, /#faf5ec/, 'names cream as the primary colour')
  assert.match(doc, /crosshair/i, 'documents the crosshair grid')
  assert.match(doc, /JetBrains Mono/, 'documents the type system')
})
