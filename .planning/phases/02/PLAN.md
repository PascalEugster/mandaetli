# Phase 2 Implementation Plan: Network Graph Visualization

**Phase:** 2 of 5
**Requirements:** GRAPH-01 through GRAPH-10
**Approach:** See DISCUSSION.md
**Created:** 2026-02-27
**Updated:** 2026-02-27 (incorporated architect + UX designer feedback)

## Task Breakdown

### Task 02-01: Graph Infrastructure and Basic Rendering
**Goal:** Install graph libraries, create the /netzwerk page, render all nodes and edges with ForceAtlas2 layout
**Depends on:** Phase 1 complete
**Acceptance criteria:**
- Graph libraries installed (sigma, graphology, @react-sigma/core, graphology-layout-forceatlas2, graphology-types, graphology-shortest-path)
- `/netzwerk` page renders the full graph (~800 nodes, ~2182 edges) via WebGL
- ForceAtlas2 layout computes in a Web Worker, UI stays responsive
- Nodes visually differentiated: persons = circles (party color, size 6), orgs = circles (amber, size 4), parties = circles (party color, size 15), commissions = circles (purple, size 4)
- Edges colored by connection type with alpha (mandate=blue, membership=green, lobbying=amber, donation=red, employment=gray)
- Zoom and pan work smoothly (mouse wheel, trackpad, drag)
- Graph component is dynamically imported with `ssr: false`
- Renderless component pattern: GraphDataLoader + GraphEventHandler inside SigmaContainer
- zustand store created for ephemeral graph UI state
- No console errors, TypeScript compiles cleanly

**Steps:**

1. **Install graph dependencies**
   ```bash
   npm install sigma graphology @react-sigma/core graphology-layout-forceatlas2 graphology-types graphology-shortest-path
   ```

2. **Create lightweight graph types** (`src/types/graph.ts`)
   - `GraphActor` -- pick type with only graph-relevant fields: id, slug, name, actor_type, canton, council, party_id, abbreviation, color, industry, first_name, last_name
   - `GraphConnection` -- pick type: id, source_actor_id, target_actor_id, connection_type, confidence, role
   - `GraphData` -- `{ actors: GraphActor[], connections: GraphConnection[] }`

3. **Create graph builder** (`src/lib/graph/builder.ts`)
   - Pure function `buildGraph(actors: GraphActor[], connections: GraphConnection[]): Graph`
   - Creates `new Graph({ multi: false, type: "undirected" })`
   - Builds party color lookup map from party actors
   - Adds nodes with attributes: `label`, `slug`, `actorType`, `canton`, `council`, `partyId`, `industry`, `color` (party-based for persons, amber for orgs, purple for commissions), `size` (15 party, 6 person, 4 org/commission), `x`/`y` (random initial)
   - Adds edges with composite key `${source}--${target}--${connectionType}` for deduplication
   - Edge attributes: `connectionType`, `confidence`, `role`, `color` (rgba by type), `size: 1`
   - Skip self-loops and edges with missing endpoints
   - Uses helper functions from `colors.ts`

4. **Create graph color/style utilities** (`src/lib/graph/colors.ts`)
   - `getNodeColor(actor, partyColors: Map<string, string>)` -- party color for persons, `#F59E0B` for orgs, `#8B5CF6` for commissions, party's own color for parties
   - `getNodeSize(actorType)` -- 15 party, 6 person, 4 org/commission
   - `getEdgeColor(connectionType)` -- rgba values: mandate `rgba(59,130,246,0.3)`, membership `rgba(16,185,129,0.3)`, lobbying `rgba(245,158,11,0.3)`, donation `rgba(239,68,68,0.3)`, employment `rgba(148,163,184,0.3)`

5. **Create FA2 layout config** (`src/lib/graph/layout.ts`)
   - `FA2_SETTINGS` object: `barnesHutOptimize: true`, `barnesHutTheta: 0.5`, `gravity: 3`, `scalingRatio: 15`, `slowDown: 5`, `edgeWeightInfluence: 1`, `strongGravityMode: false`, `adjustSizes: true`, `linLogMode: false`
   - `FA2_TIMEOUT = 3000` ms
   - Layout cache Map keyed by filter-state hash (for restoring positions on "back" nav)

