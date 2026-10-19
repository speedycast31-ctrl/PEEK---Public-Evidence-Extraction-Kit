# PEEK — Product Specification

**Public Evidence Extraction Kit** — OSINT Social Network Mapping Tool  
**Version:** 0.1.0 (Draft)  
**Status:** Active Development  
**Last Updated:** 2026-10-19

---

## 1. Product Overview

### 1.1 Vision
PEEK is a desktop-first OSINT workspace for mapping an individual's online social graph. Starting from a single "center person," it recursively discovers connections (followers, followings, mutuals, group memberships, interactions) up to 2–3 levels deep, rendering the network as a concentric-ring visualization on a calibrated grid canvas.

### 1.2 Core Concept: "Track"
A **Track** = one investigation = one workspace = one center person.  
Tracks are created, managed, and persisted locally. Only one track is active at a time; users return to the Dashboard to switch.

### 1.3 Target Users
- OSINT analysts & investigators
- Journalists researching subject networks
- Threat intelligence researchers
- Privacy/brand protection teams

### 1.4 Design Language
Cybercore "Field Terminal" aesthetic: warm cream paper ground, amber phosphor accent, phosphor green signal, 20/100 px grid rhythm, HUD chrome (corner brackets, status bar, live coordinates). All views share this visual system.
---

## 2. User Flows

### 2.1 Dashboard View (Entry Point)
**Purpose:** List all tracks, create new, resume existing.

| Element | Spec |
|---------|------|
| Track Card | Track name · Center person name/avatar · Last updated (relative time) · Node count |
| Empty State | "No tracks yet" + primary CTA: **New Track** |
| Track Actions | Click → open workspace · Rename · Delete (confirm modal) |
| Sort/Order | Most recently updated first |
| Keyboard | `N` = New Track · `↑/↓` navigate · `Enter` open · `Delete` remove |

### 2.2 New Track → Onboarding Wizard
**Steps:**

| Step | Fields Collected | Validation |
|------|------------------|------------|
| 1. Identity | Full name (required) · Known usernames/handles (array, min 1) · Profile photo (upload/crop, optional) | Name non-empty · ≥1 handle |
| 2. Biographical | Bio/description · Location · Date of birth (optional) | — |
| 3. Platform Presence | Platform checkboxes (Twitter/X, LinkedIn, GitHub, Instagram, Facebook, TikTok, Mastodon, Bluesky, Other) + profile URLs per platform | ≥1 platform with URL |
| 4. Network Seeds | Known connections (name + platform + relationship type) · Known groups/communities | Optional |
| 5. Voice Memo (Optional) | **Record** button (browser speech-to-text) → transcript preview · **Process with AI** sends transcript to LLM for additional search hints (names, aliases, orgs, keywords) | Transcript non-empty if recorded |
| 6. Review & Start | Summary of all inputs · **Start Investigation** button | Auto-advances to workspace on click |

**Onboarding UX:**
- Stepper progress indicator (HUD-style, top of canvas)
- All data saved locally immediately per step
- Voice memo: browser speech recognition → final transcript → processed by external LLM for search hints → hints merged into search config
### 2.3 Workspace / Graph View
**Layout:** Full-bleed canvas + HUD chrome + collapsible side panel (right)

#### 2.3.1 Canvas: Concentric Ring Graph
- **Center (Level 0):** Center person node — larger, distinct styling, pinned
- **Ring 1 (Level 1):** Direct connections — evenly distributed
- **Ring 2 (Level 2):** Connections of connections
- **Ring 3 (Level 3, optional):** Configurable max depth (2 or 3)
- **Edges:** Straight lines between rings, animated draw-on-load
- **Layout:** Deterministic — fixed radius per level, even angular distribution, no physics simulation
- **Grid Alignment:** Node centers snap visually to the 20px workspace grid
- **Canvas Controls:** Pan (drag background) + Zoom (wheel, 0.5×–2×) — HUD coordinates update live

#### 2.3.2 Node Visual Design
| Level | Size | Style | Label |
|-------|------|-------|-------|
| 0 (Center) | Largest | Accent border, raised surface | Handle + name |
| 1 | Large | Primary border | Handle |
| 2 | Medium | Muted border | Handle (truncated) |
| 3 | Small | Faint border | • only |

