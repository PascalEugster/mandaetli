# Phase 2 Discussion: Network Graph Visualization

**Phase:** 2 of 5
**Requirements:** GRAPH-01 through GRAPH-10
**Date:** 2026-02-27
**Updated:** 2026-02-27 (incorporated architect + UX designer feedback)

## Current State

Phase 1 delivered:
- 248 politicians, 522 organizations, 8 parties, 22 commissions (~800 nodes total)
- 2,182 connections with source attribution and confidence levels
- Dark-mode design system with 5 background layers, Swiss red accent
- Supabase local with PostgreSQL, auto-generated TypeScript types

Task 02-01 completed:
- Graph libraries installed (sigma, graphology, @react-sigma/core, graphology-layout-forceatlas2)
- /netzwerk page renders full graph with ForceAtlas2 layout in Web Worker
- Basic node styling (party colors for persons, amber for orgs, purple for commissions)
- GraphCanvas renderless component with FA2 supervisor

## Architecture Decisions (Architect)

### 1. Data Flow: Fetch All, Not Lazy-Load

~400KB uncompressed, ~60-80KB gzipped. Server Component fetches only graph-relevant fields. Pass as raw arrays, build Graphology client-side.

### 2. GraphContainer Pattern

```
Server Component (page.tsx) -> raw arrays -> GraphContainer ("use client", dynamic ssr:false)
  -> SigmaContainer -> GraphDataLoader (renderless) + GraphEventHandler (renderless)
```

Graph type: `new Graph({ multi: true, type: "undirected" })` (current implementation).

### 3. Progressive Disclosure: Interaction-Driven

Zoom levels driven by user interaction (filter + selection), NOT camera zoom ratio.

**Three view levels (derived from URL state):**
- Overview (default): party super-nodes only
- Filtered: matching actors + 1-hop neighbors, capped at 80
- Focused: ego network of clicked actor

### 4. ForceAtlas2

Barnes-Hut, gravity 3, scalingRatio 15. Fixed timeout 3s then stop. Re-run on major view transitions (200 iterations). Layout cache for instant "back" nav.

### 5. State Split

- zustand: hoveredNodeId, tooltipPosition, isLayoutRunning, selectedEdgeId, filterPanelOpen, legendOpen
- nuqs (URL): selected, parties, cantons, councils, industries, connectionTypes, pathFrom, pathTo, q

## UX Design Decisions (UX Designer)

### 6. Graph Page Layout

**Full-canvas graph with floating overlay panels.** Graph IS the page.

- Sidebar auto-collapses to 56px (icons only) on /netzwerk to maximize graph space
- Graph canvas: `calc(100vw - 56px)` x `calc(100vh - 64px)`, background `#080c14` (bg-base)
- All panels (toolbar, filters, detail, legend) float OVER the canvas with `backdrop-blur` + semi-transparent backgrounds
- No scrolling on graph page -- panning via drag

**Floating toolbar** (top of canvas area):
- 44px height, `surface-1` at 90% opacity + backdrop-blur-md, rounded-[10px], 12px margins
- Contains: Filter toggle + Search input + Legend toggle

### 7. Node Visual Design

**Shapes by actor type (for accessibility -- shape+color):**
| Actor Type | Shape | Fill Color | Size |
|---|---|---|---|
| Politician | Circle | `#3b82f6` (blue) | Proportional to degree: `6 + (degree/maxDegree) * 18` |
| Party | Rounded square (squircle) | Party color at 60% opacity | Fixed 28px radius |
| Organization | Diamond (rotated square) | `#22c55e` (green) | Proportional to degree |
| Company | Hexagon | `#f59e0b` (amber) | Proportional to degree |

**NOTE:** Sigma.js default renderer supports circles only. Custom node programs needed for squircle/diamond/hexagon. For Phase 2 MVP, use circles for all types with different colors. Add custom shapes as a Phase 2 enhancement or defer to Phase 4. The UX designer's shape spec is the target -- implement what Sigma.js supports cleanly.