6. **Create zustand store** (`src/stores/graph-store.ts`)
   - State: `hoveredNodeId: string | null`, `tooltipPosition: { x: number; y: number } | null`, `isLayoutRunning: boolean`, `selectedEdgeId: string | null`
   - Actions for each state field
   - `viewLevel` computed getter (derived later from nuqs state in 02-02)

7. **Create the /netzwerk page** (`src/app/netzwerk/page.tsx`)
   - Server Component fetching only graph-relevant fields from Supabase
   - Actors: `id, slug, name, actor_type, canton, council, party_id, abbreviation, color, industry, first_name, last_name`
   - Connections: `id, source_actor_id, target_actor_id, connection_type, confidence, role` WHERE `valid_until IS NULL` (active only)
   - Dynamic import of GraphContainer with `ssr: false`
   - Pass data as `initialData: GraphData` prop

8. **Create loading.tsx** (`src/app/netzwerk/loading.tsx`)
   - Graph skeleton placeholder while server component fetches

9. **Create GraphContainer** (`src/components/graph/GraphContainer.tsx`)
   - `"use client"` component
   - Receives `initialData: GraphData` prop
   - Full viewport height: `h-[calc(100vh-64px)]` minus TopBar
   - Wraps `<SigmaContainer>` with settings:
     - `renderEdgeLabels: false`
     - `defaultEdgeType: "line"`
     - `labelColor: { color: "#F8FAFC" }`
     - `labelSize: 12`
     - `labelFont: "Inter"`
     - Background transparent (dark bg from page CSS)
   - Children: `<GraphDataLoader data={initialData}>` + `<GraphEventHandler>`

10. **Create GraphDataLoader** (`src/components/graph/GraphDataLoader.tsx`)
    - Renderless component inside SigmaContainer context
    - Uses `useLoadGraph` hook from `@react-sigma/core`
    - On mount: calls `buildGraph(data.actors, data.connections)`, loads into sigma
    - After graph loads: starts ForceAtlas2 via `graphology-layout-forceatlas2/worker`
    - Stops FA2 after `FA2_TIMEOUT` ms via setTimeout
    - Updates `isLayoutRunning` in zustand store
    - Returns `null`

11. **Create GraphEventHandler** (`src/components/graph/GraphEventHandler.tsx`)
    - Renderless component inside SigmaContainer context
    - Uses `useRegisterEvents` hook from `@react-sigma/core`
    - For Task 02-01: minimal -- log clicks for verification, basic enter/leave for cursor style
    - Full event wiring deferred to Task 02-02
    - Returns `null`

12. **Update Sidebar** (`src/components/layout/Sidebar.tsx`)
    - Enable "Netzwerk" link (remove disabled state, add proper href)

13. **Style the graph page**
    - Graph container: `bg-base` (darkest layer), full viewport height minus TopBar

**Files created/modified:**
- `package.json` (new deps)
- `src/types/graph.ts` (new)
- `src/lib/graph/builder.ts` (new)
- `src/lib/graph/colors.ts` (new)
- `src/lib/graph/layout.ts` (new)
- `src/stores/graph-store.ts` (new)
- `src/app/netzwerk/page.tsx` (new)
- `src/app/netzwerk/loading.tsx` (new)
- `src/components/graph/GraphContainer.tsx` (new)
- `src/components/graph/GraphDataLoader.tsx` (new)
- `src/components/graph/GraphEventHandler.tsx` (new)
- `src/components/layout/Sidebar.tsx` (modified)

**Commit:** `feat: add interactive network graph with ForceAtlas2 layout on /netzwerk`

---

