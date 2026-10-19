import { useEffect, useRef } from 'react'
import './HudFrame.css'

/** Formats a raw pixel value as a four-digit HUD readout ("0142"). */
function padCoord(value: number): string {
  return Math.max(0, Math.round(value)).toString().padStart(4, '0')
}

/**
 * Instrument chrome layered over the workspace: viewport corner brackets, a
 * top-right scan readout and a bottom status bar with live pointer
 * coordinates. Purely decorative instrumentation — the whole tree is
 * `aria-hidden` and `pointer-events: none`, so canvas gestures pass through.
 *
 * Coordinates are written straight into a ref'd span on requestAnimationFrame,
 * so pointer movement never re-renders the component tree.
 */
function HudFrame() {
  const coordRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame = 0
    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = coordRef.current
        if (el) {
          el.textContent = `X ${padCoord(event.clientX)} · Y ${padCoord(event.clientY)}`
        }
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="hud" aria-hidden="true">
      <i className="hud__corner hud__corner--tl" />
      <i className="hud__corner hud__corner--tr" />
      <i className="hud__corner hud__corner--bl" />
      <i className="hud__corner hud__corner--br" />

      <div className="hud__scan">
        <span>SCAN:IDLE</span>
        <i className="hud__caret" />
      </div>

      <footer className="hud__status">
        <span className="hud__cell">PEEK://WORKSPACE.01</span>
        <span className="hud__cell hud__cell--dim">GRID 20/100</span>
        <span className="hud__spring" />
        <span className="hud__cell hud__coords" ref={coordRef}>
          X 0000 · Y 0000
        </span>
        <span className="hud__cell hud__cell--dim">LINK:LOCAL</span>
        <span className="hud__cell hud__live">
          <i className="hud__led" />
          LIVE
        </span>
      </footer>
    </div>
  )
}

export default HudFrame
