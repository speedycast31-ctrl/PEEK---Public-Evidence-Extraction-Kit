import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = 'speedycast31-ctrl/PEEK---Public-Evidence-Extraction-Kit'

/**
 * The Tauri desktop shell must exist and be wired for signed self-updates:
 * a valid config pointing at this repo's release channel, icons on disk,
 * and the updater plugin registered in the Rust entry point.
 */
test('tauri.conf.json exists and is valid', () => {
  const conf = JSON.parse(readFileSync(join(root, 'src-tauri/tauri.conf.json'), 'utf8'))
  assert.equal(conf.productName, 'PEEK')
  assert.match(conf.identifier, /^[a-z][a-z0-9]*(\.[a-z0-9-]+)+$/)
  assert.equal(conf.build.frontendDist, '../dist')
})

test('updater is wired to this repo\'s release channel', () => {
  const conf = JSON.parse(readFileSync(join(root, 'src-tauri/tauri.conf.json'), 'utf8'))
  assert.equal(conf.bundle.createUpdaterArtifacts, true)
  assert.ok(conf.plugins?.updater?.pubkey, 'updater pubkey must be present')
  assert.deepEqual(conf.plugins.updater.endpoints, [
    `https://github.com/${repo}/releases/latest/download/latest.json`,
  ])
})

test('every configured bundle icon exists on disk', () => {
  const conf = JSON.parse(readFileSync(join(root, 'src-tauri/tauri.conf.json'), 'utf8'))
  for (const icon of conf.bundle.icon) {
    assert.ok(existsSync(join(root, 'src-tauri', icon)), `missing icon: ${icon}`)
  }
})

test('Cargo.toml declares the updater plugin', () => {
  const cargo = readFileSync(join(root, 'src-tauri/Cargo.toml'), 'utf8')
  assert.match(cargo, /tauri-plugin-updater\s*=/)
})

test('main.rs registers the updater plugin and restarts after install', () => {
  const main = readFileSync(join(root, 'src-tauri/src/main.rs'), 'utf8')
  assert.match(main, /tauri_plugin_updater/)
  assert.match(main, /download_and_install/)
  assert.match(main, /restart/)
})
