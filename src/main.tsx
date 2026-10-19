import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted variable fonts, bundled by Vite. Deliberately not loaded from
// Google Fonts: an evidence tool must not phone home on every page load, and
// the workspace should render identically offline.
// Orbitron Variable (SIL OFL) is the project font — every piece of UI text
// (design.md §4). JetBrains Mono Variable is its self-hosted fallback for
// glyphs Orbitron lacks. Fraunces and Instrument Sans are retired from the
// UI (dependencies stay installed; cleanup deferred — see design.md §8).
import '@fontsource-variable/orbitron/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
