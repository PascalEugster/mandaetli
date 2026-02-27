# Phase 2 Implementation Plan: Network Graph Visualization

**Phase:** 2 of 5
**Requirements:** GRAPH-01 through GRAPH-10
**Approach:** See DISCUSSION.md
**Created:** 2026-02-27

## Task Breakdown

### Task 02-01: Graph Infrastructure and Basic Rendering
**Goal:** Install graph libraries, create the /netzwerk page, render all nodes and edges with ForceAtlas2 layout
**Depends on:** Phase 1 complete
**Acceptance criteria:**
- Graph libraries installed (sigma, graphology, @react-sigma/core, graphology-layout-forceatlas2, graphology-types)
- `/netzwerk` page renders the full graph (800 nodes, 2182 edges) via WebGL
- ForceAtlas2 layout computes in a Web Worker, UI stays responsive
- Nodes visually differentiated: persons = circles (party color), orgs = squares (amber), parties = large circles (party color), commissions = small circles (purple)
- Edges styled by connection type (solid/dashed/dotted, distinct colors)
- Edge opacity reflects confidence level
- Zoom and pan work smoothly (mouse wheel, trackpad, drag)
- Graph component is dynamically imported with `ssr: false`
- No console errors, TypeScript compiles cleanly

**Steps:**

1. **Install graph dependencies**
   ```bash
   npm install sigma graphology @react-sigma/core graphology-layout-forceatlas2 graphology-types graphology-shortest-path
   ```

2. **Create graph utility: buildGraph.ts** (`src/lib/graph/buildGraph.ts`)
   - Function `buildGraph(actors: Actor[], connections: Connection[], parties: Party[]): Graph`
   - Creates Graphology `Graph` (undirected, multi)
   - Adds nodes with attributes: `type`, `label`, `x` (random initial), `y` (random initial), `size`, `color`, `partyId`, `canton`, `council`, `industry`, `actorType`
   - Adds edges with attributes: `connectionType`, `confidence`, `role`, `label`, `color`, `type` (line/dashed/dotted)
   - Person node color = party color from `parties` lookup. Org = `#F59E0B`. Party = party color (larger). Commission = `#8B5CF6`.
   - Person size = 6, org = 5, party = 12 (scaled by total seats), commission = 4

3. **Create graph styles utility** (`src/lib/graph/graphStyles.ts`)
   - `getNodeColor(actor, parties)` -- party color for persons, amber for orgs, etc.
   - `getNodeSize(actor)` -- by type
   - `getEdgeStyle(connection)` -- color, type (line/dashed), size by connection type
   - `getEdgeOpacity(confidence)` -- verified 1.0, declared 0.8, media_reported 0.5, inferred 0.3
   - Sigma.js node program references for different shapes (circle default, can add custom programs later)

4. **Create the /netzwerk page** (`src/app/netzwerk/page.tsx`)
   - Server Component fetching all actors and connections from Supabase
   - Query actors with party data joined
   - Query all connections
   - Pass serialized data as props to client wrapper
   - Dynamic import of NetworkGraph with `ssr: false`

5. **Create NetworkGraph component** (`src/components/graph/NetworkGraph.tsx`)
   - `"use client"` component
   - Receives actors + connections as props
   - Wraps `<SigmaContainer>` from `@react-sigma/core`
   - Inside SigmaContainer: `<GraphCanvas>` child component
   - SigmaContainer settings: `renderEdgeLabels: false`, `defaultEdgeType: "line"`, `labelColor: { color: "#F8FAFC" }`, `labelSize: 12`, `labelFont: "Inter"`, background transparent (dark bg from page CSS)

6. **Create GraphCanvas component** (`src/components/graph/GraphCanvas.tsx`)
   - `"use client"` -- runs inside SigmaContainer context
   - Uses `useLoadGraph` to build and load the Graphology graph on mount
   - Uses `useSigma` for sigma instance access
   - Starts ForceAtlas2 worker via `graphology-layout-forceatlas2/worker`
   - FA2 settings: `barnesHutOptimize: true`, `gravity: 0.05`, `scalingRatio: 10`, `slowDown: 5`
   - Runs FA2 for 3 seconds then stops (or until `avgMovement < 0.5`)
   - Shows loading state while layout computes

7. **Update Sidebar navigation** -- Enable "Netzwerk" link in Sidebar.tsx (currently disabled)

8. **Style the graph page** -- Full viewport height minus TopBar (64px), dark background `bg-base`

**Files created/modified:**
- `package.json` (new deps)
- `src/lib/graph/buildGraph.ts` (new)
- `src/lib/graph/graphStyles.ts` (new)
- `src/app/netzwerk/page.tsx` (new)
- `src/components/graph/NetworkGraph.tsx` (new)
- `src/components/graph/GraphCanvas.tsx` (new)
- `src/components/layout/Sidebar.tsx` (modified -- enable Netzwerk link)

**Commit:** `feat: add interactive network graph with ForceAtlas2 layout on /netzwerk`

