# PEEK — Cybercore Design System

> **Theme:** Cybercore · **Primary colour:** Cream (`#faf5ec`) · **Status:** v1.0 — implemented
>
> Scope: the application shell (workspace canvas, HUD chrome, brand lockup,
> favicon). Verified by the design-contract test suite plus lint and a clean
> production build (see §9).

---

## 1. Concept — "Field Terminal"

Cybercore is the collision of **cyber** (HUD frames, technical grids, scanlines,
terminal readouts, phosphor glow) with **core** (softness, warmth, calm
surfaces). PEEK's version is the **Field Terminal**: an OSINT workbench that
feels like precision evidence equipment printed on a warm cream panel —
an amber-phosphor instrument, not a neon hacker movie.

The design answers one question everywhere: *what would a well-made piece of
field evidence gear look like if its case were made of cream paper instead of
gunmetal?* The answer drives every rule below.

### 1.1 Principles

1. **Cream is the machine.** `--paper` is the primary surface — ≥ 92 % of every
   viewport. The cyber layer is *painted onto* the cream, never the reverse.
   No dark mode, no near-black panels.
2. **Ink, then two accents — no more.** Warm dark ink for structure, amber
   phosphor (`--accent`) for interactive/brand emphasis, phosphor green
   (`--signal`) reserved exclusively for *live status*. A second green anywhere
   else is a bug.
3. **Everything is measured.** The 20/100 px grid is the rhythm of the whole
   product: HUD insets (20/40 px), paddings and bracket arm lengths step in
   multiples of it.
4. **Calm instrumentation.** Motion is limited to status semantics — a pulsing
   LED, a blinking terminal cursor. Nothing decorative ever animates.
5. **Evidence-grade honesty.** All fonts self-hosted, all decoration
   `aria-hidden` and `pointer-events: none`, coordinates are real (the HUD
   readout tracks the true pointer position).

---

## 2. Colour tokens

Defined once in `src/index.css` `:root`. Cream stays primary and unchanged from
the paper era; accents shift from terracotta to a more electric amber phosphor.

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#faf5ec` | **Primary.** The cream ground — canvas fill, shell base. |
| `--paper-raised` | `#fffdf8` | Raised chrome: status bar, future panels/cards. |
| `--paper-dim` | `#f1ead9` | Recessed wells, inset tracks. |
| `--ink` | `#26201a` | Primary structure & text. Warm near-black, never pure black. |
| `--ink-muted` | `#8a7761` | Secondary labels, descriptors. |
| `--ink-faint` | `#b9a88f` | Tertiary: corner brackets, idle ticks. |
| `--accent` | `#c2560f` | **Amber phosphor.** Brand glyph, emphasis, live values. |
| `--accent-soft` | `#e08a45` | Amber highlight edges / hover states. |
| `--signal` | `#2e7d54` | **Phosphor green — status only.** LED, LIVE/SYS states. |
| `--hairline` | `#e4d7c1` | 1 px separators on cream. |

Glow variants exist as alphas of the same hues (`--accent-glow`,
`--signal-glow`) so the phosphor effect can never drift to a new colour.

### 2.1 Grid palette (canvas, `src/config/workspace.ts`)

| Token | Value | Role |
| --- | --- | --- |
| `background` | `#faf5ec` | Same cream — the canvas *is* the paper. |
| `minorLine` | `#f0e7d5` | 20 px lattice, barely-there. |
| `majorLine` | `#e2d3b7` | 100 px lattice. |
| `axisLine` | `#cfae7e` | Origin axes along top/left edges. |
| `crosshair` | `#c9a06a` | `+` ticks at major intersections. |
| `coordColor` | `#a8916f` | Edge coordinate numerals. |

---

## 3. Layer stack

Bottom → top, all decorative layers `pointer-events: none`:

```
┌────────────────────────────────────────────────────┐
│ 1  WorkspaceCanvas   grid + crosshairs + coords    │  z-0  (canvas)
│ 2  Phosphor glow     amber pool TL, green haze BR  │  z-1  (::before)
│ 3  Scanlines + grain CRT lines × paper grain × vignette z-2 (::after)
│ 4  HUD chrome        brackets, readouts, status bar│  z-3  (HudFrame)
│ 5  Brand lockup      wordmark + LED                │  z-4  (BrandMark)
└────────────────────────────────────────────────────┘
```

- **Phosphor glow** — a warm amber pool in the top-left (where the wordmark
  sits) plus a faint green haze bottom-right: the two accents "powered on".
- **Scanlines** — 3 px-pitch horizontal CRT lines at 3 % ink alpha. Paired with
  a *reduced* paper grain (opacity 0.18, multiply) so the surface reads as
  printed equipment facing, and a soft vignette for screen depth.
- Scanlines drop under `prefers-reduced-transparency`; all animation drops
  under `prefers-reduced-motion`.

---

## 4. Typography

> **Project font: Orbitron Variable** (SIL OFL, self-hosted via Fontsource).
> Every piece of UI text — wordmark, HUD chrome, readouts, edge coordinates
> and all future body copy — is set in Orbitron. It is the product's single
> face; there is no separate body font.