**Party affiliation on politician nodes:** 2px colored ring (border) showing party color. Inner fill stays blue `#3b82f6`. This prevents confusion between politician blue and other actor type colors.

**Node sizing:** Proportional to connection degree, not fixed per type. `radius = 6 + (degree / maxDegree) * 18`. Party nodes fixed at 28px. This lets users instantly spot the most connected actors.

### 8. Edge Visual Design

**Edge styles by connection type:**
| Type | Line Style | Width | Color |
|---|---|---|---|
| Mandate | Solid | 1.5px | `#475569` |
| Membership | Solid | 1px | `#334155` |
| Lobbying | Dashed (6px dash, 4px gap) | 1.5px | `#475569` |
| Donation | Dotted (2px dot, 3px gap) | 1.5px | `#f59e0b33` (amber 20%) |
| Employment | Solid | 1px | `#334155` |

Edges intentionally muted (neutral grays). Colorful edges create visual noise. Nodes are foreground, edges are infrastructure.

**No edge labels by default.** Labels appear only on:
1. Hover: tooltip at midpoint
2. Click/selected: edge thickens to 3px, inline label fades in
3. Detail zoom (<20 edges visible): small labels at 40% opacity

### 9. Tooltip Design

**300ms hover delay** to prevent flicker in dense areas.

**Node tooltip (280px fixed width):**
- Anchored to node (12px right, 8px below), NOT cursor-following
- 3px top border in party color
- Photo 32x32 + name + party/canton/council metadata
- Separator + connection stats + top 3 connections
- Background: surface-2 at 95% opacity + backdrop-blur-sm

**Edge tooltip (260px):**
- Connection type + role, actor names with arrow, confidence badge, source link

### 10. Detail Panel

**Right-side floating panel, 320px wide, slides from right edge (300ms ease-out).**
- Full canvas height, surface-1 at 95% opacity + backdrop-blur-lg
- Close button top-right

**Content sections:**
1. Photo + name + metadata + "View Full Profile" button (Swiss red)
2. CONNECTIONS list with inline filter tabs (All | Mandates | Memberships | ...)
3. SIMILAR ACTORS section (share 5+ connections)
4. PATH FINDER inline search input

**Graph reaction on node select:**
- Selected node: grows 20%, Swiss red ring, subtle pulse (scale 100%->108%->100%, 400ms)
- 1-hop neighbors: full opacity
- All other nodes: 20% opacity
- Non-connected edges: 5% opacity

### 11. Filter Panel

**Floating panel below toolbar, 260px wide, top-left of canvas.**
- surface-1 at 95% opacity + backdrop-blur-md, rounded-[10px]
- Party: checkbox grid (2 cols), party color dots
- Canton: dropdown with search (shadcn Command in Popover)
- Council: segmented control (NR / SR / Both)
- Industry: checkbox list with expander
- "Reset All Filters" button

**Active filter chips in toolbar:**
```
[Funnel] Filters (3) | [SVP x] [Finance x] [NR x] | [Clear all]
```

**Filter animation:** Non-matching nodes shrink to 0 + fade out (200ms ease). Matching hidden nodes grow in (200ms ease, 50ms stagger). NO FA2 re-run on filter changes -- nodes stay in position.

### 12. Search

**Dual-purpose search in toolbar:**
- Mode 1 (default): Single actor search with autocomplete (max 8 results, grouped by type)
- Mode 2 (path finder): After selecting first actor, prompt "Find path to..." for second actor
- Keyboard shortcut: `/` to focus search
- Search input expands 240px -> 400px on focus

**Path highlighting:**
- Both endpoints: Swiss red ring
- Intermediate path nodes: full opacity, 1.2x size
- Path edges: Swiss red, 3px, animated dash flow
- All other: 10% opacity