---

### Task 02-02: Semantic Zoom, Hover/Click Interactions, and Detail Panel
**Goal:** Progressive disclosure via zoom levels, hover tooltips, node/edge click interactions, and a detail panel
**Depends on:** Task 02-01
**Acceptance criteria:**
- Zoomed out (ratio < 0.3): Only party nodes visible (8), aggregated edges between parties, individual nodes hidden
- Mid zoom (0.3-0.7): Individual politician/org nodes appear with name labels
- Zoomed in (>0.7): Full detail -- edge labels on hover, confidence badges visible
- Hover any node: tooltip shows name, actor type, party (if person), canton, connection count
- Click node: right-side detail panel opens with actor info and list of all connections
- Hover edge: tooltip shows connection type, role, confidence level
- Click edge: detail panel shows full connection info with source link
- Two-node selection: click node A, then click node B -> all shortest paths highlighted, rest dimmed
- Path-finding uses graphology-shortest-path
- Non-connected/non-hovered nodes dim to 0.15 opacity during hover

**Steps:**

1. **Create useSemanticZoom hook** (`src/components/graph/hooks/useSemanticZoom.ts`)
   - Listens to sigma camera `updated` event
   - Reads `camera.ratio` to determine current zoom level (1/2/3)
   - Returns `{ zoomLevel, cameraRatio }`
   - Debounced to avoid excessive re-renders

2. **Create useGraphInteraction hook** (`src/components/graph/hooks/useGraphInteraction.ts`)
   - zustand store for: `hoveredNode`, `selectedNode`, `secondSelectedNode`, `hoveredEdge`, `selectedEdge`
   - Actions: `setHoveredNode`, `selectNode` (handles two-node selection logic), `clearSelection`, `setHoveredEdge`, `selectEdge`
   - Path-finding state: when two nodes selected, compute shortest paths via graphology-shortest-path

3. **Update GraphCanvas** to register Sigma event handlers:
   - `enterNode` / `leaveNode` -> update hover state
   - `clickNode` -> update selection state
   - `enterEdge` / `leaveEdge` -> update edge hover
   - `clickEdge` -> update edge selection

4. **Implement nodeReducer in SigmaContainer settings:**
   - If zoom level 1: hide all non-party nodes (`{ hidden: true }`)
   - If a node is hovered: highlight neighbors, dim non-neighbors to 0.15 opacity
   - If a node is selected: highlight selected node with red ring (`borderColor: "#FF0000"`, `borderSize: 3`)
   - If two nodes selected: highlight nodes on shortest path, dim everything else

5. **Implement edgeReducer in SigmaContainer settings:**
   - If zoom level 1: show only party-to-party aggregated edges (pre-computed)
   - If a node is hovered: show only edges connected to hovered node
   - If two nodes selected: show only edges on shortest path(s)

6. **Create GraphTooltip component** (`src/components/graph/GraphTooltip.tsx`)
   - Positioned near mouse cursor (reads sigma viewport coordinates)
   - Node tooltip: name, actor type icon, party badge, canton, connection count
   - Edge tooltip: connection type label, role, confidence badge
   - Styled with surface-3 background, border-subtle, shadow

7. **Create GraphDetailPanel component** (`src/components/graph/GraphDetailPanel.tsx`)
   - Right-side sliding panel (320px wide, overlays graph)
   - Shows when a node or edge is selected
   - Node panel: actor name, type, photo (if person), party, canton, council, all connections listed with confidence badges
   - Edge panel: connection type, role, source/target names, confidence, source URL
   - Close button returns to full graph
   - Path panel (when two nodes selected): shows shortest path steps

8. **Create GraphLegend component** (`src/components/graph/GraphLegend.tsx`)
   - Bottom-left overlay on graph
   - Shows node type legend (circle/square/diamond by actor type + colors)
   - Shows edge type legend (solid/dashed/dotted by connection type)
   - Collapsible to minimize screen real estate

**Files created/modified:**
- `src/components/graph/hooks/useSemanticZoom.ts` (new)
- `src/components/graph/hooks/useGraphInteraction.ts` (new)
- `src/components/graph/GraphCanvas.tsx` (modified -- add event handlers, reducers)
- `src/components/graph/NetworkGraph.tsx` (modified -- add reducers to SigmaContainer)
- `src/components/graph/GraphTooltip.tsx` (new)
- `src/components/graph/GraphDetailPanel.tsx` (new)
- `src/components/graph/GraphLegend.tsx` (new)

**Commit:** `feat: add semantic zoom, hover/click interactions, and detail panel`

---

