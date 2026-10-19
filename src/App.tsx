import BrandMark from './components/BrandMark'
import HudFrame from './components/HudFrame'
import WorkspaceCanvas from './components/WorkspaceCanvas'

/**
 * PEEK application shell.
 *
 * The workspace canvas is the drawing substrate; the HUD frame and the
 * wordmark are the chrome layered on top of it so far. Toolbars, the
 * case/intel panels and the evidence graph layer mount here next.
 */
function App() {
  return (
    <main className="app-shell">
      <WorkspaceCanvas />
      <HudFrame />
      <BrandMark />
    </main>
  )
}

export default App