### Task 02-02: Progressive Disclosure, Interactions, and Detail Panel
**Goal:** Interaction-driven progressive disclosure (overview -> filtered -> focused), hover tooltips, node/edge click, detail panels, path-finding. Also: update node/edge styling per UX spec, add sidebar auto-collapse, keyboard shortcuts.
**Depends on:** Task 02-01
**Acceptance criteria:**
- **Node styling update:** Politician fill = blue `#3b82f6`, party color as 2px ring (border). Org fill = green `#22c55e`. Node sizes proportional to degree: `6 + (degree/maxDegree) * 18`. Party nodes fixed 28px at 60% opacity.
- **Sidebar auto-collapse:** Sidebar collapses to 56px (icons only) on /netzwerk route
- Default view (overview): only party nodes visible (~8 nodes) with aggregated inter-party edges
- Clicking a party or applying a filter -> filtered view: matching actors + 1-hop neighbors, capped at 80 nodes
- Clicking an actor node -> focused view: ego network with selection highlight (20% size increase, Swiss red ring, pulse animation 100%->108%->100% 400ms). Neighbors full opacity. Others at 20% opacity. Non-connected edges at 5% opacity.
- viewLevel is derived from URL state: `selected` set -> focused, filters set -> filtered, else -> overview
- **Tooltip (300ms delay):** Fixed 280px width, anchored to node (12px right, 8px below), NOT cursor-following. 3px top border in party color. Content: photo 32x32 + name + party/canton/council + separator + stats + top 3 connections. Background: surface-2 at 95% opacity + backdrop-blur-sm.
- Hover dims non-neighbors to 20% opacity, non-connected edges to 5%
- Click node: detail panel opens (right side, 320px, slide-in 300ms ease-out). Content: photo 56x56 + name + metadata + "View Full Profile" button + CONNECTIONS list with filter tabs + SIMILAR ACTORS section + PATH FINDER input.
- Click two nodes: path-finding highlights shortest paths. Path edges = Swiss red, 3px. Intermediate nodes at 1.2x. All other at 10% opacity.
- Hover edge: tooltip with connection type, role, confidence badge, source
- Click edge: edge detail in panel
- Click empty space: deselects all
- **Double-click node:** Navigate to profile page (placeholder toast for Phase 2)
- **Keyboard shortcuts:** Escape = close/deselect, 0 = fit viewport
- **Legend:** Bottom-left floating panel, 200px, collapsible, 2-column grid with node types + edge types + confidence colors. State in localStorage.
- **Edge styling update:** Mandate solid 1.5px `#475569`, membership solid 1px `#334155`, lobbying dashed 1.5px `#475569`, donation dotted 1.5px `#f59e0b33`, employment solid 1px `#334155` (use solid fallback if custom edge programs too complex)

**Steps:**

0. **Update node/edge styling** (apply UX designer spec to existing files)
   - Update `graphStyles.ts`: politician fill = `#3b82f6` (always blue), add `getNodeBorderColor()` returning party color for persons. Org color = `#22c55e`. Edge styles per UX spec (colors, sizes).
   - Update `buildGraph.ts`: compute node degree after adding all edges, set `size = 6 + (degree / maxDegree) * 18`. Party nodes fixed size 28. Add `borderColor` and `borderSize: 2` attributes for politician nodes.
   - Update Sidebar to auto-collapse on `/netzwerk` route (detect pathname, set collapsed state).

1. **Create nuqs search params** (`src/lib/graph/search-params.ts`)
   - nuqs parsers for graph URL state:
     - `selected`: parseAsString (actor slug)
     - `parties`: parseAsArrayOf(parseAsString, ",")
     - `cantons`: parseAsArrayOf(parseAsString, ",")
     - `councils`: parseAsArrayOf(parseAsString, ",")
     - `industries`: parseAsArrayOf(parseAsString, ",")
     - `connectionTypes`: parseAsArrayOf(parseAsString, ",")
     - `pathFrom`: parseAsString
     - `pathTo`: parseAsString
     - `q`: parseAsString
   - Export `graphSearchParams` object for `useQueryStates`

2. **Create filter logic** (`src/lib/graph/filters.ts`)
   - Pure function `computeVisibleNodes(graph: Graph, filters: FilterState, selectedSlug: string | null): Set<string>`
   - If no filters and no selection: return party node IDs only (overview mode)
   - If filters active: find actors matching ALL active filters (AND logic), add 1-hop neighbors via `graph.neighbors()`, cap at 80 by degree centrality, return as Set
   - If selectedSlug set: find node, compute ego network (selected + neighbors + neighbor interconnections), return as Set
   - Export `deriveViewLevel(filters, selected)`: returns "overview" | "filtered" | "focused"