- **Avatar:** Circular inset (center node only) or initials fallback
- **Platform Badges:** Colored dots along bottom arc — max 4, then `+N`
- **Connection Count:** Small numeral top-right (Level 1+)
- **Hover:** Glow highlight, tooltip with name + platform + mutual count
- **Click:** Opens side panel

#### 2.3.3 HUD Chrome
Retained from design system:
- **Corner Brackets:** L-marks at viewport corners
- **Top-Right Readout:** `SCAN:IDLE` → `SCAN:RUNNING` → `SCAN:COMPLETE` + blinking cursor
- **Bottom Status Bar:** Track ID · Grid spec · Current depth/max · Node count · Live X/Y coordinates · Connection status · Pulsing green LED + `LIVE`
- **Reduced Motion:** Honored (static LED, solid cursor)

#### 2.3.4 Side Panel (Right, Collapsible)
**Trigger:** Click any node  
**Tabs:**

| Tab | Content |
|-----|---------|
| **Profile** | Avatar · Name · Handles (clickable links to source profiles) · Bio · Location · Platforms with follower counts · Last seen/active |
| **Evidence** | Extracted posts/content (reverse chronological) · Platform badge · Timestamp · Text preview (expandable) · Permalink · "Archive" button (saves snapshot locally) |
| **Connections** | List of this node's edges: target node · relationship type (follows, mutual, group, mentioned) · confidence score · "Focus" button |
| **Notes** | User annotations (Markdown, auto-saved) · Tags (free-text, filterable) |

**Panel States:** Collapsed handle → Expanded → Full overlay on mobile

### 2.4 Track Persistence & Switching
- **Save:** Auto-save on every mutation (debounced) → local storage
- **Switch:** Dashboard button in HUD (top-left) → confirms unsaved changes → navigates to Dashboard
- **Export:** "Export Track" → JSON (graph, metadata, notes) + optional evidence archive (ZIP)
---

## 3. Data Stored Per Track

All data persists locally in the browser (IndexedDB):

- **Track metadata:** Name, creation/update timestamps, center person reference, config (max depth 2/3, enabled search providers), scan status
- **Nodes (people):** Level (0–3), positioned angle/radius, person data (name, handles per platform, avatar, bio, location, platform info, mutual connections, shared groups, interaction timeline), metadata (source, confidence, discovery time, linked evidence, user notes, tags)
- **Edges (connections):** Source/target nodes, type (follows, followed_by, mutual, group, mention, interaction), weight/confidence, metadata (source, evidence refs, discovery time)
- **Evidence artifacts:** Linked to nodes — type (post, profile, media, archive, screenshot), platform, URL, title, full content, author, publish/collect timestamps, content hash for integrity, archive URL
- **Search job logs:** For debugging/replay — provider, query, status, timing, results count, errors, raw responses
---

## 4. OSINT Search System

### 4.1 Plugin Architecture
Extensible plugin framework for search providers, enrichment, and analysis modules. Plugins register capabilities, declare rate limits and auth requirements, and implement a standard search interface.

### 4.2 Plugin Types
| Type | Purpose |
|------|---------|
| **Search Provider** | Query external sources for entities (DuckDuckGo, GitHub, LinkedIn, Mastodon, etc.) |
| **Enrichment** | Expand entities with additional data (Clearbit, Hunter, LLM-based) |
| **Analysis** | Derive insights from the graph (community detection, bot scoring, timeline clustering) |

### 4.3 Built-in Plugins (v1 Scope)
1. **DuckDuckGo Search** — free, no auth, HTML scrape
2. **GitHub Search** — public profile + repos + followers/following via REST API
3. **LinkedIn Public** — limited to public profile view (no auth)
4. **Mastodon/ActivityPub** — webfinger + profile + followers/following
5. **LLM Enrichment** — sends collected entity data to external LLM (OpenAI/Anthropic) for alias generation, organization inference, keyword expansion → feeds back into next search iteration

### 4.4 Search Orchestration
- **Sequential depth rounds:** For each level (1 → maxDepth):
  1. Collect all nodes at current level without outgoing connections
  2. Run all enabled search providers in parallel (with rate limiting)
  3. Deduplicate results (by handle + platform)
  4. Create new nodes at next level, edges from current node
  5. Persist locally
  6. Update HUD: live node count, scan status
