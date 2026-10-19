/**
 * Workspace presentation config — Cybercore grid paint.
 *
 * Kept separate from the canvas component so grid density and colours can later
 * be driven by user settings, a theme, or a zoom level without touching render
 * code. Tokens mirror the palette in `src/index.css`; see `design.md` §2.1.
 */

export interface GridConfig {
  /** Distance between minor grid lines, in CSS pixels. */
  minorStep: number
  /** Distance between major (brighter) grid lines, in CSS pixels. */
  majorStep: number
  /** Canvas fill painted underneath the grid. */
  background: string
  /** Colour of the minor grid lines. */
  minorLine: string
  /** Colour of the major grid lines. */
  majorLine: string
  /** Colour of the origin axes drawn along the top and left edges. */
  axisLine: string
  /** Stroke width of every grid line, in CSS pixels. */
  lineWidth: number
  /** Colour of the "+" ticks drawn at major intersections. */
  crosshair: string
  /** Half-length of a crosshair arm, in CSS pixels. */
  crosshairSize: number
  /** Colour of the edge coordinate numerals. */
  coordColor: string
  /** Canvas font for the edge coordinate numerals (mono, with fallback). */
  coordFont: string
  /** Distance a coordinate numeral is inset from its edge, in CSS pixels. */
  coordInset: number
}

/** Default cream Cybercore workspace grid. */
export const GRID: GridConfig = {
  minorStep: 20,
  majorStep: 100,
  background: '#faf5ec',
  minorLine: '#f0e7d5',
  majorLine: '#e2d3b7',
  axisLine: '#cfae7e',
  lineWidth: 1,
  crosshair: '#c9a06a',
  crosshairSize: 5,
  coordColor: '#a8916f',
  coordFont:
    '500 10px "Orbitron Variable", "JetBrains Mono Variable", ui-monospace, Menlo, monospace',
  coordInset: 6,
}