3. **Create path-finding utility** (`src/lib/graph/paths.ts`)
   - `findShortestPaths(graph: Graph, sourceId: string, targetId: string, maxDepth: number = 3): string[][]`
   - Uses graphology-shortest-path for BFS
   - Returns array of paths (each path = array of node IDs)
   - `getPathNodeAndEdgeIds(graph, paths): { nodeIds: Set<string>, edgeIds: Set<string> }` helper

4. **Update GraphEventHandler** (`src/components/graph/GraphEventHandler.tsx`) -- full event wiring:
   - `enterNode` -> zustand: `setHoveredNodeId` + `setTooltipPosition` (via `sigma.graphToViewport`)
   - `leaveNode` -> zustand: clear hover + tooltip
   - `clickNode` -> nuqs: set `selected` to node slug. If already have `selected`, set `pathFrom` = previous `selected`, `pathTo` = new slug
   - `enterEdge` / `leaveEdge` -> zustand: edge hover state
   - `clickEdge` -> zustand: `setSelectedEdgeId`
   - `clickStage` -> nuqs: clear `selected`, `pathFrom`, `pathTo`; zustand: clear `selectedEdgeId`

5. **Implement nodeReducer in GraphContainer's SigmaContainer settings:**
   - Compute visible set via `computeVisibleNodes(graph, currentFilters, selectedSlug)`
   - Nodes not in visible set: `{ hidden: true }`
   - If hoveredNodeId set: neighbors of hovered node keep full color, non-neighbors get dimmed color (0.15 opacity)
   - If node is selected: add `borderColor: "#FF0000"`, `borderSize: 3`
   - If path-finding active (pathFrom + pathTo): path nodes highlighted, non-path dimmed

6. **Implement edgeReducer:**
   - Hide edges where either endpoint is hidden (not in visible set)
   - If hoveredNodeId set: show only edges connected to hovered node at full opacity, dim rest
   - If path-finding active: highlight path edges, dim rest

7. **Create NodeTooltip** (`src/components/graph/NodeTooltip.tsx`)
   - Reads `hoveredNodeId` + `tooltipPosition` from zustand
   - **300ms hover delay** (use setTimeout, clear on leaveNode)
   - **Fixed width 280px**, anchored to node position (12px right, 8px below), NOT following cursor
   - Flip to left/above if near screen edge
   - **3px top border** in party color (from node attributes)
   - Content layout: Photo 32x32 (rounded-full, initials fallback on surface-3) | Name (text-h2, text-primary) | Party abbreviation + canton + council (text-body-sm, text-tertiary, separated by " · ") | Separator (1px border-subtle) | Connection stats: "23 Verbindungen / 12 Mandate / 4 Lobbying" (text-body-sm, numbers semibold) | Top 3 connections with colored type dots (text-body-sm, text-secondary)
   - Background: `surface-2` at 95% opacity + `backdrop-blur-sm`
   - Border: 1px border-default, rounded-lg
   - Animation: fade-in 150ms ease, fade-out 100ms ease

8. **Create DetailPanel** (`src/components/graph/DetailPanel.tsx`) -- renamed from EdgeDetailPanel
   - Right-side sliding panel, 320px wide, full canvas height
   - Slide-in from right: 300ms ease-out animation (translate-x)
   - Background: surface-1 at 95% opacity + backdrop-blur-lg, left border 1px border-subtle
   - Close button: top-right X icon (ghost button)
   - **Node detail mode** (when `selected` is set in nuqs):
     - Photo 56x56 (rounded-full) + name (text-h1) + metadata (party/canton/council)
     - "Profil anzeigen" button (Swiss red bg, white text, links to /person/[slug] or shows toast "Profilseiten folgen in Phase 3")
     - Separator
     - "VERBINDUNGEN (N)" section header (text-h3) with filter tabs: Alle | Mandate | Mitgliedschaften | Lobbying | Spenden | Anstellungen
     - Scrollable connection list: each row shows colored dot + org/person name + connection type + confidence badge
     - Separator
     - "AHNLICHE AKTEURE" section (share 5+ connections): list with shared count
     - Separator
     - "PFAD FINDEN" section: inline search input to select second actor for path finding
   - **Edge detail mode** (when `selectedEdgeId` is set in zustand):
     - Connection type (text-h3 bold) + role
     - Source actor -> target actor (with arrow)
     - Confidence badge + source link (text-caption, text-tertiary)
   - **Path detail mode** (when pathFrom + pathTo set):
     - "PFAD: Actor A -> Actor B" header
     - Path count + shortest hop count
     - Step-by-step path visualization: Node --[type]--> Node
   - Clicking different node crossfades panel content (200ms)
   - Click empty canvas closes panel