### Task 02-03: Graph Filters, In-Graph Search, and URL State
**Goal:** Filter the graph by party/canton/council/industry, search for actors within the graph, and persist state in URL
**Depends on:** Task 02-02
**Acceptance criteria:**
- Filter panel with party, canton, council (NR/SR), and industry sector filters
- Filters combine (AND logic): selecting SVP + canton ZH shows only SVP members from Zurich
- Filters update graph in real time via Sigma.js reducers
- Search input in graph toolbar -- typing filters autocomplete list of actors
- Selecting a search result zooms camera to that node and highlights it
- All filter and search state persisted in URL via nuqs
- Opening a shared URL restores exact filter state + selected node + zoom level
- Clear all filters button resets to default view
- Filter counts update dynamically (e.g., "SVP (62)" showing how many nodes match)

**Steps:**

1. **Create useGraphFilters hook** (`src/components/graph/hooks/useGraphFilters.ts`)
   - nuqs parsers for: `parties` (string array), `cantons` (string array), `council` (string), `industries` (string array), `actorTypes` (string array), `selectedNode` (string, actor slug), `zoom` (float)
   - zustand store synced with nuqs for reactive updates
   - `isNodeVisible(node)` function that checks node attributes against active filters
   - `activeFilterCount` computed value

2. **Create GraphFilters component** (`src/components/graph/GraphFilters.tsx`)
   - Left-side collapsible panel (280px) overlaying graph
   - Toggle button on graph toolbar
   - Sections:
     - **Parteien:** Checkboxes with party color dots and seat counts
     - **Kantone:** Searchable multi-select dropdown (26 cantons)
     - **Rat:** Toggle pills NR / SR / Beide
     - **Branche:** Searchable multi-select dropdown (22 industries)
     - **Akteurtyp:** Toggle pills Person / Organisation / Partei
   - "Alle zurucksetzen" button at bottom
   - Active filter count badge on toggle button

3. **Update nodeReducer** to integrate filter visibility:
   - Node hidden if `!isNodeVisible(nodeAttributes)` from filter hook
   - Combine with semantic zoom logic (Level 1 still overrides)
   - Update edgeReducer: hide edges where either endpoint is filtered out

4. **Create GraphSearch component** (`src/components/graph/GraphSearch.tsx`)
   - Search input in graph toolbar area
   - Debounced text input filters actors by name (fuzzy match via string includes)
   - Dropdown shows up to 10 matching actors with type icon + party badge
   - Selecting a result: sets `selectedNode` in URL, animates camera to node position
   - Uses `sigma.getCamera().animate()` for smooth zoom-to
   - Cmd+K keyboard shortcut opens search (via cmdk or custom handler)

5. **Create GraphToolbar component** (`src/components/graph/GraphToolbar.tsx`)
   - Top-right overlay on graph canvas
   - Buttons: Zoom in (+), Zoom out (-), Fit all (expand icon), Reset filters
   - Search trigger (magnifying glass icon)
   - Filter panel toggle (funnel icon with active count badge)
   - Styled with surface-2 background, rounded, subtle border

6. **Wire nuqs URL state:**
   - Wrap graph page with `NuqsAdapter` (or use `useQueryState` hooks directly)
   - On initial load: parse URL params -> set filters -> graph renders with those filters
   - On filter change: update URL params (shallow routing, no page reload)
   - `selectedNode` param: if present, zoom camera to that actor on load

7. **Update Sidebar** -- "Netzwerk" link should preserve current graph URL params

**Files created/modified:**
- `src/components/graph/hooks/useGraphFilters.ts` (new)
- `src/components/graph/GraphFilters.tsx` (new)
- `src/components/graph/GraphSearch.tsx` (new)
- `src/components/graph/GraphToolbar.tsx` (new)
- `src/components/graph/GraphCanvas.tsx` (modified -- integrate filter reducers)
- `src/components/graph/NetworkGraph.tsx` (modified -- add toolbar and filter panel)
- `src/app/netzwerk/page.tsx` (modified -- nuqs setup)

**Commit:** `feat: add graph filters, search, and URL state persistence`

---

## Execution Order

```
02-01: Graph Infrastructure and Basic Rendering
  |
02-02: Semantic Zoom, Interactions, and Detail Panel
  |
02-03: Filters, Search, and URL State
```

Sequential -- each task builds on the previous.

## Verification Checklist

After all tasks complete:
1. [ ] `/netzwerk` renders all 800 nodes + 2182 edges without frame drops
2. [ ] ForceAtlas2 layout computes in Web Worker (UI stays responsive during layout)
3. [ ] Zooming out shows only party clusters, zooming in reveals individual nodes
4. [ ] Hovering a node shows tooltip with name, party, canton, connection count
5. [ ] Clicking a node opens detail panel with all connections
6. [ ] Clicking two different nodes highlights shortest path between them
7. [ ] Filters (party, canton, council, industry) combine and update graph in real time
8. [ ] Search finds actors and zooms camera to matching node
9. [ ] URL captures all state (filters, selected node, zoom) -- shared URL restores view
10. [ ] `tsc --noEmit` clean, `biome check` clean, `npm run build` succeeds
11. [ ] Edge hover shows connection type and role
12. [ ] Nodes visually distinct by actor type (color, size)

---
*Plan created: 2026-02-27*
