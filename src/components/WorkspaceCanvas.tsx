import { useEffect, useRef } from 'react'
import { GRID, type GridConfig } from '../config/workspace'

interface WorkspaceCanvasProps {
  /** Grid appearance. Defaults to the shared workspace grid config. */
  grid?: GridConfig
}

/**
 * Strokes one family of parallel grid lines across the whole canvas.
 *
 * Coordinates are offset by half a pixel so hairline strokes land on a pixel
 * boundary and stay crisp instead of smearing across two pixels.
 */
function strokeGridLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: number,
  color: string,
  lineWidth: number,
): void {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  for (let x = 0; x <= width; x += step) {
    const px = Math.floor(x) + 0.5
    ctx.moveTo(px, 0)
    ctx.lineTo(px, height)
  }

  for (let y = 0; y <= height; y += step) {
    const py = Math.floor(y) + 0.5
    ctx.moveTo(0, py)
    ctx.lineTo(width, py)
  }

  ctx.stroke()
}

/**
 * Draws the HUD-signature "+" ticks at every interior major intersection.
 * The axes at x=0 / y=0 already mark the origin, so the ticks start one major
 * step in — the grid reads as an instrument face, not graph paper.
 */
function strokeCrosshairs(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grid: GridConfig,
): void {
  const { majorStep, crosshair, crosshairSize, lineWidth } = grid
  ctx.beginPath()
  ctx.strokeStyle = crosshair
  ctx.lineWidth = lineWidth

  for (let x = majorStep; x < width; x += majorStep) {
    const px = Math.floor(x) + 0.5
    for (let y = majorStep; y < height; y += majorStep) {
      const py = Math.floor(y) + 0.5
      ctx.moveTo(px - crosshairSize, py)
      ctx.lineTo(px + crosshairSize, py)
      ctx.moveTo(px, py - crosshairSize)
      ctx.lineTo(px, py + crosshairSize)
    }
  }

  ctx.stroke()
}

/** Zero-pads a workspace coordinate to four digits, HUD-readout style. */
function padCoord(value: number): string {
  return Math.max(0, Math.round(value)).toString().padStart(4, '0')
}

/**
 * Paints the coordinate numerals along the top (X) and left (Y) edges at
 * major steps. Each numeral gets a paper-coloured halo so it stays legible
 * where it crosses grid lines. The origin corner is left to the axes and the
 * first tick — both edge labels would collide there — and numerals are
 * dropped near the far corners so they never run under the HUD brackets.
 */
function paintEdgeCoords(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grid: GridConfig,
): void {
  const { majorStep, coordColor, coordFont, coordInset } = grid
  ctx.font = coordFont
  ctx.textBaseline = 'top'
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.strokeStyle = grid.background
  ctx.fillStyle = coordColor

  for (let x = majorStep; x < width; x += majorStep) {
    // Keep clear of the top-right HUD bracket.
    if (x > width - 48) break
    const label = padCoord(x)
    ctx.strokeText(label, x + coordInset, coordInset)
    ctx.fillText(label, x + coordInset, coordInset)
  }

  for (let y = majorStep; y < height; y += majorStep) {
    // Keep clear of the bottom-left bracket above the status bar.
    if (y > height - 76) break
    const label = padCoord(y)
    ctx.strokeText(label, coordInset, y + coordInset)
    ctx.fillText(label, coordInset, y + coordInset)
  }
}

/**
 * The PEEK workspace: a full-bleed cream canvas stroked as a technical
 * blueprint — minor/major lattices, "+" ticks at major intersections and
 * coordinate numerals along the edges. No graph, no panels, no interaction
 * yet — this is the drawing substrate the rest of the tool renders onto.
 */
function WorkspaceCanvas({ grid = GRID }: WorkspaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (width === 0 || height === 0) return

      // Match the backing store to the display density, otherwise every 1px
      // line gets resampled and looks blurry on Retina displays.
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.fillStyle = grid.background
      ctx.fillRect(0, 0, width, height)

      strokeGridLines(ctx, width, height, grid.minorStep, grid.minorLine, grid.lineWidth)
      strokeGridLines(ctx, width, height, grid.majorStep, grid.majorLine, grid.lineWidth)

      // Origin axes: the cross along the top and left edges.
      ctx.beginPath()
      ctx.strokeStyle = grid.axisLine
      ctx.lineWidth = grid.lineWidth
      ctx.moveTo(0.5, 0)
      ctx.lineTo(0.5, height)
      ctx.moveTo(0, 0.5)
      ctx.lineTo(width, 0.5)
      ctx.stroke()

      strokeCrosshairs(ctx, width, height, grid)
      paintEdgeCoords(ctx, width, height, grid)
    }

    render()

    // The coordinate numerals use the self-hosted webfont; repaint once it
    // has actually loaded so they never render in a fallback face.
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) render()
    })

    // ResizeObserver also catches layout changes a window resize event misses,
    // e.g. a side panel opening or collapsing.
    const observer = new ResizeObserver(render)
    observer.observe(canvas)

    // Redraw when the window moves to a display with a different pixel density.
    window.addEventListener('resize', render)
    return () => {
      cancelled = true
      observer.disconnect()
      window.removeEventListener('resize', render)
    }
  }, [grid])

  return <canvas ref={canvasRef} className="workspace-canvas" />
}

export default WorkspaceCanvas