9. **Create GraphLegend** (`src/components/graph/GraphLegend.tsx`)
   - **Bottom-left** floating panel, 200px wide, 12px from bottom and left edge of canvas
   - Background: surface-1 at 85% opacity + backdrop-blur-sm, border 1px border-subtle, rounded-[10px], padding 12px
   - "LEGENDE" header (text-h3, text-tertiary, uppercase) with chevron toggle
   - **Nodes section:** 2-column grid with colored circle/shape samples + German labels (Politiker:in, Organisation, Partei, Kommission)
   - **Edges section:** 2-column grid with line style samples + labels (Mandat, Mitgliedschaft, Lobbying, Spende, Anstellung)
   - **Confidence section:** colored dots + labels (Verifiziert, Deklariert, Medienberichte, Abgeleitet)
   - Collapsible (collapsed = just header bar "LEGENDE [v]")
   - Collapse state saved in localStorage
   - Visible by default on first visit

9b. **Add keyboard shortcuts** (in GraphEventHandler or separate hook)
    - `Escape`: close panel / clear selection / exit search (cascading)
    - `0`: fit graph to viewport (`sigma.getCamera().animatedReset()`)
    - Double-click node: `doubleClickNode` event -> navigate to profile or show toast

10. **FA2 re-run on view transitions:**
    - Update `GraphDataLoader` to accept view-level changes
    - When switching overview -> filtered (>20% node visibility change): re-run FA2 with 200 iterations
    - When switching to focused (ego network): re-run FA2 with 200 iterations
    - Use layout cache: save positions after FA2 stops, restore from cache on "back" transitions

**Files created/modified:**
- `src/lib/graph/search-params.ts` (new)
- `src/lib/graph/filters.ts` (new)
- `src/lib/graph/paths.ts` (new)
- `src/components/graph/GraphEventHandler.tsx` (modified -- full event wiring)
- `src/components/graph/GraphContainer.tsx` (modified -- add nodeReducer, edgeReducer, tooltip, panel)
- `src/components/graph/NodeTooltip.tsx` (new)
- `src/components/graph/EdgeDetailPanel.tsx` (new)
- `src/components/graph/GraphLegend.tsx` (new)
- `src/stores/graph-store.ts` (modified -- additional state fields)
- `src/lib/graph/layout.ts` (modified -- add re-run + cache logic)

**Commit:** `feat: add progressive disclosure, hover/click interactions, and detail panels`

---