| Token | Face | Use |
| --- | --- | --- |
| `--font` | **Orbitron Variable** (self-hosted) → JetBrains Mono Variable → system monos | Everything: wordmark, HUD, labels, readouts, coordinates, body copy |
| — | JetBrains Mono Variable (self-hosted) | Fallback only — covers glyphs Orbitron lacks (e.g. `·`) and keeps the UI set if Orbitron fails to load |
| — | *retired* — Fraunces serif, Instrument Sans | No longer referenced; dependencies remain installed (cleanup deferred) |

Rules:

- Labels: 10 px/1.5, uppercase, `letter-spacing: 0.14em`–`0.22em`.
- Wordmark: 28 px, weight 700, tracking `0.32em` (optically corrected with a
  negative right margin on the last glyph).
- All readouts/numerals: `font-variant-numeric: tabular-nums` so live values
  never jitter.
- Canvas coordinate numerals request Orbitron first with the same fallback
  chain, and the canvas repaints once `document.fonts.ready` resolves.

---

## 5. Components

### 5.1 Workspace grid (`WorkspaceCanvas.tsx`)

Blueprint rendering, DPR-crisp (half-pixel offsets):

- minor lattice every 20 px, major every 100 px;
- `+` crosshair ticks (5 px arms) at **major intersections only** — the HUD
  signature that turns a plain grid into an instrument face;
- coordinate numerals along the top (`X`) and left (`Y`) edges at major steps,
  zero-padded to 4 digits (`0000`, `0100` …), paper-haloed so they stay legible
  over lines;
- origin axes slightly stronger than the lattice.

### 5.2 HUD chrome (`HudFrame.tsx`) — new

- **Corner brackets** in all four viewports: 18 px L-marks, 1.5 px stroke,
  `--ink-faint`, inset 14 px (= major-grid fraction).
- **Top-right readout:** `SCAN:IDLE` + blinking terminal cursor `▮`.
- **Bottom status bar** (28 px, `--paper-raised`, top hairline):
  `PEEK://WORKSPACE.01` · `GRID 20/100` · spacer · live `X 0000 · Y 0000`
  (updates on pointer-move via rAF, zero re-renders) · `LINK:LOCAL` ·
  pulsing green LED + `LIVE`.
- Whole component `aria-hidden` — instrumentation, not content.

### 5.3 Brand lockup (`BrandMark.tsx`)

- **Glyph:** the aperture diamond, restyled as a **reticle** — outer diamond
  stroke, solid core, four N/E/S/W ticks. Amber.
- **Wordmark:** `PEEK` in the project font (Orbitron), per §4.
- **Descriptor:** `// PUBLIC EVIDENCE EXTRACTION KIT` — the `//` is the
  cybercore comment-marker motif.
- **Status row:** `SYS.NOMINAL` with a 6 px phosphor-green LED (pulse + glow).

### 5.4 Favicon

Same reticle family: cream rounded square, amber diamond reticle with axis
ticks and solid core.

---

## 6. Motion

| Effect | Spec | Reduced motion |
| --- | --- | --- |
| Status LED pulse | opacity/glow, 2.4 s ease-in-out, infinite | static full opacity |
| Terminal cursor blink | 1.1 s steps | static solid |
| Coordinate readout | rAF-throttled pointer tracking | unaffected (user-driven) |

Nothing else moves. No entrances, no parallax, no ambient sweeps.

---

## 7. Accessibility

- Decorative layers: `aria-hidden="true"` + `pointer-events: none`.
- Contrast: `--ink` on `--paper` ≈ 13.9:1; `--ink-muted` ≈ 4.6:1; `--signal`
  reserved for 10 px uppercase + LED states, backed by the word `LIVE`/`SYS`.
- `color-scheme: light` (cream is primary by requirement).
- `prefers-reduced-transparency` and `prefers-reduced-motion` honoured.

---

## 8. File map

| File | Change |
| --- | --- |
| `src/index.css` | Tokens, glow/scanline/grain/vignette layers, keyframes |
| `src/config/workspace.ts` | Extended `GridConfig` (crosshair, coords) |
| `src/components/WorkspaceCanvas.tsx` | Crosshair ticks + edge coordinate painting |
| `src/components/HudFrame.tsx` | **New** — brackets, readouts, status bar, live coords |
| `src/components/BrandMark.tsx` / `.css` | Project-font (Orbitron) reticle lockup + status LED |
| `src/main.tsx` | Orbitron project-font import + JetBrains Mono fallback (serif/sans imports dropped) |
| `public/favicon.svg` | Reticle mark |
| `package.json` | `@fontsource-variable/orbitron` + `@fontsource-variable/jetbrains-mono` deps + `npm test` script |
| `tests/theme.test.mjs` | Design-contract suite mapping to the spec's acceptance criteria |
| `design.md` | This document |

---

## 9. Verification

Agreed gate (per the recorded spec): `npm test` (Node's built-in runner — the
design-contract suite in `tests/theme.test.mjs` asserts every acceptance
criterion against the sources), plus `npm run lint` and `npm run build` clean.
Visual screenshot review was explicitly waived by the user in favour of this
compile-and-contract gate; cream dominance is additionally guaranteed by
construction — `#faf5ec` is the canvas fill, shell base and theme-colour meta.
