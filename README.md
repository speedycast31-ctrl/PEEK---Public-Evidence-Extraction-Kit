# PEEK — Public Evidence Extraction Kit

🖥️ **Local-first OSINT workspace that maps a person's public social graph** — concentric-ring evidence map, plug-in search providers, hashed evidence archive, and a self-updating desktop shell.

> **Status: early development.** The design system and workspace canvas are in; the graph, search plugins and evidence vault are landing incrementally. See [`spec.md`](/spec.md) for the product spec and [`design.md`](/design.md) for the design system.

## What it is

Start from a single "center person". PEEK recursively discovers their public
online presence — handles, followers, mutuals, group memberships — up to three
levels deep, and draws the result as a concentric-ring map on a calibrated
field-terminal canvas. Every artifact it touches is archived with a content
hash, so what you end up with is not just a pretty graph: it's evidence.

- **Tracks** — one investigation = one workspace = one center person. All data
  lives on your machine (IndexedDB); nothing is uploaded anywhere.
- **Concentric-ring graph** — deterministic layout, HUD chrome, live
  coordinates. No physics, no noise.
- **Search plugins** — keyless, CORS-vetted providers: DuckDuckGo Instant
  Answer, GitHub, Mastodon, Wikipedia. The plugin contract is built for more.
- **Evidence notebook** — every post/page snapshot carries source, timestamp
  and SHA-256 integrity hash.
- **Self-updating desktop app** — built with [Tauri](https://tauri.app); every
  push to `main` is compiled by GitHub Actions into a signed release, and the
  installed app updates itself.

## Build it

```bash
npm install
npm run dev          # browser-only dev server
npm run tauri dev    # full desktop shell (needs the Rust toolchain)
npm run tauri build  # signed production bundle + updater artifacts
```

Prerequisites: Node 20+, Rust stable (`rustup`), and for the desktop shell no
other system dependencies on macOS.

## How the self-updating works

1. You (or we) push code to `main`.
2. GitHub Actions bumps a build version, compiles the app, signs the updater
   artifacts with the release key, and publishes a GitHub Release containing
   `latest.json` + installers.
3. The installed app checks
   `releases/latest/download/latest.json` on startup, verifies the signature,
   downloads, and restarts itself.

The signing key lives **only** in GitHub Actions secrets and the maintainer's
keychain — never in the repo.

## Repository layout

```
src/            React + TypeScript frontend (the workspace)
src-tauri/      Tauri desktop shell (Rust) + updater config
tests/          node:test suites (theme, config)
spec.md         Product specification
design.md       Cybercore "Field Terminal" design system
```

## Security & privacy notes

- All investigation data stays in your browser's local storage on your
  machine. The deployed app contains no telemetry and makes no calls except to
  the search providers you enable.
- Never commit API keys or tokens to this repo — it is public and history is
  forever. Secrets belong in GitHub Actions secrets or your local environment.

## License

[MIT](/LICENSE)