### Task 02-03: Graph Filters, In-Graph Search, and Toolbar
**Goal:** Filter panel UI, dual-purpose search (single actor + path finder), floating toolbar, full URL state persistence
**Depends on:** Task 02-02
**Acceptance criteria:**
- **Floating toolbar** (top of canvas, 44px height): surface-1 at 90% opacity + backdrop-blur-md, rounded-[10px], 12px margins. Contains: filter toggle (funnel + count badge), inline search input, legend toggle
- **Filter panel** (260px, below toolbar, top-left): party checkboxes (2-col grid with color dots), canton dropdown (shadcn Command in Popover), council segmented control (NR/SR/Both), industry checkboxes with expander, connection type checkboxes. surface-1 at 95% opacity + backdrop-blur-md
- Filters combine (AND logic): selecting SVP + canton ZH shows only SVP members from Zurich
- **Filter animation:** non-matching nodes shrink to 0 + fade out (200ms ease). Matching hidden nodes grow in (200ms ease, 50ms stagger). NO FA2 re-run on filter changes.
- **Active filter chips in toolbar:** `[SVP x] [Finance x] [NR x] [Clear all]`
- "Alle zurucksetzen" button in filter panel resets to overview
- **Search:** inline in toolbar, expands 240px -> 400px on focus. Autocomplete dropdown (max 8 results, grouped by type: Politiker:innen, Organisationen, Parteien). Each result: type dot + name + party + canton.
- **Path finder mode:** after selecting first actor, search shows "Find path to..." prompt. Selecting second actor highlights paths (Swiss red edges 3px, animated dash, intermediate nodes 1.2x, rest 10% opacity).
- Keyboard shortcut: `/` to focus search, `F` to toggle filters, `L` to toggle legend
- All state persisted in URL via nuqs -- shared URL restores exact view
- **Zoom controls:** separate floating vertical stack (top-right or bottom-right): +/- buttons + fit-all
- Graph skeleton shown during dynamic import

**Steps:**

1. **Create GraphToolbar** (`src/components/graph/GraphToolbar.tsx`)
   - **Floating bar at top of canvas**, 44px height, 12px margins from edges
   - Background: surface-1 at 90% opacity + backdrop-blur-md (12px blur)
   - Border: 1px border-subtle, rounded-[10px]
   - Layout (left to right): Filter toggle button (Funnel icon + active count badge) | Search input (inline, 240px resting, expands to 400px on focus) | Legend toggle (BookOpen icon)
   - Filter toggle: when clicked, opens/closes GraphControls panel below
   - When filters active, show chips to the right of funnel: `[SVP x] [Finance x]` + "[Clear all]" link
   - If >4 chips, show "+N more" with dropdown

2. **Create GraphControls** (`src/components/graph/GraphControls.tsx`)
   - **Floating panel below toolbar**, 260px wide, 12px below toolbar, 12px from left
   - Background: surface-1 at 95% opacity + backdrop-blur-md, border 1px border-subtle, rounded-[10px], padding 16px
   - Max height: `calc(100vh - 64px - 44px - 24px)`, overflow-y auto (scrollable)
   - Sections (German labels):
     - **Parteien:** 2-column checkbox grid. Each: party color dot (8px circle) + abbreviation. Top 6 shown, "Alle 8 anzeigen" expander. All checked by default.
     - **Kantone:** Dropdown with search (shadcn Command inside Popover). Default "Alle Kantone". Multiple selection with chips.
     - **Rat:** Segmented control (NR / SR / Beide). surface-2 bg, active = surface-3 + text-primary. Default "Beide".
     - **Branche:** Single-column checkbox list. Top 6 shown, "Alle 22 anzeigen" expander. Each: colored dot + sector name.
     - **Verbindungstyp:** Checkboxes (Mandat, Mitgliedschaft, Lobbying, Spende, Anstellung)
   - "Alle Filter zurucksetzen" button at bottom
   - Reads/writes nuqs params via `useQueryStates(graphSearchParams)`
   - Real-time graph update: no "Apply" button needed

3. **Create GraphSearch** (`src/components/graph/GraphSearch.tsx`)
   - Inline in toolbar, expands from 240px to 400px on focus (200ms ease)
   - Background: surface-2 at 80% opacity, border 1px border-default, focus: border-strong + Swiss red ring
   - Placeholder: "Akteure suchen... (oder /)" in text-muted
   - Search icon 16px, text-tertiary
   - **Mode 1 (single actor):** Debounced 300ms, filters from Graphology node attributes (case-insensitive includes). Dropdown max 8 results grouped by type (Politiker:innen, Organisationen, Parteien headers in text-caption text-muted uppercase). Each row 40px: type dot + name + party/type + canton. Hover: surface-3 bg.
   - Selecting result: sets `selected` in nuqs, `sigma.getCamera().animate({ x, y, ratio: 0.1 })` for smooth zoom-to
   - **Mode 2 (path finder):** After selecting first actor, search input shows "[Actor A] -> [type to find...]". Same autocomplete. Selecting second actor sets `pathFrom` + `pathTo` in nuqs.
   - Clear path: Escape or "Clear path" button in toolbar
   - Keyboard: `/` to focus search

