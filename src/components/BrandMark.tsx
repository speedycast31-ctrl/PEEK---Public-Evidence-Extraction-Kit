import './BrandMark.css'

/**
 * The PEEK wordmark lockup, pinned to the top-left of the workspace.
 *
 * Cybercore reticle identity: an amber diamond aperture with axis ticks over
 * a mono wordmark, a `//`-marked descriptor and a SYS.NOMINAL status row.
 * Purely presentational and non-interactive (see BrandMark.css), so it can
 * sit over the canvas without stealing future pan/zoom gestures.
 */
function BrandMark() {
  return (
    <header className="brand">
      {/* Reticle: diamond aperture, N/E/S/W axis ticks, solid core. */}
      <svg
        className="brand__glyph"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M12 4 20 12 12 20 4 12Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <path
          d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path d="M12 8.9 15.1 12 12 15.1 8.9 12Z" fill="currentColor" />
      </svg>

      <div className="brand__lockup">
        <h1 className="brand__word">PEEK</h1>
        <p className="brand__descriptor">
          <span className="brand__slashes">//</span> Public Evidence Extraction
          Kit
        </p>
        <p className="brand__status">
          <i className="brand__led" />
          SYS.NOMINAL
        </p>
      </div>
    </header>
  )
}

export default BrandMark