### 13. Semantic Zoom Levels (UX Designer Refinement)

**Level 1 -- Party Landscape (default):**
- 7-10 party super-nodes (48-64px radius), party color at 60% opacity, abbreviation label centered
- Inter-party edges: width proportional to shared organization connections
- Bottom-left caption: "246 Politiker:innen / 500+ Organisationen"

**Level 2 -- Actor Network (primary exploration):**
- Party expands into politician nodes + top 20 connected orgs
- 50-80 visible nodes budget
- Non-visible nodes shown as 2px dots at 15% opacity ("dust cloud")
- Expand animation: super-node pulse -> explode into constituent nodes (500ms) -> org nodes fade in (200ms, 100ms stagger) -> FA2 settles (2s)

**Level 3 -- Connection Detail:**
- <20 nodes visible
- Full name labels on all visible nodes
- Edge labels visible at 40% opacity
- Confidence dots on edge midpoints
- Politician photos inside nodes (24px circular)

Transitions are continuous, not stepped. Labels fade in smoothly across zoom thresholds.

### 14. Graph Legend

**Bottom-left floating panel, 200px wide.**
- surface-1 at 85% opacity + backdrop-blur-sm, rounded-[10px]
- Sections: Nodes (type shapes+colors), Edges (line styles), Confidence (dot colors)
- 2-column grid layout
- Collapsible, state in localStorage

### 15. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Escape` | Close panel / clear selection / exit search |
| `F` | Toggle filter panel |
| `L` | Toggle legend |
| `0` | Fit graph to viewport |

### 16. Mobile (< 768px)

Replace graph with "Connection Explorer" card/list view:
- Full-width search + horizontal party filter chips
- Scrollable actor cards: photo, name, party/canton, connection count, top connections, confidence badges
- Sort dropdown: Most connected, Name A-Z, Party, Canton
- Same /netzwerk URL, viewport-detected

## Component Structure (Final)

```
src/
  app/
    netzwerk/
      page.tsx                  -- Server Component: fetches data
      loading.tsx               -- Next.js loading skeleton
  components/
    graph/
      GraphContainer.tsx        -- "use client" + dynamic import (ssr:false)
      NetworkGraph.tsx          -- SigmaContainer + renderless children
      GraphCanvas.tsx           -- Renderless: buildGraph(), FA2 worker
      GraphEventHandler.tsx     -- Renderless: Sigma events -> zustand/nuqs
      GraphToolbar.tsx          -- Floating top toolbar (search + filter toggle + legend)
      GraphControls.tsx         -- Filter panel (party, canton, council, industry)
      GraphSearch.tsx           -- Search input + autocomplete + path finder
      NodeTooltip.tsx           -- Hover tooltip (300ms delay, anchored)
      DetailPanel.tsx           -- Right-side slide-in panel (node/edge/path detail)
      GraphLegend.tsx           -- Bottom-left floating legend
      GraphSkeleton.tsx         -- Loading skeleton
      MobileExplorer.tsx        -- Mobile card/list alternative
  lib/
    graph/
      buildGraph.ts             -- buildGraph() -> Graphology instance
      graphStyles.ts            -- Node/edge color, size, type utilities
      types.ts                  -- GraphActor, GraphConnection, GraphParty
      layout.ts                 -- FA2_SETTINGS, layout cache
      filters.ts                -- computeVisibleNodes() -> Set<string>
      paths.ts                  -- findShortestPaths() BFS
      search-params.ts          -- nuqs parsers for graph URL state
  stores/
    graph-store.ts              -- zustand ephemeral state
```

## Dependencies

- `sigma` ^3.0.0 (installed)
- `graphology` ^0.26.0 (installed)
- `@react-sigma/core` ^5.0.0 (installed)
- `graphology-layout-forceatlas2` ^0.10.0 (installed)
- `graphology-shortest-path` (installed)
- `graphology-types` (installed)
