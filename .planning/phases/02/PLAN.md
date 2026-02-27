# Phase 2 Implementation Plan: Network Graph Visualization

**Phase:** 2 of 5
**Requirements:** GRAPH-01 through GRAPH-10
**Approach:** See DISCUSSION.md
**Created:** 2026-02-27
**Updated:** 2026-02-27 (incorporated architect feedback)

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
**Goal:** Interaction-driven progressive disclosure (overview -> filtered -> focused), hover tooltips, node/edge click, detail panels, path-finding
**Depends on:** Task 02-01
**Acceptance criteria:**
- Default view (overview): only party nodes visible (~8 nodes) with aggregated inter-party edges
- Clicking a party or applying a filter -> filtered view: matching actors + 1-hop neighbors, capped at 80 nodes
- Clicking an actor node -> focused view: ego network (actor + direct connections + neighbor interconnections)
- viewLevel is derived from URL state: `selected` set -> focused, filters set -> filtered, else -> overview
- Hover any node: tooltip shows name, actor type, party, canton, connection count
- Hover dims non-neighbors to 0.15 opacity
- Click node: selected node gets Swiss red ring, detail panel opens
- Click two different nodes: path-finding highlights all shortest paths (max depth 3), dims rest
- Hover edge: tooltip shows connection type, role, confidence level
- Click edge: slide-in panel shows full connection details with source URL
- Click empty space: deselects all
- FA2 re-runs on major view transitions (200 iterations)

**Steps:**

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
   - Positioned via absolute coords on graph container div
   - Content: name (bold), actor type icon, party badge (colored dot + abbreviation), canton, "X Verbindungen"
   - Styled: `bg-surface-3`, `border border-border-subtle`, `rounded-md`, `shadow-lg`, `text-sm`
   - Hidden when `hoveredNodeId` is null

8. **Create EdgeDetailPanel** (`src/components/graph/EdgeDetailPanel.tsx`)
   - Right-side sliding panel (320px, overlays graph canvas, animates from right)
   - Visible when `selectedEdgeId` is set (zustand) OR when `selected` is set (nuqs)
   - **Node detail mode** (selected actor): name, actor type, party, canton, council, connection count, scrollable list of all connections with confidence badges
   - **Edge detail mode** (selected edge): connection type label, role, confidence badge, source/target actor names, source URL link
   - **Path detail mode** (pathFrom + pathTo set): shows path steps (Node A -> Edge -> Node B -> ...)
   - Close button clears relevant state

9. **Create GraphLegend** (`src/components/graph/GraphLegend.tsx`)
   - Bottom-left overlay on graph canvas
   - Node type legend: colored circles with German labels (Politiker:in, Organisation, Partei, Kommission)
   - Edge type legend: colored lines with German labels (Mandat, Mitgliedschaft, Lobbying, Spende, Anstellung)
   - Collapsible via chevron toggle

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
**Goal:** Filter panel UI, search with autocomplete and camera zoom-to, toolbar controls, full URL state persistence
**Depends on:** Task 02-02
**Acceptance criteria:**
- Filter panel with party, canton, council (NR/SR), industry, and connection type filters
- Filters combine (AND logic): selecting SVP + canton ZH shows only SVP members from Zurich
- Filters update graph in real time via Sigma.js reducers (already wired in 02-02)
- Active filter count shown on filter toggle button
- "Alle zurucksetzen" button clears all filters, returns to overview
- Search input -- typing shows autocomplete list of matching actors (top 10, from graph memory)
- Selecting a search result: sets `selected` in URL, zooms camera smoothly to node
- Cmd+K keyboard shortcut opens search
- All state persisted in URL via nuqs -- shared URL restores exact view
- Toolbar: zoom +/-, fit-all, filter toggle, search trigger
- Graph skeleton shown during dynamic import

**Steps:**

1. **Create GraphControls** (`src/components/graph/GraphControls.tsx`)
   - Left-side collapsible panel (280px, overlays graph canvas, animates from left)
   - Toggle button on toolbar (funnel icon with active count badge)
   - Sections (German labels):
     - **Parteien:** Checkboxes with party color dots and member counts from graph
     - **Kantone:** Searchable multi-select (26 cantons with internal filter input)
     - **Rat:** Toggle pills: NR / SR / Beide
     - **Branche:** Searchable multi-select (22 industries)
     - **Verbindungstyp:** Checkboxes (Mandat, Mitgliedschaft, Lobbying, Spende, Anstellung)
   - "Alle zurucksetzen" button at bottom
   - Reads/writes nuqs params via `useQueryStates(graphSearchParams)`
   - Filter counts update dynamically from graph data (e.g., "SVP (62)")

2. **Create GraphSearch** (`src/components/graph/GraphSearch.tsx`)
   - Search input positioned in toolbar area or as overlay
   - Debounced (300ms) text input
   - Filters actor names from Graphology graph node attributes (case-insensitive includes)
   - Dropdown: up to 10 results with actor type icon + party color dot + canton
   - Selecting result: sets `selected` in nuqs, calls `sigma.getCamera().animate({ x, y, ratio: 0.1 })` for smooth zoom-to
   - Cmd+K keyboard shortcut to focus/toggle search
   - `q` param in nuqs preserves search query text

3. **Create GraphToolbar** (`src/components/graph/GraphToolbar.tsx`)
   - Top-right overlay on graph canvas
   - Buttons (icon-only with tooltips):
     - Zoom in (+) -- `sigma.getCamera().animatedZoom()`
     - Zoom out (-) -- `sigma.getCamera().animatedUnzoom()`
     - Fit all (Maximize icon) -- `sigma.getCamera().animatedReset()`
     - Filter toggle (Filter/Funnel icon + badge showing active filter count)
     - Search toggle (Search icon)
   - Styled: `bg-surface-2`, `rounded-lg`, `border border-border-subtle`, vertical stack

4. **Create GraphSkeleton** (`src/components/graph/GraphSkeleton.tsx`)
   - Full-viewport skeleton matching graph page layout
   - Pulsing circles of various sizes (simulating graph nodes)
   - Shown during dynamic import `loading` state

5. **URL state initialization on page load:**
   - Update `/netzwerk/page.tsx` to pass URL search params context
   - `GraphContainer` reads nuqs params on mount
   - If `selected` present: find node by slug, set initial camera position to zoom to it
   - If filter params present: apply filters (visible node set computed automatically)
   - If `pathFrom` + `pathTo` present: compute paths and highlight

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
5. [ ] Clicking a node shows ego network and opens detail panel
6. [ ] Hovering a node shows tooltip with name, party, canton, connection count
7. [ ] Hovering dims non-neighbors to 0.15 opacity
8. [ ] Clicking two nodes highlights shortest path between them
9. [ ] Filters (party, canton, council, industry) combine with AND logic and update instantly
10. [ ] Search finds actors and zooms camera to matching node
11. [ ] URL captures all state (filters, selected node, path endpoints) -- shared URL restores view
12. [ ] `tsc --noEmit` clean, `biome check` clean, `npm run build` succeeds
13. [ ] Edge hover shows connection type, role, and confidence
14. [ ] Nodes visually distinct by actor type (color, size)
15. [ ] Graph legend visible with node and edge type explanations

---
*Plan created: 2026-02-27*
*Updated with architect feedback: 2026-02-27*