- **Completion:** Scan status → `COMPLETE` → side panel populates
- **Cancellation:** User can abort in-flight scan, keep partial results
---

## 5. Acceptance Criteria

### 5.1 Dashboard
- Lists all tracks with correct metadata
- New Track button opens onboarding wizard
- Delete track requires confirmation, removes all associated local data
- Keyboard navigation works end-to-end

### 5.2 Onboarding
- All 6 steps functional, data persists per step
- Voice input works in Chrome/Edge/Firefox (browser speech recognition)
- LLM enrichment call succeeds, hints merge into search config
- "Start Investigation" creates track, navigates to workspace, triggers scan

### 5.3 Workspace / Graph
- Concentric rings render correctly for 2 and 3 depth levels
- Nodes position deterministically, snap visually to grid
- Edges draw as straight lines between rings
- Pan/zoom works, HUD coordinates update live
- HUD chrome renders per design system (brackets, readout, status bar)
- SCAN status transitions: IDLE → RUNNING → COMPLETE
- Click node opens side panel with correct tabs/data

### 5.4 Side Panel
- Profile tab shows all person data fields with links
- Evidence tab lists extracted content with archive action
- Connections tab lists edges with "Focus" action
- Notes tab saves markdown per node locally

### 5.5 Search & Plugins
- DuckDuckGo plugin returns results, creates nodes/edges
- Search orchestrator runs sequential depth rounds
- Rate limiting respected per provider
- Partial results persisted on cancel/error
- New plugins can be added and auto-discovered

### 5.6 Persistence
- Full graph round-trips local storage (save → reload → identical)
- Export/Import JSON produces valid track
- Multiple tracks coexist, switching works

### 5.7 Design Compliance
- All colors from design system tokens
- Grid crisp on Retina displays
- Scanlines, grain, vignette layers present
- Reduced motion/transparency preferences honored
- Mobile: compact HUD, side panel as bottom sheet
---

## 6. Roadmap / Phases

### Phase 1 — Core Workspace (Current)
- Dashboard + Track CRUD
- Onboarding wizard (no voice/LLM yet)
- Canvas with concentric ring renderer (static positions)
- HUD chrome integration
- Side panel (Profile tab only)
- Local persistence
- DuckDuckGo search plugin + basic orchestrator (1 round, depth 1)

### Phase 2 — Search & Intelligence
- Full multi-depth search orchestrator
- GitHub, Mastodon, LinkedIn plugins
- LLM enrichment plugin (external API)
- Voice input + transcript → LLM hints
- Evidence tab + archive action
- Connections tab + Focus action

### Phase 3 — Analysis & Polish
- Analysis plugins (community detection, bot scoring)
- Notes/tags tab
- Export/Import (JSON + ZIP)
- Keyboard shortcuts + command palette
- Mobile responsive refinements
- Accessibility audit (WCAG 2.1 AA)

### Phase 4 — Collaboration (Post-v1)
- Track sharing (encrypted export/import)
- Real-time multiplayer
- Shared evidence locker
- Report generation (PDF/HTML)

---

## 7. Technical Constraints & Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Rendering** | Canvas 2D API | Pixel-perfect grid, high-DPI control, low overhead for ~200 nodes |
| **State** | Local-first, React Context | Zero deps, explicit persistence, works offline |
| **Fonts** | Self-hosted variable fonts | Evidence-grade: no network calls, identical offline |
| **Search** | Plugin framework | Extensible, testable, supports local-only providers |
| **Voice STT** | Browser Web Speech API | Zero cost, on-device, browser-native |
| **LLM** | External API (configurable) | Powerful enrichment, user controls data sent |
| **Storage** | IndexedDB | Large capacity, transactional, works offline |
| **Build** | Vite + TypeScript + Oxlint | Fast dev, strict types, modern lint |

---

## 8. Open Questions

1. **Re-centering:** "Focus" button in Connections tab — creates new track or mutates current? (Assumes new track for v1)
2. **Auth for plugins:** Where to store API keys securely?
3. **Rate limit UI:** Per-provider status in HUD? (v1: aggregate only)
4. **Graph layout collisions:** Rings may overlap at high node counts — force nudge or spiral?
5. **Evidence integrity:** Hash verification on re-open? (v1: store hash, verify on demand)

---

*End of Specification*