4. **Create zoom controls** (can be part of GraphToolbar or separate component)
   - Floating vertical stack, positioned bottom-right of canvas (12px margins)
   - surface-2 bg, rounded-lg, border border-subtle
   - Buttons: + (animatedZoom), - (animatedUnzoom), Maximize (animatedReset/fit-all)
   - Keyboard: `0` for fit-all (already wired in 02-02)

5. **Create GraphSkeleton** (`src/components/graph/GraphSkeleton.tsx`)
   - Full-viewport skeleton matching graph page layout
   - Pulsing circles of various sizes (simulating graph nodes)
   - Shown during dynamic import `loading` state

6. **URL state initialization on page load:**
   - Update `/netzwerk/page.tsx` for nuqs context if needed
   - GraphContainer reads nuqs params on mount
   - If `selected` present: find node by slug, zoom camera to it
   - If filter params present: apply filters
   - If `pathFrom` + `pathTo` present: compute and highlight paths

7. **Keyboard shortcuts** (in GraphEventHandler or separate hook)
   - `/` -> focus search input
   - `F` -> toggle filter panel
   - `L` -> toggle legend
   - (Escape and 0 already in 02-02)

**Files created/modified:**
- `src/components/graph/GraphControls.tsx` (new)
- `src/components/graph/GraphSearch.tsx` (new)
- `src/components/graph/GraphToolbar.tsx` (new)
- `src/components/graph/GraphSkeleton.tsx` (new)
- `src/components/graph/GraphContainer.tsx` (modified -- integrate toolbar, controls, search, skeleton)
- `src/app/netzwerk/page.tsx` (modified -- nuqs provider if needed)

**Commit:** `feat: add graph filters, search, toolbar, and URL state persistence`

---

## Execution Order

```
02-01: Graph Infrastructure and Basic Rendering
  |
02-02: Progressive Disclosure, Interactions, and Detail Panel
  |
02-03: Graph Filters, In-Graph Search, and Toolbar
```

Sequential -- each task builds on the previous.

## Verification Checklist

After all tasks complete:
1. [ ] `/netzwerk` renders all ~800 nodes + ~2182 edges without frame drops
2. [ ] ForceAtlas2 layout computes in Web Worker (UI stays responsive during layout)
3. [ ] Default view shows only party clusters (~8 nodes), not all actors
4. [ ] Applying a filter shows matching actors + 1-hop neighbors (capped at 80)
5. [ ] Clicking a node shows ego network and opens detail panel (320px, slide-in)
6. [ ] Hovering a node shows tooltip (300ms delay, 280px, anchored, party color border, photo+stats)
7. [ ] Hovering dims non-neighbors to 20% opacity, non-connected edges to 5%
8. [ ] Clicking two nodes highlights shortest path (Swiss red edges, intermediate nodes 1.2x)
9. [ ] Filters (party, canton, council, industry) combine with AND logic and update instantly
10. [ ] Filter animation: non-matching fade out (200ms), matching fade in (200ms, stagger)
11. [ ] Search finds actors and zooms camera to matching node
12. [ ] Path finder mode works (select two actors via search)
13. [ ] URL captures all state (filters, selected node, path endpoints) -- shared URL restores view
14. [ ] `tsc --noEmit` clean, `biome check` clean, `npm run build` succeeds
15. [ ] Edge hover shows connection type, role, and confidence
16. [ ] Politician nodes: blue fill + party color ring (border). Sizes proportional to degree.
17. [ ] Graph legend visible (bottom-left, collapsible, node + edge + confidence sections)
18. [ ] Sidebar auto-collapses to 56px on /netzwerk
19. [ ] Floating toolbar (top, 44px, backdrop-blur) with filter toggle + search + legend toggle
20. [ ] Keyboard shortcuts: / (search), Escape (close/deselect), F (filters), L (legend), 0 (fit)
21. [ ] Active filter chips visible in toolbar when filters applied

---
*Plan created: 2026-02-27*
*Updated with architect + UX designer feedback: 2026-02-27*
