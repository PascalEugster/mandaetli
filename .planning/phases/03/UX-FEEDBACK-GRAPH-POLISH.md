# UX Designer Feedback: Graph Loading, Empty States, and Onboarding

**Received:** 2026-02-27
**From:** UX Designer
**Applies to:** Phase 4 (Sharing, Filtering, and Polish)
**Status:** Captured for future implementation

## Summary

UX designer provided detailed specs for three new areas not covered in the Phase 2 build:
1. Graph loading states (data fetch + FA2 settling)
2. Empty graph state (when filters return zero)
3. First-time user onboarding (4-step coach marks)

Plus clarifications on existing Phase 2 decisions.

## 1. Graph Loading States

### Phase A: Data Fetching
- Canvas background: #080c14
- Center loading card: surface-1 bg, border-subtle, rounded-lg, 320px width
- Skeleton shimmer + "Loading network data..." text
- Progress bar: 4px height, surface-3 track, accent fill
- Stat preview: "246 actors" / "3000+ connections" in text-caption
- Background animation: 15-20 faint dots (surface-3, 3px, 30% opacity) with slow drift

### Phase B: Layout Computing (FA2 Settling)
- Render nodes immediately at random positions
- Edges render as thin ghost lines (0.5px, 20% opacity)
- Nodes animate toward FA2 positions over 2-3 seconds
- Bottom-right indicator: "Layout settling..." with small spinner
- On convergence (avg velocity < 0.5px/frame):
  - Text fades out (200ms)
  - Edges animate to full widths (300ms ease)
  - If first visit: show onboarding

## 2. Empty Graph State (Filters Return Zero)

- Centered card: surface-1, border-subtle, max-width 360px
- Diamond outline icon (48px, text-muted)
- Headline: "No actors match your current filters"
- Active filter chips shown inline (clickable to remove)
- "Reset All Filters" link in accent color
- Animation: hold 500ms after last node fades, then fade in card (200ms)

## 3. First-Time Onboarding (Coach Marks)

4-step contextual coach marks (NOT modal tutorial):
- Step 1: Points at party super-nodes "Click a party to explore"
- Step 2: Points at expanded politician nodes "Hover/click for details"
- Step 3: Points at search bar "Search for any actor, press /"
- Step 4: Points at filter icon "Filter by party, canton, etc."

Styling: surface-2 bg, border-default, 280px width, 8px CSS arrow
Tracked via localStorage key: seilschaften:onboarding:graph:completed
Skippable, re-accessible via help menu, non-blocking, auto-dismiss after 10s

### Post-onboarding keyboard hint
Bottom-right, 5 seconds: `/ Search  ·  F Filter  ·  L Legend  ·  Esc Reset`

## 4. Clarifications on Phase 2 Decisions

### Party clusters: Super-nodes (NOT convex hulls)
- 48-64px radius, party color fill at 60% opacity, abbreviation inside
- Expand on click

### Click behavior: Select, not navigate
- Single click = select (detail panel + ego-network spotlight)
- Double click = navigate to profile page
- **Note:** Current implementation uses single-click navigate -- needs change

### Layout controls
- FA2 auto-pauses after 2-3 seconds
- "Shake" button (RefreshCw icon) re-runs simulation
- Manual node drag pins node (removes from physics)
- Double-click pinned node to unpin

### Zoom controls group (bottom-right, above legend)
- Zoom in, zoom out, fit viewport, shake (re-run force)
- surface-1 at 90% opacity + backdrop-blur-sm
- 36px square buttons, ghost style
